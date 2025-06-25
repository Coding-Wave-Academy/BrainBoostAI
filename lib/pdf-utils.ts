// PDF utility functions
import { jsPDF } from "jspdf"
import type { Note, Course } from "@/types/app-types"

export function generateNotePDF(note: Note, course: Course): jsPDF {
  const doc = new jsPDF()

  // Set up the document
  doc.setFontSize(22)
  doc.setTextColor(0, 0, 0)
  doc.text(note.title || "Untitled Note", 20, 20)

  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text(`${course.code}: ${course.name}`, 20, 30)

  // Format date
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
  const formattedDate = new Date(note.date).toLocaleDateString(undefined, options)
  doc.text(`Date: ${formattedDate}`, 20, 37)

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

  const textLines = doc.splitTextToSize(note.body, 170)
  doc.text(textLines, 20, lineY + 10)

  return doc
}
