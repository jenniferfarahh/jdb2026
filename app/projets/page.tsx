"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { projets, categories, type Projet } from "@/data/projets";

/* ─── helpers ────────────────────────────────────────────────────────────────── */

function tint(hex: string, alpha = 0.12) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return `${hex}1e`;
  return hex + Math.round(alpha * 255).toString(16).padStart(2, "0");
}

function formatMontant(n: number) {
  return n.toLocaleString("fr-FR") + " €";
}

function driveProxy(url: string, sz: "w200" | "w1200" = "w1200"): string {
  if (!url) return url;
  const m = url.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (m) return `/api/img?id=${m[1]}&sz=${sz}`;
  return url;
}

/** Weighted perceptual luminance (0–255) */
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length < 6) return 128;
  return (
    (parseInt(h.slice(0, 2), 16) * 299 +
      parseInt(h.slice(2, 4), 16) * 587 +
      parseInt(h.slice(4, 6), 16) * 114) /
    1000
  );
}

/** True when white text would be unreadable on this color */
function isLight(hex: string) {
  return luminance(hex) > 165;
}

/** Darken a hex color by factor 0–1 */
function darken(hex: string, factor = 0.35): string {
  const h = hex.replace("#", "");
  if (h.length < 6) return hex;
  const r = Math.round(parseInt(h.slice(0, 2), 16) * (1 - factor));
  const g = Math.round(parseInt(h.slice(2, 4), 16) * (1 - factor));
  const b = Math.round(parseInt(h.slice(4, 6), 16) * (1 - factor));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Safe accent: darkens too-light colors so they're readable on any background */
function safeAccent(hex: string): string {
  return isLight(hex) ? darken(hex, 0.38) : hex;
}

/** Button background: darken light colors slightly for better contrast */
function btnBg(hex: string): string {
  return isLight(hex) ? darken(hex, 0.18) : hex;
}

/** Text color to place on a solid colored background */
function textOn(hex: string): string {
  return isLight(hex) ? "#111111" : "#ffffff";
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */

export default function ProjetsPage() {
  const [activeCategory, setActiveCategory] = useState("tous");
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();

  const filtered = projets.filter((p) => {
    const catMatch =
      activeCategory === "tous" ||
      (() => {
        const cat = categories.find((c) => c.id === activeCategory);
        return cat && p.category === cat.label;
      })();
    const searchMatch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.asso.toLowerCase().includes(q);
    return catMatch && searchMatch;
  });

  return (
    <div style={{ minHeight: "100dvh", padding: "48px 20px 80px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p style={{
            fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--teal)", marginBottom: 12,
          }}>
            JDB 2026
          </p>
          <h1 style={{
            fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900,
            letterSpacing: "-0.02em", lineHeight: 1.1,
            color: "var(--text)", marginBottom: 14,
          }}>
            Les <span className="gradient-text">Projets</span>
          </h1>
          <p style={{
            fontSize: "clamp(0.9rem,2vw,1rem)", color: "var(--muted)",
            maxWidth: 480, margin: "0 auto", lineHeight: 1.65,
          }}>
            {projets.length} projet{projets.length > 1 ? "s" : ""} en compétition.
            Découvrez-les et votez pour vos favoris.
          </p>
        </div>

        {/* ── Search bar ─────────────────────────────────────────────── */}
        <div style={{ position: "relative", maxWidth: 520, margin: "0 auto 28px" }}>
          <span style={{
            position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)",
            fontSize: "1rem", pointerEvents: "none",
            color: "var(--muted)",
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Rechercher par projet ou association…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: 40, paddingRight: search ? 36 : 14 }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--muted)", fontSize: "1.1rem", lineHeight: 1,
                padding: 2,
              }}
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Category filters ────────────────────────────────────────── */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 8,
          justifyContent: "center", marginBottom: 36,
        }}>
          {categories.map(({ id, label, color }) => {
            const count =
              id === "tous"
                ? projets.filter((p) => !q || p.name.toLowerCase().includes(q) || p.asso.toLowerCase().includes(q)).length
                : projets.filter((p) => {
                    const catMatch = p.category === label;
                    const searchMatch = !q || p.name.toLowerCase().includes(q) || p.asso.toLowerCase().includes(q);
                    return catMatch && searchMatch;
                  }).length;
            const active = activeCategory === id;
            return (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 100,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  border: active ? "none" : "1px solid var(--border)",
                  background: active ? color : "transparent",
                  color: active ? textOn(color) : "var(--muted)",
                  boxShadow: active ? `0 0 18px ${color}55` : "none",
                }}
              >
                {label}
                <span style={{ marginLeft: 6, opacity: 0.65, fontSize: "0.72rem" }}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Results count (when filtering) ─────────────────────────── */}
        {(q || activeCategory !== "tous") && (
          <p style={{
            textAlign: "center", fontSize: "0.8rem",
            color: "var(--muted)", marginBottom: 20,
          }}>
            {filtered.length === 0
              ? "Aucun résultat"
              : `${filtered.length} projet${filtered.length > 1 ? "s" : ""}${q ? ` pour « ${search} »` : ""}`}
          </p>
        )}

        {/* ── Grid ───────────────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 22,
          }}>
            {filtered.map((p) => <ProjetCard key={p.id} projet={p} />)}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
            <p style={{ color: "var(--muted)", fontSize: "1rem", marginBottom: 20 }}>
              {q
                ? `Aucun projet trouvé pour « ${search} »`
                : "Aucun projet dans cette catégorie."}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {q && (
                <button onClick={() => setSearch("")} className="btn-ghost">
                  Effacer la recherche
                </button>
              )}
              {activeCategory !== "tous" && (
                <button onClick={() => setActiveCategory("tous")} className="btn-ghost">
                  Voir toutes les catégories
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ProjetCard ────────────────────────────────────────────────────────────── */

function ProjetCard({ projet: p }: { projet: Projet }) {
  const cat = categories.find((c) => c.label === p.category);
  const catColor = cat?.color ?? p.color;

  // Color-safe computed values
  const accent    = safeAccent(p.color);      // readable accent (darkened if too light)
  const btn       = btnBg(p.color);           // button background
  const btnText   = textOn(p.color);          // white or #111
  const catText   = textOn(catColor);         // white or #111 on category badge

  return (
    <article
      className="card-hover"
      style={{
        borderRadius: 22,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* ── Photo banner ─────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        height: 190,
        background: tint(p.color, 0.15),
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {p.photoURL ? (
          <Image
            src={driveProxy(p.photoURL, "w1200")}
            alt={p.name}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            style={{ objectFit: "cover" }}
            unoptimized
          />
        ) : (
          <div style={{
            inset: 0, position: "absolute",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 56, opacity: 0.2,
          }}>
            📷
          </div>
        )}

        {/* gradient overlay for text legibility */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to bottom, transparent 35%, ${p.color}60 100%)`,
        }} />

        {/* Category badge */}
        <span style={{
          position: "absolute", top: 12, left: 12,
          fontSize: "0.63rem", fontWeight: 800, letterSpacing: "0.07em",
          textTransform: "uppercase", padding: "4px 10px", borderRadius: 100,
          background: `${catColor}dd`,
          color: catText,
          backdropFilter: "blur(8px)",
        }}>
          {p.category}
        </span>

        {/* Vital badge */}
        {p.vital && (
          <span
            title="Projet vital — son existence dépend de ce financement"
            style={{
              position: "absolute", top: 12, right: 12,
              fontSize: "0.63rem", fontWeight: 800, letterSpacing: "0.05em",
              padding: "4px 10px", borderRadius: 100,
              background: "rgba(220,38,38,0.88)",
              color: "#fff",
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            ❤️ Vital
          </span>
        )}
      </div>

      {/* ── Card body ──────────────────────────────────────────────── */}
      <div style={{
        padding: "18px 20px 20px",
        display: "flex", flexDirection: "column", gap: 12, flex: 1,
      }}>

        {/* Project name */}
        <h2 style={{
          fontSize: "1.05rem", fontWeight: 900, lineHeight: 1.25,
          color: "var(--text)", margin: 0,
          display: "flex", alignItems: "flex-start", gap: 6,
        }}>
          <span style={{ flex: 1 }}>{p.name}</span>
          {p.vital && <span title="Projet vital" style={{ fontSize: "0.88rem", flexShrink: 0, marginTop: 1 }}>❤️</span>}
        </h2>

        {/* Description */}
        <p style={{
          fontSize: "0.84rem", lineHeight: 1.65,
          color: "var(--muted)", margin: 0, flex: 1,
        }}>
          {p.description}
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border)" }} />

        {/* Asso row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

          {/* Logo */}
          <div
            className="logo-box"
            style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, padding: 2,
            }}
          >
            {p.logoURL ? (
              <Image
                src={driveProxy(p.logoURL, "w200")}
                alt={p.asso}
                width={30}
                height={30}
                style={{ objectFit: "contain", borderRadius: 6, width: "100%", height: "100%" }}
                unoptimized
              />
            ) : (
              "🏛️"
            )}
          </div>

          <span style={{
            fontSize: "0.82rem", fontWeight: 700,
            color: "var(--text)", opacity: 0.85, flex: 1,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {p.asso}
          </span>

          {/* Montant */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
            <span style={{
              fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.09em",
              textTransform: "uppercase", color: "var(--muted)", marginBottom: 1,
            }}>
              Demandé
            </span>
            <span style={{
              fontSize: "1rem", fontWeight: 900,
              color: accent,
              letterSpacing: "-0.01em",
            }}>
              {p.montant > 0 ? formatMontant(p.montant) : "—"}
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/je-vote"
          style={{
            display: "block", textAlign: "center",
            padding: "11px 0", borderRadius: 14,
            fontSize: "0.85rem", fontWeight: 800,
            color: btnText,
            background: `linear-gradient(135deg, ${btn}, ${btn}cc)`,
            boxShadow: `0 4px 18px ${btn}50`,
            textDecoration: "none",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          ✦ Voter pour ce projet
        </Link>
      </div>
    </article>
  );
}
