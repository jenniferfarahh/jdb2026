
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      {theme === "dark" ? (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F6C73B"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="4.5" />
          <line x1="12" y1="2" x2="12" y2="4.5" />
          <line x1="12" y1="19.5" x2="12" y2="22" />
          <line x1="4.22" y1="4.22" x2="5.95" y2="5.95" />
          <line x1="18.05" y1="18.05" x2="19.78" y2="19.78" />
          <line x1="2" y1="12" x2="4.5" y2="12" />
          <line x1="19.5" y1="12" x2="22" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.95" y2="18.05" />
          <line x1="18.05" y1="5.95" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--blue)"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="h-16 max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-[auto_1fr_auto] items-center">
        {/* Left */}
        <div className="flex items-center justify-start">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center hover:opacity-75 transition-opacity"
          >
            <LogoForum size={44} />
          </Link>
        </div>

        {/* Center */}
        <div className="hidden md:flex items-center justify-center gap-12">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-semibold tracking-wide transition-all duration-200 relative group whitespace-nowrap"
              style={{
                color:
                  pathname === href ? "var(--blue-light)" : "var(--muted)",
              }}
            >
              {label}
              <span
                className="absolute -bottom-1 left-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full"
                style={{
                  width: pathname === href ? "100%" : "0%",
                  background: "var(--teal)",
                }}
              />
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center justify-end gap-3">
          <ThemeToggle />

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
            aria-label="Menu"
          >
            <div className="flex flex-col gap-1.5 w-5">
              <span
                className={`block h-0.5 rounded-full transition-all origin-center ${
                  open ? "rotate-45 translate-y-2" : ""
                }`}
                style={{ background: "var(--text)" }}
              />
              <span
                className={`block h-0.5 rounded-full transition-all ${
                  open ? "opacity-0 scale-x-0" : ""
                }`}
                style={{ background: "var(--text)" }}
              />
              <span
                className={`block h-0.5 rounded-full transition-all origin-center ${
                  open ? "-rotate-45 -translate-y-2" : ""
                }`}
                style={{ background: "var(--text)" }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className="px-6 py-5 flex flex-col gap-1"
          style={{ background: "var(--bg)" }}
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="py-3 px-4 rounded-xl text-sm font-semibold"
              style={{
                color:
                  pathname === href ? "var(--blue-light)" : "var(--muted)",
                background:
                  pathname === href
                    ? "rgba(37,99,235,0.08)"
                    : "transparent",
              }}
            >
              {label}
            </Link>
          ))}

          <Link
            href="/je-vote"
            onClick={() => setOpen(false)}
            className="btn-primary !py-3.5 !text-sm !justify-center !rounded-xl mt-2"
          >
            ✦ Je Vote
          </Link>
        </div>
      </div>
    </nav>
  );
}

