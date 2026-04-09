import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "JDB 2026 — Journée des Bourses | Forum CentraleSupélec",
  description: "La Journée des Bourses 2026 du Forum CentraleSupélec. Découvrez les projets, les ONG partenaires et votez pour votre projet préféré.",
  keywords: "JDB 2026, Journée des Bourses, Forum CentraleSupélec, projets, ONG, vote",
  openGraph: {
    title: "JDB 2026 — Journée des Bourses",
    description: "La Journée des Bourses 2026 du Forum CentraleSupélec",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.className}>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="py-8 text-center text-sm text-white/30 border-t border-white/5">
          <p>© 2026 Forum CentraleSupélec — Journée des Bourses</p>
          <p className="mt-1 text-white/20">Fait avec ❤️ par le Pôle Informatique du Forum CS</p>
        </footer>
      </body>
    </html>
  );
}
