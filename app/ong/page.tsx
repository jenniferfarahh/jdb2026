import Link from "next/link";
import { ongs } from "@/data/ong";

export default function ONGPage() {
  return (
    <div className="min-h-screen py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="section-label mb-3">Partenaires</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            Les <span className="gradient-text">ONG</span>
          </h1>
          <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {ongs.length} organisations non-gouvernementales partenaires de la Journée des Bourses 2026.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xl mx-auto mb-12 sm:mb-16">
          {[
            { v: ongs.length, l: "ONG partenaires", i: "🤝" },
            { v: "30+",       l: "Pays d'action",   i: "🌍" },
            { v: "1.5M+",     l: "Bénéficiaires",   i: "❤️" },
          ].map(({ v, l, i }) => (
            <div key={l} className="glass p-4 sm:p-5 text-center">
              <p className="text-xl sm:text-2xl mb-1">{i}</p>
              <p className="text-lg sm:text-2xl font-black text-purple-400">{v}</p>
              <p className="text-[11px] sm:text-xs text-muted mt-1 leading-snug">{l}</p>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {ongs.map((ong) => (
            <article key={ong.id} className="glass card-hover p-5 sm:p-6 flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"
                  style={{ background: `${ong.color}18`, border: `1px solid ${ong.color}30` }}>
                  {ong.logo}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-white text-lg sm:text-xl leading-snug">{ong.name}</h3>
                  <p className="text-sm font-medium" style={{ color: ong.color }}>{ong.tagline}</p>
                  <p className="text-xs text-muted mt-0.5">Fondée en {ong.fondee}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed" style={{ color: "rgba(232,232,255,0.5)" }}>{ong.description}</p>

              {/* Domaines */}
              <div className="flex flex-wrap gap-1.5">
                {ong.domaines.map(d => (
                  <span key={d} className="badge"
                    style={{ background: `${ong.color}15`, color: ong.color, border: `1px solid ${ong.color}30` }}>
                    {d}
                  </span>
                ))}
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Bénéficiaires</p>
                  <p className="text-sm font-black" style={{ color: ong.color }}>{ong.beneficiaires}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Zones</p>
                  <p className="text-xs font-semibold text-white/65 leading-snug">
                    {ong.pays.slice(0, 3).join(", ")}{ong.pays.length > 3 ? ` +${ong.pays.length - 3}` : ""}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 sm:mt-20 glass rounded-3xl p-8 sm:p-12 text-center">
          <p className="text-3xl sm:text-4xl mb-4">🌍</p>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Soutenez leurs projets</h2>
          <p className="text-muted mb-7 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Chaque vote compte. Aidez à redistribuer les 45 000 € aux associations gagnantes.
          </p>
          <Link href="/je-vote" className="btn-primary !py-3.5 !px-8 !text-base">
            ✦ Voter maintenant
          </Link>
        </div>

      </div>
    </div>
  );
}
