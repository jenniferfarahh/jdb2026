import Link from "next/link";
import { ongs } from "@/data/ong";

export const metadata = {
  title: "ONG Partenaires — JDB 2026",
  description: "Les 9 ONG partenaires de la Journée des Bourses 2026.",
};

export default function ONGPage() {
  return (
    <div style={{ minHeight: "100dvh", padding: "48px 20px 80px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{
            fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--teal)", marginBottom: 12,
          }}>
            Partenaires
          </p>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900,
            letterSpacing: "-0.02em", lineHeight: 1.1,
            color: "var(--text)", marginBottom: 14,
          }}>
            Les <span className="gradient-text">ONG</span>
          </h1>
          <p style={{
            fontSize: "clamp(0.9rem, 2vw, 1rem)", color: "var(--muted)",
            maxWidth: 480, margin: "0 auto", lineHeight: 1.65,
          }}>
            {ongs.length} organisations non-gouvernementales partenaires de la Journée des Bourses 2026.
          </p>
        </div>

        {/* ── Cards grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
          gap: 18,
        }}>
          {ongs.map((ong) => (
            <div
              key={ong.id}
              className="glass card-hover"
              style={{ borderRadius: 20, padding: "22px 22px 20px", display: "flex", flexDirection: "column", gap: 14 }}
            >
              {/* Top: icon + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24,
                  background: `${ong.color}18`,
                  border: `1px solid ${ong.color}35`,
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
                    fontSize: "0.78rem", fontWeight: 600, marginTop: 3,
                    color: ong.color,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {ong.tagline}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "var(--border)" }} />

              {/* Description */}
              <p style={{
                fontSize: "0.84rem", lineHeight: 1.7,
                color: "var(--muted)", margin: 0, flex: 1,
              }}>
                {ong.description}
              </p>

              {/* Domain badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                {ong.domaines.map((d) => (
                  <span key={d} style={{
                    fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.05em",
                    textTransform: "uppercase", padding: "3px 10px", borderRadius: 100,
                    background: `${ong.color}15`,
                    color: ong.color,
                    border: `1px solid ${ong.color}30`,
                  }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="glass" style={{
          marginTop: 64, borderRadius: 24, padding: "40px 32px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🌍</p>
          <h2 style={{
            fontSize: "clamp(1.3rem, 3vw, 1.8rem)", fontWeight: 900,
            color: "var(--text)", marginBottom: 10,
          }}>
            Soutenez leurs actions
          </h2>
          <p style={{
            color: "var(--muted)", marginBottom: 24, maxWidth: 420,
            margin: "0 auto 24px", lineHeight: 1.6, fontSize: "0.9rem",
          }}>
            Votez pour redistribuer les 5 000 € du pool ONG aux associations que vous soutenez.
          </p>
          <Link href="/je-vote" className="btn-primary" style={{ fontSize: "1rem" }}>
            ✦ Voter maintenant
          </Link>
        </div>

      </div>
    </div>
  );
}
