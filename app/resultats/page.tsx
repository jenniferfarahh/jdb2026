"use client";

import { useEffect, useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface ProjectResult {
  id: string; name: string; asso: string; category: string;
  vital: boolean; color: string; montant: number;
  votes: number; share: number; amount: number;
  capped: boolean;
}
interface OngResult {
  id: string; name: string; logo: string; color: string;
  tagline: string; votes: number; share: number; amount: number;
}
interface DashboardData {
  updatedAt: string;
  voteStatus: "before" | "open" | "closed";
  voters: { total: number; byCategory: Record<string, number> };
  pools: {
    projets: { total: number; allocated: number };
    ongs:    { total: number; allocated: number };
  };
  totalProjectWeight: number;
  totalOngWeight: number;
  projets: ProjectResult[];
  ongs: OngResult[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function euros(n: number) {
  return n.toLocaleString("fr-FR") + " €";
}

function relativeTime(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 5)  return "à l'instant";
  if (s < 60) return `il y a ${s}s`;
  return `il y a ${Math.round(s / 60)}min`;
}

// ── Animated bar ────────────────────────────────────────────────────────────

function Bar({ pct, color, animated = true }: { pct: number; color: string; animated?: boolean }) {
  return (
    <div style={{
      height: 8, borderRadius: 99, overflow: "hidden",
      background: "rgba(255,255,255,0.07)",
    }}>
      <div style={{
        height: "100%", borderRadius: 99,
        width: `${Math.max(pct, pct > 0 ? 1 : 0)}%`,
        background: `linear-gradient(90deg, ${color}cc, ${color})`,
        boxShadow: pct > 0 ? `0 0 8px ${color}55` : "none",
        transition: animated ? "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
      }} />
    </div>
  );
}

// ── StatPill ─────────────────────────────────────────────────────────────────

function StatPill({ label, value, color = "var(--blue)" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="glass" style={{ borderRadius: 16, padding: "14px 20px", textAlign: "center", flex: 1, minWidth: 120 }}>
      <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ fontSize: "1.3rem", fontWeight: 900, color, margin: 0, letterSpacing: "-0.02em" }}>
        {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
      </p>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function ResultatsPage() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick]       = useState(0);   // seconds since last update
  const [lastFetch, setLastFetch] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: DashboardData = await res.json();
      setData(json);
      setLastFetch(json.updatedAt);
      setTick(0);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling every 5s
  useEffect(() => {
    fetchData();
    const poll = setInterval(fetchData, 5000);
    return () => clearInterval(poll);
  }, [fetchData]);

  // Tick counter (for "updated X ago" display)
  useEffect(() => {
    const t = setInterval(() => setTick(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────

  const statusColor =
    data?.voteStatus === "open"   ? "#4ade80" :
    data?.voteStatus === "closed" ? "#f87171" : "#facc15";

  const statusLabel =
    data?.voteStatus === "open"   ? "Votes en cours" :
    data?.voteStatus === "closed" ? "Votes clôturés" : "Avant les votes";

  const maxProjectVotes = data ? Math.max(...data.projets.map(p => p.votes), 1) : 1;
  const maxOngVotes     = data ? Math.max(...data.ongs.map(o => o.votes), 1) : 1;

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid rgba(37,99,235,0.2)",
            borderTopColor: "#2563EB",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Chargement des résultats…</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="glass" style={{ borderRadius: 20, padding: 32, textAlign: "center", maxWidth: 400 }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>⚠️</p>
          <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Erreur de connexion</p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 16 }}>{error}</p>
          <button onClick={fetchData} className="btn-primary" style={{ fontSize: "0.85rem" }}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100dvh", padding: "36px 20px 80px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--teal)", marginBottom: 10 }}>
            JDB 2026 · Forum CentraleSupélec
          </p>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", fontWeight: 900,
            letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 12, lineHeight: 1.1 }}>
            Résultats <span className="gradient-text">en direct</span>
          </h1>

          {/* Status + last update */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7,
              padding: "6px 14px", borderRadius: 100,
              background: `${statusColor}18`, border: `1px solid ${statusColor}40` }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", background: statusColor,
                boxShadow: data?.voteStatus === "open" ? `0 0 6px ${statusColor}` : "none",
                animation: data?.voteStatus === "open" ? "pulse 2s infinite" : "none",
              }} />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", color: statusColor }}>
                {statusLabel}
              </span>
            </div>
            {lastFetch && (
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                Mis à jour {relativeTime(lastFetch)} · ↻ toutes les 5s
              </span>
            )}
          </div>
        </div>

        {/* ── Stats row ────────────────────────────────────────────────────── */}
        {data && (
          <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
            <StatPill label="Votants" value={data.voters.total} color="#4890E8" />
            <StatPill label="Ingénieurs" value={data.voters.byCategory?.ingenieur ?? 0} color="#2ABFC4" />
            <StatPill label="Bachelors"  value={data.voters.byCategory?.bachelor ?? 0}  color="#a855f7" />
            <StatPill label="Pool projets" value={euros(data.pools.projets.total)} color="#FF8400" />
            <StatPill label="Pool ONGs"    value={euros(data.pools.ongs.total)}    color="#10b981" />
          </div>
        )}

        {data && (
          <>
            {/* ── PROJETS ──────────────────────────────────────────────────── */}
            <section style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--text)", margin: 0,
                  display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,132,0,0.15)",
                    border: "1px solid rgba(255,132,0,0.3)", display: "inline-flex", alignItems: "center",
                    justifyContent: "center", fontSize: "0.8rem" }}>🏆</span>
                  Classement Projets
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Pool :</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 900, color: "#FF8400" }}>
                    {euros(data.pools.projets.total)}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.projets.map((p, i) => (
                  <div key={p.id} className="glass card-hover" style={{
                    borderRadius: 18, padding: "16px 20px",
                    borderLeft: `3px solid ${p.color}`,
                    position: "relative", overflow: "hidden",
                  }}>
                    {/* Subtle bg tint */}
                    <div style={{
                      position: "absolute", inset: 0, pointerEvents: "none",
                      background: `linear-gradient(90deg, ${p.color}08 0%, transparent 60%)`,
                    }} />

                    <div style={{ position: "relative" }}>
                      {/* Top row */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                        {/* Rank */}
                        <div style={{
                          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 900, fontSize: "0.85rem",
                          background: i === 0 ? "linear-gradient(135deg, #FFD700, #FFA500)" :
                                      i === 1 ? "linear-gradient(135deg, #C0C0C0, #A0A0A0)" :
                                      i === 2 ? "linear-gradient(135deg, #CD7F32, #A05C20)" :
                                      `${p.color}25`,
                          color: i < 3 ? "#fff" : p.color,
                          boxShadow: i === 0 ? "0 2px 12px rgba(255,215,0,0.4)" : "none",
                        }}>
                          {i + 1}
                        </div>

                        {/* Name + asso */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 900, color: "var(--text)", fontSize: "0.95rem" }}>
                              {p.name}
                            </span>
                            {p.vital && <span style={{ fontSize: "0.8rem" }} title="Projet vital">❤️</span>}
                            <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "2px 7px",
                              borderRadius: 100, background: `${p.color}18`, color: p.color }}>
                              {p.category}
                            </span>
                          </div>
                          <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: "2px 0 0" }}>
                            {p.asso}
                          </p>
                        </div>

                        {/* Amount — main number */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                            <p style={{ fontSize: "1.25rem", fontWeight: 900, color: p.color, margin: 0,
                              letterSpacing: "-0.02em", lineHeight: 1 }}>
                              {euros(p.amount)}
                            </p>
                            {p.capped && (
                              <span title="Montant plafonné à la demande initiale" style={{
                                fontSize: "0.6rem", fontWeight: 800, padding: "2px 6px",
                                borderRadius: 100, letterSpacing: "0.06em",
                                background: `${p.color}20`, color: p.color,
                                border: `1px solid ${p.color}40`,
                              }}>PLAFONNÉ</span>
                            )}
                          </div>
                          <p style={{ fontSize: "0.68rem", color: "var(--muted)", margin: "3px 0 0" }}>
                            {p.share.toFixed(1)}% voix · {p.votes} pts
                            {p.montant > 0 && (
                              <span style={{ color: "var(--muted)", opacity: 0.6 }}>
                                {" "}· demandé {euros(p.montant)}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <Bar pct={data.totalProjectWeight > 0 ? (p.votes / maxProjectVotes) * 100 : 0} color={p.color} />
                    </div>
                  </div>
                ))}

                {data.projets.every(p => p.votes === 0) && (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)",
                    fontSize: "0.9rem" }}>
                    Aucun vote enregistré pour le moment.
                  </div>
                )}
              </div>
            </section>

            {/* ── ONGs ─────────────────────────────────────────────────────── */}
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--text)", margin: 0,
                  display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(16,185,129,0.15)",
                    border: "1px solid rgba(16,185,129,0.3)", display: "inline-flex", alignItems: "center",
                    justifyContent: "center", fontSize: "0.8rem" }}>🌍</span>
                  Classement ONGs
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Pool :</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 900, color: "#10b981" }}>
                    {euros(data.pools.ongs.total)}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.ongs.map((o, i) => (
                  <div key={o.id} className="glass card-hover" style={{
                    borderRadius: 18, padding: "16px 20px",
                    borderLeft: `3px solid ${o.color}`,
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute", inset: 0, pointerEvents: "none",
                      background: `linear-gradient(90deg, ${o.color}08 0%, transparent 60%)`,
                    }} />

                    <div style={{ position: "relative" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                        {/* Rank */}
                        <div style={{
                          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 900, fontSize: "0.85rem",
                          background: i === 0 ? "linear-gradient(135deg, #FFD700, #FFA500)" :
                                      i === 1 ? "linear-gradient(135deg, #C0C0C0, #A0A0A0)" :
                                      i === 2 ? "linear-gradient(135deg, #CD7F32, #A05C20)" :
                                      `${o.color}25`,
                          color: i < 3 ? "#fff" : o.color,
                          boxShadow: i === 0 ? "0 2px 12px rgba(255,215,0,0.4)" : "none",
                        }}>
                          {i + 1}
                        </div>

                        {/* Logo + name */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{o.logo}</span>
                            <span style={{ fontWeight: 900, color: "var(--text)", fontSize: "0.95rem",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {o.name}
                            </span>
                          </div>
                          <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: "2px 0 0",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {o.tagline}
                          </p>
                        </div>

                        {/* Amount */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ fontSize: "1.25rem", fontWeight: 900, color: o.color, margin: 0,
                            letterSpacing: "-0.02em", lineHeight: 1 }}>
                            {euros(o.amount)}
                          </p>
                          <p style={{ fontSize: "0.68rem", color: "var(--muted)", margin: "3px 0 0" }}>
                            {o.share.toFixed(1)}% · {o.votes} pts
                          </p>
                        </div>
                      </div>

                      <Bar pct={data.totalOngWeight > 0 ? (o.votes / maxOngVotes) * 100 : 0} color={o.color} />
                    </div>
                  </div>
                ))}

                {data.ongs.every(o => o.votes === 0) && (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)",
                    fontSize: "0.9rem" }}>
                    Aucun vote ONG enregistré pour le moment.
                  </div>
                )}
              </div>
            </section>

            {/* ── Footer note ──────────────────────────────────────────────── */}
            <p style={{ textAlign: "center", fontSize: "0.72rem", color: "var(--muted)",
              marginTop: 40, lineHeight: 1.7 }}>
              Les montants sont calculés au prorata des voix (Article 10).
              Aucune asso ne peut recevoir plus que son montant demandé — le surplus est redistribué aux autres au prorata.
              <br/>Pool projets : {euros(data.pools.projets.total)} · Pool ONGs : {euros(data.pools.ongs.total)}.
              Résultats non officiels, mis à jour en continu.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
