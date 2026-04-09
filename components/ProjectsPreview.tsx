import Link from "next/link";
import { projets } from "@/data/projets";

export default function ProjectsPreview() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="section-label mb-3">Les projets</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Des initiatives à <span className="gradient-text">fort impact</span>
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            De la tech solidaire à la santé mondiale — découvrez les projets en lice.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-10">
          {projets.slice(0, 6).map((p) => (
            <div key={p.id} className="glass card-hover p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="badge"
                  style={{
                    background: `${p.categoryColor}18`,
                    color: p.categoryColor,
                    border: `1px solid ${p.categoryColor}35`,
                  }}>
                  {p.category}
                </span>
                <span className="text-xl">{p.emoji}</span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base sm:text-lg leading-snug mb-1">{p.name}</h3>
                <p className="text-muted text-sm leading-relaxed line-clamp-2">{p.description}</p>
              </div>

              <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-muted">{p.asso}</span>
                <Link href={`/projets#${p.id}`}
                  className="text-xs font-semibold transition-colors"
                  style={{ color: p.categoryColor }}>
                  Voir plus →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/projets" className="btn-primary">
            Voir tous les projets →
          </Link>
        </div>
      </div>
    </section>
  );
}
