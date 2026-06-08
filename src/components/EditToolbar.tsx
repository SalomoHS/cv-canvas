"use client";

import { useCallback } from "react";

const FONT_FAMILIES = [
  "Times New Roman",
  "Arial",
  "Calibri",
  "Cambria",
  "Georgia",
  "Helvetica",
  "Verdana",
  "Courier New",
  "Garamond",
  "Tahoma",
  "Trebuchet MS",
  "Book Antiqua",
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 42, 48, 60, 72];

export function EditToolbar() {
  const exec = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
  }, []);

  const applyFontSize = useCallback((size: number) => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || sel.isCollapsed) return;
    const html = `<span style="font-size: ${size}pt">${sel.toString()}</span>`;
    document.execCommand("insertHTML", false, html);
  }, []);

  return (
    <div className="edit-toolbar" role="toolbar" aria-label="Text formatting">
      <div className="edit-toolbar-group">
        <div className="edit-toolbar-group-label">Actions</div>
        <div className="edit-toolbar-row">
          <button
            className="toolbar-btn"
            onMouseDown={(e) => { e.preventDefault(); exec("undo"); }}
            title="Undo (Ctrl+Z)"
            type="button"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M4.5 2.5a.5.5 0 0 1 .5.5v2.5h6.5A2.5 2.5 0 0 1 14 8v2a.5.5 0 0 1-1 0V8a1.5 1.5 0 0 0-1.5-1.5H5v2.5a.5.5 0 0 1-.854.354l-3-3a.5.5 0 0 1 0-.708l3-3A.5.5 0 0 1 4.5 2.5Z"/></svg>
            <span className="toolbar-btn-label">Undo</span>
          </button>
          <button
            className="toolbar-btn"
            onMouseDown={(e) => { e.preventDefault(); exec("redo"); }}
            title="Redo (Ctrl+Shift+Z)"
            type="button"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M11.5 2.5a.5.5 0 0 0-.5.5v2.5H4.5A2.5 2.5 0 0 0 2 8v2a.5.5 0 0 0 1 0V8a1.5 1.5 0 0 1 1.5-1.5H11v2.5a.5.5 0 0 0 .854.354l3-3a.5.5 0 0 0 0-.708l-3-3A.5.5 0 0 0 11.5 2.5Z"/></svg>
            <span className="toolbar-btn-label">Redo</span>
          </button>
        </div>
      </div>

      <div className="edit-toolbar-divider" />

      <div className="edit-toolbar-group">
        <div className="edit-toolbar-group-label">Font</div>
        <div className="edit-toolbar-row">
          <button
            className="toolbar-btn"
            onMouseDown={(e) => { e.preventDefault(); exec("bold"); }}
            title="Bold (Ctrl+B)"
            type="button"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M11.061 7.573A3.5 3.5 0 0 0 9.5 1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h5.5a3.5 3.5 0 0 0 1.383-6.73A3.5 3.5 0 0 0 11.06 7.573ZM7 3.5h2a1.5 1.5 0 0 1 0 3H7Zm3 9H7v-4h3a1.5 1.5 0 0 1 0 3Z"/></svg>
            <span className="toolbar-btn-label">Bold</span>
          </button>
          <button
            className="toolbar-btn"
            onMouseDown={(e) => { e.preventDefault(); exec("italic"); }}
            title="Italic (Ctrl+I)"
            type="button"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M12.5 2H7a.5.5 0 0 0 0 1h2.293l-4 10H3a.5.5 0 0 0 0 1h5.5a.5.5 0 0 0 0-1H6.207l4-10H12.5a.5.5 0 0 0 0-1Z"/></svg>
            <span className="toolbar-btn-label">Italic</span>
          </button>
          <button
            className="toolbar-btn"
            onMouseDown={(e) => { e.preventDefault(); exec("underline"); }}
            title="Underline (Ctrl+U)"
            type="button"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M4.5 1a.5.5 0 0 1 .5.5v5a3 3 0 0 0 6 0v-5a.5.5 0 0 1 1 0v5a4 4 0 0 1-8 0v-5a.5.5 0 0 1 .5-.5ZM1 14.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5Z"/></svg>
            <span className="toolbar-btn-label">Underline</span>
          </button>
          <button
            className="toolbar-btn"
            onMouseDown={(e) => { e.preventDefault(); exec("strikeThrough"); }}
            title="Strikethrough"
            type="button"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M6.333 5.686c0 .31.083.581.27.814H5.166a2.776 2.776 0 0 1-.099-.76c0-1.627 1.436-2.768 3.48-2.768 1.969 0 3.39 1.175 3.445 2.85h-1.23c-.11-1.08-.964-1.743-2.25-1.743-1.23 0-2.18.602-2.18 1.607Zm2.194 7.478c-2.153 0-3.589-1.107-3.705-2.81h1.23c.144 1.06 1.129 1.703 2.544 1.703 1.34 0 2.31-.705 2.31-1.675 0-.827-.547-1.374-1.914-1.675L8.046 8.5H1v-1h14v1h-3.504c.468.437.675.994.675 1.697 0 1.826-1.436 2.967-3.644 2.967Z"/></svg>
            <span className="toolbar-btn-label">Strike</span>
          </button>
        </div>
      </div>

      <div className="edit-toolbar-divider" />

      <div className="edit-toolbar-group">
        <div className="edit-toolbar-group-label">Style</div>
        <div className="edit-toolbar-row">
          <select
            className="toolbar-select"
            onChange={(e) => exec("fontName", e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            defaultValue=""
          >
            <option value="" disabled>Font</option>
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <select
            className="toolbar-select toolbar-select-size"
            onChange={(e) => applyFontSize(Number(e.target.value))}
            onMouseDown={(e) => e.stopPropagation()}
            defaultValue=""
          >
            <option value="" disabled>Size</option>
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="edit-toolbar-divider" />

      <div className="edit-toolbar-group">
        <div className="edit-toolbar-group-label">Paragraph</div>
        <div className="edit-toolbar-row">
          <button
            className="toolbar-btn"
            onMouseDown={(e) => { e.preventDefault(); exec("justifyLeft"); }}
            title="Align Left"
            type="button"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Z"/></svg>
            <span className="toolbar-btn-label">Left</span>
          </button>
          <button
            className="toolbar-btn"
            onMouseDown={(e) => { e.preventDefault(); exec("justifyCenter"); }}
            title="Center"
            type="button"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2.5 3.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5Zm-2 3a.5.5 0 0 1 .5-.5h14a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5Zm2 3a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5Zm-2 3a.5.5 0 0 1 .5-.5h14a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5Z"/></svg>
            <span className="toolbar-btn-label">Center</span>
          </button>
          <button
            className="toolbar-btn"
            onMouseDown={(e) => { e.preventDefault(); exec("justifyRight"); }}
            title="Align Right"
            type="button"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2.5 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5Zm4 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm-4 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5Zm4 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Z"/></svg>
            <span className="toolbar-btn-label">Right</span>
          </button>
          <button
            className="toolbar-btn"
            onMouseDown={(e) => { e.preventDefault(); exec("justifyFull"); }}
            title="Justify"
            type="button"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5Z"/></svg>
            <span className="toolbar-btn-label">Justify</span>
          </button>
        </div>
      </div>
    </div>
  );
}
