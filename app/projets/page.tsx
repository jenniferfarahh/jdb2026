"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { projets, categories, type Projet } from "@/data/projets";

/* ─── tiny helpers ─────────────────────────────────────────────────────────── */

/** lighten hex + alpha for card background tint */
function tint(hex: string, alpha = 0.12) {
  return hex + Math.round(alpha * 255).toString(16).padStart(2, "0");
}

function formatMontant(n: number) {
  return n.toLocaleString("fr-FR") + " €";
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function ProjetsPage() {
  const [activeCategory, setActiveCategory] = useState("tous");

  const filtered =
    activeCategory === "tous"
      ? projets
      : projets.filter((p) => {
          const cat = categories.find((c) => c.id === activeCategory);
          return cat && p.category === cat.label;
        });

  return (
    <div style={{ minHeight: "100dvh", padding: "48px 20px 80px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <p style={{
            fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--teal)", marginBottom: 12,
          }}>
            JDB 2026
          </p>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900,
            letterSpacing: "-0.02em", lineHeight: 1.1,
            color: "var(--text)", marginBottom: 14,
          }}>
            Les <span className="gradient-text">Projets</span>
          </h1>
          <p style={{
            fontSize: "clamp(0.9rem, 2vw, 1rem)", color: "var(--muted)",
            maxWidth: 480, margin: "0 auto", lineHeight: 1.65,
          }}>
            {projets.length} projet{projets.length > 1 ? "s" : ""} en compétition. Découvrez-les et votez pour vos favoris.
          </p>
        </div>

        {/* ── Category filters ────────────────────────────────────────────── */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 8,
          justifyContent: "center", marginBottom: 40,
        }}>
          {categories.map(({ id, label, color }) => {
            const count =
              id === "tous"
                ? projets.length
                : projets.filter((p) => p.category === label).length;
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
                  background: active ? color : "var(--bg-card)",
                  color: active ? "#fff" : "var(--muted)",
                  boxShadow: active ? `0 0 18px ${color}55` : "none",
                }}
              >
                {label}
                <span style={{ marginLeft: 6, opacity: 0.6, fontSize: "0.72rem" }}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Grid ───────────────────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 22,
          }}>
            {filtered.map((p) => (
              <ProjetCard key={p.id} projet={p} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
            <p style={{ color: "var(--muted)", fontSize: "1rem", marginBottom: 20 }}>
              Aucun projet dans cette catégorie.
            </p>
            <button
              onClick={() => setActiveCategory("tous")}
              className="btn-ghost"
            >
              Voir tous les projets
            </button>
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
      {/* ── Photo banner ─────────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        height: 190,
        background: tint(p.color, 0.18),
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {p.photoURL ? (
          <Image
            src={p.photoURL}
            alt={p.name}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            style={{ objectFit: "cover" }}
            unoptimized={p.photoURL.startsWith("https://drive.google.com")}
          />
        ) : (
          /* placeholder when no photo yet */
          <div style={{
            inset: 0, position: "absolute",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 56, opacity: 0.25,
          }}>
            📷
          </div>
        )}

        {/* Color overlay for contrast */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to bottom, ${p.color}00 40%, ${p.color}55 100%)`,
        }} />

        {/* Category badge — top-left */}
        <span style={{
          position: "absolute", top: 12, left: 12,
          fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.06em",
          textTransform: "uppercase", padding: "4px 10px", borderRadius: 100,
          background: `${catColor}cc`,
          color: "#fff",
          backdropFilter: "blur(8px)",
        }}>
          {p.category}
        </span>

        {/* Vital badge — top-right */}
        {p.vital && (
          <span
            title="Projet vital — son existence dépend de ce financement"
            style={{
              position: "absolute", top: 12, right: 12,
              fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em",
              padding: "4px 10px", borderRadius: 100,
              background: "rgba(239,68,68,0.85)",
              color: "#fff",
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            ❤️ Vital
          </span>
        )}
      </div>

      {/* ── Card body ────────────────────────────────────────────────────── */}
      <div style={{
        padding: "18px 20px 20px",
        display: "flex", flexDirection: "column", gap: 14, flex: 1,
      }}>

        {/* Project name */}
        <div>
          <h2 style={{
            fontSize: "1.08rem", fontWeight: 900, lineHeight: 1.2,
            color: "var(--text)", margin: 0,
            display: "flex", alignItems: "center", gap: 7,
          }}>
            {p.name}
            {p.vital && (
              <span title="Projet vital" style={{ fontSize: "0.9rem", flexShrink: 0 }}>❤️</span>
            )}
          </h2>
        </div>

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
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            overflow: "hidden",
            background: tint(p.color, 0.2),
            border: `1px solid ${p.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>
            {p.logoURL ? (
              <Image
                src={p.logoURL}
                alt={p.asso}
                width={34}
                height={34}
                style={{ objectFit: "cover", borderRadius: 9 }}
                unoptimized={p.logoURL.startsWith("https://drive.google.com")}
              />
            ) : (
              "🏛️"
            )}
          </div>
          <span style={{
            fontSize: "0.82rem", fontWeight: 700,
            color: "var(--text)", opacity: 0.8,
          }}>
            {p.asso}
          </span>

          {/* Spacer + montant */}
          <div style={{ flex: 1 }} />
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "flex-end",
          }}>
            <span style={{
              fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "var(--muted)", marginBottom: 1,
            }}>
              Demandé
            </span>
            <span style={{
              fontSize: "1rem", fontWeight: 900,
              color: p.color,
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
            color: "#fff",
            background: `linear-gradient(135deg, ${p.color}, ${p.color}bb)`,
            boxShadow: `0 4px 20px ${p.color}40`,
            textDecoration: "none",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          ✦ Voter pour ce projet
        </Link>
      </div>
    </article>
  );
}
