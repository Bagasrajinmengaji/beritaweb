'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useTheme } from 'next-themes';

export interface RichTextEditorProps {
  /** The current HTML content (standard prop name) */
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
  /** Editor container height (default: 520) */
  height?: number | string;
  /** Optional additional CSS classes */
  className?: string;
}

const FALLBACK_TINYMCE_API_KEY = 'cz4qhu3ebm42kw35e0qcfait736p8uukn8wk4b499uv7am4w';

export function RichTextEditor({
  value,
  content,
  onChange,
  placeholder = 'Tulis atau tempel naskah berita di sini...',
  disabled = false,
  hasError = false,
  height = 520,
  className = '',
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<unknown>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || FALLBACK_TINYMCE_API_KEY;
  const currentContent = value ?? content ?? '';
  const isDark = resolvedTheme === 'dark';

  if (!mounted) {
    return (
      <div
        className={`w-full rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900/50 p-6 flex flex-col items-center justify-center gap-3 animate-pulse ${
          hasError ? 'border-rose-500' : ''
        } ${className}`}
        style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
      >
        <div className="h-8 w-48 bg-stone-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-3 w-72 bg-stone-200 dark:bg-zinc-800 rounded" />
        <div className="h-3 w-56 bg-stone-200 dark:bg-zinc-800 rounded" />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden transition-all duration-200 ${
        hasError
          ? 'ring-2 ring-rose-500 border border-rose-500'
          : 'border border-stone-200 dark:border-zinc-800 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20'
      } ${className}`}
    >
      <Editor
        apiKey={apiKey}
        cloudChannel="8" // TinyMCE CDN major channel 8 (never hardcode minor/patch versions)
        tinymceScriptSrc={`https://cdn.tiny.cloud/1/${apiKey}/tinymce/8/tinymce.min.js`}
        onInit={(_evt, editor) => {
          editorRef.current = editor;
        }}
        value={currentContent}
        onEditorChange={(newContent) => {
          onChange(newContent);
        }}
        disabled={disabled}
        init={{
          height,
          placeholder,
          branding: false,
          promotion: false,
          menubar: 'file edit view insert format tools table help',
          // ── 1. Plugins: Baseline Open-Source + Premium Newsroom Plugins ────────
          plugins: [
            // Open-Source Baseline Plugins
            'accordion',
            'advlist',
            'anchor',
            'autolink',
            'autosave',
            'charmap',
            'code',
            'codesample',
            'directionality',
            'emoticons',
            'fullscreen',
            'help',
            'image',
            'importcss',
            'insertdatetime',
            'link',
            'lists',
            'media',
            'nonbreaking',
            'pagebreak',
            'preview',
            'quickbars',
            'save',
            'searchreplace',
            'table',
            'visualblocks',
            'visualchars',
            'wordcount',

            // Premium Plugins Selection
            'tableofcontents', // Auto-generate TOC for long-form / deep-dive news
            'footnotes',        // Citations and reference notes for interview sources
            'importword',       // Direct MS Word document import for journalist drafts
            'powerpaste',       // Clean pasting from Google Docs & Word without broken HTML markup
            'tinymceai',        // AI Assistant for news headlines, proofreading, and tone adjustment
          ],

          // ── 2. Primary Toolbar with Full Alignment & News Editing Tools ─────
          toolbar:
            'undo redo | blocks fontfamily fontsize | ' +
            'bold italic underline strikethrough | forecolor backcolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | ' +
            'link image media table blockquote | ' +
            'footnotes tableofcontents | ' +
            'tinymceai | ' +
            'code preview fullscreen',

          // ── 3. Quickbars & Newsroom Contextual Actions ──────────────────────
          quickbars_selection_toolbar:
            'bold italic underline | quicklink blockquote | alignleft aligncenter alignright',
          quickbars_insert_toolbar: 'quickimage quicktable | hr pagebreak',

          // ── 4. Powerpaste Configuration (Clean Imports from Docs / Word) ────
          powerpaste_word_import: 'clean',
          powerpaste_html_import: 'clean',
          autosave_ask_before_unload: true,
          autosave_interval: '30s',

          // ── 5. AI Trial Token Authorization Provider ────────────────────────
          tinymceai_token_provider: (
            success: (token: string) => void,
            failure: (error: string) => void
          ) => {
            fetch('https://api.tiny.cloud/v1/ai/jwt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ apiKey }),
            })
              .then((res) => {
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                return res.json();
              })
              .then((data) => success(data.token))
              .catch((err) =>
                failure(err?.message ?? 'TinyMCE AI token acquisition failed.')
              );
          },

          // ── 6. Image Upload Handler (Custom Next.js API /api/upload) ────────
          /*
           * Custom Image Upload Handler for Next.js:
           * Streams uploaded media directly to the custom Next.js API route (`/api/upload`)
           * or encodes locally into base64 as fallback.
           */
          images_upload_handler: async (blobInfo: { blob: () => Blob; filename: () => string; base64: () => string }) => {
            try {
              // Optional implementation for custom Next.js image upload handler:
              // const formData = new FormData();
              // formData.append('file', blobInfo.blob(), blobInfo.filename());
              // const res = await fetch('/api/upload', { method: 'POST', body: formData });
              // if (!res.ok) throw new Error('Upload failed');
              // const data = await res.json();
              // return data.url || data.location;

              // Fallback to Base64 Data URI for immediate newsroom previews:
              return `data:${blobInfo.blob().type};base64,${blobInfo.base64()}`;
            } catch (err: unknown) {
              throw new Error(err instanceof Error ? err.message : 'Upload failed');
            }
          },

          // ── 7. Theme, Skin, and Isolated Styling Guardrails ─────────────────
          skin: isDark ? 'oxide-dark' : 'oxide',
          content_css: isDark ? 'dark' : 'default',
          content_style: `
            body {
              font-family: Inter, Helvetica, Arial, sans-serif;
              font-size: 16px;
              line-height: 1.6;
              color: ${isDark ? '#f4f4f5' : '#1c1917'};
              background-color: ${isDark ? '#18181b' : '#ffffff'};
              padding: 1rem 1.25rem;
            }
            img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 1rem 0;
            }
            blockquote {
              border-left: 4px solid #ea580c;
              margin: 1.2rem 0;
              padding: 0.5rem 0 0.5rem 1.25rem;
              color: ${isDark ? '#a1a1aa' : '#78716c'};
              font-style: italic;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1rem 0;
            }
            table td, table th {
              border: 1px solid ${isDark ? '#3f3f46' : '#e7e5e4'};
              padding: 8px 12px;
            }
            h1, h2, h3, h4, h5, h6 {
              color: ${isDark ? '#fafafa' : '#0c0a09'};
              font-weight: 700;
              margin-top: 1.5rem;
              margin-bottom: 0.75rem;
            }
            a {
              color: #ea580c;
              text-decoration: underline;
            }
            .mce-footnotes {
              margin-top: 2rem;
              padding-top: 1rem;
              border-top: 1px dashed ${isDark ? '#3f3f46' : '#d6d3d1'};
              font-size: 0.875rem;
              color: ${isDark ? '#a1a1aa' : '#78716c'};
            }
          `,
        }}
      />
    </div>
  );
}

export default RichTextEditor;
