export const metadata = {
  title: "Contact — JDB 2026",
  description: "Contactez l'équipe Forum CentraleSupélec pour toute question sur la Journée des Bourses 2026.",
};

export default function ContactPage() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "48px 20px" }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>

        <div style={{ fontSize: 52, marginBottom: 20 }}>✉️</div>

        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 900,
          color: "var(--text)", marginBottom: 12, letterSpacing: "-0.02em" }}>
          Contact
        </h1>

        <p style={{ color: "var(--muted)", lineHeight: 1.65, marginBottom: 32,
          fontSize: "0.95rem" }}>
          Une question sur la Journée des Bourses 2026 ?<br />
          L&apos;équipe Forum CentraleSupélec est disponible par email.
        </p>

        <div className="glass" style={{ borderRadius: 20, padding: "28px 32px", marginBottom: 20 }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--teal)", marginBottom: 12 }}>
            Email
          </p>
          <a href="mailto:jdb@forum-cs.fr" style={{
            fontSize: "1.15rem", fontWeight: 800, color: "var(--blue-light)",
            textDecoration: "none", letterSpacing: "-0.01em",
          }}>
            jdb@forum-cs.fr
          </a>
        </div>

        <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
          Copiez l&apos;adresse ou cliquez pour ouvrir votre client email.
        </p>

      </div>
    </div>
  );
}
