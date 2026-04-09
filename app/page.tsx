import Link from "next/link";
import PhoneFloat from "@/components/PhoneFloat";
import StatsBar from "@/components/StatsBar";
import ProjectsPreview from "@/components/ProjectsPreview";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* ---- HERO ---- */}
      <section className="relative min-h-screen grid-bg flex items-center pt-20">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="orb1 absolute top-20 left-1/4 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)" }} />
          <div className="orb2 absolute bottom-20 right-1/4 w-80 h-80 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)" }} />
          <div className="orb3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)" }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* LEFT: Text */}
            <div className="flex-1 text-center lg:text-left fade-in-up">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 glass live-badge">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold text-green-400 uppercase tracking-widest">JDB 2026 · Votes ouverts</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 text-white">
                Journée<br />
                <span className="gradient-text">des Bourses</span><br />
                <span className="text-white/90">2026</span>
              </h1>

              <p className="text-lg text-white/60 max-w-lg mb-8 leading-relaxed">
                Le rendez-vous incontournable du Forum CentraleSupélec. Découvrez{" "}
                <span className="text-purple-400 font-semibold">70+ projets associatifs</span>, rencontrez les ONG partenaires et
                votez pour soutenir vos initiatives préférées.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-10">
                <Link href="/projets" className="btn-glow">
                  Découvrir les projets →
                </Link>
                <Link href="/je-vote" className="btn-outline">
                  ✦ Je Vote
                </Link>
              </div>

              {/* Event info */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                {[
                  { icon: "📅", label: "Date", value: "Avril 2026" },
                  { icon: "⏰", label: "Horaires", value: "17h – 20h30" },
                  { icon: "📍", label: "Lieu", value: "Diagonale Eiffel" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="glass px-4 py-3 flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className="text-xs text-white/40 font-medium uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-bold text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Floating Phone */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <PhoneFloat />
            </div>
          </div>
        </div>
      </section>

      {/* ---- TICKER ---- */}
      <div className="overflow-hidden py-4 border-y border-purple-500/20 bg-purple-900/10">
        <div className="ticker-track flex gap-12 whitespace-nowrap w-max">
          {Array(2).fill([
            "🏆 70+ Projets en compétition",
            "💰 45 000 € à distribuer",
            "🌍 Projets à impact mondial",
            "🤝 ONG partenaires de renom",
            "📱 Votez via QR Code",
            "🎯 Forum CentraleSupélec 2026",
            "✨ Soutenez vos projets favoris",
          ]).flat().map((item, i) => (
            <span key={i} className="text-sm font-medium text-purple-300/70 flex-shrink-0">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ---- STATS ---- */}
      <StatsBar />

      {/* ---- PROJECTS PREVIEW ---- */}
      <ProjectsPreview />

      {/* ---- CTA SECTION ---- */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <p className="text-purple-400 font-semibold uppercase tracking-widest text-sm mb-4">Participez</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Votre vote compte.<br />
            <span className="gradient-text">Chaque euro aussi.</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 leading-relaxed">
            Scannez le QR code sur place ou utilisez ce lien pour voter pour les projets qui vous inspirent.
            45 000 € seront redistribués aux associations gagnantes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/je-vote" className="btn-glow !py-4 !px-10 !text-lg">
              ✦ Voter maintenant
            </Link>
            <Link href="/ong" className="btn-outline !py-4 !px-8 !text-base">
              Voir les ONG partenaires
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
