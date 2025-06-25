"use client"

import type React from "react"

import { useState } from "react"
import { X, Copy, Mail, Share2 } from "lucide-react"
import type { Note, Course } from "@/types/app-types"

interface ShareNoteModalProps {
  isOpen: boolean
  onClose: () => void
  note: Note
  course: Course
  showMessage: (message: string) => void
}

export default function ShareNoteModal({ isOpen, onClose, note, course, showMessage }: ShareNoteModalProps) {
  const [email, setEmail] = useState("")
  const [includeBody, setIncludeBody] = useState(true)

  if (!isOpen) return null

  const noteUrl = `${window.location.origin}/share/${note.id}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(noteUrl)
    showMessage("Link copied to clipboard!")
  }

  const handleEmailShare = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would send the note to the server to be emailed
    // For now, we'll just simulate it

    const subject = `BrainBoost Note: ${note.title || "Untitled Note"}`
    const body = `
${course.code}: ${course.name}
${note.title || "Untitled Note"}

${includeBody ? note.body : ""}

View this note online: ${noteUrl}
    `.trim()

    // For demo purposes, open the default email client
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)

    showMessage(`Note shared with ${email}!`)
    setEmail("")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Share Note</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Share Link</h3>
            <div className="flex">
              <input
                type="text"
                value={noteUrl}
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded-l-md bg-gray-50"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
              >
                <Copy className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Share via Email</h3>
            <form onSubmit={handleEmailShare}>
              <div className="mb-3">
                <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="example@email.com"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeBody}
                    onChange={(e) => setIncludeBody(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Include note content in email</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </button>
            </form>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="w-full flex justify-center items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">
              <Share2 className="h-4 w-4 mr-2" />
              More Sharing Options
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
