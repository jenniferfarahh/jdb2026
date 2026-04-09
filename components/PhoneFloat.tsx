"use client";

export default function PhoneFloat() {
  return (
    <div className="relative flex flex-col items-center">
      {/* Floating phone */}
      <div className="phone-float relative">
        {/* Phone body */}
        <div
          className="relative w-64 rounded-[2.8rem] overflow-hidden"
          style={{
            height: "520px",
            background: "linear-gradient(145deg, #1a1a3e, #0d0d2b)",
            border: "2px solid rgba(255,255,255,0.12)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 6px rgba(255,255,255,0.04)",
          }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-10 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-700" />
            <div className="w-3 h-3 rounded-full bg-gray-800" />
          </div>

          {/* Screen content */}
          <div
            className="absolute inset-0 overflow-y-auto"
            style={{ paddingTop: "36px", scrollbarWidth: "none" }}
          >
            {/* App header */}
            <div
              className="sticky top-0 z-10 px-4 pt-3 pb-3"
              style={{ background: "linear-gradient(180deg, #0d0d2b 70%, transparent)" }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                  >
                    J
                  </div>
                  <span className="text-white text-xs font-bold">JDB 2026</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-green-400 font-semibold">LIVE</span>
                </div>
              </div>
              <h3 className="text-white font-black text-sm">Votez pour un projet</h3>
              <p className="text-white/40 text-[10px]">Choisissez jusqu&apos;à 3 projets</p>
            </div>

            <div className="px-4 pb-6 flex flex-col gap-3">
              {/* Search bar */}
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span className="text-white/30 text-sm">🔍</span>
                <span className="text-white/30 text-xs">Rechercher un projet...</span>
              </div>

              {/* Category chips */}
              <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {["Tous", "Tech", "Social", "Santé", "Éducation"].map((cat, i) => (
                  <span
                    key={cat}
                    className="flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-semibold"
                    style={
                      i === 0
                        ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "white" }
                        : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }
                    }
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* Project vote cards */}
              {[
                { name: "Solidarité Sahel", org: "Humanitaire", emoji: "🌍", votes: 342, selected: true, color: "#7c3aed" },
                { name: "Code pour Tous", org: "Tech & Éducation", emoji: "💻", votes: 289, selected: false, color: "#3b82f6" },
                { name: "EcoInnov", org: "Environnement", emoji: "🌱", votes: 211, selected: true, color: "#10b981" },
                { name: "MédiSol", org: "Santé", emoji: "🏥", votes: 178, selected: false, color: "#f59e0b" },
                { name: "ArtSocial", org: "Culture", emoji: "🎨", votes: 155, selected: false, color: "#ec4899" },
              ].map(({ name, org, emoji, votes, selected, color }) => (
                <div
                  key={name}
                  className="rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-all"
                  style={{
                    background: selected ? `${color}18` : "rgba(255,255,255,0.04)",
                    border: selected ? `1px solid ${color}50` : "1px solid rgba(255,255,255,0.07)",
                    transform: selected ? "scale(1.01)" : "scale(1)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: `${color}25` }}
                  >
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate">{name}</p>
                    <p className="text-white/40 text-[10px]">{org}</p>
                    <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(votes / 342) * 100}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}99)`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px]"
                      style={
                        selected
                          ? { background: color, borderColor: color, color: "white" }
                          : { borderColor: "rgba(255,255,255,0.2)" }
                      }
                    >
                      {selected ? "✓" : ""}
                    </div>
                    <span className="text-[9px] text-white/30">{votes}</span>
                  </div>
                </div>
              ))}

              {/* Submit button */}
              <button
                className="w-full py-3 rounded-2xl font-bold text-sm text-white mt-2"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
              >
                ✦ Confirmer mon vote
              </button>

              <p className="text-center text-[10px] text-white/20">
                Vote anonyme · 1 vote par personne
              </p>
            </div>
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Shadow under phone */}
      <div
        className="phone-shadow mt-4 w-48 h-4 rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.5) 0%, transparent 70%)" }}
      />

      {/* Labels */}
      <div className="mt-6 text-center">
        <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-1">Interface de vote</p>
        <p className="text-[11px] text-white/30">Accessible via QR Code sur place</p>
      </div>
    </div>
  );
}
