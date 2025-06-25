"use client"

import { useEffect, useState } from "react"

interface MessageBoxProps {
  message: string
}

export default function MessageBox({ message }: MessageBoxProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [message])

  if (!message) return null

  return (
    <div
      className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 
                 py-2 px-4 bg-gray-800 text-white rounded-lg shadow-lg
                 transition-opacity duration-500 z-50
                 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      {message}
    </div>
  )
}
