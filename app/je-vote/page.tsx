"use client";
import { useState } from "react";
import { projets } from "@/data/projets";

const MAX = 3;

export default function JeVotePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [nom, setNom]       = useState("");
  const [email, setEmail]   = useState("");
  const [done, setDone]     = useState(false);

  const toggle = (id: string) => {
    if (selected.includes(id)) setSelected(s => s.filter(x => x !== id));
    else if (selected.length < MAX) setSelected(s => [...s, id]);
  };

  const filtered = projets.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="glass rounded-3xl max-w-md w-full p-8 sm:p-12 text-center">
        <div className="text-5xl sm:text-6xl mb-5">🎉</div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Vote enregistré !</h2>
        <p className="text-muted mb-7 leading-relaxed text-sm sm:text-base">
          Merci{nom ? ` ${nom}` : ""} ! Vous avez soutenu{" "}
          <span className="font-bold text-white">{selected.length} projet{selected.length > 1 ? "s" : ""}</span>.
        </p>
        <div className="flex flex-col gap-2.5 mb-8">
          {selected.map(id => {
            const p = projets.find(p => p.id === id)!;
            return (
              <div key={id} className="flex items-center gap-3 p-3 rounded-xl text-left"
                style={{ background: `${p.categoryColor}12`, border: `1px solid ${p.categoryColor}30` }}>
                <span className="text-lg">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{p.name}</p>
                  <p className="text-xs text-muted">{p.asso}</p>
                </div>
                <span className="text-green-400 text-sm font-black flex-shrink-0">✓</span>
              </div>
            );
          })}
        </div>
        <button onClick={() => { setDone(false); setSelected([]); setNom(""); setEmail(""); }}
          className="btn-ghost w-full !justify-center">
          Voter à nouveau
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-5">
            <span className="live-dot w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest">Votes ouverts</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
            <span className="gradient-text">Je Vote</span>
          </h1>
          <p className="text-muted text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Sélectionnez jusqu&apos;à <span className="font-bold text-white">{MAX} projets</span>.
            Les plus votés reçoivent une part des <span className="font-bold text-white">45 000 €</span>.
          </p>
        </div>

        <form onSubmit={e => { e.preventDefault(); if (selected.length > 0) setDone(true); }} className="flex flex-col gap-4">

          {/* Step 1 — identity */}
          <div className="glass rounded-2xl p-5 sm:p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm sm:text-base">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#6A5AE0,#3A8BE8)" }}>1</span>
              Votre identité
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Prénom *</label>
                <input type="text" placeholder="Marie" required value={nom} onChange={e => setNom(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Email *</label>
                <input type="email" placeholder="marie@example.com" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
              </div>
            </div>
            <p className="text-[11px] text-muted mt-2.5">* Email pour garantir l&apos;unicité du vote. Non partagé.</p>
          </div>

          {/* Step 2 — select */}
          <div className="glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#6A5AE0,#3A8BE8)" }}>2</span>
                Choisissez vos projets
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: selected.length === MAX ? "rgba(106,90,224,0.2)" : "rgba(255,255,255,0.05)",
                  color: selected.length === MAX ? "#9B8FF5" : "rgba(232,232,255,0.35)",
                  border: `1px solid ${selected.length === MAX ? "rgba(106,90,224,0.4)" : "rgba(255,255,255,0.07)"}`,
                }}>
                {selected.length}/{MAX}
              </span>
            </div>

            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none text-sm">🔍</span>
              <input type="text" placeholder="Filtrer les projets..." value={search}
                onChange={e => setSearch(e.target.value)} className="input-field !pl-9" />
            </div>

            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-0.5"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(106,90,224,0.4) transparent" }}>
              {filtered.map(p => {
                const isSel = selected.includes(p.id);
                const disabled = !isSel && selected.length >= MAX;
                return (
                  <button key={p.id} type="button" onClick={() => toggle(p.id)} disabled={disabled}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl text-left transition-all duration-200 w-full"
                    style={{
                      background: isSel ? `${p.categoryColor}10` : "rgba(255,255,255,0.025)",
                      border: `1px solid ${isSel ? p.categoryColor + "45" : "rgba(255,255,255,0.06)"}`,
                      opacity: disabled ? 0.38 : 1,
                      cursor: disabled ? "not-allowed" : "pointer",
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${p.categoryColor}20` }}>{p.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-bold text-white text-sm">{p.name}</span>
                        <span className="badge hidden sm:inline-flex"
                          style={{ background: `${p.categoryColor}18`, color: p.categoryColor }}>
                          {p.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted truncate">{p.asso} · {p.pays}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0 transition-all"
                      style={isSel
                        ? { background: p.categoryColor, borderColor: p.categoryColor, color: "white" }
                        : { borderColor: "rgba(255,255,255,0.15)" }}>
                      {isSel ? "✓" : ""}
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-center text-muted py-8 text-sm">Aucun projet trouvé</p>
              )}
            </div>
          </div>

          {/* Step 3 — confirm */}
          <div className="glass rounded-2xl p-5 sm:p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm sm:text-base">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#6A5AE0,#3A8BE8)" }}>3</span>
              Confirmer
            </h3>

            {selected.length > 0 ? (
              <div className="flex flex-col gap-1.5 mb-5">
                {selected.map(id => {
                  const p = projets.find(p => p.id === id)!;
                  return (
                    <div key={id} className="flex items-center gap-2 text-sm">
                      <span>{p.emoji}</span>
                      <span className="font-semibold text-white">{p.name}</span>
                      <span className="text-muted text-xs ml-auto">{p.asso}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted text-sm mb-5">Aucun projet sélectionné.</p>
            )}

            <button type="submit" disabled={selected.length === 0}
              className="btn-primary w-full !justify-center !py-4 !text-base"
              style={{ opacity: selected.length === 0 ? 0.35 : 1, cursor: selected.length === 0 ? "not-allowed" : "pointer" }}>
              ✦ Valider mon vote ({selected.length}/{MAX})
            </button>
            <p className="text-center text-xs text-muted mt-3">Vote anonymisé · Sécurisé · 1 vote par email</p>
          </div>

        </form>
      </div>
    </div>
  );
}
