"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface AddCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onAddCourse: (name: string, code: string, term: string) => void
}

export default function AddCourseModal({ isOpen, onClose, onAddCourse }: AddCourseModalProps) {
  const [courseName, setCourseName] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [courseTerm, setCourseTerm] = useState("Fall 2025")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (courseName.trim() && courseCode.trim()) {
      onAddCourse(courseName, courseCode, courseTerm)
      resetForm()
    }
  }

  const resetForm = () => {
    setCourseName("")
    setCourseCode("")
    setCourseTerm("Fall 2025")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add New Course</h2>
          <button
            onClick={() => {
              resetForm()
              onClose()
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 mb-1">
                Course Code*
              </label>
              <input
                type="text"
                id="courseCode"
                placeholder="e.g., CEC 319"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
                Course Name*
              </label>
              <input
                type="text"
                id="courseName"
                placeholder="e.g., Dynamic Web Design"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="courseTerm" className="block text-sm font-medium text-gray-700 mb-1">
                Term
              </label>
              <select
                id="courseTerm"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={courseTerm}
                onChange={(e) => setCourseTerm(e.target.value)}
              >
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="Resit Semester">Resit Semester</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                resetForm()
                onClose()
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Course
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
