import Link from "next/link";
import { ongs } from "@/data/ong";

export const metadata = {
  title: "OBNL — JDB 2026",
  description: "Les 9 organisations non-gouvernementales partenaires de la Journée des Bourses 2026.",
};

export default function ONGPage() {
  return (
    <div style={{ minHeight: "100dvh", padding: "48px 20px 80px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h1 style={{
            fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900,
            letterSpacing: "-0.02em", lineHeight: 1.1,
            color: "var(--text)", marginBottom: 14,
          }}>
            Les <span className="gradient-text">OBNL</span>
          </h1>
          <p style={{
            fontSize: "clamp(0.9rem,2vw,1rem)", color: "var(--muted)",
            maxWidth: 500, margin: "0 auto", lineHeight: 1.65,
          }}>
            {ongs.length} organisations à but non lucratif qui participent à la Journée des Bourses 2026.
            Votez pour <strong style={{ color: "var(--text)" }}>3 OBNLs</strong> et redistribuer <strong style={{ color: "var(--text)" }}>5 000 €</strong>.
          </p>
        </div>

        {/* ── Cards grid ─────────────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
        }}>
          {ongs.map((ong) => (
            <div
              key={ong.id}
              className="glass card-hover"
              style={{
                borderRadius: 22,
                padding: "22px 22px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* ── Top: icon + name + tagline ── */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 15, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26,
                  background: `${ong.color}18`,
                  border: `1.5px solid ${ong.color}35`,
                }}>
                  {ong.logo}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{
                    fontSize: "0.98rem", fontWeight: 800,
                    color: "var(--text)", lineHeight: 1.25, margin: 0,
                  }}>
                    {ong.name}
                  </h2>
                  <p style={{
                    fontSize: "0.76rem", fontWeight: 600, margin: "3px 0 0",
                    color: ong.color,
                    lineHeight: 1.35,
                  }}>
                    {ong.tagline}
                  </p>
                </div>
              </div>

              {/* ── Divider ── */}
              <div style={{ height: 1, background: "var(--border)" }} />

              {/* ── Description (full text, title attr for tooltip safety) ── */}
              <p
                title={ong.description}
                style={{
                  fontSize: "0.84rem", lineHeight: 1.72,
                  color: "var(--muted)", margin: 0, flex: 1,
                }}
              >
                {ong.description}
              </p>

              {/* ── Website link ── */}
              <a
                href={ong.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ong-site-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "10px 0",
                  borderRadius: 13,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  color: ong.color,
                  background: `${ong.color}12`,
                  border: `1.5px solid ${ong.color}35`,
                  transition: "opacity 0.15s",
                }}
              >
                🔗 En savoir plus
                <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>↗</span>
              </a>
            </div>
          ))}
        </div>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <div className="glass" style={{
          marginTop: 64, borderRadius: 24, padding: "40px 32px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🌍</p>
          <h2 style={{
            fontSize: "clamp(1.3rem,3vw,1.8rem)", fontWeight: 900,
            color: "var(--text)", marginBottom: 10,
          }}>
            Soutenez leurs actions
          </h2>
          <p style={{
            color: "var(--muted)", maxWidth: 420,
            margin: "0 auto 24px", lineHeight: 1.6, fontSize: "0.9rem",
          }}>
            Votez pour redistribuer les 5 000 € du pool OBNL aux organisations que vous soutenez.
          </p>
          <Link href="/je-vote" className="btn-primary" style={{ fontSize: "1rem" }}>
            ✦ Voter maintenant
          </Link>
        </div>

      </div>
    </div>
  );
}
