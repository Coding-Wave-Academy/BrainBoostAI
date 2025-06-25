"use client"

import { useState } from "react"
import type { Course, Note } from "@/types/app-types"
import { ChevronLeft, Plus, Search, Clock, Tag, Edit, Trash2, Filter } from "lucide-react"

interface NotesListViewProps {
  course: Course | null
  onBack: () => void
  onCreateNote: () => void
  onEditNote: (note: Note) => void
  onDeleteNote: (noteId: string) => void
  showMessage: (message: string) => void
}

export default function NotesListView({
  course,
  onBack,
  onCreateNote,
  onEditNote,
  onDeleteNote,
  showMessage,
}: NotesListViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "title">("date")
  const [filterCategory, setFilterCategory] = useState<string | "all">("all")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (!course) return null

  // Filter notes based on search query and category
  const filteredNotes = course.notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      filterCategory === "all" ||
      (filterCategory === "uncategorized" && !note.categoryId) ||
      note.categoryId === filterCategory

    return matchesSearch && matchesCategory
  })

  // Sort notes based on sortBy
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    } else {
      return a.title.localeCompare(b.title)
    }
  })

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }
  }

  // Enhanced gradient classes with more vibrant colors
  const getGradientClass = (color: string) => {
    const gradients: Record<string, string> = {
      blue: "from-blue-500 to-indigo-600",
      purple: "from-purple-500 to-pink-600",
      green: "from-emerald-500 to-teal-600",
      yellow: "from-amber-500 to-orange-600",
      red: "from-red-500 to-rose-600",
      pink: "from-pink-500 to-fuchsia-600",
      teal: "from-teal-500 to-cyan-600",
      indigo: "from-indigo-500 to-violet-600",
      orange: "from-orange-500 to-red-600",
      lime: "from-lime-500 to-green-600",
      cyan: "from-cyan-500 to-blue-600",
      violet: "from-violet-500 to-purple-600",
    }
    return gradients[color] || gradients.blue
  }

  const handleDeleteNote = (noteId: string) => {
    if (confirmDeleteId === noteId) {
      onDeleteNote(noteId)
      setConfirmDeleteId(null)
      showMessage("Note deleted successfully")
    } else {
      setConfirmDeleteId(noteId)
      // Auto-hide the confirmation after 3 seconds
      setTimeout(() => setConfirmDeleteId(null), 3000)
    }
  }

  // Find category by ID
  const getCategoryById = (categoryId?: string) => {
    if (!categoryId) return null
    return course.categories?.find((cat) => cat.id === categoryId) || null
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Go back to courses"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <span
              className={`inline-block w-4 h-4 rounded-full bg-gradient-to-br ${getGradientClass(course.color)} mr-2`}
            ></span>
            {course.code}: {course.name}
          </h2>
          <p className="mt-1 text-sm text-gray-600">{course.notes.length} notes</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button className="px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center">
              <Filter className="h-3.5 w-3.5 inline-block mr-1" />
              {filterCategory === "all"
                ? "All Categories"
                : filterCategory === "uncategorized"
                  ? "Uncategorized"
                  : getCategoryById(filterCategory)?.name || "Category"}
              <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 hidden">
              <div className="py-1">
                <button
                  onClick={() => setFilterCategory("all")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  All Categories
                </button>
                <button
                  onClick={() => setFilterCategory("uncategorized")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Uncategorized
                </button>
                {course.categories?.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setFilterCategory(category.id)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                      {category.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              sortBy === "date" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setSortBy("date")}
          >
            <Clock className="h-3.5 w-3.5 inline-block mr-1" />
            Date
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              sortBy === "title" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setSortBy("title")}
          >
            <Tag className="h-3.5 w-3.5 inline-block mr-1" />
            Title
          </button>
          <button
            onClick={onCreateNote}
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Note
          </button>
        </div>
      </div>

      {sortedNotes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Edit className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No notes yet</h3>
          <p className="text-gray-500 mb-4">Create your first note for this course</p>
          <button
            onClick={onCreateNote}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Note
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedNotes.map((note) => {
            const category = note.categoryId ? getCategoryById(note.categoryId) : null

            return (
              <div key={note.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1 cursor-pointer" onClick={() => onEditNote(note)}>
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{note.title || "Untitled Note"}</h3>
                      {category && (
                        <span
                          className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${category.color}20`, // 20% opacity
                            color: category.color,
                          }}
                        >
                          {category.name}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {note.body.substring(0, 150)}
                      {note.body.length > 150 ? "..." : ""}
                    </p>
                  </div>
                  <div className="flex items-start ml-4">
                    <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(note.date)}</span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className={`ml-3 p-1 rounded-full ${
                        confirmDeleteId === note.id
                          ? "bg-red-100 text-red-600"
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      }`}
                      title={confirmDeleteId === note.id ? "Confirm delete" : "Delete note"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
