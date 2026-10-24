'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';
import { type ReactNode, useEffect } from 'react';

// ─── Toolbar Button ───────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: ReactNode;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={[
        'flex h-8 w-8 items-center justify-center rounded-md text-xs transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
        isActive
          ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 font-semibold'
          : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-zinc-800',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function ToolbarDivider() {
  return (
    <span
      className="mx-1 h-5 w-px bg-stone-200 dark:bg-zinc-800"
      aria-hidden="true"
    />
  );
}

// ─── RichTextEditor ───────────────────────────────────────────────────────────

interface RichTextEditorProps {
  content: string;
  onChange: (htmlContent: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  disabled = false,
  hasError = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    content,
    immediatelyRender: false,
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert max-w-none focus:outline-none min-h-48 px-4 py-3.5 text-sm leading-relaxed text-zinc-900 dark:text-zinc-100 prose-a:text-orange-600 dark:prose-a:text-orange-400',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      const isEmpty = ed.isEmpty;
      onChange(isEmpty ? '' : html);
    },
  });

  // Sinkronisasi konten saat data async selesai dimuat
  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="rounded-xl border border-stone-200 dark:border-zinc-800 p-4 min-h-56 bg-white dark:bg-zinc-900 animate-pulse">
        <div className="skeleton h-8 w-full rounded mb-3" />
        <div className="skeleton h-32 w-full rounded" />
      </div>
    );
  }

  return (
    <div
      className={[
        'rounded-xl border overflow-hidden transition-colors duration-150 bg-white dark:bg-zinc-900',
        hasError
          ? 'border-red-400 dark:border-red-700'
          : 'border-stone-200 dark:border-zinc-800 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20',
        disabled ? 'opacity-60 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {/* ── Toolbar ── */}
      <div
        className="flex flex-wrap items-center gap-0.5 border-b border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900/80 px-2.5 py-1.5"
        role="toolbar"
        aria-label="Pemformatan Teks"
      >
        {/* Bold */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          disabled={disabled}
          title="Tebal (Ctrl+B)"
        >
          <Bold size={15} aria-hidden="true" />
        </ToolbarButton>

        {/* Italic */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          disabled={disabled}
          title="Miring (Ctrl+I)"
        >
          <Italic size={15} aria-hidden="true" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Heading 2 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          disabled={disabled}
          title="Subjudul (H2)"
        >
          <Heading2 size={16} aria-hidden="true" />
        </ToolbarButton>

        {/* Heading 3 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          disabled={disabled}
          title="Bagian Kecil (H3)"
        >
          <Heading3 size={16} aria-hidden="true" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Bullet List */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          disabled={disabled}
          title="Daftar Poin"
        >
          <List size={16} aria-hidden="true" />
        </ToolbarButton>

        {/* Ordered List */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          disabled={disabled}
          title="Daftar Nomor"
        >
          <ListOrdered size={16} aria-hidden="true" />
        </ToolbarButton>

        {/* Blockquote */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          disabled={disabled}
          title="Kutipan (Blockquote)"
        >
          <Quote size={15} aria-hidden="true" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Undo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
          title="Urungkan (Undo)"
        >
          <Undo size={15} aria-hidden="true" />
        </ToolbarButton>

        {/* Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
          title="Ulangi (Redo)"
        >
          <Redo size={15} aria-hidden="true" />
        </ToolbarButton>
      </div>

      {/* ── Editor Canvas ── */}
      <div className="cursor-text" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default RichTextEditor;
