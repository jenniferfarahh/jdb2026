"use client";

import { useState, useEffect, useCallback, type CSSProperties } from "react";
import Image from "next/image";
import { projets, categories } from "@/data/projets";
import { ongs } from "@/data/ong";

// ── Color helpers ─────────────────────────────────────────────────────────

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length < 6) return 128;
  return (parseInt(h.slice(0,2),16)*299 + parseInt(h.slice(2,4),16)*587 + parseInt(h.slice(4,6),16)*114) / 1000;
}
function darken(hex: string, f = 0.38): string {
  const h = hex.replace("#","");
  if (h.length < 6) return hex;
  const r = Math.round(parseInt(h.slice(0,2),16)*(1-f));
  const g = Math.round(parseInt(h.slice(2,4),16)*(1-f));
  const b = Math.round(parseInt(h.slice(4,6),16)*(1-f));
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}
/** Darken too-light colors so they're always visible on any background */
function safeColor(hex: string): string {
  return luminance(hex) > 165 ? darken(hex, 0.45) : hex;
}

// ── Window width hook ──────────────────────────────────────────────────────

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 9999);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return w;
}

// ── Types ──────────────────────────────────────────────────────────────────

type PromoType = "P2026" | "P2027" | "P2028" | "P2029" | "Bachelor" | "Other";
type Step = "auth" | "projects" | "ong" | "confirm" | "success" | "already-voted" | "closed" | "before" | "blocked";

interface AuthState {
  loading: boolean;
  authenticated: boolean;
  prenom: string;
  nom: string;
  promo: PromoType;
  category: "ingenieur" | "bachelor" | "other";
  eligible: boolean;
  hasVoted: boolean;
}

interface Countdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  total: number; // ms
}

// ── Constants ──────────────────────────────────────────────────────────────

const VOTE_START = new Date("2026-04-28T15:00:00.000Z");
const VOTE_END   = new Date("2026-04-28T19:00:00.000Z");

const INGENIEUR_WEIGHTS = [5, 4, 3, 2, 1];
const BACHELOR_WEIGHTS  = [3, 2, 1];
const ONG_WEIGHTS       = [3, 2, 1];

// ── Helpers ────────────────────────────────────────────────────────────────

function getVoteStatusNow(): "before" | "open" | "closed" {
  if (process.env.NEXT_PUBLIC_VOTE_TEST_MODE === "true") return "open";
  const now = new Date();
  if (now < VOTE_START) return "before";
  if (now <= VOTE_END)  return "open";
  return "closed";
}

function buildCountdown(target: Date): Countdown {
  const diff = Math.max(0, target.getTime() - Date.now());
  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return {
    days:    String(days).padStart(2, "0"),
    hours:   String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    total:   diff,
  };
}

function getWeights(promo: PromoType | null): number[] {
  if (promo === "P2027" || promo === "P2028" || promo === "P2029") return INGENIEUR_WEIGHTS;
  if (promo === "Bachelor") return BACHELOR_WEIGHTS;
  return [];
}

function getMaxProjects(promo: PromoType | null): number {
  if (promo === "P2027" || promo === "P2028" || promo === "P2029") return 5;
  if (promo === "Bachelor") return 3;
  return 0;
}

// ── CountdownBlock ─────────────────────────────────────────────────────────

function CountdownBlock({ value, label, color = "var(--blue)" }: { value: string; label: string; color?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 64 }}>
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "14px 16px",
        minWidth: 64,
        textAlign: "center",
        backdropFilter: "blur(20px)",
        boxShadow: `0 0 24px ${color}22`,
      }}>
        <span style={{
          fontFamily: "monospace",
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          color: color,
          display: "block",
          lineHeight: 1,
        }}>
          {value}
        </span>
      </div>
      <span style={{
        fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--muted)",
      }}>
        {label}
      </span>
    </div>
  );
}

// ── StepBadge ──────────────────────────────────────────────────────────────

function StepBadge({ n, active }: { n: number; active: boolean }) {
  return (
    <span style={{
      width: 26, height: 26, borderRadius: "50%",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.72rem", fontWeight: 900, flexShrink: 0,
      background: active
        ? "linear-gradient(135deg, #2563EB, #2ABFC4)"
        : "var(--border)",
      color: active ? "white" : "var(--muted)",
    }}>
      {n}
    </span>
  );
}

// ── WeightPill — hidden, kept for type compatibility ───────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function WeightPill({ weight, active }: { weight: number; active: boolean }) {
  return null;
}

// ── RankSlot ───────────────────────────────────────────────────────────────

function RankSlot({ rank, weight, projectId, onRemove, onMoveUp, onMoveDown, canMoveUp, canMoveDown, isMobile }: {
  rank: number; weight: number; projectId: string | null;
  onRemove: () => void; onMoveUp: () => void; onMoveDown: () => void;
  canMoveUp: boolean; canMoveDown: boolean;
  isMobile?: boolean;
}) {
  const projet = projectId ? projets.find(p => p.id === projectId) : null;
  const c = projet ? safeColor(projet.color) : null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
      borderRadius: 14, transition: "all 0.2s",
      background: c ? `${c}14` : "var(--bg-card)",
      border: `1px solid ${c ? c + "40" : "var(--border)"}`,
      minHeight: 52,
    }}>
      {/* Rank */}
      <span style={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.72rem", fontWeight: 900,
        background: c
          ? `linear-gradient(135deg, ${c}cc, ${c}88)`
          : "var(--border)",
        color: c ? "white" : "var(--muted)",
      }}>
        {rank}
      </span>

      {projet ? (
        <>
          {/* Color dot */}
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: c ?? projet.color, flexShrink: 0,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text)", margin: 0,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {projet.name}
            </p>
            <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0 }}>{projet.asso}</p>
          </div>
          <WeightPill weight={weight} active />
          {/* Reorder arrows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
            {(["▲", "▼"] as const).map((arrow, di) => (
              <button key={arrow} type="button"
                onClick={di === 0 ? onMoveUp : onMoveDown}
                disabled={di === 0 ? !canMoveUp : !canMoveDown}
                style={{
                  width: 20, height: 20, borderRadius: 5, border: "1px solid var(--border)",
                  background: "var(--bg-card)", cursor: (di === 0 ? canMoveUp : canMoveDown) ? "pointer" : "not-allowed",
                  opacity: (di === 0 ? canMoveUp : canMoveDown) ? 1 : 0.25,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6rem", color: "var(--muted)",
                }}>
                {arrow}
              </button>
            ))}
          </div>
          <button type="button" onClick={onRemove} style={{
            width: 22, height: 22, borderRadius: "50%", border: "none", flexShrink: 0,
            background: "rgba(239,68,68,0.18)", color: "#ef4444", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem",
            opacity: 0.7,
          }}>✕</button>
        </>
      ) : (
        <p style={{ fontSize: "0.75rem", color: "var(--muted)", opacity: 0.5, flex: 1 }}>
          Slot {rank}
        </p>
      )}
    </div>
  );
}

// ── OngSlot ────────────────────────────────────────────────────────────────

function OngSlot({ rank, weight, ongId, onRemove, onMoveUp, onMoveDown, canMoveUp, canMoveDown, isMobile }: {
  rank: number; weight: number; ongId: string | null;
  onRemove: () => void; onMoveUp: () => void; onMoveDown: () => void;
  canMoveUp: boolean; canMoveDown: boolean;
  isMobile?: boolean;
}) {
  const ong = ongId ? ongs.find(o => o.id === ongId) : null;
  const oc = ong ? safeColor(ong.color) : null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
      borderRadius: 14, transition: "all 0.2s",
      background: oc ? `${oc}14` : "var(--bg-card)",
      border: `1px solid ${oc ? oc + "40" : "var(--border)"}`,
      minHeight: 52,
    }}>
      <span style={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.72rem", fontWeight: 900,
        background: oc ? `linear-gradient(135deg, ${oc}cc, ${oc}88)` : "var(--border)",
        color: oc ? "white" : "var(--muted)",
      }}>
        {rank}
      </span>

      {ong ? (
        <>
          <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{ong.logo}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text)", margin: 0,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ong.name}
            </p>
            <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ong.tagline}
            </p>
          </div>
          <WeightPill weight={weight} active />
          {/* Reorder arrows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
            {(["▲", "▼"] as const).map((arrow, di) => (
              <button key={arrow} type="button"
                onClick={di === 0 ? onMoveUp : onMoveDown}
                disabled={di === 0 ? !canMoveUp : !canMoveDown}
                style={{
                  width: 20, height: 20, borderRadius: 5, border: "1px solid var(--border)",
                  background: "var(--bg-card)", cursor: (di === 0 ? canMoveUp : canMoveDown) ? "pointer" : "not-allowed",
                  opacity: (di === 0 ? canMoveUp : canMoveDown) ? 1 : 0.25,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6rem", color: "var(--muted)",
                }}>
                {arrow}
              </button>
            ))}
          </div>
          <button type="button" onClick={onRemove} style={{
            width: 22, height: 22, borderRadius: "50%", border: "none", flexShrink: 0,
            background: "rgba(239,68,68,0.18)", color: "#ef4444", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem",
            opacity: 0.7,
          }}>✕</button>
        </>
      ) : (
        <p style={{ fontSize: "0.75rem", color: "var(--muted)", opacity: 0.5, flex: 1 }}>
          Slot {rank}
        </p>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function JeVotePage() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth <= 600;

  const [auth, setAuth] = useState<AuthState>({
    loading: true, authenticated: false,
    prenom: "", nom: "", promo: "Other",
    category: "other", eligible: false, hasVoted: false,
  });

  const [voteStatus, setVoteStatus] = useState<"before" | "open" | "closed">(getVoteStatusNow());
  const [step, setStep]                     = useState<Step>("auth");
  const [promo, setPromo]                   = useState<PromoType | null>(null);
  const [projectRanking, setProjectRanking] = useState<string[]>([]);
  const [ongRanking, setOngRanking]         = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("tous");
  const [searchProjects, setSearchProjects] = useState("");
  const [searchOngs, setSearchOngs]         = useState("");
  const [submitting, setSubmitting]         = useState(false);
  const [submitError, setSubmitError]       = useState<string | null>(null);
  const [countdown, setCountdown]           = useState<Countdown>({ days:"00", hours:"00", minutes:"00", seconds:"00", total:0 });
  const [authError, setAuthError]           = useState<string | null>(null);
  const [pastVote, setPastVote]             = useState<{ projectRanking: string[]; ongRanking: string[]; promoType: string } | null | "loading">("loading");

  // ── On mount ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err) {
        setAuthError(decodeURIComponent(err));
        const url = new URL(window.location.href);
        url.searchParams.delete("error");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          const detectedPromo: PromoType = data.promo ?? "Other";
          setAuth({ loading: false, authenticated: true, prenom: data.prenom, nom: data.nom,
            promo: detectedPromo, category: data.category ?? "other",
            eligible: data.eligible ?? false, hasVoted: data.hasVoted });
          setPromo(detectedPromo);
          if (data.hasVoted) {
            setStep("already-voted");
          } else if (!data.eligible) {
            setStep("blocked");
          } else {
            const vs = getVoteStatusNow();
            if (vs === "before")  setStep("before");
            else if (vs === "closed") setStep("closed");
            else setStep("projects");
          }
        } else {
          setAuth({ loading: false, authenticated: false, prenom: "", nom: "",
            promo: "Other", category: "other", eligible: false, hasVoted: false });
          const vs = getVoteStatusNow();
          if (vs === "before") setStep("before");
          else if (vs === "closed") setStep("closed");
          else setStep("auth");
        }
      })
      .catch(() => {
        setAuth({ loading: false, authenticated: false, prenom: "", nom: "",
          promo: "Other", category: "other", eligible: false, hasVoted: false });
        setStep("auth");
      });
  }, []);

  // ── Fetch past vote when on already-voted screen ──────────────────────────

  useEffect(() => {
    if (step !== "already-voted") return;
    fetch("/api/vote/my-vote")
      .then(r => r.ok ? r.json() : null)
      .then(d => setPastVote(d))
      .catch(() => setPastVote(null));
  }, [step]);

  // ── Countdown ticker ─────────────────────────────────────────────────────

  useEffect(() => {
    const tick = () => {
      const vs = getVoteStatusNow();
      setVoteStatus(vs);
      const target = vs === "before" ? VOTE_START : vs === "open" ? VOTE_END : new Date();
      setCountdown(buildCountdown(target));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Vote helpers ──────────────────────────────────────────────────────────

  const addProject = useCallback((id: string) => {
    const max = getMaxProjects(promo);
    setProjectRanking(prev => (prev.includes(id) || prev.length >= max) ? prev : [...prev, id]);
  }, [promo]);

  const removeProject = useCallback((id: string) => {
    setProjectRanking(prev => prev.filter(x => x !== id));
  }, []);

  const moveProject = useCallback((idx: number, dir: -1 | 1) => {
    setProjectRanking(prev => {
      const next = [...prev];
      const t = idx + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[idx], next[t]] = [next[t], next[idx]];
      return next;
    });
  }, []);

  const addOng = useCallback((id: string) => {
    setOngRanking(prev => (prev.includes(id) || prev.length >= 3) ? prev : [...prev, id]);
  }, []);

  const removeOng = useCallback((id: string) => {
    setOngRanking(prev => prev.filter(x => x !== id));
  }, []);

  const moveOng = useCallback((idx: number, dir: -1 | 1) => {
    setOngRanking(prev => {
      const next = [...prev];
      const t = idx + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[idx], next[t]] = [next[t], next[idx]];
      return next;
    });
  }, []);

  const handleSubmit = async () => {
    if (!promo || projectRanking.length < maxProjects || ongRanking.length < 3) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/vote/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectRanking, ongRanking }),
      });
      const data = await res.json();
      if (res.ok && data.success) setStep("success");
      else setSubmitError(data.error ?? "Une erreur est survenue.");
    } catch {
      setSubmitError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const weights      = getWeights(promo);
  const maxProjects  = getMaxProjects(promo);
  const totalVoix    = weights.slice(0, projectRanking.length).reduce((a, b) => a + b, 0);
  const maxVoix      = weights.reduce((a, b) => a + b, 0);

  const filteredProjets = projets.filter(p => {
    const cat = categories.find(c => c.id === categoryFilter);
    const matchCat = categoryFilter === "tous" || p.category === cat?.label;
    const matchSearch = !searchProjects ||
      p.name.toLowerCase().includes(searchProjects.toLowerCase()) ||
      p.asso.toLowerCase().includes(searchProjects.toLowerCase()) ||
      p.description.toLowerCase().includes(searchProjects.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredOngs = ongs.filter(o => {
    if (!searchOngs) return true;
    const q = searchOngs.toLowerCase();
    return o.name.toLowerCase().includes(q) ||
      o.tagline.toLowerCase().includes(q) ||
      o.domaines.some(d => d.toLowerCase().includes(q));
  });

  const friendlyAuthError = (code: string) => {
    const map: Record<string, string> = {
      no_code: "Aucun code d'autorisation reçu.",
      invalid_state: "Session expirée. Réessayez.",
      token_failed: "Échec de l'authentification ViaRézo.",
      userinfo_failed: "Impossible de récupérer vos informations.",
      no_sub: "Identifiant ViaRézo manquant.",
      server_error: "Erreur serveur. Réessayez dans quelques instants.",
      access_denied: "Accès refusé. Vous avez annulé la connexion.",
    };
    return map[code] ?? `Erreur (${code})`;
  };

  const promoLabel = (p: PromoType | null) =>
    p === "P2026" ? "Ingénieur P2026" :
    p === "P2027" ? "Ingénieur P2027" :
    p === "P2028" ? "Ingénieur P2028" :
    p === "P2029" ? "Ingénieur P2029" :
    p === "Bachelor" ? "Bachelor" : "";

  // ── Loading ────────────────────────────────────────────────────────────────

  if (auth.loading) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "2px solid rgba(37,99,235,0.25)",
            borderTopColor: "#2563EB",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Chargement…</p>
        </div>
      </div>
    );
  }

  // ── BEFORE ────────────────────────────────────────────────────────────────

  if (step === "before") {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "16px" : "24px 20px" }}>
        <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>

          {/* Title */}
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--teal)", marginBottom: 12 }}>
            JDB 2026
          </p>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", fontWeight: 900,
            letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 8, lineHeight: 1.1 }}>
            Les votes ouvrent dans…
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: 36, lineHeight: 1.6 }}>
            Mardi <strong style={{ color: "var(--text)" }}>28 avril 2026 à 17h00</strong>
          </p>

          {/* Countdown blocks */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "flex-start", marginBottom: 44, flexWrap: "wrap" }}>
            <CountdownBlock value={countdown.days}    label="Jours"    color="#2563EB" />
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--border)", alignSelf: "center", marginBottom: 20 }}>:</div>
            <CountdownBlock value={countdown.hours}   label="Heures"   color="#2ABFC4" />
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--border)", alignSelf: "center", marginBottom: 20 }}>:</div>
            <CountdownBlock value={countdown.minutes} label="Minutes"  color="#8b5cf6" />
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--border)", alignSelf: "center", marginBottom: 20 }}>:</div>
            <CountdownBlock value={countdown.seconds} label="Secondes" color="#ec4899" />
          </div>

          {/* Info card */}
          <div className="glass" style={{ borderRadius: 20, padding: isMobile ? "16px" : "20px 24px", marginBottom: 24, textAlign: "left" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "var(--teal)", marginBottom: 12 }}>
              En attendant, préparez vos choix
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "🏆", text: "35 000 € à redistribuer entre les projets" },
                { icon: "🌍", text: "5 000 € pour le pool OBNL — votez pour 3 OBNLs" },
                { icon: "🔐", text: "Vote sécurisé via ViaRézo — 1 vote par personne" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: 1 }}>{icon}</span>
                  <p style={{ fontSize: "0.83rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
            <a href="/projets" className="btn-primary" style={{ fontSize: "0.85rem", textAlign: "center", justifyContent: "center" }}>
              Découvrir les projets
            </a>
            <a href="/ong" className="btn-ghost" style={{ fontSize: "0.85rem", textAlign: "center", justifyContent: "center" }}>
              Voir les OBNLs
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── CLOSED ────────────────────────────────────────────────────────────────

  if (step === "closed") {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "16px" : "24px 20px" }}>
        <div className="glass" style={{ borderRadius: 28, padding: isMobile ? "32px 20px" : "48px 40px", maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text)", marginBottom: 10 }}>
            Votes clôturés
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.6 }}>
            La fenêtre de vote s&apos;est fermée le 28 avril 2026 à 20h45 CEST.
            Merci à tous les participants&nbsp;!
          </p>
        </div>
      </div>
    );
  }

  // ── BLOCKED ───────────────────────────────────────────────────────────────

  if (step === "blocked") {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "16px" : "24px 20px" }}>
        <div className="glass" style={{ borderRadius: 28, padding: isMobile ? "28px 18px" : "40px 32px", maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>🏛️</div>
          <h2 style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--text)", marginBottom: 10 }}>
            Salut {auth.prenom} !
          </h2>
          <p style={{ fontSize: "0.92rem", color: "var(--muted)", marginBottom: 20, lineHeight: 1.7 }}>
            Le vote en ligne étant réservé aux 1A et 2A, on t&apos;invite à te rendre aux{" "}
            <strong style={{ color: "var(--text)" }}>stands Forum</strong>, à{" "}
            <strong style={{ color: "var(--text)" }}>l&apos;accueil</strong> ou{" "}
            <strong style={{ color: "var(--text)" }}>en face du CROUS</strong>, pour voter en personne.
            <br />
            <span style={{ color: "var(--teal)", fontWeight: 700 }}>À toutes&nbsp;!</span>
          </p>
          <div style={{ background: "rgba(42,191,196,0.07)", border: "1px solid rgba(42,191,196,0.2)",
            borderRadius: 16, padding: "14px 18px", marginBottom: 22, textAlign: "left" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "var(--teal)", marginBottom: 10 }}>
              Où voter ?
            </p>
            {[["📍", "Stand Forum — accueil"], ["📍", "Stand Forum — en face du CROUS"], ["🕔", "17h00 → 20h45"], ["🪪", "Carte étudiante obligatoire"]].map(([icon, txt]) => (
              <p key={txt} style={{ fontSize: "0.85rem", color: "var(--text)", marginBottom: 4 }}>{icon} {txt}</p>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a href="/projets" className="btn-primary" style={{ textAlign: "center", display: "block", justifyContent: "center" }}>
              Découvrir les projets →
            </a>
            <a href="/api/auth/logout" className="btn-ghost" style={{ textAlign: "center", fontSize: "0.85rem", justifyContent: "center" }}>
              Se déconnecter
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── ALREADY VOTED ─────────────────────────────────────────────────────────

  if (step === "already-voted") {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "16px" : "24px 20px" }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>

          {/* Confetti-ish glow ring */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(42,191,196,0.2))",
              border: "2px solid rgba(42,191,196,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 44,
              boxShadow: "0 0 60px rgba(42,191,196,0.2)",
            }}>
              ✅
            </div>
          </div>

          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 900,
            letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 8 }}>
            Vote déjà enregistré
          </h1>
          <p style={{ fontSize: "0.95rem", color: "var(--muted)", marginBottom: 32, lineHeight: 1.65 }}>
            {auth.prenom
              ? <>Merci <strong style={{ color: "var(--text)" }}>{auth.prenom}</strong> — votre vote a bien été pris en compte.</>
              : "Votre vote a bien été pris en compte."
            }{" "}
            Un seul vote est autorisé par compte ViaRézo.
          </p>

          {/* Status card */}
          <div className="glass" style={{ borderRadius: 20, padding: isMobile ? "14px 16px" : "20px 24px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: voteStatus === "open" ? "#4ade80" : voteStatus === "before" ? "#facc15" : "#f87171",
                boxShadow: voteStatus === "open" ? "0 0 8px #4ade80" : "none",
                animation: voteStatus === "open" ? "pulse 2s infinite" : "none",
                flexShrink: 0,
              }} />
              <p style={{ fontSize: "0.85rem", color: "var(--text)", margin: 0, fontWeight: 600 }}>
                {voteStatus === "open"
                  ? `Votes ouverts — fermeture dans ${countdown.hours}h ${countdown.minutes}m`
                  : voteStatus === "before"
                  ? "Les votes ne sont pas encore ouverts"
                  : "Les votes sont clôturés"}
              </p>
            </div>
          </div>

          {/* Past vote summary */}
          {pastVote && pastVote !== "loading" && (pastVote.projectRanking.length > 0 || pastVote.ongRanking.length > 0) && (
            <div className="glass" style={{ borderRadius: 20, padding: isMobile ? "16px" : "20px 24px", marginBottom: 20, textAlign: "left" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "var(--teal)", marginBottom: 14 }}>
                🗳️ Vos choix enregistrés
              </p>
              {/* project ranking */}
              {pastVote.projectRanking.length > 0 && (
                <div style={{ marginBottom: pastVote.ongRanking.length > 0 ? 16 : 0 }}>
                  <p style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "#4890E8", marginBottom: 8 }}>✦ Projets</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {pastVote.projectRanking.map((id, i) => {
                      const p = projets.find(x => x.id === id);
                      if (!p) return null;
                      const w = pastVote.promoType === "Bachelor" ? [3,2,1] : [5,4,3,2,1];
                      return (
                        <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                          borderRadius: 12, background: `${p.color}12`, border: `1px solid ${p.color}30` }}>
                          <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.65rem", fontWeight: 900,
                            background: `linear-gradient(135deg, ${p.color}80, ${p.color}40)`, color: "white" }}>{i+1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text)", margin: 0,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                            <p style={{ fontSize: "0.7rem", color: "var(--muted)", margin: 0 }}>{p.asso}</p>
                          </div>
                          <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "#4890E8", flexShrink: 0 }}>{w[i]} pts</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {pastVote.projectRanking.length > 0 && pastVote.ongRanking.length > 0 && (
                <div style={{ height: 1, background: "var(--border)", margin: "0 0 16px" }} />
              )}
              {pastVote.ongRanking.length > 0 && (
                <div>
                  <p style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "#2ABFC4", marginBottom: 8 }}>🌍 OBNLs</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {pastVote.ongRanking.map((id, i) => {
                      const o = ongs.find(x => x.id === id);
                      if (!o) return null;
                      return (
                        <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                          borderRadius: 12, background: `${o.color}12`, border: `1px solid ${o.color}30` }}>
                          <span style={{ fontSize: "1rem", flexShrink: 0 }}>{o.logo}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text)", margin: 0,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</p>
                            <p style={{ fontSize: "0.7rem", color: "var(--muted)", margin: 0,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.tagline}</p>
                          </div>
                          <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "#2ABFC4", flexShrink: 0 }}>{[3,2,1][i]} pts</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rendez-vous au Musée */}
          <div style={{
            borderRadius: 20, padding: "18px 22px", marginBottom: 28, textAlign: "center",
            background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(42,191,196,0.15))",
            border: "1px solid rgba(42,191,196,0.35)",
          }}>
            <p style={{ fontSize: "1.3rem", marginBottom: 6 }}>🏛️</p>
            <p style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
              Viens découvrir les gagnants de la JdB au Musée à 21h&nbsp;!
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
            <a href="/projets" className="btn-primary" style={{ fontSize: "0.85rem", textAlign: "center", justifyContent: "center" }}>
              Voir les projets
            </a>
            <a href="/api/auth/logout" className="btn-ghost" style={{ fontSize: "0.85rem", textAlign: "center", justifyContent: "center" }}>
              Se déconnecter
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── SUCCESS ───────────────────────────────────────────────────────────────

  if (step === "success") {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "16px" : "24px 20px" }}>
        <div style={{ maxWidth: 540, width: "100%" }}>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              width: 90, height: 90, borderRadius: "50%", margin: "0 auto 20px",
              background: "linear-gradient(135deg, rgba(37,99,235,0.25), rgba(42,191,196,0.25))",
              border: "2px solid rgba(42,191,196,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40,
              boxShadow: "0 0 50px rgba(42,191,196,0.25)",
              animation: "success-bounce 0.6s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
              🎉
            </div>
            <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 900,
              letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 8 }}>
              Vote enregistré&nbsp;!
            </h1>
            <p style={{ fontSize: "0.95rem", color: "var(--muted)", lineHeight: 1.65 }}>
              Merci{auth.prenom ? <> <strong style={{ color: "var(--text)" }}>{auth.prenom}</strong></> : ""} — votre vote a bien été pris en compte.
            </p>
          </div>

          {/* Summary card */}
          <div className="glass" style={{ borderRadius: 24, padding: isMobile ? "16px" : "24px", marginBottom: 16 }}>

            {/* Projects */}
            {projectRanking.length > 0 && (
              <div style={{ marginBottom: ongRanking.length > 0 ? 20 : 0 }}>
                <p style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--blue-light)", marginBottom: 10 }}>
                  ✦ Projets votés
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {projectRanking.map((id, i) => {
                    const p = projets.find(x => x.id === id)!;
                    return (
                      <div key={id} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                        borderRadius: 14,
                        background: `${p.color}12`, border: `1px solid ${p.color}30`,
                      }}>
                        <span style={{
                          width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.7rem", fontWeight: 900,
                          background: `linear-gradient(135deg, ${p.color}80, ${p.color}40)`,
                          color: "white",
                        }}>{i + 1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text)", margin: 0,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.name}
                          </p>
                          <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0 }}>{p.asso}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Divider if both */}
            {projectRanking.length > 0 && ongRanking.length > 0 && (
              <div style={{ height: 1, background: "var(--border)", margin: "0 0 20px" }} />
            )}

            {/* ONGs */}
            {ongRanking.length > 0 && (
              <div>
                <p style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--teal)", marginBottom: 10 }}>
                  🌍 OBNLs soutenus
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {ongRanking.map((id, i) => {
                    const o = ongs.find(x => x.id === id)!;
                    return (
                      <div key={id} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                        borderRadius: 14,
                        background: `${o.color}12`, border: `1px solid ${o.color}30`,
                      }}>
                        <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{o.logo}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text)", margin: 0,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {o.name}
                          </p>
                          <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {o.tagline}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Rendez-vous au Musée */}
          <div style={{
            borderRadius: 20, padding: "18px 22px", marginBottom: 24, textAlign: "center",
            background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(42,191,196,0.15))",
            border: "1px solid rgba(42,191,196,0.35)",
          }}>
            <p style={{ fontSize: "1.3rem", marginBottom: 6 }}>🏛️</p>
            <p style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text)", margin: "0 0 4px", letterSpacing: "-0.01em" }}>
              Viens découvrir les gagnants de la JdB au Musée à 21h&nbsp;!
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
            <a href="/projets" className="btn-primary" style={{ fontSize: "0.85rem", textAlign: "center", justifyContent: "center" }}>
              Voir tous les projets
            </a>
            <a href="/api/auth/logout" className="btn-ghost" style={{ fontSize: "0.85rem", textAlign: "center", justifyContent: "center" }}>
              Se déconnecter
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN VOTING FLOW ──────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100dvh", padding: isMobile ? "16px 16px 80px" : "40px 20px 80px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>

          {/* Status pill */}
          {voteStatus === "open" ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7,
              padding: "6px 14px", borderRadius: 100,
              background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
              marginBottom: 16, maxWidth: "100%", flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80",
                boxShadow: "0 0 6px #4ade80", animation: "pulse 2s infinite", flexShrink: 0 }} />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "#4ade80" }}>
                Votes ouverts · fermeture dans {countdown.hours}:{countdown.minutes}:{countdown.seconds}
              </span>
            </div>
          ) : (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7,
              padding: "6px 14px", borderRadius: 100,
              background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.3)",
              marginBottom: 16, maxWidth: "100%", flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#facc15", flexShrink: 0 }} />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "#facc15" }}>
                Ouverture dans {countdown.days}j {countdown.hours}h {countdown.minutes}m
              </span>
            </div>
          )}

          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", fontWeight: 900,
            letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 8, lineHeight: 1.1 }}>
            <span className="gradient-text">Je Vote</span>
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--muted)", maxWidth: 420, margin: "0 auto", lineHeight: 1.65 }}>
            Classez vos projets préférés. La dotation de{" "}
            <strong style={{ color: "var(--text)" }}>35 000 €</strong> est répartie au pro-rata des voix.
          </p>
        </div>

        {/* Auth error */}
        {authError && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 16, padding: "12px 16px", marginBottom: 16,
            display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ color: "#f87171", fontSize: "1rem", flexShrink: 0 }}>⚠</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f87171", margin: "0 0 2px" }}>
                Erreur d&apos;authentification
              </p>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: 0 }}>
                {friendlyAuthError(authError)}
              </p>
            </div>
            <button onClick={() => setAuthError(null)} style={{
              background: "none", border: "none", cursor: "pointer", color: "#f87171", opacity: 0.6, fontSize: "0.85rem",
            }}>✕</button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* ── STEP 1: Auth ────────────────────────────────────────────── */}
          <div className="glass" style={{ borderRadius: 20, padding: isMobile ? "16px" : "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: auth.authenticated ? 10 : 14 }}>
              <h3 style={{ fontWeight: 800, color: "var(--text)", fontSize: "0.95rem",
                display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                <StepBadge n={1} active={!auth.authenticated} />
                Connexion ViaRézo
              </h3>
              {auth.authenticated && (
                <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "4px 10px", borderRadius: 100,
                  background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}>
                  ✓ Connecté
                </span>
              )}
            </div>

            {auth.authenticated ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <p style={{ fontSize: "0.88rem", color: "var(--muted)", margin: 0 }}>
                  Bonjour <strong style={{ color: "var(--text)" }}>{auth.prenom} {auth.nom}</strong> 👋
                </p>
                <a href="/api/auth/logout" style={{ fontSize: "0.78rem", color: "var(--muted)", textDecoration: "underline" }}>
                  Déconnexion
                </a>
              </div>
            ) : (
              <>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
                  Connectez-vous avec votre compte <strong style={{ color: "var(--text)" }}>ViaRézo </strong> pour voter.
                  L&apos;identité garantit l&apos;unicité du vote (1 vote / compte).
                </p>
                <a href="/api/auth/login" className="btn-primary" style={{ display: "flex", width: "100%", justifyContent: "center", padding: "14px", boxSizing: "border-box" }}>
                  <Image src="/logo-viarezo.png" alt="ViaRézo" width={22} height={22} style={{ borderRadius: 4, flexShrink: 0 }} />
                  Se connecter
                </a>
              </>
            )}
          </div>


          {/* ── STEP 2: Projects ────────────────────────────────────────── */}
          {promo && promo !== "Other" && (
            <div className="glass" style={{ borderRadius: 20, padding: isMobile ? "16px" : "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <h3 style={{ fontWeight: 800, color: "var(--text)", fontSize: "0.95rem",
                  display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                  <StepBadge n={2} active={step === "projects"} />
                  Classez vos projets
                </h3>
                <span style={{
                  fontSize: "0.72rem", fontWeight: 700, padding: "4px 10px", borderRadius: 100,
                  background: projectRanking.length >= maxProjects ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.05)",
                  color: projectRanking.length >= maxProjects ? "#4890E8" : "rgba(232,240,255,0.35)",
                  border: `1px solid ${projectRanking.length >= maxProjects ? "rgba(37,99,235,0.4)" : "rgba(255,255,255,0.07)"}`,
                }}>
                  {projectRanking.length}/{maxProjects}
                </span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: 16, lineHeight: 1.5 }}>
                Classez jusqu&apos;à {maxProjects} projets. Utilisez ▲▼ pour réordonner.
              </p>

              {/* Ranking slots */}
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--teal)", marginBottom: 10 }}>
                  Votre classement
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Array.from({ length: maxProjects }, (_, i) => (
                    <RankSlot key={i} rank={i + 1} weight={weights[i]}
                      projectId={projectRanking[i] ?? null}
                      onRemove={() => removeProject(projectRanking[i])}
                      onMoveUp={() => moveProject(i, -1)}
                      onMoveDown={() => moveProject(i, 1)}
                      canMoveUp={i > 0 && i < projectRanking.length}
                      canMoveDown={i < projectRanking.length - 1}
                      isMobile={isMobile}
                    />
                  ))}
                </div>
              </div>

              {/* Search */}
              <div style={{ position: "relative", marginBottom: 10 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  color: "var(--muted)", fontSize: "0.85rem", pointerEvents: "none" }}>🔍</span>
                <input type="text" placeholder="Rechercher un projet…"
                  value={searchProjects} onChange={e => setSearchProjects(e.target.value)}
                  className="input-field" style={{ paddingLeft: 36 }} />
              </div>

              {/* Category pills */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {categories.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setCategoryFilter(cat.id)}
                    style={{
                      padding: "5px 12px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700,
                      cursor: "pointer", border: "1px solid", transition: "all 0.15s",
                      background: categoryFilter === cat.id ? `${cat.color}22` : "transparent",
                      color: categoryFilter === cat.id ? cat.color : "var(--muted)",
                      borderColor: categoryFilter === cat.id ? `${cat.color}55` : "var(--border)",
                    }}>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Project list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6,
                maxHeight: 340, overflowY: "auto", paddingRight: 2,
                scrollbarWidth: "thin", scrollbarColor: "rgba(37,99,235,0.4) transparent" } as CSSProperties}>
                {filteredProjets.map(p => {
                  const isIn = projectRanking.includes(p.id);
                  const rank = projectRanking.indexOf(p.id);
                  const disabled = !isIn && projectRanking.length >= maxProjects;
                  return (
                    <button key={p.id} type="button"
                      onClick={() => isIn ? removeProject(p.id) : addProject(p.id)}
                      disabled={disabled}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                        borderRadius: 14, textAlign: "left", width: "100%", border: "1px solid",
                        transition: "all 0.18s", cursor: disabled ? "not-allowed" : "pointer",
                        background: isIn ? `${p.color}12` : "rgba(255,255,255,0.025)",
                        borderColor: isIn ? `${p.color}45` : "rgba(255,255,255,0.06)",
                        opacity: disabled ? 0.35 : 1,
                      }}>
                      {/* Color swatch */}
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: `${p.color}22`, border: `1px solid ${p.color}35`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                          <span style={{ fontWeight: 800, color: "var(--text)", fontSize: "0.88rem" }}>{p.name}</span>
                          {p.vital && <span style={{ fontSize: "0.7rem" }}>❤️</span>}
                          <span style={{
                            fontSize: "0.62rem", fontWeight: 700, padding: "2px 7px", borderRadius: 100,
                            background: `${p.color}18`, color: p.color,
                          }}>{p.category}</span>
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0 }}>
                          {p.asso}{p.montant > 0 ? ` · ${p.montant.toLocaleString("fr-FR")} €` : ""}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        {isIn && (
                          <span style={{ fontSize: "0.72rem", fontWeight: 900, color: "#4890E8" }}>
                            #{rank + 1}
                          </span>
                        )}
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%", border: "2px solid",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.7rem", transition: "all 0.15s",
                          background: isIn ? p.color : "transparent",
                          borderColor: isIn ? p.color : "rgba(255,255,255,0.2)",
                          color: isIn ? "white" : "var(--muted)",
                        }}>
                          {isIn ? "✓" : "+"}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filteredProjets.length === 0 && (
                  <p style={{ textAlign: "center", padding: "24px 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                    Aucun projet trouvé
                  </p>
                )}
              </div>

              {step === "projects" && (
                <button type="button"
                  onClick={() => setStep("ong")}
                  disabled={projectRanking.length < maxProjects}
                  className="btn-primary"
                  style={{ marginTop: 16, width: "100%", justifyContent: "center", padding: "13px",
                    opacity: projectRanking.length < maxProjects ? 0.45 : 1,
                    cursor: projectRanking.length < maxProjects ? "not-allowed" : "pointer" }}>
                  {projectRanking.length < maxProjects
                    ? `Choisissez ${maxProjects - projectRanking.length} projet${maxProjects - projectRanking.length > 1 ? "s" : ""} de plus`
                    : "Continuer vers les OBNLs →"}
                </button>
              )}
            </div>
          )}

          {/* ── STEP 3: ONGs ────────────────────────────────────────────── */}
          {promo && promo !== "Other" && (step === "ong" || step === "confirm") && (
            <div className="glass" style={{ borderRadius: 20, padding: isMobile ? "16px" : "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <h3 style={{ fontWeight: 800, color: "var(--text)", fontSize: "0.95rem",
                  display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                  <StepBadge n={3} active={step === "ong"} />
                  OBNLs à soutenir
                </h3>
                <span style={{
                  fontSize: "0.72rem", fontWeight: 700, padding: "4px 10px", borderRadius: 100,
                  background: ongRanking.length >= 3 ? "rgba(42,191,196,0.2)" : "var(--border)",
                  color: ongRanking.length >= 3 ? "#2ABFC4" : "var(--muted)",
                  border: `1px solid ${ongRanking.length >= 3 ? "rgba(42,191,196,0.4)" : "var(--border)"}`,
                }}>
                  {ongRanking.length}/3
                </span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: 16, lineHeight: 1.5 }}>
                Classez jusqu&apos;à 3 OBNLs.
              </p>

              {/* ONG ranking slots */}
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--teal)", marginBottom: 10 }}>
                  Votre classement OBNLs
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Array.from({ length: 3 }, (_, i) => (
                    <OngSlot key={i} rank={i + 1} weight={ONG_WEIGHTS[i]}
                      ongId={ongRanking[i] ?? null}
                      onRemove={() => removeOng(ongRanking[i])}
                      onMoveUp={() => moveOng(i, -1)}
                      onMoveDown={() => moveOng(i, 1)}
                      canMoveUp={i > 0 && i < ongRanking.length}
                      canMoveDown={i < ongRanking.length - 1}
                      isMobile={isMobile}
                    />
                  ))}
                </div>
              </div>

              {/* ONG search */}
              <div style={{ position: "relative", marginBottom: 12 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  color: "var(--muted)", fontSize: "0.85rem", pointerEvents: "none" }}>🔍</span>
                <input type="text" placeholder="Rechercher un OBNL…"
                  value={searchOngs} onChange={e => setSearchOngs(e.target.value)}
                  className="input-field" style={{ paddingLeft: 36 }} />
              </div>

              {/* ONG list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6,
                maxHeight: 340, overflowY: "auto", paddingRight: 2,
                scrollbarWidth: "thin", scrollbarColor: "rgba(42,191,196,0.4) transparent" } as CSSProperties}>
                {filteredOngs.map(o => {
                  const isIn = ongRanking.includes(o.id);
                  const rank = ongRanking.indexOf(o.id);
                  const disabled = !isIn && ongRanking.length >= 3;
                  return (
                    <button key={o.id} type="button"
                      onClick={() => isIn ? removeOng(o.id) : addOng(o.id)}
                      disabled={disabled}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                        borderRadius: 14, textAlign: "left", width: "100%", border: "1px solid",
                        transition: "all 0.18s", cursor: disabled ? "not-allowed" : "pointer",
                        background: isIn ? `${o.color}10` : "rgba(255,255,255,0.025)",
                        borderColor: isIn ? `${o.color}40` : "rgba(255,255,255,0.06)",
                        opacity: disabled ? 0.35 : 1,
                      }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: `${o.color}20`, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.1rem",
                      }}>{o.logo}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 800, color: "var(--text)", fontSize: "0.88rem", margin: "0 0 2px",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {o.name}
                        </p>
                        <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {o.tagline}
                        </p>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                          {o.domaines.slice(0, 2).map(d => (
                            <span key={d} style={{ fontSize: "0.6rem", padding: "2px 6px", borderRadius: 100,
                              background: `${o.color}15`, color: o.color }}>{d}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        {isIn && <span style={{ fontSize: "0.72rem", fontWeight: 900, color: "#2ABFC4" }}>#{rank + 1}</span>}
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%", border: "2px solid",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.7rem", transition: "all 0.15s",
                          background: isIn ? o.color : "transparent",
                          borderColor: isIn ? o.color : "rgba(255,255,255,0.2)",
                          color: isIn ? "white" : "var(--muted)",
                        }}>{isIn ? "✓" : "+"}</div>
                      </div>
                    </button>
                  );
                })}
                {filteredOngs.length === 0 && (
                  <p style={{ textAlign: "center", padding: "24px 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                    Aucun OBNL trouvé
                  </p>
                )}
              </div>

              {step === "ong" && (
                <div style={{ display: "flex", gap: 10, marginTop: 16, flexDirection: isMobile ? "column" : "row" }}>
                  <button type="button" onClick={() => setStep("projects")} className="btn-ghost"
                    style={{ flexShrink: 0, padding: "11px 18px", fontSize: "0.85rem", justifyContent: "center" }}>
                    ← Retour
                  </button>
                  <button type="button"
                    onClick={() => setStep("confirm")}
                    disabled={ongRanking.length < 3}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: "center", padding: "11px",
                      opacity: ongRanking.length < 3 ? 0.45 : 1,
                      cursor: ongRanking.length < 3 ? "not-allowed" : "pointer" }}>
                    {ongRanking.length < 3
                      ? `Choisissez ${3 - ongRanking.length} OBNL${3 - ongRanking.length > 1 ? "s" : ""} de plus`
                      : "Confirmer mon vote →"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Confirm ─────────────────────────────────────────── */}
          {step === "confirm" && promo && promo !== "Other" && (
            <div className="glass" style={{ borderRadius: 20, padding: isMobile ? "16px" : "20px 24px" }}>
              <h3 style={{ fontWeight: 800, color: "var(--text)", fontSize: "0.95rem",
                display: "flex", alignItems: "center", gap: 8, margin: "0 0 16px" }}>
                <StepBadge n={4} active />
                Confirmer et soumettre
              </h3>

              {/* Summary — stacked, full width */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <div style={{ padding: "14px 16px", borderRadius: 14,
                  background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.2)" }}>
                  <p style={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "#4890E8", margin: "0 0 10px" }}>
                    Projets ({projectRanking.length}/{maxProjects})
                  </p>
                  {projectRanking.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {projectRanking.map((id, i) => {
                        const p = projets.find(x => x.id === id)!;
                        return (
                          <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                            <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.6rem", fontWeight: 900,
                              background: `${p.color}30`, color: p.color }}>
                              {i + 1}
                            </span>
                            <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: 700, color: "var(--text)",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {p.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: 0 }}>Aucun projet</p>
                  )}
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 14,
                  background: "rgba(42,191,196,0.07)", border: "1px solid rgba(42,191,196,0.2)" }}>
                  <p style={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "#2ABFC4", margin: "0 0 10px" }}>
                    OBNLs ({ongRanking.length}/3)
                  </p>
                  {ongRanking.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {ongRanking.map((id, i) => {
                        const o = ongs.find(x => x.id === id)!;
                        return (
                          <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                            <span style={{ fontSize: "0.85rem", flexShrink: 0 }}>{o.logo}</span>
                            <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: 700, color: "var(--text)",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {o.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: 0 }}>Non renseigné</p>
                  )}
                </div>
              </div>

              {/* Voix bar */}
              <div style={{ padding: "10px 14px", borderRadius: 12, marginBottom: 14,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Voix distribuées</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 900, color: "var(--text)" }}>
                  <span style={{ color: "#4890E8" }}>{totalVoix}</span>
                  <span style={{ color: "var(--muted)", fontWeight: 500 }}> / {maxVoix}</span>
                </span>
              </div>

              {submitError && (
                <div style={{ padding: "10px 14px", borderRadius: 12, marginBottom: 12,
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                  fontSize: "0.82rem", color: "#f87171" }}>
                  ⚠ {submitError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
                <button type="button" onClick={() => setStep("ong")} disabled={submitting}
                  className="btn-ghost" style={{ flexShrink: 0, padding: "11px 18px", fontSize: "0.85rem", justifyContent: "center" }}>
                  ← Modifier
                </button>
                <button type="button" onClick={handleSubmit}
                  disabled={submitting || projectRanking.length < maxProjects || ongRanking.length < 3}
                  className="btn-primary"
                  style={{
                    flex: 1, justifyContent: "center", padding: "13px",
                    opacity: (submitting || projectRanking.length < maxProjects || ongRanking.length < 3) ? 0.5 : 1,
                    cursor: (submitting || projectRanking.length < maxProjects || ongRanking.length < 3) ? "not-allowed" : "pointer",
                  }}>
                  {submitting ? (
                    <><span style={{ width: 14, height: 14, borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white",
                      animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                    Envoi…</>
                  ) : "✦ Valider mon vote définitivement"}
                </button>
              </div>
              <p style={{ textAlign: "center", fontSize: "0.72rem", color: "var(--muted)", marginTop: 10 }}>
                Vote sécurisé · Identité vérifiée · 1 vote par compte · Irrévocable
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
