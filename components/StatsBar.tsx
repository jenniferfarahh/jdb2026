const stats = [
  { value: "70+",     label: "Projets en compétition", icon: "🚀", color: "#4890E8" },
  { value: "45 000€", label: "À redistribuer",          icon: "💰", color: "#2ABFC4" },
  { value: "12",      label: "ONG partenaires",          icon: "🤝", color: "#4890E8" },
  { value: "1 200+",  label: "Votants attendus",         icon: "🗳️", color: "#2ABFC4" },
];

export default function StatsBar() {
  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {stats.map(({ value, label, icon, color }) => (
            <div key={label}
              className="glass card-hover p-5 sm:p-6 flex flex-col items-center text-center gap-2 rounded-2xl">
              <span className="text-2xl sm:text-3xl">{icon}</span>
              <span className="text-2xl sm:text-3xl font-black" style={{ color }}>{value}</span>
              <span className="text-xs sm:text-sm text-muted leading-snug">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
