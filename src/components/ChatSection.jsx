import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles, Send, Plus, FolderPlus, Folder, FolderOpen,
  MessageSquare, ChevronRight, ChevronDown, Trash2,
  Edit3, Check, X, MoreHorizontal, Search, BookOpen,
  FileText, Maximize2, ChevronLeft, Eye,
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

/* ═══════════════════════════════════════════════════════════════════════════
   Sidebar
═══════════════════════════════════════════════════════════════════════════ */
const Sidebar = ({ folders, chats, activeChatId, onSelectChat, onNewChat, onNewFolder, onDeleteChat, onRenameFolder, onDeleteFolder, onToggleFolder, onMoveChat }) => {
  const [editFolderId, setEditFolderId]     = useState(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [search, setSearch]                 = useState('');
  const [menuChat, setMenuChat]             = useState(null); // chat id with open context menu

  const filtered = search.trim()
    ? chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : null;

  const startRenameFolder = (f) => { setEditFolderId(f.id); setEditFolderName(f.name); };
  const commitRenameFolder = () => { onRenameFolder(editFolderId, editFolderName); setEditFolderId(null); };

  const SANS  = { fontFamily: "'Space Grotesk', sans-serif" };
  const MONO  = { fontFamily: "'JetBrains Mono', monospace" };

  const ChatRow = ({ chat }) => (
    <div
      className={`group relative flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${activeChatId === chat.id ? 'bg-[#0A0A0A] text-white' : 'hover:bg-[#0A0A0A]/06 text-[#0A0A0A]/70'}`}
      onClick={() => onSelectChat(chat.id)}
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
    <aside className="w-64 shrink-0 bg-[#F8F8F7] border-r border-[#0A0A0A]/08 flex flex-col h-full">

      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-[#0A0A0A]/08">
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

      {/* New chat + new folder */}
      <div className="px-3 pt-3 flex gap-2">
        <button onClick={onNewChat}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-[#0A0A0A] text-white text-xs font-medium hover:bg-[#262626] transition-colors"
          style={SANS}>
          <Plus className="w-3.5 h-3.5" /> New chat
        </button>
        <button onClick={onNewFolder}
          className="p-1.5 rounded-md border border-[#0A0A0A]/15 text-[#0A0A0A]/50 hover:border-[#0A0A0A]/35 hover:text-[#0A0A0A] transition-colors"
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
  );
};

/* ── seed documents (replace with your real doc list from API) ─────────── */
const DOCS = [
  {
    id: 'd1', folder: 'Physics', name: 'Newton\'s Laws.pdf',
    pages: 12, preview: 'Chapter 1: Laws of Motion\n\nNewton\'s first law states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by a net external force.\n\nNewton\'s second law: F = ma, where F is net force, m is mass and a is acceleration.\n\nNewton\'s third law: For every action there is an equal and opposite reaction.',
  },
  {
    id: 'd2', folder: 'Physics', name: 'Kinematics Notes.pdf',
    pages: 8, preview: 'Chapter 2: Kinematics\n\nEquations of motion:\n• v = u + at\n• s = ut + ½at²\n• v² = u² + 2as\n\nProjectile motion: horizontal component is uniform, vertical component is uniformly accelerated under gravity g = 9.8 m/s².',
  },
  {
    id: 'd3', folder: 'Mathematics', name: 'Integration.pdf',
    pages: 20, preview: 'Chapter 5: Integration\n\nIndefinite Integrals:\n∫xⁿ dx = xⁿ⁺¹/(n+1) + C\n∫sin x dx = −cos x + C\n∫cos x dx = sin x + C\n∫eˣ dx = eˣ + C\n\nIntegration by Parts:\n∫u dv = uv − ∫v du\n\nLIATE rule for choosing u: Logarithm, Inverse trig, Algebraic, Trigonometric, Exponential.',
  },
  {
    id: 'd4', folder: 'Chemistry', name: 'Organic Chemistry.pdf',
    pages: 35, preview: 'Chapter 3: Organic Chemistry\n\nFunctional Groups:\n• Alkanes: −CH₃, −CH₂−\n• Alkenes: C=C double bond\n• Alkynes: C≡C triple bond\n• Alcohols: −OH group\n• Aldehydes: −CHO\n• Ketones: C=O (in chain)',
  },
  {
    id: 'd5', folder: 'Mathematics', name: 'Trigonometry.pdf',
    pages: 15, preview: 'Chapter 4: Trigonometry\n\nBasic Identities:\nsin²θ + cos²θ = 1\n1 + tan²θ = sec²θ\n1 + cot²θ = csc²θ\n\nAddition Formulas:\nsin(A+B) = sinA cosB + cosA sinB\ncos(A+B) = cosA cosB − sinA sinB',
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Compose Modal — opens when user clicks the input bar
═══════════════════════════════════════════════════════════════════════════ */
const ComposeModal = ({ open, onClose, onSend, initialText = '' }) => {
  const [text, setText]           = useState(initialText);
  const [activeDoc, setActiveDoc] = useState(DOCS[0]);
  const [docSearch, setDocSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(true);
  const textRef = useRef(null);

  useEffect(() => {
    if (open) {
      setText(initialText);
      setTimeout(() => textRef.current?.focus(), 80);
    }
  }, [open]);

  const filteredDocs = docSearch.trim()
    ? DOCS.filter(d => d.name.toLowerCase().includes(docSearch.toLowerCase()) || d.folder.toLowerCase().includes(docSearch.toLowerCase()))
    : DOCS;

  const grouped = filteredDocs.reduce((acc, d) => {
    (acc[d.folder] = acc[d.folder] || []).push(d);
    return acc;
  }, {});

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
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#0A0A0A]/08 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0A0A0A]/50" />
            <span className="text-sm font-medium text-[#0A0A0A]" style={SANS}>Compose your doubt</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPanelOpen(p => !p)}
              className="flex items-center gap-1.5 text-xs text-[#0A0A0A]/45 hover:text-[#0A0A0A] transition-colors px-2 py-1 rounded-md hover:bg-[#0A0A0A]/05"
              style={MONO}>
              {panelOpen ? <><ChevronRight className="w-3.5 h-3.5" /> Hide docs</> : <><Eye className="w-3.5 h-3.5" /> Show docs</>}
            </button>
            <button onClick={onClose} className="p-1 rounded-md text-[#0A0A0A]/40 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/06 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body: compose + doc panel */}
        <div className="flex flex-1 min-h-0">

          {/* Left: text compose */}
          <div className="flex flex-col flex-1 min-w-0">
            <textarea
              ref={textRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend(); }}
              placeholder={"Type your doubt in detail…\n\nTip: the more specific you are, the better the answer.\nE.g. \"Explain why mg·sin(θ) is the component along the incline and not mg·cos(θ)\""}
              className="flex-1 resize-none outline-none text-[15px] leading-relaxed text-[#0A0A0A] placeholder:text-[#0A0A0A]/25 px-6 py-5 bg-white"
              style={SANS}
            />

            {/* Bottom action bar */}
            <div className="px-5 py-3 border-t border-[#0A0A0A]/08 flex items-center justify-between shrink-0 gap-3">
              <p className="text-[11px] text-[#0A0A0A]/30" style={MONO}>
                {text.length > 0 ? `${text.length} chars` : 'Ctrl+Enter to send'}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={onClose}
                  className="px-4 py-2 text-sm text-[#0A0A0A]/55 hover:text-[#0A0A0A] rounded-md border border-[#0A0A0A]/12 hover:border-[#0A0A0A]/30 transition-colors"
                  style={SANS}>
                  Cancel
                </button>
                <button onClick={handleSend} disabled={!text.trim()}
                  className="px-5 py-2 text-sm font-medium bg-[#0A0A0A] text-white rounded-md hover:bg-[#262626] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                  style={SANS}>
                  <Send className="w-3.5 h-3.5" /> Send doubt
                </button>
              </div>
            </div>
          </div>

          {/* Right: document panel */}
          {panelOpen && (
            <div className="w-72 shrink-0 border-l border-[#0A0A0A]/08 flex flex-col bg-[#F8F8F7]">

              {/* Doc panel header */}
              <div className="px-4 pt-3 pb-2 border-b border-[#0A0A0A]/08">
                <p className="text-[10px] uppercase tracking-widest text-[#0A0A0A]/35 mb-2" style={MONO}>Your Documents</p>
                <div className="flex items-center gap-1.5 bg-white border border-[#0A0A0A]/12 rounded-md px-2.5 py-1.5">
                  <Search className="w-3 h-3 text-[#0A0A0A]/30 shrink-0" />
                  <input value={docSearch} onChange={e => setDocSearch(e.target.value)}
                    placeholder="Search docs…" className="flex-1 text-[11px] outline-none bg-transparent placeholder:text-[#0A0A0A]/25" style={SANS} />
                </div>
              </div>

              {/* Doc list */}
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                {Object.entries(grouped).map(([folder, docs]) => (
                  <div key={folder}>
                    <p className="text-[10px] uppercase tracking-widest text-[#0A0A0A]/30 px-1 py-1 mt-1" style={MONO}>{folder}</p>
                    {docs.map(doc => (
                      <button key={doc.id}
                        onClick={() => setActiveDoc(doc)}
                        className={`w-full text-left flex items-start gap-2 px-2 py-2 rounded-lg transition-colors ${activeDoc?.id === doc.id ? 'bg-[#0A0A0A] text-white' : 'hover:bg-[#0A0A0A]/06 text-[#0A0A0A]/70'}`}>
                        <FileText className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${activeDoc?.id === doc.id ? 'text-white/70' : 'text-[#0A0A0A]/35'}`} />
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium truncate" style={SANS}>{doc.name}</p>
                          <p className={`text-[10px] mt-0.5 ${activeDoc?.id === doc.id ? 'text-white/50' : 'text-[#0A0A0A]/35'}`} style={MONO}>{doc.pages} pages</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Doc preview */}
              {activeDoc && (
                <div className="border-t border-[#0A0A0A]/08 p-4 max-h-[220px] overflow-y-auto bg-white">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText className="w-3 h-3 text-[#0A0A0A]/40" />
                    <p className="text-[11px] font-medium text-[#0A0A0A]" style={SANS}>{activeDoc.name}</p>
                  </div>
                  <pre className="text-[11px] leading-relaxed text-[#0A0A0A]/65 whitespace-pre-wrap" style={MONO}>
                    {activeDoc.preview}
                  </pre>
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
      <div className={`max-w-[72%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
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
const ChatArea = ({ chat, onSend, onRenameChat, folders }) => {
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
    <div className="flex-1 flex flex-col items-center justify-center bg-white gap-4 text-[#0A0A0A]/30">
      <BookOpen className="w-10 h-10 opacity-20" />
      <p className="text-sm" style={SANS}>Select a chat or start a new one</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0">

      {/* Top bar */}
      <div className="h-14 border-b border-[#0A0A0A]/08 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {folder && (
            <span className="text-[11px] text-[#0A0A0A]/35 flex items-center gap-1 shrink-0" style={MONO}>
              <Folder className="w-3 h-3" />{folder.name}
              <ChevronRight className="w-3 h-3" />
            </span>
          )}
          {editTitle ? (
            <div className="flex items-center gap-1">
              <input autoFocus value={titleVal} onChange={e => setTitleVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { onRenameChat(chat.id, titleVal); setEditTitle(false); } if (e.key === 'Escape') setEditTitle(false); }}
                className="text-sm font-semibold text-[#0A0A0A] outline-none border-b border-[#0A0A0A]/30 bg-transparent min-w-0"
                style={SANS} />
              <button onClick={() => { onRenameChat(chat.id, titleVal); setEditTitle(false); }} className="text-[#0A0A0A]/40 hover:text-[#0A0A0A]"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => setEditTitle(false)} className="text-[#0A0A0A]/40 hover:text-[#0A0A0A]"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <button onClick={() => setEditTitle(true)} className="text-sm font-semibold text-[#0A0A0A] hover:opacity-70 truncate text-left" style={SANS}>
              {chat.title}
            </button>
          )}
        </div>
        <span className="text-[11px] text-[#0A0A0A]/30 shrink-0 ml-4" style={MONO}>{chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
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
      <div className="border-t border-[#0A0A0A]/08 px-4 py-3 shrink-0">
        <button
          onClick={() => !thinking && setModalOpen(true)}
          disabled={thinking}
          className="w-full flex items-center gap-3 bg-[#F8F8F7] border border-[#0A0A0A]/12 rounded-xl px-4 py-3 hover:border-[#0A0A0A]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left group"
        >
          <span className="flex-1 text-sm text-[#0A0A0A]/30 group-hover:text-[#0A0A0A]/45 transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {thinking ? 'AI is thinking…' : 'Type your doubt…'}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-[#0A0A0A]/25 hidden md:block"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              opens with doc viewer
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
    <div className="h-screen flex bg-white text-[#0A0A0A] overflow-hidden" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <style>{FONTS}</style>

      <Sidebar
        folders={folders} chats={chats} activeChatId={activeChatId}
        onSelectChat={setActiveChatId} onNewChat={newChat} onNewFolder={newFolder}
        onDeleteChat={deleteChat} onRenameFolder={renameFolder} onDeleteFolder={deleteFolder}
        onToggleFolder={toggleFolder} onMoveChat={moveChat}
      />

      <ChatArea
        chat={activeChat} onSend={sendMessage} onRenameChat={renameChat} folders={folders}
      />
    </div>
  );
}