import React from 'react';
import { Sparkles } from 'lucide-react';

const LeftPanel = () => {
  return (
    <div className="flex-1 h-full bg-[#0A0A0A] text-white flex flex-col justify-center items-center p-10 relative overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06]"
        viewBox="0 0 100 140"
        preserveAspectRatio="none"
      >
        <path
          d="M 8 10 Q 70 30 30 70 Q 0 95 80 130"
          stroke="#FFFFFF"
          strokeWidth="0.6"
          strokeDasharray="1.5 2.5"
          fill="none"
        />
      </svg>

      <div className="relative z-10 w-7 h-7 rounded-md bg-white flex items-center justify-center mb-5">
        <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
      </div>

      <h1
        className="relative z-10 text-3xl font-semibold mb-4 text-center"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        AI Notes Assistant
      </h1>

      <p className="relative z-10 text-center leading-relaxed max-w-[280px] text-white/60">
        Upload notes, ask questions and get AI-powered answers instantly.
      </p>

      <div
        className="relative z-10 flex items-center gap-6 mt-8 text-xs text-white/35"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        <span>40,000+ doubts/day</span>
        <span>11s avg. response</span>
      </div>
    </div>
  );
};

export default LeftPanel;