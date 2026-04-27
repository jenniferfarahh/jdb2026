"use client";

import { useState, useEffect, useCallback } from "react";
import { projets } from "@/data/projets";
import { ongs } from "@/data/ong";

interface ProjectVoteRow { projectId: string; rank: number; weight: number }
interface OngVoteRow     { ongId: string;     rank: number; weight: number }
interface VoteRow {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  promoType: string;
  voterCategory: string;
  votedAt: string;
  projectVotes: ProjectVoteRow[];
  ongVotes: OngVoteRow[];
}

interface ProjectResult {
  id: string; name: string; requestedAmount: number;
  totalVotes: number; allocated: number; percentage: number;
}
interface ResultsData {
  stats: { total: number; byCategory: Record<string, number> };
  totalPool: number;
  ongPool: number;
  projects: ProjectResult[];
  ongsResults: ProjectResult[];
  generatedAt: string;
}

// ── Results Tab ──────────────────────────────────────────────────────────────
function ResultsTab({ secret }: { secret: string }) {
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/results?token=${encodeURIComponent(secret)}`);
      if (!res.ok) { setError("Impossible de charger les résultats."); setLoading(false); return; }
      setResults(await res.json());
    } catch { setError("Erreur réseau."); }
    setLoading(false);
  }, [secret]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Chargement des résultats…</p>
    </div>
  );
  if (error) return (
    <div className="glass" style={{ borderRadius: 16, padding: "32px", textAlign: "center" }}>
      <p style={{ color: "#f87171", marginBottom: 12 }}>⚠ {error}</p>
      <button onClick={fetchResults} className="btn-ghost" style={{ fontSize: "0.85rem" }}>Réessayer</button>
    </div>
  );
  if (!results) return null;

  // API returns already sorted by allocated desc, but sort defensively
  const sortedProjets = [...(results.projects ?? [])].sort((a, b) => b.allocated - a.allocated);
  const sortedOngs    = [...(results.ongsResults ?? [])].sort((a, b) => b.allocated - a.allocated);

  // Enrich with static data (color, asso, logo…)
  const projetMeta = (id: string) => projets.find(p => p.id === id);
  const ongMeta    = (id: string) => ongs.find(o => o.id === id);

  const totalProjectVotes = sortedProjets.reduce((s, p) => s + p.totalVotes, 0);
  const totalOngVotes     = sortedOngs.reduce((s, o) => s + o.totalVotes, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        {[
          { label: "Votants",      value: results.stats?.total ?? 0,   color: "#2563EB" },
          { label: "Pool Projets", value: `${results.totalPool ?? 0} €`, color: "#8B5CF6" },
          { label: "Pool OBNLs",   value: `${results.ongPool ?? 0} €`,   color: "#F59E0B" },
        ].map(s => (
          <div key={s.label} className="glass" style={{ borderRadius: 16, padding: "16px 18px", textAlign: "center" }}>
            <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: "1.6rem", fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Projets ── */}
      <div>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4890E8", marginBottom: 12 }}>
          🏆 Classement Projets
        </p>
        {totalProjectVotes === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "center" }}>Aucun vote pour les projets pour l'instant.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sortedProjets.map((p, i) => {
              const meta = projetMeta(p.id);
              const color = meta?.color ?? "#4890E8";
              return (
                <div key={p.id} className="glass" style={{ borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 900, background: i < 3 ? `${color}30` : "rgba(255,255,255,0.06)", color: i < 3 ? color : "var(--muted)", border: `1px solid ${i < 3 ? color + "40" : "var(--border)"}` }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <p style={{ fontWeight: 800, color: "var(--text)", margin: 0, fontSize: "0.9rem" }}>{p.name}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0 }}>{meta?.asso ?? ""}{meta?.category ? ` · ${meta.category}` : ""}</p>
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "0.65rem", color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Pts</p>
                      <p style={{ fontWeight: 800, color: "var(--text)", margin: 0, fontSize: "0.9rem" }}>{p.totalVotes}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "0.65rem", color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Part</p>
                      <p style={{ fontWeight: 800, color: "var(--text)", margin: 0, fontSize: "0.9rem" }}>{p.percentage.toFixed(1)}%</p>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 64 }}>
                      <p style={{ fontSize: "0.65rem", color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Alloué</p>
                      <p style={{ fontWeight: 900, color, margin: 0, fontSize: "1rem" }}>{p.allocated} €</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── OBNLs ── */}
      <div>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2ABFC4", marginBottom: 12 }}>
          🌍 Classement OBNLs
        </p>
        {totalOngVotes === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "center" }}>Aucun vote pour les OBNLs pour l'instant.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sortedOngs.map((o, i) => {
              const meta = ongMeta(o.id);
              const color = meta?.color ?? "#2ABFC4";
              return (
                <div key={o.id} className="glass" style={{ borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{meta?.logo ?? "🌍"}</span>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <p style={{ fontWeight: 800, color: "var(--text)", margin: 0, fontSize: "0.9rem" }}>{o.name}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0 }}>{meta?.tagline ?? ""}</p>
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "0.65rem", color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Pts</p>
                      <p style={{ fontWeight: 800, color: "var(--text)", margin: 0, fontSize: "0.9rem" }}>{o.totalVotes}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "0.65rem", color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Part</p>
                      <p style={{ fontWeight: 800, color: "var(--text)", margin: 0, fontSize: "0.9rem" }}>{o.percentage.toFixed(1)}%</p>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 64 }}>
                      <p style={{ fontSize: "0.65rem", color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Alloué</p>
                      <p style={{ fontWeight: 900, color, margin: 0, fontSize: "1rem" }}>{o.allocated} €</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ textAlign: "right" }}>
        <button onClick={fetchResults} className="btn-ghost" style={{ fontSize: "0.82rem" }}>↻ Actualiser</button>
      </div>
    </div>
  );
}

// ── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [secret, setSecret]     = useState("");
  const [input,  setInput]      = useState("");
  const [data,   setData]       = useState<{ total: number; votes: VoteRow[] } | null>(null);
  const [error,  setError]      = useState<string | null>(null);
  const [loading,setLoading]    = useState(false);
  const [search, setSearch]     = useState("");
  const [activeTab, setActiveTab] = useState<"votes" | "resultats">("votes");

  const doFetch = async (s: string) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/votes", { headers: { Authorization: `Bearer ${s}` } });
      if (!res.ok) { setError("Mot de passe incorrect ou accès refusé."); setLoading(false); return; }
      setData(await res.json());
      setSecret(s);
    } catch { setError("Erreur réseau."); }
    setLoading(false);
  };

  const exportCSV = () => {
    if (!data) return;
    const rows = ["Prénom,Nom,Email,Promo,Catégorie,Vote à,Projets (classés),ONGs (classés)"];
    for (const v of data.votes) {
      const ps = v.projectVotes.map(p => { const proj = projets.find(x => x.id === p.projectId); return `#${p.rank} ${proj?.name ?? p.projectId}(${p.weight}pts)`; }).join(" | ");
      const os = v.ongVotes.map(o => { const ong = ongs.find(x => x.id === o.ongId); return `#${o.rank} ${ong?.name ?? o.ongId}(${o.weight}pts)`; }).join(" | ");
      rows.push(`"${v.prenom}","${v.nom}","${v.email}","${v.promoType}","${v.voterCategory}","${v.votedAt}","${ps}","${os}"`);
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "jdb2026_votes.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (!secret) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div className="glass" style={{ borderRadius: 24, padding: "clamp(24px,5vw,36px) clamp(20px,4vw,32px)", maxWidth: 420, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <h1 style={{ fontSize: "clamp(1.4rem,4vw,1.8rem)", fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>Admin JDB 2026</h1>
          <p style={{ fontSize: "0.88rem", color: "var(--muted)", marginBottom: 28, lineHeight: 1.6 }}>
            Accès réservé aux administrateurs.<br/>Entrez le mot de passe admin.
          </p>
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 12, marginBottom: 16, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", fontSize: "0.82rem", color: "#f87171" }}>⚠ {error}</div>
          )}
          <input type="password" placeholder="Mot de passe admin…" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doFetch(input)} className="input-field" style={{ marginBottom: 12, fontSize: "1rem" }} />
          <button onClick={() => doFetch(input)} disabled={loading || !input} className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "13px", opacity: (!input || loading) ? 0.5 : 1 }}>
            {loading ? "Chargement…" : "Accéder au dashboard →"}
          </button>
        </div>
      </div>
    );
  }

  const filtered = (data?.votes ?? []).filter(v =>
    !search || v.prenom.toLowerCase().includes(search.toLowerCase()) || v.nom.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase()) || v.promoType.toLowerCase().includes(search.toLowerCase())
  );
  const byPromo: Record<string, number> = {};
  for (const v of data?.votes ?? []) byPromo[v.promoType] = (byPromo[v.promoType] ?? 0) + 1;

  return (
    <div style={{ minHeight: "100dvh", padding: "clamp(16px,4vw,40px) clamp(12px,3vw,24px) 80px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--teal)", marginBottom: 4 }}>JDB 2026 · Admin</p>
              <h1 style={{ fontSize: "clamp(1.4rem,4vw,2.2rem)", fontWeight: 900, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>Tableau de bord</h1>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {activeTab === "votes" && (
                <button onClick={exportCSV} className="btn-primary" style={{ fontSize: "0.85rem" }}>⬇ Exporter CSV</button>
              )}
              <button onClick={() => { setSecret(""); setData(null); }} className="btn-ghost" style={{ fontSize: "0.85rem" }}>Déconnexion</button>
            </div>
          </div>
        </div>

        {/* ── Tab switcher ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, padding: 4, background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", width: "fit-content" }}>
          {(["votes", "resultats"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 22px", borderRadius: 10, border: "none", cursor: "pointer",
                fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.01em",
                transition: "all 0.18s ease",
                background: activeTab === tab ? "linear-gradient(135deg, var(--blue), var(--teal))" : "transparent",
                color: activeTab === tab ? "#fff" : "var(--muted)",
              }}
            >
              {tab === "votes" ? "📊 Votes" : "🏆 Résultats"}
            </button>
          ))}
        </div>

        {/* ── Votes Tab ── */}
        {activeTab === "votes" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
              <div className="glass" style={{ borderRadius: 18, padding: "18px 20px", textAlign: "center" }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Total votants</p>
                <p style={{ fontSize: "2rem", fontWeight: 900, color: "#2563EB", margin: 0 }}>{data?.total ?? 0}</p>
              </div>
              {Object.entries(byPromo).sort().map(([promo, count]) => (
                <div key={promo} className="glass" style={{ borderRadius: 18, padding: "18px 20px", textAlign: "center" }}>
                  <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>{promo}</p>
                  <p style={{ fontSize: "2rem", fontWeight: 900, color: "#2ABFC4", margin: 0 }}>{count}</p>
                </div>
              ))}
            </div>

            <div style={{ position: "relative", marginBottom: 16 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: "0.9rem", pointerEvents: "none" }}>🔍</span>
              <input type="text" placeholder="Rechercher par prénom ou promo…" value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: 40 }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((v, idx) => (
                <div key={v.id} className="glass" style={{ borderRadius: 18, padding: "clamp(12px,2vw,16px) clamp(14px,3vw,20px)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 900, background: "linear-gradient(135deg, rgba(37,99,235,0.25), rgba(42,191,196,0.25))", border: "1px solid rgba(37,99,235,0.3)", color: "#4890E8" }}>{idx + 1}</span>
                      <div>
                        <p style={{ fontWeight: 800, color: "var(--text)", margin: 0, fontSize: "0.95rem" }}>
                          {[v.prenom, v.nom].filter(Boolean).join(" ") || "—"}
                        </p>
                        <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: "1px 0 0" }}>{v.email || "—"}</p>
                        <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0 }}>{v.promoType} · {v.voterCategory}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{new Date(v.votedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                    <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.18)" }}>
                      <p style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4890E8", margin: "0 0 8px" }}>Projets</p>
                      {v.projectVotes.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {v.projectVotes.map(pv => {
                            const proj = projets.find(x => x.id === pv.projectId);
                            return (
                              <div key={pv.projectId} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 900, background: proj ? `${proj.color}30` : "rgba(255,255,255,0.1)", color: proj?.color ?? "var(--text)" }}>{pv.rank}</span>
                                <span style={{ flex: 1, fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{proj?.name ?? pv.projectId}</span>
                                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#4890E8", flexShrink: 0 }}>{pv.weight}pts</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: 0 }}>Aucun</p>}
                    </div>
                    <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(42,191,196,0.06)", border: "1px solid rgba(42,191,196,0.18)" }}>
                      <p style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2ABFC4", margin: "0 0 8px" }}>OBNLs</p>
                      {v.ongVotes.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {v.ongVotes.map(ov => {
                            const ong = ongs.find(x => x.id === ov.ongId);
                            return (
                              <div key={ov.ongId} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>{ong?.logo ?? "🌍"}</span>
                                <span style={{ flex: 1, fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ong?.name ?? ov.ongId}</span>
                                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#2ABFC4", flexShrink: 0 }}>{ov.weight}pts</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: 0 }}>Non renseigné</p>}
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="glass" style={{ borderRadius: 18, padding: "40px", textAlign: "center" }}>
                  <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>{(data?.total ?? 0) === 0 ? "Aucun vote enregistré pour l'instant." : "Aucun résultat pour cette recherche."}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Résultats Tab ── */}
        {activeTab === "resultats" && <ResultsTab secret={secret} />}

      </div>
    </div>
  );
}
