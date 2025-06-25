"use client"

import type React from "react"
import { useState } from "react"
import { Search, Sparkles } from "lucide-react"
import Link from "next/link"

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
    // In a real app, you would filter notes/courses based on the query
  }

  return (
    <header className=" p-4 flex justify-between items-center top-0 z-20">
      <div className="flex items-center space-x-2">
        <Link href="/" className="text-lg font-semibold text-gray-800">
          
          <span className="text-sm text-gray-500 ml-1">UB AI </span>
        </Link>
      </div>
      <div className="flex-1 max-w-xl mx-4">
        
      </div>
      <div className="flex items-center space-x-3">
        <Link
          href="/chat"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-4 rounded transition duration-150 ease-in-out flex items-center"
        >
          <Sparkles className="h-4 w-4 mr-1.5" />
          AI Assistant
        </Link>
      </div>
    </header>
  )
}
