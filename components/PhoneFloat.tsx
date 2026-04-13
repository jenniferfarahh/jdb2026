"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

// ── Real data matching the actual vote form ────────────────────────────────────
const PROJECTS = [
  { id: "automatans-automathon", name: "Automathon",          asso: "Automatans", category: "Science & digital", color: "#FF8400", vital: false },
  { id: "commus-catch-me",       name: "Catch Me If You Can", asso: "CommuS'",    category: "Art & events",      color: "#800080", vital: false },
];

const ONGS = [
  { id: "msf-gaza",      name: "MSF Gaza",     logo: "🏥", tagline: "Soigner sans frontières",       color: "#ef4444", domaines: ["Médical","Urgence"] },
  { id: "sea-shepherd",  name: "Sea Shepherd",  logo: "🐋", tagline: "Défendre les océans",           color: "#0ea5e9", domaines: ["Environnement","Océans"] },
  { id: "anne-lorient",  name: "Anne-Lorient",  logo: "🤝", tagline: "Solidarité locale et inter…",  color: "#3b82f6", domaines: ["Solidarité","Humanitaire"] },
];

const CATEGORIES = [
  { id: "tous",       label: "Tous",             color: "#a855f7" },
  { id: "science",    label: "Science & digital", color: "#6366f1" },
  { id: "art",        label: "Art & events",      color: "#ec4899" },
];

const INGENIEUR_WEIGHTS = [5, 4, 3, 2, 1];
const ONG_WEIGHTS = [3, 2, 1];

// Steps: 0=splash 1=projects-empty 2=projects-filled 3=ongs 4=success
const STEP_DURATION = [2600, 2000, 2200, 2400, 2800];

// ── Tiny helpers ───────────────────────────────────────────────────────────────
function RankDot({ n, filled, color }: { n: number; filled: boolean; color?: string }) {
  return (
    <span style={{
      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.55rem", fontWeight: 900,
      background: filled ? `linear-gradient(135deg,${color}90,${color}50)` : "rgba(255,255,255,0.06)",
      color: filled ? "white" : "rgba(255,255,255,0.2)",
    }}>{n}</span>
  );
}

function WeightTag({ w, active }: { w: number; active: boolean }) {
  return (
    <span style={{
      fontSize: "7px", fontWeight: 700, padding: "2px 5px", borderRadius: 100, flexShrink: 0,
      background: active ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.05)",
      color: active ? "#4890E8" : "rgba(255,255,255,0.25)",
      border: `1px solid ${active ? "rgba(37,99,235,0.4)" : "rgba(255,255,255,0.06)"}`,
    }}>{w} pts</span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PhoneFloat() {
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setStep(s => (s + 1) % 5);
      setAnimKey(k => k + 1);
    }, STEP_DURATION[step]);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="flex flex-col items-center select-none">
      <div className="phone-float">
        <div
          className="relative rounded-[2.6rem] overflow-hidden"
          style={{
            width: 248,
            height: 516,
            background: "linear-gradient(165deg, #0D1535 0%, #060C20 100%)",
            border: "1.5px solid rgba(255,255,255,0.1)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 5px rgba(37,99,235,0.06), 0 40px 90px rgba(37,99,235,0.28)",
          }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-3xl z-20 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
            <div className="w-3 h-3 rounded-full bg-gray-800" />
          </div>

          {/* Status bar */}
          <div className="absolute top-1.5 left-5 right-5 flex items-center justify-between z-10 pt-0.5">
            <span className="text-[9px] text-white/40 font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5 items-end h-3">
                {[3,4,5,4].map((h,i) => <div key={i} className="w-0.5 rounded-sm bg-white/40" style={{height:h*2}}/>)}
              </div>
              <svg width="10" height="8" viewBox="0 0 12 9" fill="white" opacity="0.4">
                <path d="M6 2C4.2 2 2.6 2.7 1.4 3.8L0 2.4C1.6 1 3.7 0 6 0s4.4 1 6 2.4L10.6 3.8C9.4 2.7 7.8 2 6 2z"/>
                <path d="M6 4.8c-.9 0-1.7.3-2.3.8L2.3 4.2C3.2 3.5 4.5 3 6 3s2.8.5 3.7 1.2L8.3 5.6C7.7 5.1 6.9 4.8 6 4.8z"/>
                <circle cx="6" cy="8" r="1.2"/>
              </svg>
              <div className="flex items-center gap-0.5">
                <div className="w-4 h-2 rounded-sm border border-white/40 p-px"><div className="h-full w-3/4 bg-white/60 rounded-sm"/></div>
              </div>
            </div>
          </div>

          {/* Screen */}
          <div className="absolute inset-0 flex flex-col" style={{ paddingTop: 28 }}>

            {/* ── App header ── */}
            <div
              className="px-3.5 pt-2 pb-2 flex-shrink-0 flex items-center justify-between"
              style={{ background: "linear-gradient(180deg,#0D1535 85%,transparent)" }}
            >
              {/* Forum logo — always white on dark phone */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-forum.png"
                alt="Forum CentraleSupélec"
                width={26}
                height={26}
                style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
              />

              {/* Step dots */}
              <div className="flex gap-1">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="h-1 rounded-full transition-all duration-500"
                    style={{
                      width: i === step ? 14 : 4,
                      background: i === step ? "#2563EB" : "rgba(255,255,255,0.15)"
                    }}/>
                ))}
              </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-hidden relative px-3 pb-3" style={{ overflowY: "auto" }}>

              {/* ════════════════ STEP 0 — JDB Splash ════════════════ */}
              {step === 0 && (
                <div key={`splash-${animKey}`} className="step-in flex flex-col items-center justify-center h-full gap-6">

                  {/* Floating ambient particles */}
                  {[
                    { size: 5,  x: 22,  y: 60,  color: "#2563EB", delay: "0s",    dur: "3s"   },
                    { size: 4,  x: 170, y: 40,  color: "#2ABFC4", delay: "0.5s",  dur: "2.5s" },
                    { size: 3,  x: 190, y: 130, color: "#a855f7", delay: "1s",    dur: "3.5s" },
                    { size: 3,  x: 30,  y: 150, color: "#2ABFC4", delay: "0.8s",  dur: "2.8s" },
                  ].map((p, i) => (
                    <div key={i} style={{
                      position: "absolute", left: p.x, top: p.y,
                      width: p.size, height: p.size, borderRadius: "50%",
                      background: p.color, opacity: 0.5,
                      boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                      animation: `pulse ${p.dur} ${p.delay} ease-in-out infinite`,
                      pointerEvents: "none",
                    }} />
                  ))}

                  {/* Spinning outer ring */}
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 120, height: 120 }}>
                    <div className="animate-spin" style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      border: "1.5px solid transparent",
                      borderTopColor: "#2563EB",
                      borderBottomColor: "rgba(42,191,196,0.4)",
                      animationDuration: "3s",
                    }} />
                    <div className="animate-spin" style={{
                      position: "absolute", inset: 8, borderRadius: "50%",
                      border: "1px solid transparent",
                      borderTopColor: "rgba(168,85,247,0.5)",
                      borderBottomColor: "rgba(37,99,235,0.3)",
                      animationDuration: "2s",
                      animationDirection: "reverse",
                    }} />

                    {/* Glow disc */}
                    <div style={{
                      position: "absolute", inset: 16, borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(37,99,235,0.22) 0%, rgba(42,191,196,0.1) 55%, transparent 100%)",
                    }} />

                    {/* J D B letters — each bounces in staggered */}
                    <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "baseline", gap: 2 }}>
                      {(["J","D","B"] as const).map((letter, i) => (
                        <span key={letter} style={{
                          fontSize: "2.2rem", fontWeight: 900, lineHeight: 1,
                          letterSpacing: "-0.04em", display: "block",
                          background:
                            i === 0 ? "linear-gradient(160deg,#93c5fd,#2563EB)" :
                            i === 1 ? "linear-gradient(160deg,#5eead4,#2ABFC4)" :
                                      "linear-gradient(160deg,#d8b4fe,#a855f7)",
                          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                          filter:
                            i === 0 ? "drop-shadow(0 0 10px rgba(37,99,235,0.7))" :
                            i === 1 ? "drop-shadow(0 0 10px rgba(42,191,196,0.7))" :
                                      "drop-shadow(0 0 10px rgba(168,85,247,0.7))",
                          animation: `successBounce 0.55s ${i * 0.13}s cubic-bezier(0.34,1.56,0.64,1) both`,
                        }}>{letter}</span>
                      ))}
                    </div>
                  </div>

                  {/* 2026 + subtitle */}
                  <div className="text-center" style={{ animation: "fadeInUp 0.5s 0.42s ease-out both" }}>
                    {/* Year badge */}
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "4px 14px", borderRadius: 100, marginBottom: 8,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#2ABFC4",
                        boxShadow: "0 0 6px #2ABFC4", animation: "pulse 2s infinite" }} />
                      <span style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.18em",
                        color: "rgba(255,255,255,0.75)" }}>2026</span>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#2ABFC4",
                        boxShadow: "0 0 6px #2ABFC4", animation: "pulse 2s 0.3s infinite" }} />
                    </div>
                    <p style={{ fontSize: "8px", color: "rgba(255,255,255,0.3)", fontWeight: 600,
                      letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Forum CentraleSupélec
                    </p>
                  </div>

                  {/* Loading dots */}
                  <div style={{ display: "flex", gap: 6, animation: "fadeInUp 0.4s 0.65s ease-out both" }}>
                    {[
                      { color: "#2563EB", delay: "0s"   },
                      { color: "#2ABFC4", delay: "0.18s"},
                      { color: "#a855f7", delay: "0.36s"},
                    ].map((d, i) => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: d.color, boxShadow: `0 0 7px ${d.color}`,
                        animation: `pulse 1.1s ${d.delay} ease-in-out infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}

              {/* ════════════════ STEP 1 — Projects (empty) ════════════════ */}
              {step === 1 && (
                <div key={`proj-empty-${animKey}`} className="step-in flex flex-col gap-1.5 pb-2">

                  {/* Status pill */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full self-start mb-0.5"
                    style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80",
                      boxShadow: "0 0 5px #4ade80", animation: "pulse 2s infinite", flexShrink: 0 }} />
                    <span className="text-[7px] font-black text-green-400">VOTES OUVERTS</span>
                  </div>

                  {/* Step 1: Auth card — connected */}
                  <div style={{ borderRadius: 10, padding: "8px 10px",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "7px", fontWeight: 900,
                          background: "linear-gradient(135deg,#2563EB,#2ABFC4)", color: "white" }}>1</span>
                        <span className="text-white text-[9px] font-black">Connexion ViaRézo</span>
                      </div>
                      <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}>
                        ✓ Connecté
                      </span>
                    </div>
                    <p className="text-white/50 text-[8px]">Bonjour <strong className="text-white/80">Said le BG</strong> 👋</p>
                  </div>

                  {/* Promo banner */}
                  <div style={{ borderRadius: 9, padding: "7px 10px",
                    background: "rgba(42,191,196,0.06)", border: "1px solid rgba(42,191,196,0.28)",
                    display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(42,191,196,0.15)", border: "1px solid rgba(42,191,196,0.3)", fontSize: "0.6rem" }}>✓</div>
                    <div>
                      <p className="text-[7px] font-black text-teal-400 uppercase tracking-widest mb-0.5">Promotion détectée</p>
                      <p className="text-white text-[8px] font-black">
                        Ingénieur P2027
                        <span className="text-white/40 font-normal"> · 5 projets · 5+4+3+2+1</span>
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Projects card */}
                  <div style={{ borderRadius: 10, padding: "8px 10px",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "7px", fontWeight: 900,
                          background: "linear-gradient(135deg,#2563EB,#2ABFC4)", color: "white" }}>2</span>
                        <span className="text-white text-[9px] font-black">Classez vos projets</span>
                      </div>
                      <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full text-white/30"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        0/5
                      </span>
                    </div>

                    {/* Rank slots — all empty */}
                    <div className="flex flex-col gap-1 mb-2">
                      <p className="text-[7px] font-black text-teal-400 uppercase tracking-widest mb-0.5">Votre classement</p>
                      {[1,2,3,4,5].map(n => (
                        <div key={n} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <RankDot n={n} filled={false} />
                          <p className="text-[8px] flex-1" style={{ color: "rgba(255,255,255,0.18)" }}>
                            Slot {n} — libre (optionnel)
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Category pills */}
                    <div className="flex gap-1 flex-wrap mb-1.5">
                      {CATEGORIES.map(c => (
                        <span key={c.id} className="text-[7px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: c.id === "tous" ? `${c.color}22` : "transparent",
                            color: c.id === "tous" ? c.color : "rgba(255,255,255,0.3)",
                            border: `1px solid ${c.id === "tous" ? `${c.color}55` : "rgba(255,255,255,0.1)"}`,
                          }}>{c.label}</span>
                      ))}
                    </div>

                    {/* Project list */}
                    <div className="flex flex-col gap-1">
                      {PROJECTS.map(p => (
                        <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                            background: `${p.color}22`, border: `1px solid ${p.color}35`,
                            display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-[8px] font-black truncate">{p.name}</p>
                            <p className="text-white/35 text-[7px]">{p.asso}</p>
                          </div>
                          <div style={{ width: 16, height: 16, borderRadius: "50%",
                            border: "1.5px solid rgba(255,255,255,0.2)", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "8px", color: "rgba(255,255,255,0.3)" }}>+</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════ STEP 2 — Projects (Automathon filled) ════════════════ */}
              {step === 2 && (
                <div key={`proj-filled-${animKey}`} className="step-in flex flex-col gap-1.5 pb-2">

                  {/* Status pill */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full self-start mb-0.5"
                    style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80",
                      boxShadow: "0 0 5px #4ade80", flexShrink: 0 }} />
                    <span className="text-[7px] font-black text-green-400">VOTES OUVERTS</span>
                  </div>

                  {/* Auth card (collapsed) */}
                  <div style={{ borderRadius: 10, padding: "6px 10px",
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6px", fontWeight: 900,
                          background: "linear-gradient(135deg,#2563EB,#2ABFC4)", color: "white" }}>1</span>
                        <span className="text-white/60 text-[8px] font-bold">Connexion ViaRézo</span>
                      </div>
                      <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>
                        ✓ Connecté
                      </span>
                    </div>
                  </div>

                  {/* Projects card */}
                  <div style={{ borderRadius: 10, padding: "8px 10px",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "7px", fontWeight: 900,
                          background: "linear-gradient(135deg,#2563EB,#2ABFC4)", color: "white" }}>2</span>
                        <span className="text-white text-[9px] font-black">Classez vos projets</span>
                      </div>
                      <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(37,99,235,0.2)", color: "#4890E8", border: "1px solid rgba(37,99,235,0.4)" }}>
                        1/5
                      </span>
                    </div>

                    {/* Rank slots */}
                    <div className="flex flex-col gap-1 mb-2">
                      <p className="text-[7px] font-black text-teal-400 uppercase tracking-widest mb-0.5">Votre classement</p>

                      {/* Slot 1 — filled */}
                      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
                        style={{ background: `${PROJECTS[0].color}14`, border: `1px solid ${PROJECTS[0].color}45` }}>
                        <RankDot n={1} filled color={PROJECTS[0].color} />
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: PROJECTS[0].color, flexShrink: 0 }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[8px] font-black truncate">{PROJECTS[0].name}</p>
                          <p className="text-white/35 text-[7px]">{PROJECTS[0].asso}</p>
                        </div>
                        <WeightTag w={5} active />
                        <div className="flex flex-col gap-0.5 flex-shrink-0">
                          <div style={{ width: 14, height: 14, borderRadius: 4, background: "rgba(255,255,255,0.06)",
                            display:"flex",alignItems:"center",justifyContent:"center",fontSize:"5px",color:"var(--muted)" }}>▲</div>
                          <div style={{ width: 14, height: 14, borderRadius: 4, background: "rgba(255,255,255,0.06)",
                            display:"flex",alignItems:"center",justifyContent:"center",fontSize:"5px",color:"var(--muted)" }}>▼</div>
                        </div>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(239,68,68,0.18)",
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:"7px",color:"#ef4444",flexShrink:0 }}>✕</div>
                      </div>

                      {/* Slots 2-5 empty */}
                      {[2,3,4,5].map(n => (
                        <div key={n} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                          <RankDot n={n} filled={false} />
                          <p className="text-[8px] flex-1" style={{ color: "rgba(255,255,255,0.15)" }}>Slot {n} — libre (optionnel)</p>
                        </div>
                      ))}
                    </div>

                    {/* Category pills */}
                    <div className="flex gap-1 flex-wrap mb-1.5">
                      {CATEGORIES.map(c => (
                        <span key={c.id} className="text-[7px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: c.id === "tous" ? `${c.color}22` : "transparent",
                            color: c.id === "tous" ? c.color : "rgba(255,255,255,0.3)",
                            border: `1px solid ${c.id === "tous" ? `${c.color}55` : "rgba(255,255,255,0.1)"}`,
                          }}>{c.label}</span>
                      ))}
                    </div>

                    {/* Project list */}
                    <div className="flex flex-col gap-1 mb-2">
                      {PROJECTS.map((p, i) => {
                        const isIn = i === 0;
                        return (
                          <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                            style={{
                              background: isIn ? `${p.color}12` : "rgba(255,255,255,0.025)",
                              border: `1px solid ${isIn ? p.color+"45" : "rgba(255,255,255,0.06)"}`,
                            }}>
                            <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                              background: `${p.color}22`, border: `1px solid ${p.color}35`,
                              display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-[8px] font-black truncate">{p.name}</p>
                              <p className="text-white/35 text-[7px]">{p.asso}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {isIn && <span className="text-[7px] font-black text-blue-400">#1</span>}
                              <div style={{
                                width: 16, height: 16, borderRadius: "50%", border: "1.5px solid",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "7px",
                                background: isIn ? p.color : "transparent",
                                borderColor: isIn ? p.color : "rgba(255,255,255,0.2)",
                                color: isIn ? "white" : "rgba(255,255,255,0.3)",
                              }}>{isIn ? "✓" : "+"}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Continue button */}
                    <div className="w-full py-2 rounded-xl font-black text-[9px] text-white flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg,#2563EB,#2ABFC4)", boxShadow: "0 3px 12px rgba(37,99,235,0.35)" }}>
                      Continuer vers les ONGs →
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════ STEP 3 — ONGs ════════════════ */}
              {step === 3 && (
                <div key={`ong-${animKey}`} className="step-in flex flex-col gap-1.5 pb-2">

                  {/* Status pill */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full self-start mb-0.5"
                    style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80",
                      boxShadow: "0 0 5px #4ade80", flexShrink: 0 }} />
                    <span className="text-[7px] font-black text-green-400">VOTES OUVERTS</span>
                  </div>

                  {/* Auth card collapsed */}
                  <div style={{ borderRadius: 10, padding: "6px 10px",
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6px", fontWeight: 900,
                          background: "linear-gradient(135deg,#2563EB,#2ABFC4)", color: "white" }}>1</span>
                        <span className="text-white/60 text-[8px] font-bold">Connexion ViaRézo</span>
                      </div>
                      <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>
                        ✓ Connecté
                      </span>
                    </div>
                  </div>

                  {/* Projects card collapsed */}
                  <div style={{ borderRadius: 10, padding: "6px 10px",
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6px", fontWeight: 900,
                          background: "linear-gradient(135deg,#2563EB,#2ABFC4)", color: "white" }}>2</span>
                        <span className="text-white/60 text-[8px] font-bold">Classez vos projets</span>
                      </div>
                      <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(37,99,235,0.15)", color: "#4890E8", border: "1px solid rgba(37,99,235,0.3)" }}>
                        1/5 ✓
                      </span>
                    </div>
                  </div>

                  {/* ONGs card */}
                  <div style={{ borderRadius: 10, padding: "8px 10px",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "7px", fontWeight: 900,
                          background: "linear-gradient(135deg,#2563EB,#2ABFC4)", color: "white" }}>3</span>
                        <span className="text-white text-[9px] font-black">ONGs à soutenir</span>
                        <span className="text-white/30 text-[7px]">(optionnel)</span>
                      </div>
                      <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(42,191,196,0.2)", color: "#2ABFC4", border: "1px solid rgba(42,191,196,0.4)" }}>
                        1/3
                      </span>
                    </div>

                    {/* ONG rank slots */}
                    <div className="flex flex-col gap-1 mb-2">
                      <p className="text-[7px] font-black text-teal-400 uppercase tracking-widest mb-0.5">Votre classement ONGs</p>

                      {/* Slot 1 — MSF filled */}
                      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
                        style={{ background: `${ONGS[0].color}14`, border: `1px solid ${ONGS[0].color}45` }}>
                        <RankDot n={1} filled color={ONGS[0].color} />
                        <div style={{ fontSize: "0.75rem", flexShrink: 0 }}>{ONGS[0].logo}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[8px] font-black truncate">{ONGS[0].name}</p>
                          <p className="text-white/35 text-[7px] truncate">{ONGS[0].tagline}</p>
                        </div>
                        <WeightTag w={3} active />
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(239,68,68,0.18)",
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:"7px",color:"#ef4444",flexShrink:0 }}>✕</div>
                      </div>

                      {/* Slots 2-3 empty */}
                      {[2,3].map(n => (
                        <div key={n} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                          <RankDot n={n} filled={false} />
                          <p className="text-[8px] flex-1" style={{ color: "rgba(255,255,255,0.15)" }}>Slot {n} — libre (optionnel)</p>
                        </div>
                      ))}
                    </div>

                    {/* ONG list */}
                    <div className="flex flex-col gap-1 mb-2">
                      {ONGS.map((o, i) => {
                        const isIn = i === 0;
                        return (
                          <div key={o.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                            style={{
                              background: isIn ? `${o.color}10` : "rgba(255,255,255,0.025)",
                              border: `1px solid ${isIn ? o.color+"40" : "rgba(255,255,255,0.06)"}`,
                            }}>
                            <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                              background: `${o.color}20`, display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.75rem" }}>{o.logo}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-[8px] font-black truncate">{o.name}</p>
                              <p className="text-white/35 text-[7px] truncate">{o.tagline}</p>
                              <div className="flex gap-1 mt-0.5">
                                {o.domaines.slice(0,2).map(d => (
                                  <span key={d} style={{ fontSize:"6px",padding:"1px 4px",borderRadius:100,background:`${o.color}15`,color:o.color }}>{d}</span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {isIn && <span className="text-[7px] font-black" style={{ color: "#2ABFC4" }}>#1</span>}
                              <div style={{
                                width: 16, height: 16, borderRadius: "50%", border: "1.5px solid",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "7px",
                                background: isIn ? o.color : "transparent",
                                borderColor: isIn ? o.color : "rgba(255,255,255,0.2)",
                                color: isIn ? "white" : "rgba(255,255,255,0.3)",
                              }}>{isIn ? "✓" : "+"}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom buttons */}
                    <div className="flex gap-1.5">
                      <div className="py-2 px-3 rounded-xl font-black text-[8px] flex-shrink-0 flex items-center"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                        ← Retour
                      </div>
                      <div className="flex-1 py-2 rounded-xl font-black text-[8px] text-white flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#2563EB,#2ABFC4)", boxShadow: "0 3px 10px rgba(37,99,235,0.35)" }}>
                        Confirmer mon vote →
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════ STEP 4 — Success ════════════════ */}
              {step === 4 && (
                <div key={`success-${animKey}`} className="step-in flex flex-col items-center justify-center h-full gap-4 pb-2">
                  <div style={{
                    width: 62, height: 62, borderRadius: "50%",
                    background: "linear-gradient(135deg,rgba(37,99,235,0.25),rgba(42,191,196,0.25))",
                    border: "2px solid rgba(42,191,196,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, boxShadow: "0 0 38px rgba(42,191,196,0.25)",
                  }}>🎉</div>

                  <div className="text-center">
                    <p className="text-white font-black text-sm mb-1">Vote enregistré !</p>
                    <p className="text-white/40 text-[9px] leading-relaxed">
                      Merci Said — vos choix ont bien<br/>été pris en compte.
                    </p>
                  </div>

                  {/* Summary card */}
                  <div className="w-full flex flex-col gap-1.5" style={{ borderRadius: 12, padding: "10px 12px",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-[7px] font-black uppercase tracking-widest text-blue-400 mb-0.5">✦ Projets votés</p>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
                      style={{ background: `${PROJECTS[0].color}12`, border: `1px solid ${PROJECTS[0].color}30` }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6px", fontWeight: 900,
                        background: `linear-gradient(135deg,${PROJECTS[0].color}80,${PROJECTS[0].color}40)`, color: "white" }}>1</span>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: PROJECTS[0].color, flexShrink: 0 }} />
                      <span className="text-white text-[8px] font-black flex-1 truncate">{PROJECTS[0].name}</span>
                      <span className="text-[7px] font-black text-blue-400">5 pts</span>
                    </div>

                    <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

                    <p className="text-[7px] font-black uppercase tracking-widest text-teal-400 mb-0.5">🌍 ONGs soutenues</p>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
                      style={{ background: `${ONGS[0].color}10`, border: `1px solid ${ONGS[0].color}25` }}>
                      <span style={{ fontSize: "0.75rem", flexShrink: 0 }}>{ONGS[0].logo}</span>
                      <span className="text-white text-[8px] font-bold flex-1 truncate">{ONGS[0].name}</span>
                      <span className="text-[7px] font-black" style={{ color: "#2ABFC4" }}>3 pts</span>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="flex gap-2 w-full">
                    <div className="flex-1 py-2 rounded-xl text-center"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-[6px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Voix distribuées</p>
                      <p className="text-white font-black text-[10px]"><span className="text-blue-400">5</span><span className="text-white/30">/15</span></p>
                    </div>
                    <div className="flex-1 py-2 rounded-xl text-center"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-[6px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Promotion</p>
                      <p className="text-teal-400 font-black text-[9px]">P2027</p>
                    </div>
                  </div>

                  <p className="text-[7px] text-white/20">1 vote par compte · irrévocable</p>
                </div>
              )}

            </div>
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-0.5 rounded-full bg-white/15" />
        </div>
      </div>

      {/* Shadow */}
      <div className="phone-shadow mt-4 w-44 h-3 rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.4) 0%, transparent 70%)" }} />
    </div>
  );
}
