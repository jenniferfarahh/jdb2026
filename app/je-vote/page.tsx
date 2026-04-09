"use client";
import { useState } from "react";
import { projets } from "@/data/projets";

const MAX_VOTES = 3;

export default function JeVotePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else if (selected.length < MAX_VOTES) {
      setSelected([...selected, id]);
    }
  };

  const filtered = projets.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-6">
        <div className="glass max-w-lg w-full p-12 text-center rounded-3xl">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-black text-white mb-3">Vote enregistré !</h2>
          <p className="text-white/50 mb-6 leading-relaxed">
            Merci <span className="text-purple-400 font-semibold">{nom || "pour votre vote"}</span> !
            Vous avez soutenu {selected.length} projet{selected.length > 1 ? "s" : ""}.
          </p>
          <div className="flex flex-col gap-3 mb-8">
            {selected.map((id) => {
              const p = projets.find((p) => p.id === id)!;
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: `${p.categoryColor}12`, border: `1px solid ${p.categoryColor}30` }}
                >
                  <span className="text-xl">{p.emoji}</span>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">{p.name}</p>
                    <p className="text-xs text-white/40">{p.asso}</p>
                  </div>
                  <span className="ml-auto text-green-400 text-sm font-bold">✓</span>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => { setSubmitted(false); setSelected([]); setNom(""); setEmail(""); }}
            className="btn-outline"
          >
            Voter à nouveau
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass live-badge mb-5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest">Votes ouverts</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            <span className="gradient-text">Je Vote</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            Sélectionnez jusqu&apos;à <span className="text-purple-400 font-bold">{MAX_VOTES} projets</span> que vous souhaitez soutenir.
            Les projets les plus votés recevront une partie des <strong className="text-white">45 000 €</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Voter info */}
          <div className="glass p-6 rounded-2xl mb-8">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-purple-400">①</span> Votre identité
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider">Prénom *</label>
                <input
                  type="text"
                  placeholder="Ex : Marie"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="input-dark"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider">Email *</label>
                <input
                  type="email"
                  placeholder="marie@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-dark"
                />
              </div>
            </div>
            <p className="text-xs text-white/25 mt-3">* Votre email garantit l&apos;unicité du vote. Il ne sera pas partagé.</p>
          </div>

          {/* Project selection */}
          <div className="glass p-6 rounded-2xl mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="text-purple-400">②</span> Choisissez vos projets
              </h3>
              <span
                className="text-sm font-bold px-3 py-1 rounded-full"
                style={{
                  background: selected.length === MAX_VOTES ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)",
                  color: selected.length === MAX_VOTES ? "#a855f7" : "rgba(255,255,255,0.4)",
                  border: `1px solid ${selected.length === MAX_VOTES ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                {selected.length}/{MAX_VOTES} sélectionné{selected.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
              <input
                type="text"
                placeholder="Filtrer les projets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-dark !pl-9"
              />
            </div>

            {/* Projects list */}
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(124,58,237,0.4) transparent" }}>
              {filtered.map((projet) => {
                const isSelected = selected.includes(projet.id);
                const isDisabled = !isSelected && selected.length >= MAX_VOTES;

                return (
                  <button
                    key={projet.id}
                    type="button"
                    onClick={() => toggle(projet.id)}
                    disabled={isDisabled}
                    className="flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: isSelected ? `${projet.categoryColor}12` : "rgba(255,255,255,0.03)",
                      border: isSelected ? `1px solid ${projet.categoryColor}50` : "1px solid rgba(255,255,255,0.06)",
                      opacity: isDisabled ? 0.4 : 1,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      transform: isSelected ? "scale(1.01)" : "scale(1)",
                    }}
                  >
                    {/* Emoji */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${projet.categoryColor}20` }}
                    >
                      {projet.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-white text-sm">{projet.name}</p>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: `${projet.categoryColor}20`, color: projet.categoryColor }}
                        >
                          {projet.category}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 truncate">{projet.description}</p>
                      <p className="text-xs text-white/25 mt-0.5">{projet.asso} · {projet.pays}</p>
                    </div>

                    {/* Checkbox */}
                    <div
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm flex-shrink-0 transition-all"
                      style={
                        isSelected
                          ? { background: projet.categoryColor, borderColor: projet.categoryColor, color: "white" }
                          : { borderColor: "rgba(255,255,255,0.15)", color: "transparent" }
                      }
                    >
                      {isSelected ? "✓" : ""}
                    </div>
                  </button>
                );
              })}

              {filtered.length === 0 && (
                <p className="text-center text-white/30 py-10 text-sm">Aucun projet trouvé</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="glass p-6 rounded-2xl">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-purple-400">③</span> Confirmer
            </h3>

            {selected.length > 0 ? (
              <div className="flex flex-col gap-2 mb-6">
                {selected.map((id) => {
                  const p = projets.find((p) => p.id === id)!;
                  return (
                    <div key={id} className="flex items-center gap-2 text-sm">
                      <span>{p.emoji}</span>
                      <span className="text-white/80 font-medium">{p.name}</span>
                      <span className="text-white/30">—</span>
                      <span className="text-white/40 text-xs">{p.asso}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-white/30 text-sm mb-6">Vous n&apos;avez pas encore sélectionné de projet.</p>
            )}

            <button
              type="submit"
              disabled={selected.length === 0}
              className="btn-glow w-full !py-4 !text-base"
              style={{ opacity: selected.length === 0 ? 0.4 : 1, cursor: selected.length === 0 ? "not-allowed" : "pointer" }}
            >
              ✦ Valider mes {selected.length > 0 ? selected.length : ""} vote{selected.length > 1 ? "s" : ""}
            </button>
            <p className="text-center text-xs text-white/20 mt-3">Vote anonymisé · Sécurisé · 1 vote par email</p>
          </div>
        </form>
      </div>
    </div>
  );
}
