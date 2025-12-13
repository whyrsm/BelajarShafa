'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Ketik di sini...',
  maxLength,
  className = '',
}: RichTextEditorProps) {
  const [textLength, setTextLength] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const currentLength = text.length;
      
      // Check max length if provided
      if (maxLength && currentLength > maxLength) {
        // Revert to previous content if max length exceeded
        // This prevents typing beyond the limit
        const previousContent = value || '';
        editor.commands.setContent(previousContent);
        return;
      }
      
      setTextLength(currentLength);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none min-h-[120px] px-3 py-2 text-sm ${className}`,
      },
    },
  });

  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      setTextLength(text.length);
      
      // Only update if the value actually changed (to avoid infinite loops)
      const currentHtml = editor.getHTML();
      if (value !== currentHtml) {
        editor.commands.setContent(value || '');
      }
    }
  }, [value, editor]);

  // Handle max length on input
  useEffect(() => {
    if (editor && maxLength) {
      const handleBeforeInput = () => {
        const text = editor.getText();
        if (text.length >= maxLength) {
          return false; // Prevent input
        }
        return true;
      };
      
      // Note: Tiptap doesn't have a direct beforeInput handler,
      // but we can use the onUpdate handler which already checks maxLength
    }
  }, [editor, maxLength]);

  if (!isMounted || !editor) {
    return (
      <div className="border border-input rounded-md bg-background min-h-[120px] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Memuat editor...</div>
      </div>
    );
  }

  return (
    <div className="border border-input rounded-md bg-background">
      <div className="flex items-center gap-2 p-2 border-b border-input bg-muted/50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={editor.isActive('bold')}
          className={`px-2 py-1 rounded text-sm font-semibold transition-colors ${
            editor.isActive('bold')
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-foreground'
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={editor.isActive('italic')}
          className={`px-2 py-1 rounded text-sm italic transition-colors ${
            editor.isActive('italic')
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-foreground'
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={editor.isActive('bulletList')}
          className={`px-2 py-1 rounded text-sm transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-foreground'
          }`}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={editor.isActive('orderedList')}
          className={`px-2 py-1 rounded text-sm transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-foreground'
          }`}
        >
          1.
        </button>
        <div className="flex-1" />
        {maxLength && (
          <span className={`text-xs ${textLength > maxLength ? 'text-destructive' : 'text-muted-foreground'}`}>
            {textLength} / {maxLength} karakter
          </span>
        )}
      </div>
      <div className="min-h-[120px] max-h-[300px] overflow-y-auto [&_.ProseMirror]:outline-none [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror_p]:my-2 [&_.ProseMirror_p:first-child]:mt-0 [&_.ProseMirror_p:last-child]:mb-0 [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ol]:my-2 [&_.ProseMirror_li]:my-1">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

