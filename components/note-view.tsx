"use client"

import { useState, useEffect } from "react"
import { Trash2, Share, Download, Sparkles } from "lucide-react"
import type { Note, Course, NoteCategory } from "@/types/app-types"
import CategorySelector from "./category-selector"
import ShareNoteModal from "./share-note-modal"
import { streamChatCompletion, DEFAULT_MODEL } from "@/lib/openrouter-service"
import { jsPDF } from "jspdf"

interface NoteViewProps {
  note: Note | null
  course: Course | null
  onSave: (note: Note) => void
  onCancel: () => void
  onDelete: (noteId: string) => void
  showMessage: (message: string) => void
}

export default function NoteView({ note, course, onSave, onCancel, onDelete, showMessage }: NoteViewProps) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tags, setTags] = useState("")
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [processingAction, setProcessingAction] = useState<"research" | "summarize" | "explain" | null>(null)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setBody(note.body)
      setTags(Array.isArray(note.tags) ? note.tags.join(", ") : "")
      setCategoryId(note.categoryId)
      setShowDeleteConfirm(false)
    }
  }, [note])

  const handleSave = () => {
    if (!note || !course) return

    const updatedNote: Note = {
      ...note,
      title: title || "Untitled Note",
      body,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      categoryId,
      date: new Date().toISOString(),
    }

    onSave(updatedNote)
  }

  const handleAddCategory = (name: string, color: string) => {
    if (!course) return

    const newCategory: NoteCategory = {
      id: Date.now().toString(),
      name,
      color,
    }

    // In a real app, you would update the course with the new category
    // For now, we'll just show a message
    showMessage(`Category "${name}" added!`)

    // Simulate adding the category to the course
    const updatedCourse = {
      ...course,
      categories: [...course.categories, newCategory],
    }

    // Select the new category
    setCategoryId(newCategory.id)
  }

  const handleEditCategory = (id: string, name: string, color: string) => {
    if (!course) return

    // In a real app, you would update the category in the course
    showMessage(`Category "${name}" updated!`)
  }

  const handleDeleteCategory = (id: string) => {
    if (!course) return

    // In a real app, you would remove the category from the course
    // and update any notes that use this category
    showMessage(`Category deleted!`)

    // If the current note uses this category, clear it
    if (categoryId === id) {
      setCategoryId(undefined)
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const handleAIAction = async (action: "research" | "summarize" | "explain") => {
    if (!body.trim()) {
      showMessage(`Please add some content to ${action}`)
      return
    }

    setIsProcessing(true)
    setProcessingAction(action)
    showMessage(`${action.charAt(0).toUpperCase() + action.slice(1)}ing your content...`)

    try {
      let prompt = ""
      let systemMessage = ""

      if (action === "research") {
        systemMessage = "You are a research assistant helping a student find relevant information about their notes."
        prompt = `Based on my notes below, provide additional resources, references, and information that would help me understand this topic better. Include 3-5 key points and potential sources for further reading.\n\nMy notes:\n${body}`
      } else if (action === "summarize") {
        systemMessage = "You are a summarization assistant helping a student condense their notes."
        prompt = `Summarize the following notes in a concise way, highlighting the most important concepts and key points. Create a structured summary with bullet points for main ideas.\n\nNotes to summarize:\n${body}`
      } else if (action === "explain") {
        systemMessage = "You are an educational assistant helping a student understand complex concepts."
        prompt = `Explain the following content in simpler terms. Break down any complex concepts, use analogies where helpful, and make the information more accessible. Assume I'm learning this for the first time.\n\nContent to explain:\n${body}`
      }

      let result = ""

      await streamChatCompletion(
        {
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: prompt },
          ],
          model: DEFAULT_MODEL,
          temperature: 0.7,
        },
        (chunk) => {
          // Update in real-time as chunks come in
          result += chunk
          setBody(body + "\n\n--- " + action.charAt(0).toUpperCase() + action.slice(1) + " Results ---\n" + result)
        },
        (fullResponse) => {
          // Final update with complete response
          setBody(
            body + "\n\n--- " + action.charAt(0).toUpperCase() + action.slice(1) + " Results ---\n" + fullResponse,
          )
          showMessage(`${action.charAt(0).toUpperCase() + action.slice(1)} completed!`)
        },
      )
    } catch (error) {
      console.error(`Error during ${action}:`, error)
      showMessage(`Error during ${action}. Please try again.`)
    } finally {
      setIsProcessing(false)
      setProcessingAction(null)
    }
  }

  const handleResearch = () => handleAIAction("research")
  const handleSummarize = () => handleAIAction("summarize")
  const handleExplain = () => handleAIAction("explain")

  const handleDelete = () => {
    if (!note) return

    if (showDeleteConfirm) {
      onDelete(note.id)
    } else {
      setShowDeleteConfirm(true)
      // Auto-hide the confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000)
    }
  }

  const handleExportToPDF = () => {
    if (!note || !course) return

    try {
      const doc = new jsPDF()

      // Set up the document
      doc.setFontSize(22)
      doc.setTextColor(0, 0, 0)
      doc.text(title || "Untitled Note", 20, 20)

      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`${course.code}: ${course.name}`, 20, 30)
      doc.text(`Date: ${formatDate(note.date)}`, 20, 37)

      // Add tags if present
      if (note.tags && note.tags.length > 0) {
        doc.text(`Tags: ${note.tags.join(", ")}`, 20, 44)
      }

      // Add category if present
      if (note.categoryId) {
        const category = course.categories.find((cat) => cat.id === note.categoryId)
        if (category) {
          doc.text(`Category: ${category.name}`, 20, note.tags && note.tags.length > 0 ? 51 : 44)
        }
      }

      // Add horizontal line
      const lineY = note.categoryId
        ? note.tags && note.tags.length > 0
          ? 55
          : 48
        : note.tags && note.tags.length > 0
          ? 48
          : 41

      doc.setDrawColor(200, 200, 200)
      doc.line(20, lineY, 190, lineY)

      // Add note content with word wrap
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)

      const textLines = doc.splitTextToSize(body, 170)
      doc.text(textLines, 20, lineY + 10)

      // Save the PDF
      doc.save(`${title || "note"}-${new Date().toISOString().split("T")[0]}.pdf`)

      showMessage("Note exported to PDF successfully!")
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      showMessage("Error exporting to PDF. Please try again.")
    }
  }

  if (!note || !course) return null

  return (
    <div className="p-6 lg:p-8 bg-white h-full">
      <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          {course.code}: {course.name}
        </h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportToPDF}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            Export PDF
          </button>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 flex items-center"
          >
            <Share className="h-4 w-4 mr-1" />
            Share
          </button>
          <button
            onClick={handleDelete}
            className={`text-sm font-medium px-3 py-1.5 rounded-md flex items-center ${
              showDeleteConfirm
                ? "bg-red-600 text-white hover:bg-red-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {showDeleteConfirm ? "Confirm Delete" : "Delete"}
          </button>
          <button
            onClick={onCancel}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-1.5 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-5 rounded-md transition duration-150 ease-in-out"
            disabled={isProcessing}
          >
            Save Note
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Note Title"
          className="text-2xl font-semibold text-gray-900 w-full border-none focus:ring-0 p-0 mb-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="text-sm text-gray-500 mb-4">
          <span>{course.name}</span> | <span>{formatDate(note.date)}</span>
        </div>

        <textarea
          placeholder="Start writing your note..."
          className="w-full resize-none border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700 leading-relaxed min-h-[250px]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isProcessing}
        />

        <div className="flex space-x-2">
          <button
            className={`note-action-btn flex items-center ${
              processingAction === "research" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"
            } px-4 py-2 rounded-md hover:bg-gray-300 transition-colors`}
            onClick={handleResearch}
            disabled={isProcessing}
          >
            {processingAction === "research" ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                Researching...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1.5" />
                Research
              </>
            )}
          </button>
          <button
            className={`note-action-btn flex items-center ${
              processingAction === "summarize" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"
            } px-4 py-2 rounded-md hover:bg-gray-300 transition-colors`}
            onClick={handleSummarize}
            disabled={isProcessing}
          >
            {processingAction === "summarize" ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                Summarizing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1.5" />
                Summarize
              </>
            )}
          </button>
          <button
            className={`note-action-btn flex items-center ${
              processingAction === "explain" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"
            } px-4 py-2 rounded-md hover:bg-gray-300 transition-colors`}
            onClick={handleExplain}
            disabled={isProcessing}
          >
            {processingAction === "explain" ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                Explaining...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1.5" />
                Explain
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-4 border-t border-gray-200">
          <div>
            <label htmlFor="noteTags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags / Keywords
            </label>
            <input
              type="text"
              id="noteTags"
              placeholder="Add tags separated by commas..."
              className="w-full text-sm border border-gray-300 p-2 rounded-md"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Example: lecture, chapter 5, important</p>
          </div>

          <div>
            <CategorySelector
              categories={course.categories || []}
              selectedCategoryId={categoryId}
              onSelectCategory={setCategoryId}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </div>
        </div>
      </div>

      {isShareModalOpen && note && course && (
        <ShareNoteModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          note={note}
          course={course}
          showMessage={showMessage}
        />
      )}
    </div>
  )
}
