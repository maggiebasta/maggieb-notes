import { useEffect } from 'react'
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
  title: string
  onUpdate: (html: string) => void
  onTitleChange: (title: string) => void
}

export function TiptapEditor({ content, title, onUpdate, onTitleChange }: TiptapEditorProps) {
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

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  if (!editor) return null

  return (
    <div className="flex-1 p-6">
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full text-2xl font-bold mb-4 bg-transparent border-none outline-none"
        placeholder="Note title"
      />
      <EditorContent 
        editor={editor} 
        className="w-full h-[calc(100vh-200px)] p-4 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )
}
