"use client"

import type { Course } from "@/types/app-types"
import { Plus } from "lucide-react"

interface CoursesViewProps {
  courses: Course[]
  onViewNotes: (course: Course) => void
  onAddCourse: () => void
}

export default function CoursesView({ courses, onViewNotes, onAddCourse }: CoursesViewProps) {
  // Enhanced gradient classes with more vibrant colors
  const getGradientClass = (color: string) => {
    const gradients: Record<string, string> = {
      blue: "bg-gradient-to-br from-blue-500 to-indigo-600",
      purple: "bg-gradient-to-br from-purple-500 to-pink-600",
      green: "bg-gradient-to-br from-emerald-500 to-teal-600",
      yellow: "bg-gradient-to-br from-amber-500 to-orange-600",
      red: "bg-gradient-to-br from-red-500 to-rose-600",
      pink: "bg-gradient-to-br from-pink-500 to-fuchsia-600",
      teal: "bg-gradient-to-br from-teal-500 to-cyan-600",
      indigo: "bg-gradient-to-br from-indigo-500 to-violet-600",
      orange: "bg-gradient-to-br from-orange-500 to-red-600",
      lime: "bg-gradient-to-br from-lime-500 to-green-600",
      cyan: "bg-gradient-to-br from-cyan-500 to-blue-600",
      violet: "bg-gradient-to-br from-violet-500 to-purple-600",
    }
    return gradients[color] || gradients.blue
  }

  // Updated text color classes to match new gradients
  const getTextColorClass = (color: string) => {
    const textColors: Record<string, { light: string; lighter: string }> = {
      blue: { light: "text-blue-100", lighter: "text-blue-200" },
      purple: { light: "text-purple-100", lighter: "text-purple-200" },
      green: { light: "text-emerald-100", lighter: "text-emerald-200" },
      yellow: { light: "text-amber-100", lighter: "text-amber-200" },
      red: { light: "text-red-100", lighter: "text-red-200" },
      pink: { light: "text-pink-100", lighter: "text-pink-200" },
      teal: { light: "text-teal-100", lighter: "text-teal-200" },
      indigo: { light: "text-indigo-100", lighter: "text-indigo-200" },
      orange: { light: "text-orange-100", lighter: "text-orange-200" },
      lime: { light: "text-lime-100", lighter: "text-lime-200" },
      cyan: { light: "text-cyan-100", lighter: "text-cyan-200" },
      violet: { light: "text-violet-100", lighter: "text-violet-200" },
    }
    return textColors[color] || textColors.blue
  }

  // Updated border color classes to match new gradients
  const getBorderColorClass = (color: string) => {
    const borderColors: Record<string, string> = {
      blue: "border-blue-400",
      purple: "border-purple-400",
      green: "border-emerald-400",
      yellow: "border-amber-400",
      red: "border-red-400",
      pink: "border-pink-400",
      teal: "border-teal-400",
      indigo: "border-indigo-400",
      orange: "border-orange-400",
      lime: "border-lime-400",
      cyan: "border-cyan-400",
      violet: "border-violet-400",
    }
    return borderColors[color] || borderColors.blue
  }

  return (
    <main className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Your Courses</h2>
        <p className="mt-1 text-sm text-gray-600">Manage your UB course notes in one place</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`course-card rounded-lg shadow-md overflow-hidden ${getGradientClass(course.color)} text-white p-5`}
            onClick={() => onViewNotes(course)}
          >
            <div>
              <h3 className="font-bold text-xl tracking-tight">{course.code}</h3>
              <p className={`text-sm font-medium ${getTextColorClass(course.color).light} mt-2 mb-1`}>{course.name}</p>
              <p className={`text-xs ${getTextColorClass(course.color).lighter}`}>{course.term}</p>
            </div>
            <div
              className={`mt-4 pt-3 border-t ${getBorderColorClass(course.color)} border-opacity-50 flex justify-between items-center`}
            >
              <span className={`text-sm ${getTextColorClass(course.color).light}`}>{course.notes.length} notes</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onViewNotes(course)
                }}
                className="text-sm font-medium text-white hover:text-blue-100"
              >
                View notes &rarr;
              </button>
            </div>
          </div>
        ))}

        <div
          onClick={onAddCourse}
          className="add-course-card bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition duration-150 ease-in-out"
        >
          <div className="text-center">
            <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <span className="font-medium text-sm">Add New Course</span>
          </div>
        </div>
      </div>
    </main>
  )
}
