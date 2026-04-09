"use client";
import { useState } from "react";
import Link from "next/link";
import { projets, categories } from "@/data/projets";

export default function ProjetsPage() {
  const [activeCategory, setActiveCategory] = useState("tous");
  const [search, setSearch] = useState("");

  const filtered = projets.filter((p) => {
    const matchCat = activeCategory === "tous" || p.category.toLowerCase() === categories.find(c => c.id === activeCategory)?.label.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.asso.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-purple-400 font-semibold uppercase tracking-widest text-sm mb-3">JDB 2026</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            Les <span className="gradient-text">Projets</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            {projets.length} projets en compétition. Explorez, découvrez, et votez pour ceux qui vous inspirent.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-lg mx-auto mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un projet, une association..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark !pl-11 !py-3 !rounded-2xl !text-base"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
              style={
                activeCategory === id
                  ? { background: color, color: "white", boxShadow: `0 0 20px ${color}50` }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {label}
              {id !== "tous" && (
                <span className="ml-2 text-xs opacity-70">
                  ({projets.filter(p => p.category.toLowerCase() === label.toLowerCase()).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-white/30 text-sm mb-6 text-center">
          {filtered.length} projet{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
        </p>

        {/* Projects Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((projet) => (
              <div
                key={projet.id}
                id={projet.id}
                className="glass card-hover p-6 flex flex-col gap-4"
              >
                {/* Top */}
                <div className="flex items-start justify-between">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{
                      background: `${projet.categoryColor}20`,
                      color: projet.categoryColor,
                      border: `1px solid ${projet.categoryColor}40`,
                    }}
                  >
                    {projet.category}
                  </span>
                  <span className="text-2xl">{projet.emoji}</span>
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-black text-white text-xl leading-snug mb-2">{projet.name}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{projet.description}</p>
                </div>

                {/* Long description */}
                <p className="text-white/35 text-xs leading-relaxed border-t border-white/5 pt-4">
                  {projet.longDescription}
                </p>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Budget</p>
                    <p className="text-sm font-bold" style={{ color: projet.categoryColor }}>
                      {projet.montant.toLocaleString("fr-FR")} €
                    </p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Impact</p>
                    <p className="text-xs font-semibold text-white/70">{projet.impact}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">Porteur</p>
                    <p className="text-xs font-semibold text-white/70">{projet.asso}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">Pays</p>
                    <p className="text-xs font-semibold text-white/70">{projet.pays}</p>
                  </div>
                </div>

                <Link
                  href="/je-vote"
                  className="btn-glow !py-3 !text-sm text-center block"
                  style={{ background: `linear-gradient(135deg, ${projet.categoryColor}, ${projet.categoryColor}99)` }}
                >
                  ✦ Voter pour ce projet
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-white/50 text-lg">Aucun projet ne correspond à ta recherche.</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("tous"); }}
              className="mt-6 btn-outline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
