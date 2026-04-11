
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import LogoForum from "@/components/LogoForum";
import { useTheme } from "@/components/ThemeProvider";

const links = [
  { href: "/projets", label: "Projets" },
  { href: "/ong", label: "ONG" },
  { href: "/contact", label: "Contact" },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Changer le thème"
      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 flex-shrink-0"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      {theme === "dark" ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#F6C73B" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.5" />
          <line x1="12" y1="2" x2="12" y2="4.5" /><line x1="12" y1="19.5" x2="12" y2="22" />
          <line x1="4.22" y1="4.22" x2="5.95" y2="5.95" /><line x1="18.05" y1="18.05" x2="19.78" y2="19.78" />
          <line x1="2" y1="12" x2="4.5" y2="12" /><line x1="19.5" y1="12" x2="22" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.95" y2="18.05" /><line x1="18.05" y1="5.95" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.2" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", background: "var(--nav-bg)" }}>
        {/* Use 3 equal columns: left=1fr, center=auto, right=1fr — guarantees true centering */}
        <div
          className="h-16 max-w-7xl mx-auto px-6 sm:px-10"
          style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}
        >
          {/* Left — Forum logo */}
          <div className="flex items-center justify-start">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center hover:opacity-75 transition-opacity">
              <LogoForum size={44} />
            </Link>
          </div>

          {/* Center — desktop nav links, perfectly centered */}
          <div className="hidden md:flex items-center gap-10">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-semibold tracking-wide transition-all duration-200 relative group whitespace-nowrap"
                style={{ color: pathname === href ? "var(--blue-light)" : "var(--muted)" }}
              >
                {label}
                <span
                  className="absolute -bottom-1 left-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full"
                  style={{ width: pathname === href ? "100%" : "0%", background: "var(--teal)" }}
                />
              </Link>
            ))}
          </div>

          {/* Right — theme toggle + hamburger */}
          <div className="flex items-center justify-end gap-3">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              aria-label="Menu"
            >
              <div className="flex flex-col gap-1.5 w-5">
                <span className={`block h-0.5 rounded-full transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-2" : ""}`} style={{ background: "var(--text)" }} />
                <span className={`block h-0.5 rounded-full transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""}`} style={{ background: "var(--text)" }} />
                <span className={`block h-0.5 rounded-full transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`} style={{ background: "var(--text)" }} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      <div
        className="md:hidden fixed inset-0 z-40 transition-all duration-300"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          background: "var(--bg)",
        }}
      >
        {/* Content — starts below navbar */}
        <div
          className="flex flex-col h-full pt-20 px-8"
          style={{
            transform: open ? "translateY(0)" : "translateY(-16px)",
            transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* Nav links */}
          <nav className="flex flex-col gap-2 mt-4">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-5 py-4 rounded-2xl text-xl font-bold transition-all"
                style={{
                  color: pathname === href ? "var(--blue-light)" : "var(--text)",
                  background: pathname === href ? "rgba(37,99,235,0.1)" : "var(--bg-card)",
                  border: `1px solid ${pathname === href ? "rgba(37,99,235,0.3)" : "var(--border)"}`,
                }}
              >
                {label}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* CTA at bottom */}
          <div className="pb-10 flex flex-col gap-3">
            <Link
              href="/je-vote"
              onClick={() => setOpen(false)}
              className="btn-primary w-full text-center !justify-center !py-4 !text-base !rounded-2xl"
            >
              ✦ Je Vote
            </Link>
            <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
              © 2026 Forum CentraleSupélec
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
