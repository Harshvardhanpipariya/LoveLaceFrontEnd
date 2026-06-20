import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Zap, Clock, Users, CheckCircle2, ArrowRight, BookOpen, TrendingUp, MessageSquareText, Sparkles, FileUp, MessagesSquare, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const steps = [
  { id: '01', title: 'Upload your notes', desc: 'Add PDFs, scanned chapters, assignments and past papers — the AI reads them, not the open internet.' },
  { id: '02', title: 'Ask the doubt', desc: 'Student photographs or types the question. AI breaks it down step by step in under 10 seconds.' },
  { id: '03', title: 'Teacher reviews', desc: 'Flagged doubts route to faculty for a human check, so accuracy never depends on AI alone.' },
];

const offerings = [
  { icon: FileUp,       title: 'Upload notes',   desc: 'PDFs, handwritten scans, assignments and reference books — all become searchable answer sources.' },
  { icon: MessagesSquare, title: 'Ask questions', desc: 'Doubts asked in plain language, in any chapter sequence, get contextual answers from your own material.' },
  { icon: Brain,        title: 'AI tutor',        desc: "Concepts explained at the student's pace, with worked examples instead of just final answers." },
];

const stats = [
  { value: '40,000+', label: 'doubts solved daily' },
  { value: '11 sec',  label: 'average response time' },
  { value: '94%',     label: 'resolved without a teacher' },
  { value: '6',       label: 'boards & competitive exams' },
];

const features = [
  { icon: Camera,     title: 'Photo or typed doubts',       desc: 'Works from a phone photo, a scanned worksheet, or text typed straight from class.' },
  { icon: BookOpen,   title: 'Synced to your curriculum',   desc: 'Upload your chapter list once — solutions follow your sequence, not a generic syllabus.' },
  { icon: Users,      title: 'Teacher dashboard',           desc: 'See which topics are generating the most doubts, batch by batch, before the test does.' },
  { icon: TrendingUp, title: 'Progress for every student',  desc: 'Doubt history becomes a weak-topic map parents and mentors can actually read.' },
];

const DoubtLine = ({ children, delay }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className={`transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      {children}
    </div>
  );
};

/* ─── Spline helpers (pure, no state) ─────────────────────────────────────── */
const lerp  = (a, b, l) => a + (b - a) * l;
const angle = (x1, y1, x2, y2) => (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
const ease  = (l) => (l < 0.5 ? 2 * l * l : 1 - 2 * (1 - l) * (1 - l));

const P0 = { x: 5,  y: 10, z: 40, s: 1    };
const P1 = { x: 82, y: 48, z: 0,  s: 0.95 };
const P2 = { x: 6,  y: 50, z: 0,  s: 1.05 };
const P3 = { x: 84, y: 14, z: 40, s: 1.6  };
const PTS = [P0, P0, P1, P2, P3, P3];

const catmullRom = (p0, p1, p2, p3, l) => {
  const l2 = l * l, l3 = l2 * l;
  return 0.5 * (2*p1 + (-p0+p2)*l + (2*p0-5*p1+4*p2-p3)*l2 + (-p0+3*p1-3*p2+p3)*l3);
};

const splinePoint = (t) => {
  const segCount = PTS.length - 3;
  const segF = Math.min(t, 0.9999) * segCount;
  const i  = Math.floor(segF);
  const lf = segF - i;
  return {
    x: catmullRom(PTS[i].x, PTS[i+1].x, PTS[i+2].x, PTS[i+3].x, lf),
    y: catmullRom(PTS[i].y, PTS[i+1].y, PTS[i+2].y, PTS[i+3].y, lf),
  };
};

const planeProps = (t) => {
  const base  = splinePoint(t);
  const ahead = splinePoint(Math.min(t + 0.008, 1));
  const rot   = angle(base.x, base.y, ahead.x, ahead.y);
  let z, s;
  if (t < 0.33)      { const e = ease(t / 0.33);          z = lerp(P0.z, P1.z, e); s = lerp(P0.s, P1.s, e); }
  else if (t < 0.66) { const l = (t - 0.33) / 0.33;       z = P1.z;                s = lerp(P1.s, P2.s, l); }
  else               { const e = ease((t - 0.66) / 0.34);  z = lerp(P2.z, P3.z, e); s = lerp(P2.s, P3.s, e); }
  const loopSpin = t > 0.92 ? ((t - 0.92) / 0.08) * 360 : 0;
  return { x: base.x, y: base.y, z, s, rot: rot + 45 + loopSpin };
};

/* ─── Paper Plane (isolated, self-contained RAF) ───────────────────────────── */
const PaperPlane = () => {
  const planeRef   = useRef(null);
  const shadowRef  = useRef(null);
  const tooltipRef = useRef(null);
  const scrollPct  = useRef(0);
  const flutterT   = useRef(0);
  const hovering   = useRef(false);
  const launching  = useRef(false);
  const launchEndRot = useRef(0); // frozen rotation at launch end
  const rafId      = useRef(null);

  const scrollToTop = useCallback(() => {
    if (launching.current) return;
    launching.current = true;
    // freeze rotation so the spin doesn't jump on re-render
    launchEndRot.current = parseFloat(planeRef.current?.style.getPropertyValue('--rot') || '0');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { launching.current = false; }, 800);
  }, []);

  useEffect(() => {
    /* ── scroll listener: use window.scrollY, reliable in all environments ── */
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollPct.current = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ── single RAF loop drives both flutter AND position; zero React setState ── */
    const tick = (time) => {
      flutterT.current = time / 1000;
      const t   = scrollPct.current;
      const ft  = flutterT.current;
      const hov = hovering.current;
      const lnc = launching.current;

      const { x, y, z, s, rot } = planeProps(t);

      const bobX   = Math.sin(ft * 1.6) * 0.5;
      const bobY   = Math.cos(ft * 1.3) * 0.6 + (hov ? -1.5 : 0);
      const wobble = Math.sin(ft * 2.1) * 6;
      // launch: fixed 2-turn spin baked in, no live flutter dependency
      const launchSpin = lnc ? ((time % 700) / 700) * 720 : 0;
      const launchPop  = lnc ? 1.25 : 1;

      const px    = x + bobX;
      const py    = y + bobY;
      const scale = (hov ? s * 1.12 : s) * launchPop;
      const totalRot = rot + wobble * 0.15 + launchSpin;

      if (planeRef.current) {
        planeRef.current.style.left      = `${px}vw`;
        planeRef.current.style.top       = `${py}vh`;
        planeRef.current.style.transform = `translate(-50%,-50%) scale(${scale}) rotate(${totalRot}deg)`;
        planeRef.current.style.zIndex    = Math.round(z);
      }
      if (shadowRef.current) {
        const ss = scale * s;
        shadowRef.current.style.left   = `${px}vw`;
        shadowRef.current.style.top    = `calc(${py}vh + ${9 * ss}px)`;
        shadowRef.current.style.width  = `${20 * ss}px`;
        shadowRef.current.style.height = `${5  * ss}px`;
        shadowRef.current.style.zIndex = Math.max(Math.round(z) - 1, 0);
      }
      if (tooltipRef.current) {
        tooltipRef.current.style.opacity = (hov && !lnc) ? '1' : '0';
        tooltipRef.current.style.transform = `rotate(${-totalRot}deg)`;
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      {/* Shadow */}
      <div
        ref={shadowRef}
        className="hidden md:block fixed pointer-events-none rounded-full"
        style={{
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(ellipse, rgba(10,10,10,0.14) 0%, rgba(10,10,10,0) 75%)',
          willChange: 'top, left, width, height',
        }}
      />
      {/* Plane */}
      <button
        ref={planeRef}
        onClick={scrollToTop}
        onMouseEnter={() => { hovering.current = true; }}
        onMouseLeave={() => { hovering.current = false; }}
        aria-label="Back to top"
        className="hidden md:flex items-center gap-2 fixed"
        style={{ willChange: 'transform, top, left' }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="drop-shadow-md">
          <path d="M12 2 L21 21 L12 17 L3 21 Z" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M12 2 L12 17" stroke="#0A0A0A" strokeWidth="1" />
        </svg>
        <span
          ref={tooltipRef}
          className="mono text-[10px] uppercase tracking-wider bg-[#0A0A0A] text-white px-2 py-1 rounded whitespace-nowrap transition-opacity duration-200"
          style={{ opacity: 0 }}
        >
          Back to top
        </span>
      </button>
    </>
  );
};

/* ─── Main page ────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0A0A0A]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .sans { font-family: 'Space Grotesk', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <PaperPlane />

      {/* Nav */}
      <nav className="border-b border-[#0A0A0A]/10 sticky top-0 bg-[#FFFFFF]/90 backdrop-blur z-20">
        <div className="max-w-6xl mx-auto px-8 lg:px-16 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sans font-semibold text-lg">
            <div className="w-7 h-7 rounded-md bg-[#0A0A0A] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            Hal&nbsp;<span className="text-[#0A0A0A]">Karo</span>
          </div>
          <div className="hidden md:flex items-center gap-8 sans text-sm text-[#0A0A0A]/70">
            <a href="#how"      className="hover:text-[#0A0A0A]">How it works</a>
            <a href="#features" className="hover:text-[#0A0A0A]">Features</a>
            <a href="#pricing"  className="hover:text-[#0A0A0A]">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="sans text-sm font-medium text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors">
              Login
            </button>
            <button className="sans text-sm font-medium px-4 py-2 rounded-md bg-[#0A0A0A] text-white hover:bg-[#0A0A0A]/85 transition-colors">
              Book a demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 lg:px-16 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 mono text-xs uppercase tracking-wider text-[#0A0A0A] bg-[#0A0A0A]/10 px-3 py-1 rounded-full mb-6">
            Built for coaching centers
          </div>
          <h1 className="sans text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
            Every doubt,<br />answered before<br />
            it <span className="italic font-normal" style={{ fontFamily: "'Source Serif 4', serif" }}>cools off</span>.
          </h1>
          <p className="mt-6 text-lg text-[#0A0A0A]/70 max-w-md">
            Your students stop waiting for the next class to ask. They photograph the question, get a worked solution in seconds, and you keep teaching instead of repeating.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="sans font-medium px-6 py-3 rounded-md bg-[#0A0A0A] text-white hover:bg-[#262626] transition-colors inline-flex items-center gap-2">
              Start free trial <ArrowRight className="w-4 h-4" />
            </button>
            <button className="sans font-medium px-6 py-3 rounded-md border border-[#0A0A0A]/20 hover:border-[#0A0A0A]/40 transition-colors">
              See a sample doubt
            </button>
          </div>
          <p className="mono text-xs text-[#0A0A0A]/40 mt-6">No credit card · Setup in one afternoon</p>
        </div>

        <div className="relative">
          <div className="absolute -top-4 -left-4 w-full h-full rounded-2xl bg-[#0A0A0A]/15 -z-10" />
          <div className="bg-white rounded-2xl border border-[#0A0A0A]/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center justify-between pb-4 border-b border-dashed border-[#0A0A0A]/15">
              <span className="mono text-xs text-[#0A0A0A]/40">doubt #38291 · Physics, Class 11</span>
              <span className="mono text-xs text-[#0A0A0A] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> solved</span>
            </div>
            <p className="mt-4 text-sm text-[#0A0A0A]/80 italic">
              "A block of mass 2kg slides down a frictionless incline of 30°. Find its acceleration."
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <DoubtLine delay={300}><p className="mono text-xs text-[#0A0A0A]/40">Step 1</p><p>Forces along incline: mg·sin(θ) = ma</p></DoubtLine>
              <DoubtLine delay={700}><p className="mono text-xs text-[#0A0A0A]/40">Step 2</p><p>a = g·sin(30°) = 9.8 × 0.5</p></DoubtLine>
              <DoubtLine delay={1100}><p className="mono text-xs text-[#0A0A0A]/40">Result</p><p className="font-semibold text-[#0A0A0A]">a = 4.9 m/s²</p></DoubtLine>
            </div>
            <div className="mt-5 pt-4 border-t border-dashed border-[#0A0A0A]/15 flex items-center justify-between mono text-xs text-[#0A0A0A]/40">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> answered in 8s</span>
              <span>matched to NCERT Ch. 5</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#0A0A0A]/10 bg-[#0A0A0A] text-white">
        <div className="max-w-6xl mx-auto px-8 lg:px-16 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="sans text-3xl font-semibold text-white">{s.value}</div>
              <div className="mono text-xs text-white/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="bg-[#F5F5F5] py-24">
        <div className="max-w-6xl mx-auto px-8 lg:px-16">
          <h2 className="sans text-3xl md:text-4xl font-semibold text-center">Everything a batch needs to stop waiting</h2>
          <p className="text-center text-[#0A0A0A]/60 mt-3 max-w-md mx-auto">Built for students, coaching institutes and the faculty running both.</p>
          <div className="grid md:grid-cols-3 gap-6 mt-14">
            {offerings.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-8 border border-[#0A0A0A]/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-[#0A0A0A]/10 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-[#0A0A0A]" />
                </div>
                <h3 className="sans text-xl font-semibold mb-2">{title}</h3>
                <p className="text-sm text-[#0A0A0A]/65 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-8 lg:px-16 py-24">
        <h2 className="sans text-3xl font-semibold mb-2">From question to working, in one breath</h2>
        <p className="text-[#0A0A0A]/60 mb-12 max-w-lg">Three handoffs, not three days.</p>
        <div className="grid md:grid-cols-3 gap-px bg-[#0A0A0A]/10 rounded-xl overflow-hidden">
          {steps.map((s) => (
            <div key={s.id} className="bg-[#FFFFFF] p-8">
              <span className="mono text-xs text-[#0A0A0A]">{s.id}</span>
              <h3 className="sans text-xl font-semibold mt-3 mb-2">{s.title}</h3>
              <p className="text-sm text-[#0A0A0A]/65 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-8 lg:px-16 py-24">
        <h2 className="sans text-3xl font-semibold mb-2">Made for the way a coaching center actually runs</h2>
        <p className="text-[#0A0A0A]/60 mb-12 max-w-lg">Not a generic chatbot — a tool tuned to batches, boards, and faculty workflow.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-6 rounded-xl border border-[#0A0A0A]/10 bg-white">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#0A0A0A]/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#0A0A0A]" />
              </div>
              <div>
                <h3 className="sans font-semibold mb-1">{title}</h3>
                <p className="text-sm text-[#0A0A0A]/65 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="max-w-6xl mx-auto px-8 lg:px-16 py-16">
        <div className="bg-[#0A0A0A] text-white rounded-2xl p-10 md:p-14 grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <MessageSquareText className="w-8 h-8 text-white mb-4" />
            <p className="sans text-2xl leading-snug">
              "Our after-class doubt queue used to run till 9pm. Now it clears itself by 6, and our faculty only step in for the genuinely hard ones."
            </p>
            <p className="mono text-sm text-white/50 mt-6">— Director, Aakash Foundation centre, Indore</p>
          </div>
          <button className="sans whitespace-nowrap font-medium px-6 py-3 rounded-md bg-white text-[#0A0A0A] hover:bg-white/90 transition-colors inline-flex items-center gap-2 justify-center">
            Talk to us <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer CTA */}
      <section id="pricing" className="max-w-6xl mx-auto px-8 lg:px-16 py-20 text-center">
        <h2 className="sans text-3xl font-semibold mb-3">Bring it to your batches this week</h2>
        <p className="text-[#0A0A0A]/60 mb-8">Plans scale per student, with a free pilot for your first batch.</p>
        <button className="sans font-medium px-8 py-3.5 rounded-md bg-[#0A0A0A] text-white hover:bg-[#262626] transition-colors inline-flex items-center gap-2">
          Start free trial <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      <footer className="bg-[#0A0A0A] text-white py-8 text-center mono text-xs text-white/40">
        © 2026 Hal Karo — AI doubt resolution for coaching centers
      </footer>
    </div>
  );
}
