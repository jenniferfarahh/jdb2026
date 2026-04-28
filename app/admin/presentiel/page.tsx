"use client";
import { useState, useRef } from "react";
import { projets } from "@/data/projets";
import { ongs } from "@/data/ong";

type Category = "ingenieur" | "bachelor";
type Step = "pin" | "student" | "projects" | "ong" | "confirm" | "success";

const PIN_KEY = "presentiel_pin";

const WEIGHTS_ING  = [5, 4, 3, 2, 1];
const WEIGHTS_BACH = [3, 2, 1];
const ONG_WEIGHTS  = [3, 2, 1];

function getWeights(cat: Category) { return cat === "bachelor" ? WEIGHTS_BACH : WEIGHTS_ING; }
function getMax(cat: Category)     { return cat === "bachelor" ? 3 : 5; }

// ── helpers ──────────────────────────────────────────────────────────────────
function pill(bg: string, text: string) {
  return (
    <span style={{ background: bg, color: "#fff", borderRadius: 100, padding: "2px 10px",
      fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {text}
    </span>
  );
}

export default function PresentielPage() {
  const [step, setStep]           = useState<Step>("pin");
  const [pin, setPin]             = useState("");
  const [pinError, setPinError]   = useState("");
  const [nom, setNom]             = useState("");
  const [prenom, setPrenom]       = useState("");
  const [category, setCategory]   = useState<Category>("ingenieur");
  const [projects, setProjects]   = useState<string[]>([]);
  const [ongRanking, setOng]      = useState<string[]>([]);
  const [search, setSearch]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const nomRef = useRef<HTMLInputElement>(null);

  const storedPin = typeof window !== "undefined"
    ? sessionStorage.getItem(PIN_KEY) ?? ""
    : "";

  const activePin = pin || storedPin;
  const max = getMax(category);
  const weights = getWeights(category);

  // ── PIN ───────────────────────────────────────────────────────────────────
  async function handlePin() {
    setPinError("");
    const res = await fetch("/api/vote/presentiel/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, nom: "TEST", prenom: "TEST" }),
    });
    if (res.status === 401) { setPinError("PIN incorrect."); return; }
    sessionStorage.setItem(PIN_KEY, pin);
    setStep("student");
    setTimeout(() => nomRef.current?.focus(), 100);
  }

  // ── Check duplicate ───────────────────────────────────────────────────────
  async function handleStudentNext() {
    setError("");
    setAlreadyVoted(false);
    if (!nom.trim() || !prenom.trim()) { setError("Entrez le nom et le prénom."); return; }
    const res = await fetch("/api/vote/presentiel/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: activePin, nom: nom.trim(), prenom: prenom.trim() }),
    });
    const data = await res.json();
    if (data.alreadyVoted) { setAlreadyVoted(true); return; }
    setProjects([]);
    setOng([]);
    setSearch("");
    setStep("projects");
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/vote/presentiel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pin: activePin,
        nom: nom.trim(),
        prenom: prenom.trim(),
        category,
        projectRanking: projects,
        ongRanking,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error ?? "Erreur serveur."); return; }
    setStep("success");
  }

  // ── Reset for next student ────────────────────────────────────────────────
  function reset() {
    setNom(""); setPrenom(""); setCategory("ingenieur");
    setProjects([]); setOng([]); setSearch(""); setError("");
    setAlreadyVoted(false);
    setStep("student");
    setTimeout(() => nomRef.current?.focus(), 100);
  }

  // ── Filtered projects ─────────────────────────────────────────────────────
  const filtered = projets.filter(p =>
    search === "" ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.asso.toLowerCase().includes(search.toLowerCase())
  );

  function toggleProject(id: string) {
    setProjects(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= max) return prev;
      return [...prev, id];
    });
  }

  function toggleOng(id: string) {
    setOng(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // ── PIN ───────────────────────────────────────────────────────────────────
  if (step === "pin") return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24 }}>
      <div className="glass" style={{ borderRadius: 28, padding: "48px 40px",
        maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🏛️</div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>
          Vote présentiel
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: 28, fontSize: "0.9rem" }}>
          Entrez le code opérateur pour commencer
        </p>
        <input
          type="password"
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handlePin()}
          placeholder="Code PIN"
          className="input-field"
          style={{ textAlign: "center", fontSize: "1.4rem", letterSpacing: "0.3em",
            marginBottom: 12, padding: "14px" }}
        />
        {pinError && <p style={{ color: "#f87171", marginBottom: 12, fontSize: "0.85rem" }}>{pinError}</p>}
        <button onClick={handlePin} className="btn-primary" style={{ width: "100%" }}>
          Accéder au stand →
        </button>
      </div>
    </div>
  );

  // ── STUDENT ───────────────────────────────────────────────────────────────
  if (step === "student") return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24 }}>
      <div className="glass" style={{ borderRadius: 28, padding: "40px 36px",
        maxWidth: 480, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <span style={{ fontSize: 28 }}>🎓</span>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text)", margin: 0 }}>
            Nouvel étudiant
          </h2>
        </div>

        {/* Instructions */}
        <div style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)",
          borderRadius: 14, padding: "12px 16px", marginBottom: 20 }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--blue-light)",
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            ⚠️ Instructions saisie
          </p>
          {["Écrire en MAJUSCULES (ex: MARIE, DUPONT)",
            "Pas de tirets — écrire JEAN MARIE et non JEAN-MARIE",
            "Pas d'accents — écrire ELEONORE et non ÉLÉONORE",
            "Vérifier la carte étudiante avant de valider"].map(txt => (
            <p key={txt} style={{ fontSize: "0.82rem", color: "var(--muted)", margin: "3px 0" }}>• {txt}</p>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--teal)",
              textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              Prénom
            </label>
            <input ref={nomRef} className="input-field" value={prenom}
              onChange={e => { setPrenom(e.target.value.toUpperCase()); setAlreadyVoted(false); }}
              placeholder="ex: MARIE" style={{ fontSize: "1rem", padding: "12px 14px", textTransform: "uppercase" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--teal)",
              textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              Nom
            </label>
            <input className="input-field" value={nom}
              onChange={e => { setNom(e.target.value.toUpperCase()); setAlreadyVoted(false); }}
              onKeyDown={e => e.key === "Enter" && handleStudentNext()}
              placeholder="ex: DUPONT" style={{ fontSize: "1rem", padding: "12px 14px", textTransform: "uppercase" }} />
          </div>

          {/* Category toggle */}
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--teal)",
              textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
              Cursus (visible sur la carte)
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {(["ingenieur", "bachelor"] as Category[]).map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  padding: "14px 10px", borderRadius: 14, border: "2px solid",
                  borderColor: category === cat ? "var(--blue)" : "var(--border)",
                  background: category === cat ? "rgba(37,99,235,0.15)" : "transparent",
                  color: category === cat ? "var(--blue-light)" : "var(--muted)",
                  cursor: "pointer", fontWeight: 700, fontSize: "0.9rem",
                  transition: "all 0.15s",
                }}>
                  {cat === "ingenieur"
                    ? <>🎓 Ingénieur / Autre<br /><span style={{ fontSize: "0.75rem", opacity: 0.7 }}>5 projets</span></>
                    : <>🎓 Bachelor<br /><span style={{ fontSize: "0.75rem", opacity: 0.7 }}>3 projets</span></>
                  }
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Already voted warning */}
        {alreadyVoted && (
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 14,
            background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.4)" }}>
            <p style={{ color: "#f87171", fontWeight: 700, margin: 0, fontSize: "0.95rem" }}>
              ⚠️ {prenom} {nom} a déjà voté !
            </p>
            <p style={{ color: "rgba(248,113,113,0.7)", margin: "4px 0 0", fontSize: "0.8rem" }}>
              Vérifiez l&apos;identité — un seul vote par personne.
            </p>
          </div>
        )}

        {error && <p style={{ color: "#f87171", marginTop: 12, fontSize: "0.85rem" }}>{error}</p>}

        <button onClick={handleStudentNext} className="btn-primary"
          style={{ width: "100%", marginTop: 20 }}>
          Suivant — Choisir les projets →
        </button>
      </div>
    </div>
  );

  // ── PROJECTS ──────────────────────────────────────────────────────────────
  if (step === "projects") return (
    <div style={{ minHeight: "100dvh", padding: "24px 20px 40px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>📋</span>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--text)", margin: 0 }}>
                {prenom} {nom}
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "0.8rem", margin: 0 }}>
                {category === "bachelor" ? "Bachelor — 3 projets" : "Ingénieur — 5 projets"}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ padding: "8px 16px", borderRadius: 100,
              background: projects.length >= max ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.06)",
              color: projects.length >= max ? "var(--blue-light)" : "var(--muted)",
              fontWeight: 700, fontSize: "0.85rem" }}>
              {projects.length}/{max} projets
            </div>
            <button onClick={() => setStep("student")} className="btn-ghost"
              style={{ fontSize: "0.8rem", padding: "8px 16px" }}>← Retour</button>
          </div>
        </div>

        {/* Ranking bar */}
        {projects.length > 0 && (
          <div className="glass" style={{ borderRadius: 18, padding: "14px 18px", marginBottom: 16 }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--teal)",
              textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
              Classement actuel
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {projects.map((id, i) => {
                const p = projets.find(x => x.id === id);
                return (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 100, background: "rgba(37,99,235,0.15)",
                    border: "1px solid rgba(37,99,235,0.3)" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 900,
                      color: "var(--blue-light)" }}>#{i + 1}</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text)", fontWeight: 600 }}>
                      {p?.name ?? id}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                      {weights[i]}pts
                    </span>
                    <button onClick={() => toggleProject(id)} style={{
                      background: "none", border: "none", color: "#f87171",
                      cursor: "pointer", fontSize: "0.8rem", padding: "0 2px" }}>✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search */}
        <input className="input-field" value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Rechercher un projet ou une association..."
          style={{ marginBottom: 16, padding: "12px 16px", fontSize: "0.95rem" }} />

        {/* Projects grid */}
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
          {filtered.map(p => {
            const rank = projects.indexOf(p.id);
            const selected = rank !== -1;
            const full = !selected && projects.length >= max;
            return (
              <button key={p.id} onClick={() => !full && toggleProject(p.id)} style={{
                padding: "14px 16px", borderRadius: 16, border: "2px solid",
                borderColor: selected ? p.color : full ? "var(--border)" : "var(--border)",
                background: selected ? `${p.color}18` : "var(--bg-card)",
                cursor: full ? "not-allowed" : "pointer",
                opacity: full ? 0.4 : 1,
                textAlign: "left", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: selected ? p.color : `${p.color}22`, fontWeight: 900,
                  fontSize: "0.85rem", color: selected ? "#fff" : p.color }}>
                  {selected ? `#${rank + 1}` : "•"}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: "var(--text)", margin: 0,
                    fontSize: "0.9rem", lineHeight: 1.3 }}>{p.name}</p>
                  <p style={{ color: "var(--muted)", margin: "2px 0 0",
                    fontSize: "0.75rem" }}>{p.asso}</p>
                </div>
                {selected && (
                  <span style={{ marginLeft: "auto", fontSize: "0.72rem", fontWeight: 700,
                    color: p.color, flexShrink: 0 }}>{weights[rank]}pts</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Continue */}
        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => setStep("ong")} className="btn-primary"
            disabled={projects.length < max}
            style={{ opacity: projects.length < max ? 0.45 : 1,
              cursor: projects.length < max ? "not-allowed" : "pointer" }}>
            {projects.length < max
              ? `Sélectionnez ${max - projects.length} projet${max - projects.length > 1 ? "s" : ""} de plus`
              : "Continuer → OBNLs"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── ONG ───────────────────────────────────────────────────────────────────
  if (step === "ong") return (
    <div style={{ minHeight: "100dvh", padding: "24px 20px 40px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>🌍</span>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--text)", margin: 0 }}>
                OBNLs — {prenom} {nom}
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "0.8rem", margin: 0 }}>
                Classez jusqu&apos;à 3 OBNLs (3, 2, 1 pts)
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ padding: "8px 16px", borderRadius: 100,
              background: ongRanking.length >= 3 ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.06)",
              color: ongRanking.length >= 3 ? "var(--blue-light)" : "var(--muted)",
              fontWeight: 700, fontSize: "0.85rem" }}>
              {ongRanking.length}/3 OBNLs
            </div>
            <button onClick={() => setStep("projects")} className="btn-ghost"
              style={{ fontSize: "0.8rem", padding: "8px 16px" }}>← Projets</button>
          </div>
        </div>

        {/* ONG ranking bar */}
        {ongRanking.length > 0 && (
          <div className="glass" style={{ borderRadius: 18, padding: "14px 18px", marginBottom: 16 }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--teal)",
              textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
              Classement OBNLs
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ongRanking.map((id, i) => {
                const o = ongs.find(x => x.id === id);
                return (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 100, background: `${o?.color ?? "#2ABFC4"}20`,
                    border: `1px solid ${o?.color ?? "#2ABFC4"}40` }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 900,
                      color: o?.color ?? "var(--teal)" }}>#{i + 1}</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text)", fontWeight: 600 }}>
                      {o?.name ?? id}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                      {ONG_WEIGHTS[i]}pts
                    </span>
                    <button onClick={() => toggleOng(id)} style={{
                      background: "none", border: "none", color: "#f87171",
                      cursor: "pointer", fontSize: "0.8rem", padding: "0 2px" }}>✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ongs.map(o => {
            const rank = ongRanking.indexOf(o.id);
            const selected = rank !== -1;
            const full = !selected && ongRanking.length >= 3;
            return (
              <button key={o.id} onClick={() => !full && toggleOng(o.id)} style={{
                padding: "16px 20px", borderRadius: 16, border: "2px solid",
                borderColor: selected ? o.color : "var(--border)",
                background: selected ? `${o.color}18` : "var(--bg-card)",
                cursor: full ? "not-allowed" : "pointer",
                opacity: full ? 0.4 : 1,
                textAlign: "left", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: selected ? o.color : `${o.color}22`, fontSize: "1.2rem" }}>
                  {o.logo}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: "var(--text)", margin: 0,
                    fontSize: "0.95rem" }}>{o.name}</p>
                  <p style={{ color: "var(--muted)", margin: "2px 0 0",
                    fontSize: "0.78rem" }}>{o.tagline}</p>
                </div>
                {selected && (
                  <span style={{ fontSize: "0.8rem", fontWeight: 700,
                    color: o.color, flexShrink: 0 }}>#{rank + 1} — {ONG_WEIGHTS[rank]}pts</span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => setStep("confirm")} className="btn-primary"
            disabled={ongRanking.length < 3}
            style={{ opacity: ongRanking.length < 3 ? 0.45 : 1,
              cursor: ongRanking.length < 3 ? "not-allowed" : "pointer" }}>
            {ongRanking.length < 3
              ? `Sélectionnez ${3 - ongRanking.length} OBNL${3 - ongRanking.length > 1 ? "s" : ""} de plus`
              : "Confirmer le vote →"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── CONFIRM ───────────────────────────────────────────────────────────────
  if (step === "confirm") return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24 }}>
      <div className="glass" style={{ borderRadius: 28, padding: "36px 32px",
        maxWidth: 520, width: "100%" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text)",
          marginBottom: 4, textAlign: "center" }}>
          Confirmer le vote
        </h2>
        <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: 24,
          fontSize: "0.88rem" }}>
          {prenom} {nom} — {category === "bachelor" ? "Bachelor" : "Ingénieur / Autre"}
        </p>

        {/* Projects summary */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--teal)",
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Projets ({projects.length}/{max})
          </p>
          {projects.map((id, i) => {
            const p = projets.find(x => x.id === id);
            return (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px", borderRadius: 10,
                background: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "transparent",
                marginBottom: 2 }}>
                <span style={{ fontWeight: 900, color: "var(--blue-light)",
                  fontSize: "0.85rem", width: 24 }}>#{i + 1}</span>
                <span style={{ flex: 1, color: "var(--text)", fontSize: "0.88rem",
                  fontWeight: 600 }}>{p?.name ?? id}</span>
                <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                  {weights[i]} pts
                </span>
              </div>
            );
          })}
        </div>

        {/* OBNLs summary */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--teal)",
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            OBNLs ({ongRanking.length}/3)
          </p>
          {ongRanking.map((id, i) => {
            const o = ongs.find(x => x.id === id);
            return (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px", borderRadius: 10,
                background: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "transparent",
                marginBottom: 2 }}>
                <span style={{ fontSize: "0.9rem" }}>{o?.logo}</span>
                <span style={{ flex: 1, color: "var(--text)", fontSize: "0.88rem",
                  fontWeight: 600 }}>{o?.name ?? id}</span>
                <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                  {ONG_WEIGHTS[i]} pts
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 16,
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <p style={{ color: "#f87171", margin: 0, fontSize: "0.88rem" }}>⚠️ {error}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setStep("projects"); setError(""); }}
            className="btn-ghost" style={{ flex: 1 }} disabled={submitting}>
            ← Modifier
          </button>
          <button onClick={handleSubmit} className="btn-primary"
            style={{ flex: 2 }} disabled={submitting}>
            {submitting ? "Enregistrement..." : "✓ Valider le vote"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── SUCCESS ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24 }}>
      <div className="glass" style={{ borderRadius: 28, padding: "48px 40px",
        maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>
          Vote enregistré !
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: 6, fontSize: "0.95rem" }}>
          <strong style={{ color: "var(--text)" }}>{prenom} {nom}</strong>
        </p>
        <p style={{ color: "var(--muted)", marginBottom: 28, fontSize: "0.85rem" }}>
          {projects.length} projet{projects.length > 1 ? "s" : ""} classés
          · {ongRanking.length} OBNL{ongRanking.length > 1 ? "s" : ""} soutenu{ongRanking.length > 1 ? "s" : ""}
        </p>
        <button onClick={reset} className="btn-primary" style={{ width: "100%", fontSize: "1rem" }}>
          Étudiant suivant →
        </button>
      </div>
    </div>
  );
}
