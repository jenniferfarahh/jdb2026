import { ongs } from "@/data/ong";

export default function ONGPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-purple-400 font-semibold uppercase tracking-widest text-sm mb-3">Partenaires</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            Les <span className="gradient-text">ONG</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            {ongs.length} organisations non-gouvernementales partenaires de la Journée des Bourses 2026.
            Leur mission : changer le monde, un projet à la fois.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-16">
          {[
            { value: ongs.length, label: "ONG partenaires", icon: "🤝" },
            { value: "30+", label: "Pays d'intervention", icon: "🌍" },
            { value: "1.5M+", label: "Bénéficiaires totaux", icon: "❤️" },
          ].map(({ value, label, icon }) => (
            <div key={label} className="glass p-5 text-center">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-2xl font-black text-purple-400">{value}</div>
              <p className="text-xs text-white/40 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ONG Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ongs.map((ong) => (
            <div key={ong.id} className="glass card-hover p-6 flex flex-col gap-5">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: `${ong.color}18`, border: `1px solid ${ong.color}30` }}
                >
                  {ong.logo}
                </div>
                <div>
                  <h3 className="font-black text-white text-xl">{ong.name}</h3>
                  <p className="text-sm font-medium" style={{ color: ong.color }}>{ong.tagline}</p>
                  <p className="text-xs text-white/30 mt-0.5">Fondée en {ong.fondee}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-white/55 text-sm leading-relaxed">{ong.description}</p>

              {/* Domaines */}
              <div className="flex flex-wrap gap-2">
                {ong.domaines.map((d) => (
                  <span
                    key={d}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: `${ong.color}15`,
                      color: ong.color,
                      border: `1px solid ${ong.color}30`,
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Bénéficiaires</p>
                  <p className="text-sm font-bold" style={{ color: ong.color }}>{ong.beneficiaires}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Zones d'action</p>
                  <p className="text-xs font-semibold text-white/60 leading-snug">
                    {ong.pays.slice(0, 3).join(", ")}{ong.pays.length > 3 ? ` +${ong.pays.length - 3}` : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center glass p-10 rounded-3xl">
          <p className="text-3xl mb-4">🌍</p>
          <h2 className="text-2xl font-black text-white mb-3">
            Soutenez leurs projets
          </h2>
          <p className="text-white/50 mb-6 max-w-lg mx-auto">
            Chaque vote compte. Votez pour les projets de ces ONG et aidez à redistribuer les 45 000 € de bourses.
          </p>
          <a href="/je-vote" className="btn-glow !inline-block">
            ✦ Voter maintenant
          </a>
        </div>
      </div>
    </div>
  );
}
