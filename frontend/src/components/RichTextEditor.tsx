'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

export interface RichTextEditorProps {
  /** The current HTML content */
  value?: string;
  /** Backward compatibility with existing callers using 'content' */
  content?: string;
  /** Callback fired whenever the editor HTML changes */
  onChange: (content: string) => void;
  /** Optional placeholder text when editor is empty */
  placeholder?: string;
  /** Disables editing mode */
  disabled?: boolean;
  /** Renders visual validation error border if true */
  hasError?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

// ─── 1. SSR-Safe Dynamic Import with Next.js ──────────────────────────────────
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[420px] w-full rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900/40 p-6 flex flex-col items-center justify-center gap-3 animate-pulse">
      <div className="h-9 w-64 bg-stone-200 dark:bg-zinc-800 rounded-lg" />
      <div className="h-3 w-80 bg-stone-200 dark:bg-zinc-800 rounded" />
      <div className="h-3 w-60 bg-stone-200 dark:bg-zinc-800 rounded" />
      <span className="text-xs text-stone-400 dark:text-stone-500 mt-2">
        Memuat editor naskah berita...
      </span>
    </div>
  ),
});

export function RichTextEditor({
  value,
  content,
  onChange,
  placeholder = 'Tulis naskah berita lengkap di sini...',
  disabled = false,
  hasError = false,
  className = '',
}: RichTextEditorProps) {
  const currentContent = value ?? content ?? '';

  // ─── 2. Newsroom Toolbar & Modules Configuration ────────────────────────────
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ align: [] }], // Text Alignment: left, center, right, justify
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'link', 'image'],
        ['clean'],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'align',
    'list',
    'bullet',
    'blockquote',
    'link',
    'image',
  ];

  return (
    <div
      className={`react-quill-newsroom relative w-full rounded-xl overflow-hidden transition-all duration-200 ${
        hasError
          ? 'ring-2 ring-rose-500 border border-rose-500'
          : 'focus-within:ring-2 focus-within:ring-orange-500/20'
      } ${className}`}
    >
      <ReactQuill
        theme="snow"
        value={currentContent}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
      />

      {/* ─── 3. Isolated Styling & UX (Responsive, 400px+ height, Dark Mode) ─── */}
      <style jsx global>{`
        .react-quill-newsroom .ql-toolbar.ql-snow {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          border: 1px solid #e7e5e4;
          background-color: #fafaf9;
          padding: 0.65rem 0.85rem;
          font-family: inherit;
        }
        .dark .react-quill-newsroom .ql-toolbar.ql-snow {
          border-color: #27272a;
          background-color: #18181b;
        }
        .dark .react-quill-newsroom .ql-toolbar .ql-stroke {
          stroke: #d4d4d8;
        }
        .dark .react-quill-newsroom .ql-toolbar .ql-fill {
          fill: #d4d4d8;
        }
        .dark .react-quill-newsroom .ql-toolbar .ql-picker {
          color: #d4d4d8;
        }
        .dark .react-quill-newsroom .ql-toolbar .ql-picker-options {
          background-color: #18181b;
          border-color: #27272a;
          color: #d4d4d8;
        }
        .react-quill-newsroom .ql-container.ql-snow {
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border: 1px solid #e7e5e4;
          border-top: none;
          min-height: 400px;
          font-size: 1rem;
          font-family: inherit;
          background-color: #ffffff;
        }
        .dark .react-quill-newsroom .ql-container.ql-snow {
          border-color: #27272a;
          border-top: none;
          background-color: #09090b;
          color: #f4f4f5;
        }
        .react-quill-newsroom .ql-editor {
          min-height: 380px;
          font-size: 1rem;
          line-height: 1.6;
          padding: 1rem 1.25rem;
        }
        .react-quill-newsroom .ql-editor.ql-blank::before {
          color: #a8a29e;
          font-style: normal;
        }
        .dark .react-quill-newsroom .ql-editor.ql-blank::before {
          color: #71717a;
        }
        .react-quill-newsroom .ql-editor blockquote {
          border-left: 4px solid #ea580c;
          padding-left: 1rem;
          color: #78716c;
          font-style: italic;
          margin: 1rem 0;
        }
        .dark .react-quill-newsroom .ql-editor blockquote {
          color: #a1a1aa;
        }
        .react-quill-newsroom .ql-editor img {
          border-radius: 0.5rem;
          margin: 1rem 0;
          max-width: 100%;
          height: auto;
        }
        .react-quill-newsroom .ql-snow .ql-tooltip {
          background-color: #ffffff;
          border-color: #e7e5e4;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
        }
        .dark .react-quill-newsroom .ql-snow .ql-tooltip {
          background-color: #18181b;
          border-color: #27272a;
          color: #f4f4f5;
        }
        .dark .react-quill-newsroom .ql-snow .ql-tooltip input[type='text'] {
          background-color: #27272a;
          border-color: #3f3f46;
          color: #f4f4f5;
        }
      `}</style>
    </div>
  );
}

export default RichTextEditor;
