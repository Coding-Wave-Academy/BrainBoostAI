export interface NoteCategory {
  id: string
  name: string
  color: string
}

export interface Note {
  id: string
  title: string
  body: string
  tags: string[]
  date: string
  courseId: string
  categoryId?: string // Optional category ID
}

export interface Course {
  id: string
  code: string
  name: string
  term: string
  color: string
  notes: Note[]
  categories: NoteCategory[] // Categories for this course
}
