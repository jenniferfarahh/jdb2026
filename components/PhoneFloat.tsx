"use client";
import { useEffect, useState } from "react";

const PROJECTS = [
  { name: "Solidarité Sahel",  org: "Humanitaire",     emoji: "🌍", c: "#2563EB" },
  { name: "Code pour Tous",    org: "Tech & Éducation", emoji: "💻", c: "#4890E8" },
  { name: "EcoInnov",          org: "Environnement",    emoji: "🌱", c: "#2ABFC4" },
  { name: "MédiSol",           org: "Santé",            emoji: "🏥", c: "#1D9098" },
  { name: "ArtSocial",         org: "Culture",          emoji: "🎨", c: "#4890E8" },
];

// Steps: 0=browse 1=select1 2=select2 3=confirm 4=success
const STEP_DURATION = [2200, 1400, 1400, 2000, 2200];

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
          className="relative w-60 sm:w-64 rounded-[2.6rem] overflow-hidden"
          style={{
            height: 510,
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

          {/* Screen content */}
          <div className="absolute inset-0 flex flex-col" style={{ paddingTop: 28 }}>

            {/* App Header — always visible */}
            <div className="px-4 pt-2 pb-3 flex-shrink-0"
              style={{ background: "linear-gradient(180deg,#0D1535 80%,transparent)" }}>
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black text-white"
                    style={{ background: "linear-gradient(135deg,#2563EB,#2ABFC4)" }}>J</div>
                  <span className="text-white text-[11px] font-bold">JDB 2026</span>
                </div>
                {/* Step indicator */}
                <div className="flex gap-1">
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="h-1 rounded-full transition-all duration-500"
                      style={{
                        width: i === step ? 16 : 4,
                        background: i === step ? "#2563EB" : "rgba(255,255,255,0.15)"
                      }}/>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-white/40 font-medium">
                {step === 0 && "Choisissez vos projets"}
                {step === 1 && "Sélection en cours..."}
                {step === 2 && "Encore un projet ?"}
                {step === 3 && "Confirmez votre vote"}
                {step === 4 && "Vote enregistré !"}
              </div>
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-hidden relative px-4 pb-4">

              {/* STEP 0 — Browse */}
              {step === 0 && (
                <div key={`browse-${animKey}`} className="step-in flex flex-col gap-2.5 h-full">
                  <div className="flex items-center gap-2 rounded-2xl px-3 py-2.5 mb-1"
                    style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.18)" }}>
                    <span className="text-white/30 text-xs">🔍</span>
                    <span className="text-white/30 text-[10px]">Rechercher un projet...</span>
                  </div>
                  {PROJECTS.map((p, i) => (
                    <div key={p.name}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        opacity: 1,
                        transform: "translateY(0)",
                        animation: `fadeInUp 0.4s ${i * 0.08}s ease-out both`,
                      }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: `${p.c}20` }}>{p.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-[10px] font-bold truncate">{p.name}</p>
                        <p className="text-white/40 text-[9px]">{p.org}</p>
                      </div>
                      <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"/>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 1 — Select first project */}
              {step === 1 && (
                <div key={`sel1-${animKey}`} className="step-in flex flex-col gap-2.5">
                  {PROJECTS.map((p, i) => {
                    const sel = i === 0;
                    return (
                      <div key={p.name}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all duration-500"
                        style={{
                          background: sel ? `${p.c}14` : "rgba(255,255,255,0.025)",
                          border: `1px solid ${sel ? p.c + "45" : "rgba(255,255,255,0.06)"}`,
                        }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: `${p.c}20` }}>{p.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[10px] font-bold truncate">{p.name}</p>
                          <p className="text-white/40 text-[9px]">{p.org}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 ${sel ? "check-pop" : ""}`}
                          style={sel
                            ? { background: p.c, border: `1px solid ${p.c}`, color: "white" }
                            : { border: "1px solid rgba(255,255,255,0.2)" }}>
                          {sel ? "✓" : ""}
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-1 text-center">
                    <span className="text-[9px] font-semibold px-3 py-1 rounded-full"
                      style={{ background: "rgba(37,99,235,0.15)", color: "#6AABFF" }}>
                      1/3 sélectionné
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 2 — Select second project */}
              {step === 2 && (
                <div key={`sel2-${animKey}`} className="step-in flex flex-col gap-2.5">
                  {PROJECTS.map((p, i) => {
                    const sel = i === 0 || i === 2;
                    return (
                      <div key={p.name}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl"
                        style={{
                          background: sel ? `${p.c}14` : "rgba(255,255,255,0.025)",
                          border: `1px solid ${sel ? p.c + "45" : "rgba(255,255,255,0.06)"}`,
                        }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: `${p.c}20` }}>{p.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[10px] font-bold truncate">{p.name}</p>
                          <p className="text-white/40 text-[9px]">{p.org}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 ${i === 2 ? "check-pop" : ""}`}
                          style={sel
                            ? { background: p.c, border: `1px solid ${p.c}`, color: "white" }
                            : { border: "1px solid rgba(255,255,255,0.2)" }}>
                          {sel ? "✓" : ""}
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-1 text-center">
                    <span className="text-[9px] font-semibold px-3 py-1 rounded-full"
                      style={{ background: "rgba(42,191,196,0.15)", color: "#2ABFC4" }}>
                      2/3 sélectionnés
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 3 — Confirm */}
              {step === 3 && (
                <div key={`confirm-${animKey}`} className="step-in flex flex-col gap-3 h-full">
                  <p className="text-[10px] text-white/50 font-medium">Vos 2 projets sélectionnés :</p>
                  {[PROJECTS[0], PROJECTS[2]].map((p, i) => (
                    <div key={p.name}
                      className="flex items-center gap-2.5 p-3 rounded-2xl"
                      style={{
                        background: `${p.c}12`,
                        border: `1px solid ${p.c}40`,
                        animation: `fadeInUp 0.4s ${i * 0.15}s ease-out both`,
                      }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${p.c}22` }}>{p.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-bold">{p.name}</p>
                        <p className="text-white/40 text-[9px]">{p.org}</p>
                      </div>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{ background: p.c, color: "white" }}>✓</div>
                    </div>
                  ))}
                  <div className="mt-auto">
                    <div className="w-full py-3 rounded-2xl font-bold text-xs text-white flex items-center justify-center gap-2 animate-pulse"
                      style={{ background: "linear-gradient(135deg,#2563EB,#2ABFC4)" }}>
                      ✦ Confirmer mon vote
                    </div>
                    <p className="text-center text-[9px] text-white/25 mt-2">Vote anonyme · 1 vote par personne</p>
                  </div>
                </div>
              )}

              {/* STEP 4 — Success */}
              {step === 4 && (
                <div key={`success-${animKey}`} className="step-in flex flex-col items-center justify-center h-full gap-4 pb-4">
                  <div className="success-bounce w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.25), rgba(42,191,196,0.25))", border: "2px solid rgba(42,191,196,0.5)" }}>
                    <span className="text-4xl">✅</span>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-black text-base mb-1">Vote enregistré !</p>
                    <p className="text-white/45 text-[10px] leading-relaxed">
                      Merci ! Vos projets ont bien<br />été pris en compte.
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 w-full">
                    {[PROJECTS[0], PROJECTS[2]].map(p => (
                      <div key={p.name} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: `${p.c}10`, border: `1px solid ${p.c}30` }}>
                        <span className="text-sm">{p.emoji}</span>
                        <span className="text-[10px] font-semibold text-white/80">{p.name}</span>
                        <span className="ml-auto text-green-400 text-xs">✓</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-white/20">Retour à la liste dans 2s...</p>
                </div>
              )}

            </div>
          </div>

          {/* Home bar */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-0.5 rounded-full bg-white/15" />
        </div>
      </div>

      {/* Shadow */}
      <div className="phone-shadow mt-4 w-44 h-3 rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.4) 0%, transparent 70%)" }} />
    </div>
  );
}
