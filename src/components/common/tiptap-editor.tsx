"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Quote } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

export function TipTapEditor({
  content,
  onChange,
  editable = true,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync local editor content with the `content` prop (e.g., when clearing input)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // transform current editor content to HTML to compare,
      // or just set it if it's empty to avoid cursor jumps on every keystroke
      // A simple check is if content is empty string, we clear.
      if (content === "") {
        editor.commands.clearContent();
      } else if (editor.getHTML() !== content) {
        // Only set content if it's materially different to avoid cursor reset
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className="border rounded-md cursor-text bg-background"
      onClick={() => {
        if (!editor.isFocused) {
          editor.chain().focus().run();
        }
      }}
    >
      {editable && (
        <div className="border-b p-2 flex gap-1 bg-muted/20">
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("blockquote")}
            onPressedChange={() =>
              editor.chain().focus().toggleBlockquote().run()
            }
          >
            <Quote className="h-4 w-4" />
          </Toggle>
        </div>
      )}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[80px] max-h-[200px] overflow-y-auto outline-none"
      />
    </div>
  );
}
