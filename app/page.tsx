"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import CoursesView from "@/components/courses-view"
import NoteView from "@/components/note-view"
import NotesListView from "@/components/notes-list-view"
import MessageBox from "@/components/message-box"
import AddCourseModal from "@/components/add-course-modal"
import type { Course, Note, NoteCategory } from "@/types/app-types"

export default function Home() {
  const [activeView, setActiveView] = useState<"courses" | "notes" | "note">("courses")
  const [message, setMessage] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [activeCourse, setActiveCourse] = useState<Course | null>(null)
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false)

  // Load courses from localStorage on initial render
  useEffect(() => {
    const savedCourses = localStorage.getItem("brainboost-courses")
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses))
    } else {
      // Set default courses if none exist
      const defaultCategories: NoteCategory[] = [
        { id: "cat1", name: "Lecture Notes", color: "#3B82F6" },
        { id: "cat2", name: "Assignments", color: "#10B981" },
        { id: "cat3", name: "Exam Prep", color: "#F59E0B" },
      ]

      const defaultCourses: Course[] = [
        {
          id: "1",
          code: "CSE 115",
          name: "Computer Science",
          term: "Fall 2025",
          color: "blue",
          notes: [
            {
              id: "1",
              title: "Introduction to Programming Concepts",
              body: "Basic programming concepts including variables, control structures, and functions...",
              tags: ["programming", "variables", "functions"],
              date: new Date().toISOString(),
              courseId: "1",
              categoryId: "cat1",
            },
          ],
          categories: [...defaultCategories],
        },
        {
          id: "2",
          code: "FRE 102",
          name: "Mathematics",
          term: "Fall 2025",
          color: "purple",
          notes: [],
          categories: [...defaultCategories],
        },
        {
          id: "3",
          code: "CHE 101",
          name: "Chemistry",
          term: "Fall 2025",
          color: "green",
          notes: [],
          categories: [...defaultCategories],
        },
        {
          id: "4",
          code: "PSY 101",
          name: "Psychology",
          term: "Fall 2025",
          color: "yellow",
          notes: [],
          categories: [...defaultCategories],
        },
      ]
      setCourses(defaultCourses)
      localStorage.setItem("brainboost-courses", JSON.stringify(defaultCourses))
    }
  }, [])

  // Save courses to localStorage whenever they change
  useEffect(() => {
    if (courses.length > 5) {
      localStorage.setItem("brainboost-courses", JSON.stringify(courses))
    }
  }, [courses])

  const showMessage = (text: string) => {
    setMessage(text)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleViewNotes = (course: Course) => {
    setActiveCourse(course)
    setActiveView("notes")
  }

  const handleCreateNote = () => {
    if (!activeCourse) return

    // Create a new note for this course
    const newNote: Note = {
      id: Date.now().toString(),
      title: "",
      body: "",
      tags: [],
      date: new Date().toISOString(),
      courseId: activeCourse.id,
    }
    setActiveNote(newNote)
    setActiveView("note")
  }

  const handleEditNote = (note: Note) => {
    setActiveNote(note)
    setActiveView("note")
  }

  const handleSaveNote = (note: Note) => {
    if (!activeCourse) return

    const updatedCourses = courses.map((course) => {
      if (course.id === activeCourse.id) {
        // Check if note already exists
        const existingNoteIndex = course.notes.findIndex((n) => n.id === note.id)

        if (existingNoteIndex >= 0) {
          // Update existing note
          const updatedNotes = [...course.notes]
          updatedNotes[existingNoteIndex] = note
          return { ...course, notes: updatedNotes }
        } else {
          // Add new note
          return { ...course, notes: [...course.notes, note] }
        }
      }
      return course
    })

    setCourses(updatedCourses)
    showMessage(`Note "${note.title || "Untitled Note"}" saved successfully!`)
    setActiveView("notes")
  }

  const handleDeleteNote = (noteId: string) => {
    if (!activeCourse) return

    const updatedCourses = courses.map((course) => {
      if (course.id === activeCourse.id) {
        return {
          ...course,
          notes: course.notes.filter((note) => note.id !== noteId),
        }
      }
      return course
    })

    setCourses(updatedCourses)

    // If we're deleting the active note, go back to notes list
    if (activeNote && activeNote.id === noteId) {
      setActiveView("notes")
    }
  }

  const handleAddCourse = (name: string, code: string, term: string) => {
    // Enhanced color palette
    const colors = [
      "blue",
      "purple",
      "green",
      "yellow",
      "red",
      "pink",
      "teal",
      "indigo",
      "orange",
      "lime",
      "cyan",
      "violet",
    ]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]

    // Default categories for new courses
    const defaultCategories: NoteCategory[] = [
      { id: `cat-${Date.now()}-1`, name: "Lecture Notes", color: "#3B82F6" },
      { id: `cat-${Date.now()}-2`, name: "Assignments", color: "#10B981" },
      { id: `cat-${Date.now()}-3`, name: "Exam Prep", color: "#F59E0B" },
    ]

    const newCourse: Course = {
      id: Date.now().toString(),
      code,
      name,
      term,
      color: randomColor,
      notes: [],
      categories: defaultCategories,
    }

    setCourses([...courses, newCourse])
    showMessage(`Course "${code}: ${name}" added successfully!`)
    setIsAddCourseModalOpen(false)
  }

  return (
    <div className="bg-white h-screen flex flex-col">
      <Header />

      <div className="flex-1 overflow-y-auto">
        {activeView === "courses" ? (
          <CoursesView
            courses={courses}
            onViewNotes={handleViewNotes}
            onAddCourse={() => setIsAddCourseModalOpen(true)}
          />
        ) : activeView === "notes" ? (
          <NotesListView
            course={activeCourse}
            onBack={() => setActiveView("courses")}
            onCreateNote={handleCreateNote}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            showMessage={showMessage}
          />
        ) : (
          <NoteView
            note={activeNote}
            course={activeCourse}
            onSave={handleSaveNote}
            onCancel={() => setActiveView(activeCourse?.notes.length ? "notes" : "courses")}
            onDelete={handleDeleteNote}
            showMessage={showMessage}
          />
        )}
      </div>

      {message && <MessageBox message={message} />}

      <AddCourseModal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        onAddCourse={handleAddCourse}
      />
    </div>
  )
}
