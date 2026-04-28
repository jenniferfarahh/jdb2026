"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import LogoForum from "@/components/LogoForum"
import { useTheme } from "@/components/ThemeProvider"

const NAV_LINKS = [
  { href: "/projets",                 label: "Projets",   external: false },
  { href: "/ong",                     label: "OBNL",      external: false },
  { href: "/contact",                  label: "Contact",   external: false },
]

// ─── Icons ────────────────────────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F6C73B" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue-light)" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label="Changer le thème"
      style={{
        width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border)",
        background: "var(--bg-card)", cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

// ─── User Avatar Dropdown ─────────────────────────────────────────────────────
interface UserInfo { prenom: string; nom: string }

function AvatarMenu({
  user,
  onLogout,
  mobileLinks = false,
}: {
  user: UserInfo
  onLogout: () => void
  mobileLinks?: boolean
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
  const initials = ((user.prenom?.[0] ?? "") + (user.nom?.[0] ?? "")).toUpperCase()

  useEffect(() => {
    if (!open) return
    function close(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    document.addEventListener("touchstart", close)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("touchstart", close)
    }
  }, [open])

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Menu utilisateur"
        aria-expanded={open}
        style={{
          width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)",
          background: "linear-gradient(135deg,#2563EB,#2ABFC4)", color: "#fff",
          fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {initials}
      </button>

      {/* Dropdown */}
      <div
        role="menu"
        style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          minWidth: 200, borderRadius: 16, overflow: "hidden",
          background: "var(--nav-bg)", border: "1px solid var(--border)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.96)",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.15s ease, transform 0.15s ease",
          zIndex: 200,
        }}
      >
        {/* Name header */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap" }}>
            {user.prenom} {user.nom}
          </p>
        </div>

        {/* Nav links — only on mobile */}
        {mobileLinks && NAV_LINKS.map(({ href, label, external }) => {
          const isActive = !external && pathname === href
          const sharedStyle = {
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", textDecoration: "none", fontSize: 14, fontWeight: 600,
            color: isActive ? "var(--blue-light)" : "var(--text)",
            background: isActive ? "rgba(37,99,235,0.06)" : "transparent",
          } as const
          return external ? (
            <a key={href} href={href} role="menuitem" onClick={() => setOpen(false)} style={sharedStyle}>
              {label}
            </a>
          ) : (
            <Link key={href} href={href} role="menuitem" onClick={() => setOpen(false)} style={sharedStyle}>
              {label}
              {isActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", flexShrink: 0 }} />}
            </Link>
          )
        })}

        {/* Divider before logout */}
        <div style={{ height: 1, background: "var(--border)" }} />

        {/* Logout */}
        <button
          role="menuitem"
          onClick={() => { setOpen(false); onLogout() }}
          style={{
            width: "100%", padding: "12px 16px", background: "transparent",
            border: "none", textAlign: "left", fontSize: 14, fontWeight: 600,
            color: "#f87171", cursor: "pointer", display: "block",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}

// ─── Guest Mobile Dropdown (unauthenticated) ─────────────────────────────────
function GuestDropdown({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function close(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", close)
    document.addEventListener("touchstart", close)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("touchstart", close)
    }
  }, [open, onClose])

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {children}
      {/* Dropdown card — same style as AvatarMenu */}
      <div
        role="menu"
        style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          minWidth: 200, borderRadius: 16, overflow: "hidden",
          background: "var(--nav-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.96)",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.15s ease, transform 0.15s ease",
          zIndex: 200,
        }}
      >
        {NAV_LINKS.map(({ href, label, external }) => {
          const isActive = !external && pathname === href
          const sharedStyle = {
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", textDecoration: "none", fontSize: 14, fontWeight: 600,
            color: isActive ? "var(--blue-light)" : "var(--text)",
            background: isActive ? "rgba(37,99,235,0.06)" : "transparent",
          } as const
          return external ? (
            <a key={href} href={href} role="menuitem" onClick={onClose} style={sharedStyle}>
              {label}
            </a>
          ) : (
            <Link key={href} href={href} role="menuitem" onClick={onClose} style={sharedStyle}>
              {label}
              {isActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", flexShrink: 0 }} />}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolledOnHome, setScrolledOnHome] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const isHome = pathname === "/"
  const showBackground = scrolledOnHome || !isHome

  useEffect(() => {
    if (!isHome) return
    function onScroll() { setScrolledOnHome(window.scrollY > 10) }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [isHome])

  // Fetch session on mount + every route change
  useEffect(() => {
    setHydrated(true)
    fetch("/api/auth/me")
      .then(r => (r.ok ? r.json() : null))
      .then(data => setUser(data?.authenticated ? { prenom: data.prenom, nom: data.nom } : null))
      .catch(() => setUser(null))
  }, [pathname])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  function handleLogout() {
    setUser(null)
    setMenuOpen(false)
    // Use full browser navigation so the Set-Cookie header from the logout
    // route is correctly applied — router.push() can drop cookies on redirects.
    window.location.href = "/api/auth/logout"
  }

  return (
    <>
      <nav
        aria-label="Navigation principale"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          height: 64,
          background: showBackground ? "var(--nav-bg)" : "transparent",
          backdropFilter: showBackground ? "blur(20px)" : "none",
          WebkitBackdropFilter: showBackground ? "blur(20px)" : "none",
          borderBottom: `1px solid ${showBackground ? "var(--border)" : "transparent"}`,
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        <div
          style={{
            height: "100%", maxWidth: 1200, margin: "0 auto",
            padding: "0 20px", display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 16,
          }}
        >
          {/* ── Left: Logo ── */}
          <Link
            href="/"
            aria-label="Accueil JDB 2026"
            style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}
          >
            <LogoForum size={40} />
          </Link>

          {/* ── Center: Desktop links (absolutely centered in bar) ── */}
          <div
            aria-label="Liens de navigation"
            style={{
              display: "flex", alignItems: "center", gap: 40,
              position: "absolute", left: "50%", transform: "translateX(-50%)",
            }}
            className="hide-on-mobile"
          >
            {NAV_LINKS.map(({ href, label, external }) => {
              const isActive = !external && pathname === href
              const sharedStyle = {
                textDecoration: "none", fontSize: 14, fontWeight: 600,
                letterSpacing: "0.01em", whiteSpace: "nowrap",
                color: isActive ? "var(--blue-light)" : "var(--muted)",
                transition: "color 0.2s",
                position: "relative",
              } as const
              return external ? (
                <a key={href} href={href} style={sharedStyle}>{label}</a>
              ) : (
                <Link key={href} href={href} style={sharedStyle}>
                  {label}
                  {isActive && (
                    <span style={{
                      position: "absolute", bottom: -4, left: 0, right: 0,
                      height: 2, borderRadius: 2, background: "var(--teal)",
                    }} />
                  )}
                </Link>
              )
            })}
          </div>

          {/* ── Right: Actions ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <ThemeToggle />

            {hydrated && (
              <>
                {/* Desktop avatar */}
                {user && (
                  <div className="hide-on-mobile">
                    <AvatarMenu user={user} onLogout={handleLogout} />
                  </div>
                )}

                {/* Mobile */}
                <div className="show-on-mobile">
                  {user ? (
                    <AvatarMenu user={user} onLogout={handleLogout} mobileLinks />
                  ) : (
                    <GuestDropdown open={menuOpen} onClose={() => setMenuOpen(false)}>
                      <button
                        onClick={() => setMenuOpen(v => !v)}
                        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                        aria-expanded={menuOpen}
                        style={{
                          width: 36, height: 36, borderRadius: 10,
                          border: "1px solid var(--border)", background: "var(--nav-bg)",
                          cursor: "pointer", display: "flex", alignItems: "center",
                          justifyContent: "center", flexShrink: 0,
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <line x1="2" y1="5" x2="16" y2="5" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round"
                            style={{ transformOrigin: "9px 5px", transition: "transform 0.25s ease", transform: menuOpen ? "rotate(45deg) translate(0, 4px)" : "none" }} />
                          <line x1="2" y1="9" x2="16" y2="9" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round"
                            style={{ transition: "opacity 0.2s ease", opacity: menuOpen ? 0 : 1 }} />
                          <line x1="2" y1="13" x2="16" y2="13" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round"
                            style={{ transformOrigin: "9px 13px", transition: "transform 0.25s ease", transform: menuOpen ? "rotate(-45deg) translate(0, -4px)" : "none" }} />
                        </svg>
                      </button>
                    </GuestDropdown>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

    </>
  )
}
