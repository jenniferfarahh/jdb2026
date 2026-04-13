"use client";

import { useState } from "react";
import { projets } from "@/data/projets";
import { ongs } from "@/data/ong";

interface ProjectVoteRow { projectId: string; rank: number; weight: number }
interface OngVoteRow     { ongId: string;     rank: number; weight: number }
interface VoteRow {
  id: string;
  prenom: string;
  promoType: string;
  voterCategory: string;
  votedAt: string;
  projectVotes: ProjectVoteRow[];
  ongVotes: OngVoteRow[];
}

export default function AdminPage() {
  const [secret, setSecret]  = useState("");
  const [input,  setInput]   = useState("");
  const [data,   setData]    = useState<{ total: number; votes: VoteRow[] } | null>(null);
  const [error,  setError]   = useState<string | null>(null);
  const [loading,setLoading] = useState(false);
  const [search, setSearch]  = useState("");

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
    const rows = ["Prénom,Promo,Catégorie,Vote à,Projets (classés),ONGs (classés)"];
    for (const v of data.votes) {
      const ps = v.projectVotes.map(p => { const proj = projets.find(x => x.id === p.projectId); return `#${p.rank} ${proj?.name ?? p.projectId}(${p.weight}pts)`; }).join(" | ");
      const os = v.ongVotes.map(o => { const ong = ongs.find(x => x.id === o.ongId); return `#${o.rank} ${ong?.name ?? o.ongId}(${o.weight}pts)`; }).join(" | ");
      rows.push(`"${v.prenom}","${v.promoType}","${v.voterCategory}","${v.votedAt}","${ps}","${os}"`);
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
    !search || v.prenom.toLowerCase().includes(search.toLowerCase()) || v.promoType.toLowerCase().includes(search.toLowerCase())
  );
  const byPromo: Record<string, number> = {};
  for (const v of data?.votes ?? []) byPromo[v.promoType] = (byPromo[v.promoType] ?? 0) + 1;

  return (
    <div style={{ minHeight: "100dvh", padding: "clamp(16px,4vw,40px) clamp(12px,3vw,24px) 80px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--teal)", marginBottom: 4 }}>JDB 2026 · Admin</p>
              <h1 style={{ fontSize: "clamp(1.4rem,4vw,2.2rem)", fontWeight: 900, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>Tableau de bord des votes</h1>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={exportCSV} className="btn-primary" style={{ fontSize: "0.85rem" }}>⬇ Exporter CSV</button>
              <button onClick={() => { setSecret(""); setData(null); }} className="btn-ghost" style={{ fontSize: "0.85rem" }}>Déconnexion</button>
            </div>
          </div>
        </div>

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
                    <p style={{ fontWeight: 800, color: "var(--text)", margin: 0, fontSize: "0.95rem" }}>{v.prenom || "—"}</p>
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
                  <p style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2ABFC4", margin: "0 0 8px" }}>ONGs</p>
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
      </div>
    </div>
  );
}
