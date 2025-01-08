import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $getSelection, $isRangeSelection, TextNode } from 'lexical';
import { $createListItemNode, $createListNode } from '@lexical/list';
import { useEffect } from 'react';

export function AutoListPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Register listener for text changes
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        
        if (!$isRangeSelection(selection)) return;
        
        const node = selection.anchor.getNode();
        
        // Check if we're in a text node
        if (!(node instanceof TextNode)) return;
        
        const textContent = node.getTextContent();
        
        // Check if the line starts with "- " and it's the only content
        if (textContent === "- ") {
          // Get the parent paragraph
          const paragraph = node.getParent();
          if (!paragraph) return;
          
          editor.update(() => {
            // Create a new list
            const listNode = $createListNode('bullet');
            const listItemNode = $createListItemNode();
            
            // Replace the paragraph with the list
            paragraph.replace(listNode);
            listNode.append(listItemNode);
            
            // Create a new paragraph node for the list item content
            const newParagraph = $createParagraphNode();
            listItemNode.append(newParagraph);
            
            // Move selection into the list item
            newParagraph.select();
          });
        }
      });
    });
  }, [editor]);

  return null;
}
