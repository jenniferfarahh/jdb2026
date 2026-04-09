export default function StatsBar() {
  const stats = [
    { value: "70+", label: "Projets en compétition", icon: "🚀", color: "#a855f7" },
    { value: "45k€", label: "À distribuer", icon: "💰", color: "#3b82f6" },
    { value: "15+", label: "ONG partenaires", icon: "🤝", color: "#06b6d4" },
    { value: "1 200+", label: "Votants attendus", icon: "🗳️", color: "#10b981" },
  ];

  return (
    <section className="py-16 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ value, label, icon, color }) => (
            <div
              key={label}
              className="glass card-hover p-6 text-center"
              style={{ "--accent": color } as React.CSSProperties}
            >
              <div className="text-3xl mb-2">{icon}</div>
              <div
                className="text-3xl font-black mb-1"
                style={{ color }}
              >
                {value}
              </div>
              <p className="text-sm text-white/50 leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
