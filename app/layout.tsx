import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300","400","500","600","700","800","900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JDB 2026 — Journée des Bourses | Forum CentraleSupélec",
  description: "La Journée des Bourses 2026 du Forum CentraleSupélec. Découvrez les projets, les ONG partenaires et votez.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" className={inter.className}>
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('jdb-theme') || 'dark';
            document.documentElement.setAttribute('data-theme', t);
          } catch(e) {}
        `}} />
      </head>
      <body className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
            <footer className="py-6 text-center">
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                © 2026 Forum CentraleSupélec — Journée des Bourses
              </p>
            </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
