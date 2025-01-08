import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import HardBreak from '@tiptap/extension-hard-break'
import { Extension } from '@tiptap/core'
import { InputRule } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import type { EditorView } from '@tiptap/pm/view'

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
          HTMLAttributes: {
            class: 'bullet-list',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'list-item',
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: 'paragraph',
          },
        },
        bold: {
          HTMLAttributes: {
            class: 'font-bold',
          },
        },
        italic: {
          HTMLAttributes: {
            class: 'italic',
          },
        },
        history: {},
      }),
      HardBreak.configure({
        keepMarks: true,
        HTMLAttributes: {
          class: 'hard-break',
        },
      }),
      Underline.configure({
        HTMLAttributes: {
          class: 'underline',
        },
      }),
      BulletOnDash
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML())
    },
    editorProps: {
      handleKeyDown: (view: EditorView, event: KeyboardEvent & { key: string }) => {
        // Access editor instance from view
        const editorView = view as unknown as { editor: Editor }
        const editor = editorView.editor
        if (!editor) return false

        // Allow default Enter behavior for new paragraphs
        if (event.key === 'Enter' && !event.shiftKey) {
          return false
        }
        // Use Shift+Enter for hard breaks within paragraphs
        if (event.key === 'Enter' && event.shiftKey) {
          editor.commands.setHardBreak()
          return true
        }
        // Handle Tab key for indentation
        if (event.key === 'Tab') {
          event.preventDefault()
          
          if (editor.isActive('bulletList') || editor.isActive('orderedList')) {
            // Handle list indentation
            if (event.shiftKey) {
              editor.commands.liftListItem('listItem')
            } else {
              editor.commands.sinkListItem('listItem')
            }
          } else {
            // Insert spaces for regular text indentation
            editor.commands.insertContent('  ')
          }
          return true
        }
        return false
      },
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
