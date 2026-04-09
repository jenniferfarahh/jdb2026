import Link from "next/link";
import { projets } from "@/data/projets";

export default function ProjectsPreview() {
  const preview = projets.slice(0, 6);

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-purple-400 font-semibold uppercase tracking-widest text-sm mb-3">Les projets</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Des initiatives à{" "}
            <span className="gradient-text">fort impact</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-lg leading-relaxed">
            De la tech solidaire à la santé mondiale, découvrez les projets en compétition pour la JDB 2026.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {preview.map((projet) => (
            <ProjectCard key={projet.id} projet={projet} />
          ))}
        </div>

        <div className="text-center">
          <Link href="/projets" className="btn-glow">
            Voir tous les projets →
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ProjectCard({ projet }: { projet: typeof projets[0] }) {
  return (
    <div className="glass card-hover p-6 flex flex-col gap-4">
      {/* Category + emoji */}
      <div className="flex items-start justify-between">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{
            background: `${projet.categoryColor}20`,
            color: projet.categoryColor,
            border: `1px solid ${projet.categoryColor}40`,
          }}
        >
          {projet.category}
        </span>
        <span className="text-2xl">{projet.emoji}</span>
      </div>

      {/* Name */}
      <div>
        <h3 className="font-bold text-white text-lg leading-snug mb-1">{projet.name}</h3>
        <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{projet.description}</p>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
            style={{ background: `${projet.categoryColor}25` }}
          >
            🏢
          </div>
          <span className="text-xs text-white/40">{projet.asso}</span>
        </div>
        <Link
          href={`/projets#${projet.id}`}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
        >
          Voir plus →
        </Link>
      </div>
    </div>
  );
}
