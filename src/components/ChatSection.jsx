import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles, Send, Plus, FolderPlus, Folder, FolderOpen,
  MessageSquare, ChevronRight, ChevronDown, Trash2,
  Edit3, Check, X, MoreHorizontal, Search, BookOpen,
  FileText, Maximize2, ChevronLeft, Eye, Menu, Book,
} from 'lucide-react';

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');`;

/* ── seed data ──────────────────────────────────────────────────────────── */
const seed = {
  folders: [
    { id: 'f1', name: 'Physics',    open: true  },
    { id: 'f2', name: 'Mathematics', open: false },
    { id: 'f3', name: 'Chemistry',   open: false },
  ],
  chats: [
    {
      id: 'c1', folderId: 'f1', title: 'Newton\'s Laws',
      messages: [
        { id: 'm1', role: 'user',      text: 'Explain Newton\'s third law with an example.',        ts: '10:02' },
        { id: 'm2', role: 'assistant', text: 'Newton\'s third law states that for every action there is an equal and opposite reaction. When you push against a wall, the wall pushes back on you with the same force — that\'s why you don\'t move through it.', ts: '10:02' },
      ],
    },
    {
      id: 'c2', folderId: 'f1', title: 'Inclined Plane Doubt',
      messages: [
        { id: 'm3', role: 'user',      text: 'How do I resolve forces on an inclined plane?',      ts: '11:15' },
        { id: 'm4', role: 'assistant', text: 'Break the weight mg into two components: mg·sin(θ) along the incline and mg·cos(θ) perpendicular to it. The normal force N equals mg·cos(θ), and net acceleration along the incline is g·sin(θ) when friction is absent.', ts: '11:15' },
      ],
    },
    {
      id: 'c3', folderId: 'f2', title: 'Integration by Parts',
      messages: [
        { id: 'm5', role: 'user',      text: 'What is the formula for integration by parts?',       ts: '09:30' },
        { id: 'm6', role: 'assistant', text: '∫u·dv = u·v − ∫v·du. Choose u as the function that simplifies when differentiated (LIATE rule: Logarithm, Inverse trig, Algebraic, Trigonometric, Exponential).', ts: '09:31' },
      ],
    },
  ],
};

let _nextId = 100;
const uid = () => `id_${_nextId++}`;
const nowTs = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/* ── tiny AI stub (replace with real API call) ──────────────────────────── */
const fakeAI = async (question) => {
  await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
  return `Great question! Here's a step-by-step breakdown for: "${question.slice(0, 60)}${question.length > 60 ? '…' : ''}"\n\n1. Identify the key concept involved.\n2. Write down the relevant formula or principle.\n3. Substitute the given values carefully.\n4. Solve and verify the units.\n\nIf you need a deeper explanation of any step, just ask!`;
};

/* ── subject list (replaces PDF docs) ── */
const SUBJECTS = [
  { id: 's1', name: 'Physics', icon: '⚛️', description: 'Mechanics, Thermodynamics, Optics, Electromagnetism' },
  { id: 's2', name: 'Mathematics', icon: '📐', description: 'Algebra, Calculus, Trigonometry, Statistics' },
  { id: 's3', name: 'Chemistry', icon: '🧪', description: 'Organic, Inorganic, Physical Chemistry' },
  { id: 's4', name: 'Biology', icon: '🧬', description: 'Cell Biology, Genetics, Ecology, Human Anatomy' },
  { id: 's5', name: 'Computer Science', icon: '💻', description: 'Programming, Data Structures, Algorithms, AI' },
  { id: 's6', name: 'History', icon: '📜', description: 'Ancient, Medieval, Modern World History' },
  { id: 's7', name: 'Literature', icon: '📚', description: 'Poetry, Prose, Drama, Literary Criticism' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Sidebar (Mobile Friendly with Drawer)
═══════════════════════════════════════════════════════════════════════════ */
const Sidebar = ({ folders, chats, activeChatId, onSelectChat, onNewChat, onNewFolder, onDeleteChat, onRenameFolder, onDeleteFolder, onToggleFolder, onMoveChat, mobileOpen, setMobileOpen }) => {
  const [editFolderId, setEditFolderId]     = useState(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [search, setSearch]                 = useState('');
  const [menuChat, setMenuChat]             = useState(null);

  const filtered = search.trim()
    ? chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : null;

  const startRenameFolder = (f) => { setEditFolderId(f.id); setEditFolderName(f.name); };
  const commitRenameFolder = () => { onRenameFolder(editFolderId, editFolderName); setEditFolderId(null); };

  const SANS  = { fontFamily: "'Space Grotesk', sans-serif" };
  const MONO  = { fontFamily: "'JetBrains Mono', monospace" };

  const handleSelectChat = (id) => {
    onSelectChat(id);
    if (window.innerWidth < 1024) setMobileOpen(false);
  };

  const ChatRow = ({ chat }) => (
    <div
      className={`group relative flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${activeChatId === chat.id ? 'bg-[#0A0A0A] text-white' : 'hover:bg-[#0A0A0A]/06 text-[#0A0A0A]/70'}`}
      onClick={() => handleSelectChat(chat.id)}
    >
      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
      <span className="text-xs truncate flex-1" style={SANS}>{chat.title}</span>
      <button
        className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${activeChatId === chat.id ? 'text-white/60 hover:text-white' : 'text-[#0A0A0A]/40 hover:text-[#0A0A0A]'}`}
        onClick={(e) => { e.stopPropagation(); setMenuChat(menuChat === chat.id ? null : chat.id); }}
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
      {menuChat === chat.id && (
        <div className="absolute right-0 top-7 z-50 bg-white border border-[#0A0A0A]/10 rounded-lg shadow-lg py-1 w-36" onClick={e => e.stopPropagation()}>
          {folders.map(f => f.id !== chat.folderId && (
            <button key={f.id} className="w-full text-left px-3 py-1.5 text-xs text-[#0A0A0A]/70 hover:bg-[#0A0A0A]/05 flex items-center gap-2" style={SANS}
              onClick={() => { onMoveChat(chat.id, f.id); setMenuChat(null); }}>
              <Folder className="w-3 h-3" /> Move to {f.name}
            </button>
          ))}
          <div className="border-t border-[#0A0A0A]/08 my-1" />
          <button className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2" style={SANS}
            onClick={() => { onDeleteChat(chat.id); setMenuChat(null); }}>
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-[#F8F8F7] border-r border-[#0A0A0A]/08 flex flex-col
        transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:w-64 lg:z-auto
        ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Mobile header with close button */}
        <div className="flex items-center justify-between lg:hidden px-4 pt-4 pb-3 border-b border-[#0A0A0A]/08">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0A0A0A] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-[#0A0A0A]" style={SANS}>Hal Karo</span>
          </div>
          <button 
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-md hover:bg-[#0A0A0A]/06 transition-colors"
          >
            <X className="w-5 h-5 text-[#0A0A0A]/60" />
          </button>
        </div>

        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-[#0A0A0A]/08 hidden lg:block">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-[#0A0A0A] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-[#0A0A0A]" style={SANS}>Hal Karo</span>
          </div>
          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-[#0A0A0A]/12 rounded-md px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-[#0A0A0A]/35 shrink-0" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search chats…"
              className="flex-1 text-xs outline-none bg-transparent placeholder:text-[#0A0A0A]/30"
              style={SANS}
            />
          </div>
        </div>

        {/* Mobile search */}
        <div className="px-4 pt-3 pb-2 lg:hidden">
          <div className="flex items-center gap-2 bg-white border border-[#0A0A0A]/12 rounded-md px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-[#0A0A0A]/35 shrink-0" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search chats…"
              className="flex-1 text-xs outline-none bg-transparent placeholder:text-[#0A0A0A]/30"
              style={SANS}
            />
          </div>
        </div>

        {/* New chat + new folder */}
        <div className="px-3 pt-3 flex gap-2">
          <button onClick={() => { onNewChat(); if (window.innerWidth < 1024) setMobileOpen(false); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-[#0A0A0A] text-white text-xs font-medium hover:bg-[#262626] transition-colors"
            style={SANS}>
            <Plus className="w-3.5 h-3.5" /> New chat
          </button>
          <button onClick={onNewFolder}
            className="p-1.5 rounded-md border border-[#0A0A0A]/15 text-[#0A0A0A]/50 hover:border-[#0A0A0A]/35 hover:text-[#0A0A0A] transition-colors shrink-0"
            title="New folder">
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-1" onClick={() => setMenuChat(null)}>

          {/* Search results */}
          {filtered ? (
            <>
              <p className="text-[10px] uppercase tracking-widest text-[#0A0A0A]/30 px-1 mb-2" style={MONO}>Results</p>
              {filtered.length === 0
                ? <p className="text-xs text-[#0A0A0A]/35 px-1" style={SANS}>No chats found.</p>
                : filtered.map(c => <ChatRow key={c.id} chat={c} />)
              }
            </>
          ) : (
            folders.map(folder => {
              const folderChats = chats.filter(c => c.folderId === folder.id);
              return (
                <div key={folder.id}>
                  {/* Folder row */}
                  <div className="group flex items-center gap-1.5 px-1 py-1 rounded-md hover:bg-[#0A0A0A]/05 cursor-pointer"
                    onClick={() => onToggleFolder(folder.id)}>
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
                        onKeyDown={e => { if (e.key === 'Enter') commitRenameFolder(); if (e.key === 'Escape') setEditFolderId(null); }}
                        className="flex-1 text-xs outline-none bg-transparent border-b border-[#0A0A0A]/30"
                        style={SANS}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span className="flex-1 text-xs font-medium text-[#0A0A0A]/70 truncate" style={SANS}>{folder.name}</span>
                    )}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button className="p-0.5 text-[#0A0A0A]/35 hover:text-[#0A0A0A]" onClick={() => startRenameFolder(folder)}>
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button className="p-0.5 text-[#0A0A0A]/35 hover:text-red-500" onClick={() => onDeleteFolder(folder.id)}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {/* Chats inside folder */}
                  {folder.open && (
                    <div className="ml-5 mt-0.5 space-y-0.5 border-l border-[#0A0A0A]/08 pl-2">
                      {folderChats.length === 0
                        ? <p className="text-[11px] text-[#0A0A0A]/25 py-1 px-1" style={SANS}>No chats yet</p>
                        : folderChats.map(c => <ChatRow key={c.id} chat={c} />)
                      }
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Uncategorized */}
          {!filtered && (() => {
            const loose = chats.filter(c => !folders.find(f => f.id === c.folderId));
            if (loose.length === 0) return null;
            return (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#0A0A0A]/30 px-1 mt-3 mb-1" style={MONO}>Unsorted</p>
                <div className="space-y-0.5">{loose.map(c => <ChatRow key={c.id} chat={c} />)}</div>
              </div>
            );
          })()}
        </div>
      </aside>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Compose Modal — opens when user clicks the input bar
═══════════════════════════════════════════════════════════════════════════ */
const ComposeModal = ({ open, onClose, onSend, initialText = '' }) => {
  const [text, setText] = useState(initialText);
  const [activeSubject, setActiveSubject] = useState(SUBJECTS[0]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(true);
  const textRef = useRef(null);

  useEffect(() => {
    if (open) {
      setText(initialText);
      setTimeout(() => textRef.current?.focus(), 80);
    }
  }, [open]);

  const filteredSubjects = subjectSearch.trim()
    ? SUBJECTS.filter(s => 
        s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        s.description.toLowerCase().includes(subjectSearch.toLowerCase())
      )
    : SUBJECTS;

  const handleSend = () => {
    const q = text.trim();
    if (!q) return;
    onSend(q);
    setText('');
    onClose();
  };

  const SANS = { fontFamily: "'Space Grotesk', sans-serif" };
  const MONO = { fontFamily: "'JetBrains Mono', monospace" };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
         onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-[2px]" />

      {/* Modal */}
      <div
        className="relative z-10 w-full md:max-w-5xl bg-white rounded-t-2xl md:rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.18)] border border-[#0A0A0A]/10 flex flex-col overflow-hidden"
        style={{ height: 'min(88vh, 680px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal topbar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#0A0A0A]/08 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-[#0A0A0A]/50 shrink-0" />
            <span className="text-sm font-medium text-[#0A0A0A] truncate" style={SANS}>Compose your doubt</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button onClick={() => setPanelOpen(p => !p)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-[#0A0A0A]/45 hover:text-[#0A0A0A] transition-colors px-2 py-1 rounded-md hover:bg-[#0A0A0A]/05"
              style={MONO}>
              {panelOpen ? <><ChevronRight className="w-3.5 h-3.5" /> Hide subjects</> : <><Eye className="w-3.5 h-3.5" /> Show subjects</>}
            </button>
            <button onClick={onClose} className="p-1 rounded-md text-[#0A0A0A]/40 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/06 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body: compose + subject panel */}
        <div className="flex flex-1 min-h-0 flex-col sm:flex-row">

          {/* Left: text compose */}
          <div className="flex flex-col flex-1 min-w-0">
            <textarea
              ref={textRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend(); }}
              placeholder={"Type your doubt in detail…\n\nTip: the more specific you are, the better the answer.\nE.g. \"Explain why mg·sin(θ) is the component along the incline and not mg·cos(θ)\""}
              className="flex-1 resize-none outline-none text-[15px] leading-relaxed text-[#0A0A0A] placeholder:text-[#0A0A0A]/25 px-4 sm:px-6 py-4 sm:py-5 bg-white min-h-[200px]"
              style={SANS}
            />

            {/* Bottom action bar */}
            <div className="px-4 sm:px-5 py-3 border-t border-[#0A0A0A]/08 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-2 sm:gap-3">
              <p className="text-[11px] text-[#0A0A0A]/30" style={MONO}>
                {text.length > 0 ? `${text.length} chars` : 'Ctrl+Enter to send'}
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm text-[#0A0A0A]/55 hover:text-[#0A0A0A] rounded-md border border-[#0A0A0A]/12 hover:border-[#0A0A0A]/30 transition-colors"
                  style={SANS}>
                  Cancel
                </button>
                <button onClick={handleSend} disabled={!text.trim()}
                  className="flex-1 sm:flex-none px-5 py-2 text-sm font-medium bg-[#0A0A0A] text-white rounded-md hover:bg-[#262626] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  style={SANS}>
                  <Send className="w-3.5 h-3.5" /> Send doubt
                </button>
              </div>
            </div>
          </div>

          {/* Right: subject panel */}
          {panelOpen && (
            <div className="w-full sm:w-72 shrink-0 border-t sm:border-t-0 sm:border-l border-[#0A0A0A]/08 flex flex-col bg-[#F8F8F7] max-h-[300px] sm:max-h-none">
              {/* Subject panel header */}
              <div className="px-4 pt-3 pb-2 border-b border-[#0A0A0A]/08">
                <p className="text-[10px] uppercase tracking-widest text-[#0A0A0A]/35 mb-2" style={MONO}>Subjects</p>
                <div className="flex items-center gap-1.5 bg-white border border-[#0A0A0A]/12 rounded-md px-2.5 py-1.5">
                  <Search className="w-3 h-3 text-[#0A0A0A]/30 shrink-0" />
                  <input value={subjectSearch} onChange={e => setSubjectSearch(e.target.value)}
                    placeholder="Search subjects…" className="flex-1 text-[11px] outline-none bg-transparent placeholder:text-[#0A0A0A]/25" style={SANS} />
                </div>
              </div>

              {/* Subject list */}
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                {filteredSubjects.length === 0 ? (
                  <p className="text-xs text-[#0A0A0A]/35 px-2 py-4 text-center" style={SANS}>No subjects found</p>
                ) : (
                  filteredSubjects.map(subject => (
                    <button key={subject.id}
                      onClick={() => setActiveSubject(subject)}
                      className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        activeSubject?.id === subject.id 
                          ? 'bg-[#0A0A0A] text-white' 
                          : 'hover:bg-[#0A0A0A]/06 text-[#0A0A0A]/70'
                      }`}>
                      <span className="text-lg shrink-0">{subject.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium truncate" style={SANS}>{subject.name}</p>
                        <p className={`text-[10px] mt-0.5 truncate ${
                          activeSubject?.id === subject.id ? 'text-white/60' : 'text-[#0A0A0A]/40'
                        }`} style={MONO}>
                          {subject.description}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Subject details preview */}
              {activeSubject && (
                <div className="border-t border-[#0A0A0A]/08 p-4 bg-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{activeSubject.icon}</span>
                    <p className="text-[12px] font-medium text-[#0A0A0A]" style={SANS}>{activeSubject.name}</p>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#0A0A0A]/60" style={MONO}>
                    {activeSubject.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Message bubble
═══════════════════════════════════════════════════════════════════════════ */
const Bubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#0A0A0A] flex items-center justify-center shrink-0 mr-2.5 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-[85%] sm:max-w-[72%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
        isUser
          ? 'bg-[#0A0A0A] text-white rounded-tr-sm'
          : 'bg-white border border-[#0A0A0A]/10 text-[#0A0A0A] rounded-tl-sm shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
      }`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {msg.text}
        <div className={`text-[10px] mt-1.5 ${isUser ? 'text-white/40' : 'text-[#0A0A0A]/30'}`}
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {msg.ts}
        </div>
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-[#0A0A0A]/10 flex items-center justify-center shrink-0 ml-2.5 mt-0.5">
          <span className="text-xs font-semibold text-[#0A0A0A]/60" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>U</span>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Chat area
═══════════════════════════════════════════════════════════════════════════ */
const ChatArea = ({ chat, onSend, onRenameChat, folders, onMenuToggle }) => {
  const [input,    setInput]    = useState('');
  const [thinking, setThinking] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [titleVal, setTitleVal]   = useState(chat?.title || '');
  const [modalOpen, setModalOpen] = useState(false);
  const bottomRef = useRef(null);
  const textRef   = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat?.messages]);
  useEffect(() => { setTitleVal(chat?.title || ''); setEditTitle(false); }, [chat?.id]);

  const send = async () => {
    const q = input.trim();
    if (!q || thinking) return;
    setInput('');
    setThinking(true);
    await onSend(q);
    setThinking(false);
    setTimeout(() => textRef.current?.focus(), 50);
  };

  const folder = folders.find(f => f.id === chat?.folderId);
  const SANS = { fontFamily: "'Space Grotesk', sans-serif" };
  const MONO = { fontFamily: "'JetBrains Mono', monospace" };

  if (!chat) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white gap-4 text-[#0A0A0A]/30 p-4">
      <BookOpen className="w-10 h-10 opacity-20" />
      <p className="text-sm text-center" style={SANS}>Select a chat or start a new one</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0">

      {/* Top bar with hamburger menu */}
      <div className="h-14 border-b border-[#0A0A0A]/08 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden p-1 -ml-1.5 rounded-md hover:bg-[#0A0A0A]/06 text-[#0A0A0A]/60 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          {folder && (
            <span className="text-[11px] text-[#0A0A0A]/35 flex items-center gap-1 shrink-0 hidden sm:flex" style={MONO}>
              <Folder className="w-3 h-3" />{folder.name}
              <ChevronRight className="w-3 h-3" />
            </span>
          )}
          {editTitle ? (
            <div className="flex items-center gap-1 min-w-0">
              <input autoFocus value={titleVal} onChange={e => setTitleVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { onRenameChat(chat.id, titleVal); setEditTitle(false); } if (e.key === 'Escape') setEditTitle(false); }}
                className="text-sm font-semibold text-[#0A0A0A] outline-none border-b border-[#0A0A0A]/30 bg-transparent min-w-0 flex-1"
                style={SANS} />
              <button onClick={() => { onRenameChat(chat.id, titleVal); setEditTitle(false); }} className="text-[#0A0A0A]/40 hover:text-[#0A0A0A] shrink-0"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => setEditTitle(false)} className="text-[#0A0A0A]/40 hover:text-[#0A0A0A] shrink-0"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <button onClick={() => setEditTitle(true)} className="text-sm font-semibold text-[#0A0A0A] hover:opacity-70 truncate text-left flex-1 min-w-0" style={SANS}>
              {chat.title}
            </button>
          )}
        </div>
        <span className="text-[11px] text-[#0A0A0A]/30 shrink-0 ml-2" style={MONO}>
          {chat.messages.length} msg{chat.messages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
        {chat.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-[#0A0A0A]/30">
            <Sparkles className="w-8 h-8 opacity-20" />
            <p className="text-sm" style={SANS}>Ask your first doubt below</p>
          </div>
        )}
        {chat.messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
        {thinking && (
          <div className="flex justify-start mb-4">
            <div className="w-7 h-7 rounded-full bg-[#0A0A0A] flex items-center justify-center shrink-0 mr-2.5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white border border-[#0A0A0A]/10 rounded-2xl rounded-tl-sm px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <span className="flex gap-1 items-center h-5">
                {[0,1,2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]/30 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose modal */}
      <ComposeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSend={async (text) => { setThinking(true); await onSend(text); setThinking(false); }}
        initialText={input}
      />

      {/* Input bar — clicking opens the modal */}
      <div className="border-t border-[#0A0A0A]/08 px-3 sm:px-4 py-3 shrink-0">
        <button
          onClick={() => !thinking && setModalOpen(true)}
          disabled={thinking}
          className="w-full flex items-center gap-2 sm:gap-3 bg-[#F8F8F7] border border-[#0A0A0A]/12 rounded-xl px-3 sm:px-4 py-3 hover:border-[#0A0A0A]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left group"
        >
          <span className="flex-1 text-sm text-[#0A0A0A]/30 group-hover:text-[#0A0A0A]/45 transition-colors truncate"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {thinking ? 'AI is thinking…' : 'Type your doubt…'}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-[#0A0A0A]/25 hidden md:block"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              opens with subject list
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#0A0A0A]/08 flex items-center justify-center group-hover:bg-[#0A0A0A] transition-colors">
              <Maximize2 className="w-3.5 h-3.5 text-[#0A0A0A]/40 group-hover:text-white transition-colors" />
            </div>
          </div>
        </button>
        <p className="text-[10px] text-[#0A0A0A]/25 mt-1.5 text-center"
           style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          AI answers may need verification · always cross-check with your notes
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Root
═══════════════════════════════════════════════════════════════════════════ */
export default function DoubtChat() {
  const [folders, setFolders]       = useState(seed.folders);
  const [chats,   setChats]         = useState(seed.chats);
  const [activeChatId, setActiveChatId] = useState('c1');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  /* ── folder ops ── */
  const toggleFolder = (id) => setFolders(f => f.map(x => x.id === id ? { ...x, open: !x.open } : x));
  const newFolder    = ()   => {
    const id = uid();
    setFolders(f => [...f, { id, name: 'New Folder', open: true }]);
  };
  const renameFolder = (id, name) => setFolders(f => f.map(x => x.id === id ? { ...x, name } : x));
  const deleteFolder = (id) => {
    setFolders(f => f.filter(x => x.id !== id));
    setChats(c => c.map(x => x.folderId === id ? { ...x, folderId: null } : x));
  };

  /* ── chat ops ── */
  const newChat = () => {
    const targetFolder = folders.find(f => f.open)?.id || folders[0]?.id || null;
    const id = uid();
    const chat = { id, folderId: targetFolder, title: 'New Doubt', messages: [] };
    setChats(c => [chat, ...c]);
    setActiveChatId(id);
    if (targetFolder) setFolders(f => f.map(x => x.id === targetFolder ? { ...x, open: true } : x));
    if (window.innerWidth < 1024) setMobileOpen(false);
  };
  const deleteChat   = (id) => { setChats(c => c.filter(x => x.id !== id)); if (activeChatId === id) setActiveChatId(chats.find(x => x.id !== id)?.id || null); };
  const renameChat   = (id, title) => setChats(c => c.map(x => x.id === id ? { ...x, title } : x));
  const moveChat     = (chatId, folderId) => setChats(c => c.map(x => x.id === chatId ? { ...x, folderId } : x));

  /* ── send message ── */
  const sendMessage = async (text) => {
    const userMsg = { id: uid(), role: 'user', text, ts: nowTs() };
    setChats(c => c.map(x => x.id === activeChatId ? { ...x, messages: [...x.messages, userMsg] } : x));

    // Auto-name the chat from the first question
    if (activeChat?.messages.length === 0) {
      const autoTitle = text.length > 40 ? text.slice(0, 40) + '…' : text;
      setChats(c => c.map(x => x.id === activeChatId ? { ...x, title: autoTitle } : x));
    }

    const answer = await fakeAI(text);
    const aiMsg  = { id: uid(), role: 'assistant', text: answer, ts: nowTs() };
    setChats(c => c.map(x => x.id === activeChatId ? { ...x, messages: [...x.messages, aiMsg] } : x));
  };

  return (
    <div className="h-[93vh] flex bg-white text-[#0A0A0A] overflow-hidden relative" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <style>{FONTS}</style>

      <Sidebar
        folders={folders} chats={chats} activeChatId={activeChatId}
        onSelectChat={setActiveChatId} onNewChat={newChat} onNewFolder={newFolder}
        onDeleteChat={deleteChat} onRenameFolder={renameFolder} onDeleteFolder={deleteFolder}
        onToggleFolder={toggleFolder} onMoveChat={moveChat}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
      />

      <ChatArea
        chat={activeChat} onSend={sendMessage} onRenameChat={renameChat} folders={folders}
        onMenuToggle={() => setMobileOpen(true)}
      />
    </div>
  );
}