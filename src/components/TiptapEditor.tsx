import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Extension } from '@tiptap/core'
import { InputRule } from '@tiptap/core'
import type { SingleCommands } from '@tiptap/core'

// Custom extension to handle bullet creation on "-"
const BulletOnDash = Extension.create({
  name: 'bulletOnDash',
  addInputRules() {
    return [
      // Transform "-" into a bullet list when typed at the start of a line
      new InputRule({
        find: /^-$/,
        handler: ({ commands }: { commands: SingleCommands }) => {
          commands.toggleBulletList()
        }
      })
    ]
  }
})

interface TiptapEditorProps {
  content: string
  onUpdate: (html: string) => void
}

export function TiptapEditor({ content, onUpdate }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      BulletOnDash
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML()) // returns HTML version of content
    }
  })

  if (!editor) return null

  return (
    <div className="flex-1 p-6">
      <EditorContent 
        editor={editor} 
        className="w-full h-[calc(100vh-200px)] p-4 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )
}
