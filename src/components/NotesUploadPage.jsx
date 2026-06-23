import React, { useState, useRef } from 'react';
import {
  FolderPlus, Folder, FolderOpen, FileText, Image as ImageIcon,
  FileSpreadsheet, Presentation, File as FileIcon, ChevronRight, ChevronDown,
  Trash2, Edit3, MoreHorizontal, Search, ExternalLink, BookOpen, Layers,
  UploadCloud,
} from 'lucide-react';

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');`;

const SANS = { fontFamily: "'Space Grotesk', sans-serif" };
const MONO = { fontFamily: "'JetBrains Mono', monospace" };

/* ── seed data ──────────────────────────────────────────────────────────── */
const seed = {
  folders: [
    { id: 'f1', name: 'Physics',     open: true  },
    { id: 'f2', name: 'Mathematics', open: false },
    { id: 'f3', name: 'Chemistry',   open: false },
  ],
  notes: [
    { id: 'n1', folderId: 'f1', name: 'Newtons_Laws_Chapter4.pdf',   size: 842000,  ext: 'pdf',  uploadedAt: '10:02',     url: null },
    { id: 'n2', folderId: 'f1', name: 'inclined_plane_diagram.png',  size: 215000,  ext: 'png',  uploadedAt: '11:15',     url: null },
    { id: 'n3', folderId: 'f2', name: 'Integration_by_Parts.docx',   size: 64000,   ext: 'docx', uploadedAt: '09:30',     url: null },
    { id: 'n4', folderId: 'f3', name: 'Periodic_Table_Notes.pdf',    size: 1240000, ext: 'pdf',  uploadedAt: 'Yesterday', url: null },
  ],
};

let _nextId = 100;
const uid = () => `id_${_nextId++}`;
const nowTs = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatSize = (b) => (b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

const ICONS = {
  pdf: FileText, doc: FileText, docx: FileText, txt: FileText,
  xls: FileSpreadsheet, xlsx: FileSpreadsheet, csv: FileSpreadsheet,
  ppt: Presentation, pptx: Presentation,
  png: ImageIcon, jpg: ImageIcon, jpeg: ImageIcon, gif: ImageIcon, webp: ImageIcon, svg: ImageIcon,
};
const iconFor = (ext) => ICONS[ext] || FileIcon;

const COLORS = {
  pdf: '#C0392B', doc: '#2563EB', docx: '#2563EB', txt: '#0A0A0A',
  xls: '#15803D', xlsx: '#15803D', csv: '#15803D',
  ppt: '#D97706', pptx: '#D97706',
  png: '#7C3AED', jpg: '#7C3AED', jpeg: '#7C3AED', gif: '#7C3AED', webp: '#7C3AED', svg: '#7C3AED',
};
const colorFor = (ext) => COLORS[ext] || '#0A0A0A';

/* ═══════════════════════════════════════════════════════════════════════════
   Sidebar
═══════════════════════════════════════════════════════════════════════════ */
const Sidebar = ({ folders, notes, activeFolderId, onSelectFolder, onNewFolder, onRenameFolder, onDeleteFolder, onToggleFolder, onDeleteNote, onMoveNote }) => {
  const [editFolderId, setEditFolderId]     = useState(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [search, setSearch]                 = useState('');
  const [menuNote, setMenuNote]             = useState(null);

  const filtered = search.trim()
    ? notes.filter(n => n.name.toLowerCase().includes(search.toLowerCase()))
    : null;

  const startRename = (f) => { setEditFolderId(f.id); setEditFolderName(f.name); };
  const commitRename = () => { onRenameFolder(editFolderId, editFolderName); setEditFolderId(null); };

  const NoteRow = ({ note }) => {
    const Icon = iconFor(note.ext);
    return (
      <div className="group relative flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#0A0A0A]/06 text-[#0A0A0A]/70 transition-colors">
        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: colorFor(note.ext) }} />
        <span className="text-xs truncate flex-1" style={SANS} title={note.name}>{note.name}</span>
        <button
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#0A0A0A]/40 hover:text-[#0A0A0A]"
          onClick={(e) => { e.stopPropagation(); setMenuNote(menuNote === note.id ? null : note.id); }}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
        {menuNote === note.id && (
          <div className="absolute right-0 top-7 z-50 bg-white border border-[#0A0A0A]/10 rounded-lg shadow-lg py-1 w-40" onClick={e => e.stopPropagation()}>
            {folders.map(f => f.id !== note.folderId && (
              <button key={f.id} className="w-full text-left px-3 py-1.5 text-xs text-[#0A0A0A]/70 hover:bg-[#0A0A0A]/05 flex items-center gap-2" style={SANS}
                onClick={() => { onMoveNote(note.id, f.id); setMenuNote(null); }}>
                <Folder className="w-3 h-3" /> Move to {f.name}
              </button>
            ))}
            <div className="border-t border-[#0A0A0A]/08 my-1" />
            <button className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2" style={SANS}
              onClick={() => { onDeleteNote(note.id); setMenuNote(null); }}>
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 shrink-0 bg-[#F8F8F7] border-r border-[#0A0A0A]/08 flex flex-col h-full">

      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-[#0A0A0A]/08">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-[#0A0A0A] flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm text-[#0A0A0A]" style={SANS}>Hal Karo · Notes</span>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-[#0A0A0A]/12 rounded-md px-2.5 py-1.5">
          <Search className="w-3.5 h-3.5 text-[#0A0A0A]/35 shrink-0" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="flex-1 text-xs outline-none bg-transparent placeholder:text-[#0A0A0A]/30"
            style={SANS}
          />
        </div>
      </div>

      {/* All notes + new folder */}
      <div className="px-3 pt-3 flex gap-2">
        <button onClick={() => onSelectFolder('ALL')}
          className={`flex-1 flex items-center justify-between gap-1.5 py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors ${
            activeFolderId === 'ALL' ? 'bg-[#0A0A0A] text-white' : 'bg-white border border-[#0A0A0A]/12 text-[#0A0A0A]/70 hover:border-[#0A0A0A]/30'}`}
          style={SANS}>
          <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> All notes</span>
          <span className={activeFolderId === 'ALL' ? 'text-white/50' : 'text-[#0A0A0A]/35'} style={MONO}>{notes.length}</span>
        </button>
        <button onClick={onNewFolder}
          className="p-1.5 rounded-md border border-[#0A0A0A]/15 text-[#0A0A0A]/50 hover:border-[#0A0A0A]/35 hover:text-[#0A0A0A] transition-colors"
          title="New folder">
          <FolderPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-1" onClick={() => setMenuNote(null)}>

        {filtered ? (
          <>
            <p className="text-[10px] uppercase tracking-widest text-[#0A0A0A]/30 px-1 mb-2" style={MONO}>Results</p>
            {filtered.length === 0
              ? <p className="text-xs text-[#0A0A0A]/35 px-1" style={SANS}>No notes found.</p>
              : filtered.map(n => <NoteRow key={n.id} note={n} />)
            }
          </>
        ) : (
          folders.map(folder => {
            const folderNotes = notes.filter(n => n.folderId === folder.id);
            return (
              <div key={folder.id}>
                {/* Folder row */}
                <div className={`group flex items-center gap-1.5 px-1 py-1 rounded-md cursor-pointer transition-colors ${
                    activeFolderId === folder.id ? 'bg-[#0A0A0A]/08' : 'hover:bg-[#0A0A0A]/05'}`}
                  onClick={() => { onToggleFolder(folder.id); onSelectFolder(folder.id); }}>
                  <button className="text-[#0A0A0A]/40 shrink-0">
                    {folder.open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                  {folder.open
                    ? <FolderOpen className="w-3.5 h-3.5 text-[#0A0A0A]/50 shrink-0" />
                    : <Folder     className="w-3.5 h-3.5 text-[#0A0A0A]/50 shrink-0" />
                  }
                  {editFolderId === folder.id ? (
                    <input
                      autoFocus
                      value={editFolderName}
                      onChange={e => setEditFolderName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditFolderId(null); }}
                      className="flex-1 text-xs outline-none bg-transparent border-b border-[#0A0A0A]/30"
                      style={SANS}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className="flex-1 text-xs font-medium text-[#0A0A0A]/70 truncate" style={SANS}>{folder.name}</span>
                  )}
                  <span className="text-[10px] text-[#0A0A0A]/30 shrink-0" style={MONO}>{folderNotes.length}</span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button className="p-0.5 text-[#0A0A0A]/35 hover:text-[#0A0A0A]" onClick={() => startRename(folder)}>
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button className="p-0.5 text-[#0A0A0A]/35 hover:text-red-500" onClick={() => onDeleteFolder(folder.id)}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {/* Notes inside folder */}
                {folder.open && (
                  <div className="ml-5 mt-0.5 space-y-0.5 border-l border-[#0A0A0A]/08 pl-2">
                    {folderNotes.length === 0
                      ? <p className="text-[11px] text-[#0A0A0A]/25 py-1 px-1" style={SANS}>No notes yet</p>
                      : folderNotes.map(n => <NoteRow key={n.id} note={n} />)
                    }
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Unsorted */}
        {!filtered && (() => {
          const loose = notes.filter(n => !folders.find(f => f.id === n.folderId));
          if (loose.length === 0) return null;
          return (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#0A0A0A]/30 px-1 mt-3 mb-1" style={MONO}>Unsorted</p>
              <div className="space-y-0.5">{loose.map(n => <NoteRow key={n.id} note={n} />)}</div>
            </div>
          );
        })()}
      </div>
    </aside>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Note card
═══════════════════════════════════════════════════════════════════════════ */
const NoteCard = ({ note, onDelete, folderName }) => {
  const Icon = iconFor(note.ext);
  const color = colorFor(note.ext);
  const uploading = note.progress !== null && note.progress !== undefined;

  return (
    <div className="group relative bg-white border border-[#0A0A0A]/10 rounded-xl p-4 hover:border-[#0A0A0A]/25 hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}14` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {note.url && (
            <a href={note.url} target="_blank" rel="noreferrer"
              className="p-1.5 rounded-md text-[#0A0A0A]/40 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/06" title="Open">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button onClick={() => onDelete(note.id)}
            className="p-1.5 rounded-md text-[#0A0A0A]/40 hover:text-red-500 hover:bg-red-50" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className="text-xs font-medium text-[#0A0A0A] truncate mb-1" style={SANS} title={note.name}>{note.name}</p>
      <div className="flex items-center gap-2 text-[10px] text-[#0A0A0A]/35 truncate" style={MONO}>
        <span className="shrink-0">{formatSize(note.size)}</span>
        <span className="shrink-0">·</span>
        <span className="shrink-0">{note.uploadedAt}</span>
        {folderName && <><span className="shrink-0">·</span><span className="truncate">{folderName}</span></>}
      </div>
      {uploading && (
        <div className="mt-2.5 h-1 bg-[#0A0A0A]/08 rounded-full overflow-hidden">
          <div className="h-full bg-[#0A0A0A] rounded-full transition-all duration-300" style={{ width: `${Math.min(note.progress, 100)}%` }} />
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Main area
═══════════════════════════════════════════════════════════════════════════ */
const MainArea = ({ folder, notes, folders, onUpload, onDelete }) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const title = folder ? folder.name : 'All notes';
  const handleFiles = (fileList) => { if (fileList && fileList.length) onUpload(fileList); };

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0">

      {/* Top bar */}
      <div className="h-14 border-b border-[#0A0A0A]/08 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {folder && <Folder className="w-3.5 h-3.5 text-[#0A0A0A]/40 shrink-0" />}
          <span className="text-sm font-semibold text-[#0A0A0A] truncate" style={SANS}>{title}</span>
        </div>
        <span className="text-[11px] text-[#0A0A0A]/30 shrink-0 ml-4" style={MONO}>
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Body */}
      <div
        className="flex-1 overflow-y-auto px-6 py-6"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      >
        <input ref={inputRef} type="file" multiple className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />

        <button onClick={() => inputRef.current?.click()}
          className={`w-full mb-6 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-10 transition-colors ${
            dragOver ? 'border-[#0A0A0A]/50 bg-[#0A0A0A]/04' : 'border-[#0A0A0A]/15 hover:border-[#0A0A0A]/30 hover:bg-[#0A0A0A]/02'}`}>
          <div className="w-10 h-10 rounded-full bg-[#0A0A0A] flex items-center justify-center">
            <UploadCloud className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm font-medium text-[#0A0A0A]" style={SANS}>
            {dragOver ? 'Drop to upload' : 'Drag notes here, or click to browse'}
          </p>
          <p className="text-[11px] text-[#0A0A0A]/35" style={MONO}>PDF, DOCX, PPTX, images, and more</p>
        </button>

        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3 text-[#0A0A0A]/30">
            <BookOpen className="w-8 h-8 opacity-20" />
            <p className="text-sm" style={SANS}>No notes here yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
            {notes.map(n => (
              <NoteCard key={n.id} note={n} onDelete={onDelete}
                folderName={!folder ? folders.find(f => f.id === n.folderId)?.name : null} />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[#0A0A0A]/08 px-4 py-2.5 shrink-0">
        <p className="text-[10px] text-[#0A0A0A]/25 text-center" style={MONO}>
          Notes are kept in this browser session only · connect storage to persist them across reloads
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Root
═══════════════════════════════════════════════════════════════════════════ */
export default function NotesUploadPage() {
  const [folders, setFolders] = useState(seed.folders);
  const [notes, setNotes]     = useState(seed.notes);
  const [activeFolderId, setActiveFolderId] = useState('ALL');

  /* ── folder ops ── */
  const toggleFolder = (id) => setFolders(f => f.map(x => x.id === id ? { ...x, open: !x.open } : x));
  const newFolder    = ()   => setFolders(f => [...f, { id: uid(), name: 'New Folder', open: true }]);
  const renameFolder = (id, name) => setFolders(f => f.map(x => x.id === id ? { ...x, name } : x));
  const deleteFolder = (id) => {
    setFolders(f => f.filter(x => x.id !== id));
    setNotes(n => n.map(x => x.folderId === id ? { ...x, folderId: null } : x));
    if (activeFolderId === id) setActiveFolderId('ALL');
  };

  /* ── note ops ── */
  const selectFolder = (id) => setActiveFolderId(id);
  const deleteNote = (id) => setNotes(n => {
    const target = n.find(x => x.id === id);
    if (target?.url) URL.revokeObjectURL(target.url);
    return n.filter(x => x.id !== id);
  });
  const moveNote = (noteId, folderId) => setNotes(n => n.map(x => x.id === noteId ? { ...x, folderId } : x));

  /* ── upload (simulated progress, real object URLs) ── */
  const uploadFiles = (fileList) => {
    const targetFolder = activeFolderId === 'ALL' ? (folders[0]?.id || null) : activeFolderId;
    Array.from(fileList).forEach(file => {
      const id = uid();
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const url = URL.createObjectURL(file);
      const note = { id, folderId: targetFolder, name: file.name, size: file.size, ext, uploadedAt: nowTs(), url, progress: 0 };
      setNotes(n => [note, ...n]);

      let p = 0;
      const tick = setInterval(() => {
        p += 20 + Math.random() * 25;
        if (p >= 100) {
          clearInterval(tick);
          setNotes(n => n.map(x => x.id === id ? { ...x, progress: null } : x));
        } else {
          setNotes(n => n.map(x => x.id === id ? { ...x, progress: p } : x));
        }
      }, 200);
    });
    if (targetFolder) setFolders(f => f.map(x => x.id === targetFolder ? { ...x, open: true } : x));
  };

  const activeFolder = activeFolderId === 'ALL' ? null : (folders.find(f => f.id === activeFolderId) || null);
  const visibleNotes = activeFolderId === 'ALL' ? notes : notes.filter(n => n.folderId === activeFolderId);

  return (
    <div className="h-screen flex bg-white text-[#0A0A0A] overflow-hidden" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <style>{FONTS}</style>

      <Sidebar
        folders={folders} notes={notes} activeFolderId={activeFolderId}
        onSelectFolder={selectFolder} onNewFolder={newFolder}
        onRenameFolder={renameFolder} onDeleteFolder={deleteFolder}
        onToggleFolder={toggleFolder} onDeleteNote={deleteNote} onMoveNote={moveNote}
      />

      <MainArea
        folder={activeFolder} notes={visibleNotes} folders={folders}
        onUpload={uploadFiles} onDelete={deleteNote}
      />
    </div>
  );
}