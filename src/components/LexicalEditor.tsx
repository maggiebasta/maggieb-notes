import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { EditorState, $getRoot } from 'lexical';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AutoListPlugin } from './AutoListPlugin';
import { ListItemNode, ListNode } from '@lexical/list';

// Custom error boundary component
function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ReactErrorBoundary fallback={<div>Something went wrong</div>}>{children}</ReactErrorBoundary>;
}

interface LexicalEditorProps {
  initialContent?: string;
  onContentChange: (content: string, editorState: string) => void;
}

// Basic theme for the editor
const theme = {
  paragraph: 'mb-2',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
};

export function LexicalEditor({ initialContent, onContentChange }: LexicalEditorProps) {
  // Initial editor configuration
  let parsedEditorState;
  try {
    if (initialContent) {
      parsedEditorState = JSON.parse(initialContent);
    }
  } catch (error) {
    // If parsing fails, we'll default to undefined
    parsedEditorState = undefined;
    console.error('Invalid editorState JSON:', error);
  }

  const initialConfig = {
    namespace: 'MaggieNotesEditor',
    theme,
    onError: (error: Error) => {
      console.error('Lexical Editor Error:', error);
    },
    editorState: parsedEditorState,
    nodes: [ListItemNode, ListNode],
  };

  // Handle editor changes
  const onChange = (editorState: EditorState) => {
    // Get editor state as JSON string
    const json = JSON.stringify(editorState.toJSON());
    
    // Get plain text content for backwards compatibility
    editorState.read(() => {
      const textContent = $getRoot().getTextContent();
      onContentChange(textContent, json);
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <RichTextPlugin
          contentEditable={<ContentEditable className="h-[calc(100vh-200px)] p-4 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />}
          placeholder={<div className="editor-placeholder">Start writing...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <AutoListPlugin />
        <HistoryPlugin />
        <OnChangePlugin onChange={onChange} />
      </div>
    </LexicalComposer>
  );
}
