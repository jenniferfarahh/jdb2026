"use client";

import { useState, useEffect, useCallback } from "react";
import { projets, categories } from "@/data/projets";
import { ongs } from "@/data/ong";

// ── Types ──────────────────────────────────────────────────────────────────

type PromoType = "P2027" | "P2028" | "P2029" | "Bachelor" | "Other";
// 'blocked' = authenticated but not eligible for online vote
type Step = "auth" | "projects" | "ong" | "confirm" | "success" | "already-voted" | "closed" | "before" | "blocked";

interface AuthState {
  loading: boolean;
  authenticated: boolean;
  prenom: string;
  nom: string;
  promo: PromoType;       // auto-detected from ViaRézo
  category: "ingenieur" | "bachelor" | "other";
  eligible: boolean;      // false → blocked from online vote
  hasVoted: boolean;
}

interface VoteStatus {
  status: "before" | "open" | "closed";
  loadingStatus: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────

const VOTE_START = new Date("2026-04-28T15:30:00.000Z");
const VOTE_END   = new Date("2026-04-28T19:00:00.000Z");

const INGENIEUR_WEIGHTS = [5, 4, 3, 2, 1];
const BACHELOR_WEIGHTS  = [3, 2, 1];
const ONG_WEIGHTS       = [3, 2, 1];

const PROMO_OPTIONS: { value: PromoType; label: string; desc: string; eligible: boolean }[] = [
  { value: "P2027", label: "Ingénieur P2027", desc: "5 choix de projets · 15 voix max", eligible: true },
  { value: "P2028", label: "Ingénieur P2028", desc: "5 choix de projets · 15 voix max", eligible: true },
  { value: "P2029", label: "Ingénieur P2029", desc: "5 choix de projets · 15 voix max", eligible: true },
  { value: "Bachelor", label: "Bachelor", desc: "3 choix de projets · 6 voix max", eligible: true },
  { value: "Other", label: "Autre promotion", desc: "Vote en présentiel uniquement", eligible: false },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function getVoteStatusNow(): "before" | "open" | "closed" {
  if (process.env.NEXT_PUBLIC_VOTE_TEST_MODE === "true") return "open";
  const now = new Date();
  if (now < VOTE_START) return "before";
  if (now <= VOTE_END) return "open";
  return "closed";
}

function formatCountdown(target: Date): string {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return "00:00:00";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return [h, m, s].map(n => String(n).padStart(2, "0")).join(":");
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

// ── Sub-components ─────────────────────────────────────────────────────────

function StepBadge({ n, active }: { n: number; active: boolean }) {
  return (
    <span
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
      style={{
        background: active
          ? "linear-gradient(135deg, #2563EB, #2ABFC4)"
          : "rgba(255,255,255,0.08)",
        color: active ? "white" : "rgba(232,240,255,0.4)",
      }}
    >
      {n}
    </span>
  );
}

function WeightPill({ weight, active }: { weight: number; active: boolean }) {
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{
        background: active ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.05)",
        color: active ? "#4890E8" : "rgba(232,240,255,0.3)",
        border: `1px solid ${active ? "rgba(37,99,235,0.4)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      {weight} pt{weight > 1 ? "s" : ""}
    </span>
  );
}

function RankSlot({
  rank,
  weight,
  projectId,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  rank: number;
  weight: number;
  projectId: string | null;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const projet = projectId ? projets.find(p => p.id === projectId) : null;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
      style={{
        background: projet
          ? `${projet.categoryColor}10`
          : "rgba(255,255,255,0.025)",
        border: `1px solid ${projet ? projet.categoryColor + "35" : "rgba(255,255,255,0.06)"}`,
        minHeight: "56px",
      }}
    >
      {/* Rank number */}
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
        style={{
          background: projet
            ? `linear-gradient(135deg, ${projet.categoryColor}80, ${projet.categoryColor}40)`
            : "rgba(255,255,255,0.06)",
          color: projet ? "white" : "rgba(232,240,255,0.25)",
        }}
      >
        {rank}
      </span>

      {/* Content */}
      {projet ? (
        <>
          <span className="text-lg flex-shrink-0">{projet.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{projet.name}</p>
            <p className="text-xs" style={{ color: "rgba(232,240,255,0.45)" }}>
              {projet.asso}
            </p>
          </div>
          <WeightPill weight={weight} active />
          {/* Reorder arrows */}
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="w-5 h-5 rounded flex items-center justify-center text-xs transition-opacity"
              style={{
                background: "rgba(255,255,255,0.06)",
                opacity: canMoveUp ? 1 : 0.2,
                cursor: canMoveUp ? "pointer" : "not-allowed",
              }}
              title="Monter"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="w-5 h-5 rounded flex items-center justify-center text-xs transition-opacity"
              style={{
                background: "rgba(255,255,255,0.06)",
                opacity: canMoveDown ? 1 : 0.2,
                cursor: canMoveDown ? "pointer" : "not-allowed",
              }}
              title="Descendre"
            >
              ▼
            </button>
          </div>
          {/* Remove */}
          <button
            type="button"
            onClick={onRemove}
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-opacity hover:opacity-100 opacity-60"
            style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }}
            title="Retirer"
          >
            ✕
          </button>
        </>
      ) : (
        <p className="text-xs flex-1" style={{ color: "rgba(232,240,255,0.25)" }}>
          — Slot {rank} libre (optionnel)
        </p>
      )}
    </div>
  );
}

function OngSlot({
  rank,
  weight,
  ongId,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  rank: number;
  weight: number;
  ongId: string | null;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const ong = ongId ? ongs.find(o => o.id === ongId) : null;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
      style={{
        background: ong ? `${ong.color}10` : "rgba(255,255,255,0.025)",
        border: `1px solid ${ong ? ong.color + "35" : "rgba(255,255,255,0.06)"}`,
        minHeight: "56px",
      }}
    >
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
        style={{
          background: ong
            ? `linear-gradient(135deg, ${ong.color}80, ${ong.color}40)`
            : "rgba(255,255,255,0.06)",
          color: ong ? "white" : "rgba(232,240,255,0.25)",
        }}
      >
        {rank}
      </span>

      {ong ? (
        <>
          <span className="text-lg flex-shrink-0">{ong.logo}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{ong.name}</p>
            <p className="text-xs truncate" style={{ color: "rgba(232,240,255,0.45)" }}>
              {ong.tagline}
            </p>
          </div>
          <WeightPill weight={weight} active />
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="w-5 h-5 rounded flex items-center justify-center text-xs"
              style={{
                background: "rgba(255,255,255,0.06)",
                opacity: canMoveUp ? 1 : 0.2,
                cursor: canMoveUp ? "pointer" : "not-allowed",
              }}
            >
              ▲
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="w-5 h-5 rounded flex items-center justify-center text-xs"
              style={{
                background: "rgba(255,255,255,0.06)",
                opacity: canMoveDown ? 1 : 0.2,
                cursor: canMoveDown ? "pointer" : "not-allowed",
              }}
            >
              ▼
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 opacity-60 hover:opacity-100"
            style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }}
          >
            ✕
          </button>
        </>
      ) : (
        <p className="text-xs flex-1" style={{ color: "rgba(232,240,255,0.25)" }}>
          — Slot {rank} libre (optionnel)
        </p>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function JeVotePage() {
  // Auth state
  const [auth, setAuth] = useState<AuthState>({
    loading: true,
    authenticated: false,
    prenom: "",
    nom: "",
    promo: "Other",
    category: "other",
    eligible: false,
    hasVoted: false,
  });

  // Vote status
  const [voteStatus, setVoteStatus] = useState<VoteStatus>({
    status: getVoteStatusNow(),
    loadingStatus: false,
  });

  // UI state
  const [step, setStep] = useState<Step>("auth");
  const [promo, setPromo] = useState<PromoType | null>(null); // kept for submit compat
  const [projectRanking, setProjectRanking] = useState<string[]>([]);
  const [ongRanking, setOngRanking] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("tous");
  const [searchProjects, setSearchProjects] = useState("");
  const [searchOngs, setSearchOngs] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");

  // Error from OIDC callback (query param)
  const [authError, setAuthError] = useState<string | null>(null);

  // ── On mount: read query params, check auth ───────────────────────────

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err) {
        setAuthError(decodeURIComponent(err));
        // Clean URL
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
          setAuth({
            loading: false, authenticated: true,
            prenom: data.prenom, nom: data.nom,
            promo: detectedPromo,
            category: data.category ?? "other",
            eligible: data.eligible ?? false,
            hasVoted: data.hasVoted,
          });
          setPromo(detectedPromo); // sync for submit handler
          if (data.hasVoted) {
            setStep("already-voted");
          } else if (!data.eligible) {
            setStep("blocked"); // not P2027/P2028/Bachelor → block
          } else {
            const vs = getVoteStatusNow();
            if (vs === "before") setStep("before");
            else if (vs === "closed") setStep("closed");
            else setStep("projects"); // ← skip promo step, go straight to voting
          }
        } else {
          setAuth({ loading: false, authenticated: false, prenom: "", nom: "", promo: "Other", category: "other", eligible: false, hasVoted: false });
          const vs = getVoteStatusNow();
          if (vs === "before") setStep("before");
          else if (vs === "closed") setStep("closed");
          else setStep("auth");
        }
      })
      .catch(() => {
        setAuth({ loading: false, authenticated: false, prenom: "", nom: "", promo: "Other", category: "other", eligible: false, hasVoted: false });
        setStep("auth");
      });
  }, []);

  // ── Countdown timer ────────────────────────────────────────────────────

  useEffect(() => {
    const tick = () => {
      const vs = getVoteStatusNow();
      setVoteStatus(prev => ({ ...prev, status: vs }));
      if (vs === "before") setCountdown(formatCountdown(VOTE_START));
      else if (vs === "open") setCountdown(formatCountdown(VOTE_END));
      else setCountdown("00:00:00");
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Ranked list helpers ────────────────────────────────────────────────

  const addProject = useCallback((id: string) => {
    const max = getMaxProjects(promo);
    setProjectRanking(prev => {
      if (prev.includes(id) || prev.length >= max) return prev;
      return [...prev, id];
    });
  }, [promo]);

  const removeProject = useCallback((id: string) => {
    setProjectRanking(prev => prev.filter(x => x !== id));
  }, []);

  const moveProject = useCallback((idx: number, dir: -1 | 1) => {
    setProjectRanking(prev => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  const addOng = useCallback((id: string) => {
    setOngRanking(prev => {
      if (prev.includes(id) || prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  const removeOng = useCallback((id: string) => {
    setOngRanking(prev => prev.filter(x => x !== id));
  }, []);

  const moveOng = useCallback((idx: number, dir: -1 | 1) => {
    setOngRanking(prev => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!promo || projectRanking.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/vote/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectRanking, ongRanking }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep("success");
      } else {
        setSubmitError(data.error ?? "Une erreur est survenue.");
      }
    } catch {
      setSubmitError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────

  const weights = getWeights(promo);
  const maxProjects = getMaxProjects(promo);

  const filteredProjets = projets.filter(p => {
    const matchCat = categoryFilter === "tous" || p.category.toLowerCase().replace(/\s+/g, "") === categoryFilter;
    const matchSearch =
      !searchProjects ||
      p.name.toLowerCase().includes(searchProjects.toLowerCase()) ||
      p.asso.toLowerCase().includes(searchProjects.toLowerCase()) ||
      p.pays.toLowerCase().includes(searchProjects.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredOngs = ongs.filter(o => {
    if (!searchOngs) return true;
    const q = searchOngs.toLowerCase();
    return (
      o.name.toLowerCase().includes(q) ||
      o.tagline.toLowerCase().includes(q) ||
      o.domaines.some(d => d.toLowerCase().includes(q))
    );
  });

  const totalVoix = weights.slice(0, projectRanking.length).reduce((a, b) => a + b, 0);
  const maxVoix = weights.reduce((a, b) => a + b, 0);

  // ── Error message mapping ──────────────────────────────────────────────

  const friendlyAuthError = (code: string) => {
    const map: Record<string, string> = {
      no_code: "Aucun code d'autorisation reçu.",
      invalid_state: "Session expirée ou invalide. Réessayez.",
      token_failed: "Échec de l'authentification ViaRézo.",
      userinfo_failed: "Impossible de récupérer vos informations.",
      no_sub: "Identifiant ViaRézo manquant.",
      server_error: "Erreur serveur. Réessayez dans quelques instants.",
      access_denied: "Accès refusé. Vous avez annulé la connexion.",
    };
    return map[code] ?? `Erreur d'authentification (${code}).`;
  };

  // ── Render helpers ─────────────────────────────────────────────────────

  const renderStatusBar = () => {
    if (voteStatus.status === "open") {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-5">
          <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 animate-pulse" />
          <span className="text-xs font-semibold text-green-400 uppercase tracking-widest">
            Votes ouverts · Fermeture dans {countdown}
          </span>
        </div>
      );
    }
    if (voteStatus.status === "before") {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-5">
          <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-yellow-400 uppercase tracking-widest">
            Ouverture dans {countdown}
          </span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-5">
        <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">
          Votes clôturés
        </span>
      </div>
    );
  };

  // ── Loading ────────────────────────────────────────────────────────────

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "rgba(37,99,235,0.3)", borderTopColor: "#2563EB" }} />
          <p className="text-sm" style={{ color: "var(--muted)" }}>Chargement…</p>
        </div>
      </div>
    );
  }

  // ── BEFORE window ──────────────────────────────────────────────────────

  if (step === "before") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="glass rounded-3xl max-w-md w-full p-8 sm:p-12 text-center">
          <div className="text-5xl mb-5">⏳</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Bientôt disponible</h2>
          <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
            Les votes ouvriront le <strong className="text-white">28 avril 2026 à 17h30 CEST</strong>.
          </p>
          <div className="glass rounded-2xl p-4 mb-5">
            <div className="text-3xl font-black text-white font-mono tracking-wider">{countdown}</div>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>avant l&apos;ouverture</p>
          </div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Préparez vos choix en consultant les <a href="/projets" className="underline" style={{ color: "var(--blue-light)" }}>projets</a> et les <a href="/ong" className="underline" style={{ color: "var(--blue-light)" }}>ONGs</a>.
          </p>
        </div>
      </div>
    );
  }

  // ── BLOCKED — not eligible for online vote ─────────────────────────────

  if (step === "blocked") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="glass rounded-3xl max-w-md w-full p-8 sm:p-12 text-center">
          <div className="text-5xl mb-5">🏛️</div>
          <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: "var(--text)" }}>
            Vote en présentiel
          </h2>
          <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--muted)" }}>
            Bonjour <strong style={{ color: "var(--text)" }}>{auth.prenom}</strong> — votre promotion{" "}
            <strong style={{ color: "var(--blue-light)" }}>{auth.promo}</strong> vote{" "}
            <strong style={{ color: "var(--text)" }}>en présentiel</strong> uniquement.
          </p>
          <div className="glass rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--teal)" }}>Infos vote sur place</p>
            <p className="text-sm" style={{ color: "var(--text)" }}>📍 Diagonale Eiffel</p>
            <p className="text-sm" style={{ color: "var(--text)" }}>🕔 17h30 → 20h45</p>
            <p className="text-sm" style={{ color: "var(--text)" }}>🪪 Carte étudiante obligatoire</p>
          </div>
          <div className="flex flex-col gap-3">
            <a href="/projets" className="btn-primary !justify-center !py-3 !text-sm">
              Découvrir les projets →
            </a>
            <a href="/api/auth/logout" className="btn-ghost !text-sm !py-3 !px-6">
              Se déconnecter
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── CLOSED window ──────────────────────────────────────────────────────

  if (step === "closed") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="glass rounded-3xl max-w-md w-full p-8 sm:p-12 text-center">
          <div className="text-5xl mb-5">🔒</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Votes clôturés</h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            La fenêtre de vote s&apos;est fermée le 28 avril 2026 à 21h00 CEST. Merci à tous les participants !
          </p>
        </div>
      </div>
    );
  }

  // ── ALREADY VOTED ──────────────────────────────────────────────────────

  if (step === "already-voted") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="glass rounded-3xl max-w-md w-full p-8 sm:p-12 text-center">
          <div className="text-5xl mb-5">✅</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Déjà voté !</h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            {auth.prenom ? `Bonjour ${auth.prenom} ! ` : ""}Votre vote a déjà été enregistré. Un seul vote par compte ViaRézo est autorisé.
          </p>
          <a href="/api/auth/logout" className="btn-ghost !text-sm !py-3 !px-6">
            Se déconnecter
          </a>
        </div>
      </div>
    );
  }

  // ── SUCCESS ────────────────────────────────────────────────────────────

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="glass rounded-3xl max-w-lg w-full p-8 sm:p-12 text-center">
          <div className="text-6xl mb-5 success-bounce inline-block">🎉</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Vote enregistré !</h2>
          <p className="text-sm mb-7" style={{ color: "var(--muted)" }}>
            Merci{auth.prenom ? ` ${auth.prenom}` : ""} ! Votre vote a été pris en compte.
          </p>

          {/* Projects summary */}
          {projectRanking.length > 0 && (
            <div className="mb-5 text-left">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--teal)" }}>
                Projets votés
              </p>
              <div className="flex flex-col gap-2">
                {projectRanking.map((id, i) => {
                  const p = projets.find(x => x.id === id)!;
                  return (
                    <div key={id} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: `${p.categoryColor}12`, border: `1px solid ${p.categoryColor}30` }}>
                      <span className="text-lg">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{p.name}</p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>{p.asso}</p>
                      </div>
                      <span className="text-xs font-black flex-shrink-0" style={{ color: "#4890E8" }}>
                        #{i + 1} · {weights[i]} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ONGs summary */}
          {ongRanking.length > 0 && (
            <div className="mb-7 text-left">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--teal)" }}>
                ONGs soutenues
              </p>
              <div className="flex flex-col gap-2">
                {ongRanking.map((id, i) => {
                  const o = ongs.find(x => x.id === id)!;
                  return (
                    <div key={id} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: `${o.color}12`, border: `1px solid ${o.color}30` }}>
                      <span className="text-lg">{o.logo}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{o.name}</p>
                        <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{o.tagline}</p>
                      </div>
                      <span className="text-xs font-black flex-shrink-0" style={{ color: "#2ABFC4" }}>
                        #{i + 1} · {ONG_WEIGHTS[i]} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="glass rounded-xl p-4 text-sm" style={{ color: "var(--muted)" }}>
            <strong className="text-white">{totalVoix}</strong> voix distribuées sur {maxVoix} possible{maxVoix > 1 ? "s" : ""}
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN FLOW ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-8">
          {renderStatusBar()}
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
            <span className="gradient-text">Je Vote</span>
          </h1>
          <p className="text-sm sm:text-base max-w-md mx-auto leading-relaxed" style={{ color: "var(--muted)" }}>
            Classez vos projets préférés. Les votes sont pondérés et la dotation de{" "}
            <span className="font-bold text-white">45 000 €</span> est répartie au pro-rata.
          </p>
        </div>

        {/* Auth error banner */}
        {authError && (
          <div className="glass rounded-2xl p-4 mb-5 flex items-start gap-3"
            style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)" }}>
            <span className="text-red-400 text-lg flex-shrink-0">⚠</span>
            <div>
              <p className="text-sm font-bold text-red-400 mb-1">Erreur d&apos;authentification</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{friendlyAuthError(authError)}</p>
            </div>
            <button onClick={() => setAuthError(null)} className="ml-auto text-red-400 opacity-60 hover:opacity-100 text-sm">✕</button>
          </div>
        )}

        <div className="flex flex-col gap-4">

          {/* ── STEP 1: Auth ─────────────────────────────────────────── */}
          <div className="glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <StepBadge n={1} active={step === "auth" || !auth.authenticated} />
                Connexion ViaRézo
              </h3>
              {auth.authenticated && (
                <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                  style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}>
                  ✓ Connecté
                </span>
              )}
            </div>

            {auth.authenticated ? (
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Bonjour <span className="font-bold text-white">{auth.prenom} {auth.nom}</span> 👋
                </p>
                <a href="/api/auth/logout" className="text-xs underline" style={{ color: "var(--muted)" }}>
                  Déconnexion
                </a>
              </div>
            ) : (
              <div>
                <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                  Connectez-vous avec votre compte <strong className="text-white">ViaRézo</strong> pour voter. L&apos;identité garantit l&apos;unicité du vote (1 vote / compte).
                </p>
                <a href="/api/auth/login"
                  className="btn-primary !text-base !py-4 !px-8 w-full sm:w-auto text-center"
                  style={{ display: "inline-flex", justifyContent: "center" }}>
                  🔐 Se connecter via ViaRézo
                </a>
              </div>
            )}
          </div>

          {/* ── STEP 2: Promo (auto-detected, read-only) ─────────────── */}
          {auth.authenticated && promo && promo !== "Other" && (
            <div className="glass rounded-2xl p-4 sm:p-5 flex items-center gap-4"
              style={{ border: "1px solid rgba(42,191,196,0.3)", background: "rgba(42,191,196,0.05)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(42,191,196,0.15)", border: "1px solid rgba(42,191,196,0.3)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--teal)" }}>
                  Promotion détectée via ViaRézo
                </p>
                <p className="text-sm font-black" style={{ color: "var(--text)" }}>
                  {promo === "P2027" ? "Ingénieur P2027" : promo === "P2028" ? "Ingénieur P2028" : promo === "P2029" ? "Ingénieur P2029" : "Bachelor"}
                  <span className="ml-2 font-normal text-xs" style={{ color: "var(--muted)" }}>
                    · {maxProjects} projets max · {getWeights(promo).join("+")} = {getWeights(promo).reduce((a,b)=>a+b,0)} voix
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 3: Projects ranking ──────────────────────────────── */}
          {promo && promo !== "Other" && (
            <div className="glass rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                  <StepBadge n={3} active={step === "projects"} />
                  Classez vos projets
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: projectRanking.length >= maxProjects ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.05)",
                    color: projectRanking.length >= maxProjects ? "#4890E8" : "rgba(232,240,255,0.35)",
                    border: `1px solid ${projectRanking.length >= maxProjects ? "rgba(37,99,235,0.4)" : "rgba(255,255,255,0.07)"}`,
                  }}>
                  {projectRanking.length}/{maxProjects}
                </span>
              </div>
              <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                Cliquez sur un projet pour l&apos;ajouter à votre classement. Utilisez les flèches ▲▼ pour réordonner.
              </p>

              {/* Current ranking slots */}
              {maxProjects > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--teal)" }}>
                    Votre classement
                  </p>
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: maxProjects }, (_, i) => (
                      <RankSlot
                        key={i}
                        rank={i + 1}
                        weight={weights[i]}
                        projectId={projectRanking[i] ?? null}
                        onRemove={() => removeProject(projectRanking[i])}
                        onMoveUp={() => moveProject(i, -1)}
                        onMoveDown={() => moveProject(i, 1)}
                        canMoveUp={i > 0 && i < projectRanking.length}
                        canMoveDown={i < projectRanking.length - 1}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Search & filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm" style={{ color: "var(--muted)" }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Rechercher un projet…"
                    value={searchProjects}
                    onChange={e => setSearchProjects(e.target.value)}
                    className="input-field !pl-9"
                  />
                </div>
              </div>

              {/* Category filters */}
              <div className="flex gap-2 flex-wrap mb-4">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background: categoryFilter === cat.id ? `${cat.color}25` : "rgba(255,255,255,0.04)",
                      color: categoryFilter === cat.id ? cat.color : "rgba(232,240,255,0.45)",
                      border: `1px solid ${categoryFilter === cat.id ? cat.color + "50" : "rgba(255,255,255,0.07)"}`,
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Project list */}
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-0.5"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(37,99,235,0.4) transparent" }}>
                {filteredProjets.map(p => {
                  const isInRanking = projectRanking.includes(p.id);
                  const rank = projectRanking.indexOf(p.id);
                  const isDisabled = !isInRanking && projectRanking.length >= maxProjects;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => isInRanking ? removeProject(p.id) : addProject(p.id)}
                      disabled={isDisabled}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl text-left transition-all duration-200 w-full"
                      style={{
                        background: isInRanking ? `${p.categoryColor}12` : "rgba(255,255,255,0.025)",
                        border: `1px solid ${isInRanking ? p.categoryColor + "45" : "rgba(255,255,255,0.06)"}`,
                        opacity: isDisabled ? 0.35 : 1,
                        cursor: isDisabled ? "not-allowed" : "pointer",
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${p.categoryColor}20` }}>
                        {p.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-bold text-white text-sm">{p.name}</span>
                          <span className="badge hidden sm:inline-flex"
                            style={{ background: `${p.categoryColor}18`, color: p.categoryColor }}>
                            {p.category}
                          </span>
                        </div>
                        <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                          {p.asso} · {p.pays} · {p.montant.toLocaleString("fr-FR")} €
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isInRanking && (
                          <span className="text-xs font-black" style={{ color: "#4890E8" }}>
                            #{rank + 1}
                          </span>
                        )}
                        <div
                          className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all"
                          style={isInRanking
                            ? { background: p.categoryColor, borderColor: p.categoryColor, color: "white" }
                            : { borderColor: "rgba(255,255,255,0.15)" }}>
                          {isInRanking ? "✓" : "+"}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filteredProjets.length === 0 && (
                  <p className="text-center py-8 text-sm" style={{ color: "var(--muted)" }}>
                    Aucun projet trouvé
                  </p>
                )}
              </div>

              {projectRanking.length > 0 && step === "projects" && (
                <button
                  type="button"
                  onClick={() => setStep("ong")}
                  className="btn-primary mt-4 w-full !justify-center !py-3 !text-sm"
                >
                  Continuer vers les ONGs →
                </button>
              )}
            </div>
          )}

          {/* ── STEP 4: ONG ranking ───────────────────────────────────── */}
          {promo && promo !== "Other" && (step === "ong" || step === "confirm" || step === "success") && (
            <div className="glass rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                  <StepBadge n={4} active={step === "ong"} />
                  ONG à soutenir{" "}
                  <span className="text-xs font-normal" style={{ color: "var(--muted)" }}>(optionnel)</span>
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: ongRanking.length >= 3 ? "rgba(42,191,196,0.2)" : "rgba(255,255,255,0.05)",
                    color: ongRanking.length >= 3 ? "#2ABFC4" : "rgba(232,240,255,0.35)",
                    border: `1px solid ${ongRanking.length >= 3 ? "rgba(42,191,196,0.4)" : "rgba(255,255,255,0.07)"}`,
                  }}>
                  {ongRanking.length}/3
                </span>
              </div>
              <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                Vote ONG séparé — classez jusqu&apos;à 3 ONGs. Poids : {ONG_WEIGHTS.join(", ")} pts. Pool indépendant des projets.
              </p>

              {/* ONG ranking slots */}
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--teal)" }}>
                  Votre classement ONGs
                </p>
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }, (_, i) => (
                    <OngSlot
                      key={i}
                      rank={i + 1}
                      weight={ONG_WEIGHTS[i]}
                      ongId={ongRanking[i] ?? null}
                      onRemove={() => removeOng(ongRanking[i])}
                      onMoveUp={() => moveOng(i, -1)}
                      onMoveDown={() => moveOng(i, 1)}
                      canMoveUp={i > 0 && i < ongRanking.length}
                      canMoveDown={i < ongRanking.length - 1}
                    />
                  ))}
                </div>
              </div>

              {/* ONG search */}
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm" style={{ color: "var(--muted)" }}>🔍</span>
                <input
                  type="text"
                  placeholder="Rechercher une ONG…"
                  value={searchOngs}
                  onChange={e => setSearchOngs(e.target.value)}
                  className="input-field !pl-9"
                />
              </div>

              {/* ONG list */}
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-0.5"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(42,191,196,0.4) transparent" }}>
                {filteredOngs.map(o => {
                  const isInRanking = ongRanking.includes(o.id);
                  const rank = ongRanking.indexOf(o.id);
                  const isDisabled = !isInRanking && ongRanking.length >= 3;

                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => isInRanking ? removeOng(o.id) : addOng(o.id)}
                      disabled={isDisabled}
                      className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 w-full"
                      style={{
                        background: isInRanking ? `${o.color}10` : "rgba(255,255,255,0.025)",
                        border: `1px solid ${isInRanking ? o.color + "40" : "rgba(255,255,255,0.06)"}`,
                        opacity: isDisabled ? 0.35 : 1,
                        cursor: isDisabled ? "not-allowed" : "pointer",
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${o.color}20` }}>
                        {o.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-white text-sm">{o.name}</span>
                        </div>
                        <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{o.tagline}</p>
                        <div className="flex gap-1.5 flex-wrap mt-1">
                          {o.domaines.slice(0, 2).map(d => (
                            <span key={d} className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: `${o.color}15`, color: o.color }}>
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isInRanking && (
                          <span className="text-xs font-black" style={{ color: "#2ABFC4" }}>
                            #{rank + 1}
                          </span>
                        )}
                        <div
                          className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all"
                          style={isInRanking
                            ? { background: o.color, borderColor: o.color, color: "white" }
                            : { borderColor: "rgba(255,255,255,0.15)" }}>
                          {isInRanking ? "✓" : "+"}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filteredOngs.length === 0 && (
                  <p className="text-center py-8 text-sm" style={{ color: "var(--muted)" }}>
                    Aucune ONG trouvée
                  </p>
                )}
              </div>

              {step === "ong" && (
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setStep("projects")}
                    className="btn-ghost !text-sm !py-3 !px-5 flex-shrink-0"
                  >
                    ← Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("confirm")}
                    className="btn-primary flex-1 !justify-center !py-3 !text-sm"
                  >
                    Confirmer mon vote →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 5: Confirm ───────────────────────────────────────── */}
          {(step === "confirm") && promo && promo !== "Other" && (
            <div className="glass rounded-2xl p-5 sm:p-6">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base mb-4">
                <StepBadge n={5} active={step === "confirm"} />
                Confirmer et soumettre
              </h3>

              {/* Summary */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl" style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#4890E8" }}>
                    Projets ({projectRanking.length}/{maxProjects})
                  </p>
                  {projectRanking.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {projectRanking.map((id, i) => {
                        const p = projets.find(x => x.id === id)!;
                        return (
                          <div key={id} className="flex items-center gap-2 text-sm">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                              style={{ background: `${p.categoryColor}30`, color: p.categoryColor }}>
                              {i + 1}
                            </span>
                            <span className="flex-1 font-semibold text-white text-xs truncate">{p.name}</span>
                            <span className="text-xs font-bold" style={{ color: "#4890E8" }}>{weights[i]}pts</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: "var(--muted)" }}>Aucun projet</p>
                  )}
                </div>

                <div className="p-4 rounded-xl" style={{ background: "rgba(42,191,196,0.08)", border: "1px solid rgba(42,191,196,0.2)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#2ABFC4" }}>
                    ONGs ({ongRanking.length}/3)
                  </p>
                  {ongRanking.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {ongRanking.map((id, i) => {
                        const o = ongs.find(x => x.id === id)!;
                        return (
                          <div key={id} className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                              style={{ background: `${o.color}30`, color: o.color }}>
                              {i + 1}
                            </span>
                            <span className="flex-1 font-semibold text-white text-xs truncate">{o.name}</span>
                            <span className="text-xs font-bold" style={{ color: "#2ABFC4" }}>{ONG_WEIGHTS[i]}pts</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: "var(--muted)" }}>Vote ONG non effectué</p>
                  )}
                </div>
              </div>

              {/* Voix count */}
              <div className="p-3 rounded-xl mb-5 flex items-center justify-between"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="text-xs" style={{ color: "var(--muted)" }}>Total voix projets</span>
                <span className="text-sm font-black text-white">
                  {totalVoix} / {maxVoix}
                </span>
              </div>

              {/* Error */}
              {submitError && (
                <div className="p-3 rounded-xl mb-4 text-sm"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                  ⚠ {submitError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("ong")}
                  disabled={submitting}
                  className="btn-ghost !text-sm !py-3 !px-5 flex-shrink-0"
                >
                  ← Modifier
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || projectRanking.length === 0}
                  className="btn-primary flex-1 !justify-center !py-4 !text-base"
                  style={{
                    opacity: (submitting || projectRanking.length === 0) ? 0.5 : 1,
                    cursor: (submitting || projectRanking.length === 0) ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi…
                    </>
                  ) : (
                    "✦ Valider mon vote définitivement"
                  )}
                </button>
              </div>

              <p className="text-center text-xs mt-3" style={{ color: "var(--muted)" }}>
                Vote sécurisé · Identité vérifiée via ViaRézo · 1 vote par compte · Irrévocable
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
