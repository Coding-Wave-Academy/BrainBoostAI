"use client"

import type React from "react"

import { useState } from "react"
import { X, Check, Edit2 } from "lucide-react"
import type { NoteCategory } from "@/types/app-types"

interface CategorySelectorProps {
  categories: NoteCategory[]
  selectedCategoryId?: string
  onSelectCategory: (categoryId?: string) => void
  onAddCategory: (name: string, color: string) => void
  onEditCategory: (id: string, name: string, color: string) => void
  onDeleteCategory: (id: string) => void
}

export default function CategorySelector({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: CategorySelectorProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6") // Default blue

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim(), newCategoryColor)
      setNewCategoryName("")
      setNewCategoryColor("#3B82F6")
      setIsAdding(false)
    }
  }

  const handleEditSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault()
    if (newCategoryName.trim()) {
      onEditCategory(id, newCategoryName.trim(), newCategoryColor)
      setNewCategoryName("")
      setNewCategoryColor("#3B82F6")
      setIsEditing(null)
    }
  }

  const startEditing = (category: NoteCategory) => {
    setIsEditing(category.id)
    setNewCategoryName(category.name)
    setNewCategoryColor(category.color)
  }

  const colorOptions = [
    { value: "#3B82F6", label: "Blue" },
    { value: "#8B5CF6", label: "Purple" },
    { value: "#10B981", label: "Green" },
    { value: "#F59E0B", label: "Yellow" },
    { value: "#EF4444", label: "Red" },
    { value: "#EC4899", label: "Pink" },
  ]

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">Category</label>
        {!isAdding && (
          <button type="button" onClick={() => setIsAdding(true)} className="text-xs text-blue-600 hover:text-blue-800">
            Add New
          </button>
        )}
      </div>

      <div className="space-y-2">
        {/* No Category option */}
        <div
          className={`flex items-center p-2 rounded-md cursor-pointer ${
            !selectedCategoryId ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
          }`}
          onClick={() => onSelectCategory(undefined)}
        >
          <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
          <span className="text-sm">None</span>
          {!selectedCategoryId && <Check className="h-4 w-4 ml-auto text-blue-600" />}
        </div>

        {/* Existing categories */}
        {categories.map((category) =>
          isEditing === category.id ? (
            <form
              key={category.id}
              onSubmit={(e) => handleEditSubmit(e, category.id)}
              className="p-2 bg-gray-50 rounded-md"
            >
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 p-1 text-sm border border-gray-300 rounded"
                  placeholder="Category name"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsEditing(null)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {colorOptions.map((color) => (
                    <div
                      key={color.value}
                      className={`w-4 h-4 rounded-full cursor-pointer ${
                        newCategoryColor === color.value ? "ring-2 ring-offset-1 ring-gray-400" : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewCategoryColor(color.value)}
                      title={color.label}
                    ></div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(category.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                  <button type="submit" className="text-xs text-blue-600 hover:text-blue-800">
                    Save
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div
              key={category.id}
              className={`flex items-center p-2 rounded-md cursor-pointer ${
                selectedCategoryId === category.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
              }`}
              onClick={() => onSelectCategory(category.id)}
            >
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
              <span className="text-sm">{category.name}</span>
              <div className="ml-auto flex items-center space-x-1">
                {selectedCategoryId === category.id && <Check className="h-4 w-4 text-blue-600" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    startEditing(category)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ),
        )}

        {/* Add new category form */}
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="p-2 bg-gray-50 rounded-md">
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 p-1 text-sm border border-gray-300 rounded"
                placeholder="Category name"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {colorOptions.map((color) => (
                  <div
                    key={color.value}
                    className={`w-4 h-4 rounded-full cursor-pointer ${
                      newCategoryColor === color.value ? "ring-2 ring-offset-1 ring-gray-400" : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setNewCategoryColor(color.value)}
                    title={color.label}
                  ></div>
                ))}
              </div>
              <button type="submit" className="text-xs text-blue-600 hover:text-blue-800">
                Add
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
