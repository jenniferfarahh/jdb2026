import Link from "next/link";
import PhoneFloat from "@/components/PhoneFloat";
import LogoJDB from "@/components/LogoJDB";

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 15.5"/>
    </svg>
  );
}
function IconPin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
    </svg>
  );
}

const infoCards = [
  {
    icon: <IconCalendar />,
    label: "Date",
    value: <>Mardi<br/>28 Avril</>,
    bg: "rgba(37,99,235,0.15)",
    color: "var(--blue-light)",
    border: "rgba(37,99,235,0.28)",
  },
  {
    icon: <IconClock />,
    label: "Horaires",
    value: <>17h00<br/>→ 20h45</>,
    bg: "rgba(42,191,196,0.12)",
    color: "var(--teal)",
    border: "rgba(42,191,196,0.28)",
  },
  {
    icon: <IconPin />,
    label: "Lieu",
    value: <>Diagonale<br/>Eiffel</>,
    bg: "rgba(37,99,235,0.12)",
    color: "var(--blue-light)",
    border: "rgba(37,99,235,0.22)",
  },
];

export default function Home() {
  return (
    <div className="hero-bg" style={{ minHeight: "100dvh", marginTop: "-64px", display: "flex", flexDirection: "column" }}>
      {/* Orbs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div className="orb-1" style={{ position: "absolute", top: "-160px", left: "15%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 65%)" }}/>
        <div className="orb-2" style={{ position: "absolute", bottom: "-100px", right: "15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(42,191,196,0.11) 0%, transparent 65%)" }}/>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, padding: "96px 24px 32px" }}>
        <div className="fade-up" style={{ width: "100%", maxWidth: 1100 }}>
          <div className="flex flex-col items-center text-center gap-8 lg:flex-row lg:items-center lg:gap-20 lg:justify-between">

            {/* ══ LEFT ══ */}
            <div className="flex flex-col items-center gap-7 w-full lg:flex-1">
              <div className="logo-glow w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[400px]">
                <LogoJDB width={680} height={340} />
              </div>

              <h1
                className="w-full"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.5rem)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                <span className="gradient-text">Journée des Bourses</span>{" "}
                <span style={{ color: "var(--text)" }}>2026</span>
              </h1>

              {/* 3 cards */}
              <div className="w-full" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {infoCards.map(({ icon, label, value, bg, color, border }) => (
                  <div key={label} className="glass" style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    textAlign: "center", padding: "14px 8px", borderRadius: 16, gap: 8,
                    borderColor: border,
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: bg, color, border: `1px solid ${border}` }}>
                      {icon}
                    </div>
                    <div>
                      <p style={{ fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--teal)", marginBottom: 3 }}>{label}</p>
                      <p style={{ fontWeight: 900, fontSize: "clamp(0.72rem, 1.8vw, 0.88rem)", lineHeight: 1.3, color: "var(--text)" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/projets" className="btn-primary">Voir les projets →</Link>
                <Link href="/je-vote" className="btn-ghost">✦ Je Vote</Link>
              </div>
            </div>

            {/* ══ RIGHT — Phone ══ */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <PhoneFloat />
            </div>

          </div>
        </div>
      </div>

      {/* Copyright — inline at the bottom */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "16px 24px" }}>
        <p style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
          © 2026 Forum CentraleSupélec — Journée des Bourses
        </p>
      </div>
    </div>
  );
}
