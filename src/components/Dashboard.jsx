import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Sparkles, FileText, MessageSquare, Database,
  Upload, Zap, LogOut, Settings, LayoutDashboard,
  BookOpen, ArrowRight,
} from "lucide-react";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
`;

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");

  const [notes] = useState([
    { id: 1, title: "Operating System Notes", date: "2026-06-19", preview: "CPU Scheduling, Deadlocks, Memory Management..." },
    { id: 2, title: "DBMS Notes",             date: "2026-06-18", preview: "Normalization, Transactions, SQL Queries..." },
    { id: 3, title: "Computer Networks",       date: "2026-06-17", preview: "OSI Model, TCP/IP, Routing Protocols..." },
  ]);

  useEffect(() => {
    const token    = localStorage.getItem("token")  || sessionStorage.getItem("token");
    const userData = localStorage.getItem("user")   || sessionStorage.getItem("user");

    if (!token || !userData) { navigate("/login", { replace: true }); return; }

    try { setUser(JSON.parse(userData)); }
    catch (err) { console.error(err); navigate("/login", { replace: true }); }

    setCheckingAuth(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  const handleAskAI = () => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); toast.success("AI Assistant Ready"); }, 1000);
  };

  /* Loading screen */
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <style>{FONTS}</style>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-md bg-[#0A0A0A] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <p className="text-sm text-[#0A0A0A]/50" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  const userName = user?.name || user?.fullName || "User";
  const initial  = userName.charAt(0).toUpperCase();

  const navLinks = [
    { label: "Dashboard",    icon: LayoutDashboard },
    { label: "My Notes",     icon: BookOpen },
    { label: "AI Assistant", icon: Sparkles },
    { label: "Settings",     icon: Settings },
  ];

  const stats = [
    { label: "Total Notes",  value: "24",  icon: FileText },
    { label: "AI Questions", value: "87",  icon: MessageSquare },
    { label: "Storage Used", value: "45%", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <style>{FONTS}</style>

      {/* Navbar */}
      <nav className="bg-white border-b border-[#0A0A0A]/10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="h-16 flex justify-between items-center">

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <div className="w-7 h-7 rounded-md bg-[#0A0A0A] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-lg text-[#0A0A0A]">Hal Karo</span>
              </div>

              <div className="hidden md:flex items-center gap-1">
                {navLinks.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => setActiveNav(label)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      background: activeNav === label ? "#0A0A0A" : "transparent",
                      color:      activeNav === label ? "#FFFFFF" : "rgba(10,10,10,0.50)",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {initial}
                </div>
                <span className="hidden md:block text-sm font-medium text-[#0A0A0A]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {userName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border border-[#0A0A0A]/15 text-[#0A0A0A]/60 hover:border-[#0A0A0A]/40 hover:text-[#0A0A0A] transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-6">

        {/* Welcome */}
        <div className="bg-white rounded-xl border border-[#0A0A0A]/10 p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#0A0A0A]/40 mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <h2 className="text-2xl font-semibold text-[#0A0A0A]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Welcome back,{" "}
              <span className="font-normal italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
                {userName.split(" ")[0]}
              </span>.
            </h2>
            <p className="text-[#0A0A0A]/50 text-sm mt-1">Upload notes and ask questions from your AI tutor.</p>
          </div>
          <button
            onClick={handleAskAI}
            disabled={isLoading}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#0A0A0A] text-white text-sm font-medium hover:bg-[#262626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Thinking…
              </>
            ) : (
              <><Zap className="w-4 h-4" /> Ask AI</>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-5">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-[#0A0A0A]/10 p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#0A0A0A]/40 mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</p>
                <p className="text-3xl font-semibold text-[#0A0A0A]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
              </div>
              <div className="w-11 h-11 rounded-lg bg-[#F5F5F5] border border-[#0A0A0A]/08 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#0A0A0A]/40" />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Notes */}
        <div className="bg-white rounded-xl border border-[#0A0A0A]/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#0A0A0A]/08 flex justify-between items-center">
            <h3 className="font-semibold text-[#0A0A0A]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Recent Notes</h3>
            <button className="text-xs text-[#0A0A0A]/45 hover:text-[#0A0A0A] transition-colors" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              View all →
            </button>
          </div>
          <div className="divide-y divide-[#0A0A0A]/06">
            {notes.map((note) => (
              <div key={note.id} className="px-6 py-4 hover:bg-[#F5F5F5] transition-colors cursor-pointer flex justify-between items-start gap-4">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-md bg-[#F5F5F5] border border-[#0A0A0A]/08 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-[#0A0A0A]/35" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0A0A0A]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{note.title}</p>
                    <p className="text-xs text-[#0A0A0A]/45 mt-0.5">{note.preview}</p>
                  </div>
                </div>
                <span className="text-xs text-[#0A0A0A]/30 whitespace-nowrap" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{note.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-5">

          <div className="bg-[#0A0A0A] rounded-xl p-7 text-white relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 100 80" preserveAspectRatio="none">
              <path d="M 0 60 Q 50 10 100 50" stroke="#FFFFFF" strokeWidth="0.8" strokeDasharray="2 3" fill="none" />
            </svg>
            <Upload className="w-5 h-5 text-white/55 mb-4 relative z-10" />
            <h3 className="font-semibold mb-1 relative z-10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Upload New Notes</h3>
            <p className="text-white/50 text-sm mb-5 relative z-10">Upload PDF, DOCX, or TXT files to get AI-powered insights.</p>
            <button className="relative z-10 flex items-center gap-1.5 px-4 py-2 bg-white text-[#0A0A0A] rounded-md text-sm font-medium hover:bg-white/90 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Upload Files <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#0A0A0A]/10 p-7 relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 100 80" preserveAspectRatio="none">
              <path d="M 100 60 Q 50 10 0 50" stroke="#0A0A0A" strokeWidth="0.8" strokeDasharray="2 3" fill="none" />
            </svg>
            <Sparkles className="w-5 h-5 text-[#0A0A0A]/35 mb-4 relative z-10" />
            <h3 className="font-semibold text-[#0A0A0A] mb-1 relative z-10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>AI Chat Assistant</h3>
            <p className="text-[#0A0A0A]/50 text-sm mb-5 relative z-10">Ask questions about your notes and get instant answers.</p>
            <button onClick={handleAskAI} className="relative z-10 flex items-center gap-1.5 px-4 py-2 bg-[#0A0A0A] text-white rounded-md text-sm font-medium hover:bg-[#262626] transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Start Chatting <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
