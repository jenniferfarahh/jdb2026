"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/projets", label: "Projets" },
  { href: "/ong", label: "ONG" },
  { href: "/je-vote", label: "Je Vote" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav-blur fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-black text-sm text-white">
              JDB
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-white text-sm tracking-wide">Journée des Bourses</span>
            <span className="text-white/40 text-xs font-medium">Forum CentraleSupélec · 2026</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/je-vote"
            className="ml-3 btn-glow !py-2 !px-5 !text-sm"
          >
            ✦ Voter maintenant
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span className={`w-6 h-0.5 bg-white transition-all ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-6 h-0.5 bg-white transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`w-6 h-0.5 bg-white transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-2 border-t border-white/5 mt-2 pt-4">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white py-2 text-sm font-medium"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/je-vote"
            onClick={() => setOpen(false)}
            className="btn-glow !py-3 !text-sm text-center mt-2"
          >
            ✦ Voter maintenant
          </Link>
        </div>
      )}
    </nav>
  );
}
