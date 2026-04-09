"use client";
import { useState } from "react";
import Link from "next/link";
import { projets, categories } from "@/data/projets";

export default function ProjetsPage() {
  const [activeCategory, setActiveCategory] = useState("tous");
  const [search, setSearch] = useState("");

  const filtered = projets.filter((p) => {
    const cat = categories.find(c => c.id === activeCategory);
    const matchCat = activeCategory === "tous" || p.category.toLowerCase() === cat?.label.toLowerCase();
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.asso.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="section-label mb-3">JDB 2026</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            Les <span className="gradient-text">Projets</span>
          </h1>
          <p className="text-muted text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            {projets.length} projets en compétition. Explorez et votez pour ceux qui vous inspirent.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-lg mx-auto mb-6 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un projet, une association..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field !pl-11 !py-3 !rounded-2xl !text-base"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(({ id, label, color }) => {
            const count = id === "tous" ? projets.length : projets.filter(p => p.category.toLowerCase() === label.toLowerCase()).length;
            const active = activeCategory === id;
            return (
              <button key={id} onClick={() => setActiveCategory(id)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={active
                  ? { background: color, color: "white", boxShadow: `0 0 20px ${color}45` }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(232,232,255,0.45)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {label}
                <span className="ml-1.5 text-xs opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Count */}
        <p className="text-center text-sm text-muted mb-8">
          {filtered.length} projet{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((p) => (
              <article key={p.id} id={p.id} className="glass card-hover p-5 flex flex-col gap-4">
                {/* Top */}
                <div className="flex items-start justify-between gap-2">
                  <span className="badge"
                    style={{ background: `${p.categoryColor}18`, color: p.categoryColor, border: `1px solid ${p.categoryColor}35` }}>
                    {p.category}
                  </span>
                  <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                </div>

                {/* Name + desc */}
                <div>
                  <h3 className="font-black text-white text-lg leading-snug mb-2">{p.name}</h3>
                  <p className="text-muted text-sm leading-relaxed">{p.description}</p>
                </div>

                {/* Long desc */}
                <p className="text-xs leading-relaxed border-t border-white/5 pt-4" style={{ color: "rgba(232,232,255,0.28)" }}>
                  {p.longDescription}
                </p>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Budget</p>
                    <p className="text-sm font-black" style={{ color: p.categoryColor }}>
                      {p.montant.toLocaleString("fr-FR")} €
                    </p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Impact</p>
                    <p className="text-xs font-semibold text-white/65 leading-snug">{p.impact}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                  <div>
                    <p className="text-muted">Porteur</p>
                    <p className="font-semibold text-white/75">{p.asso}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted">Pays</p>
                    <p className="font-semibold text-white/75">{p.pays}</p>
                  </div>
                </div>

                <Link href="/je-vote"
                  className="btn-primary !rounded-xl !py-3 !text-sm !justify-center"
                  style={{ background: `linear-gradient(135deg, ${p.categoryColor}, ${p.categoryColor}BB)` }}>
                  ✦ Voter pour ce projet
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-muted text-lg mb-6">Aucun projet ne correspond.</p>
            <button onClick={() => { setSearch(""); setActiveCategory("tous"); }} className="btn-ghost">
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
