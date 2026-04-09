"use client";
import { useState } from "react";

interface LogoJDBProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function LogoJDB({ className = "", width = 600, height = 300 }: LogoJDBProps) {
  const [usePng, setUsePng] = useState(true);

  if (usePng) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logo-jdb.png"
        alt="Journée des Bourses 2026"
        width={width}
        height={height}
        className={`w-full h-auto ${className}`}
        onError={() => setUsePng(false)}
        style={{ objectFit: "contain" }}
      />
    );
  }

  // Fallback SVG — couleurs fidèles au vrai logo
  return (
    <svg
      viewBox="0 0 600 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto ${className}`}
    >
      <defs>
        {/* J gradients — bleu cobalt */}
        <linearGradient id="jg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4890E8"/>
          <stop offset="100%" stopColor="#1A40B8"/>
        </linearGradient>
        <linearGradient id="jg2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB"/>
          <stop offset="100%" stopColor="#5BA0F0"/>
        </linearGradient>
        <linearGradient id="jg3" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1A40B8"/>
          <stop offset="100%" stopColor="#2ABFC4"/>
        </linearGradient>
        {/* D gradients — bleu royal */}
        <linearGradient id="dg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB"/>
          <stop offset="100%" stopColor="#1535A0"/>
        </linearGradient>
        <linearGradient id="dg2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3A7AE8"/>
          <stop offset="100%" stopColor="#2050C8"/>
        </linearGradient>
        {/* B gradients — teal */}
        <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2ABFC4"/>
          <stop offset="100%" stopColor="#0F6070"/>
        </linearGradient>
        <linearGradient id="bg2" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#1D9098"/>
          <stop offset="100%" stopColor="#2ABFC4"/>
        </linearGradient>
        <linearGradient id="bg3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0A2050"/>
          <stop offset="100%" stopColor="#1A4090"/>
        </linearGradient>
      </defs>

      {/* ═══ LETTRE J ═══ */}
      {/* Barre horizontale haut */}
      <polygon points="30,20 150,20 150,60 110,60 110,40 30,40" fill="url(#jg1)"/>
      {/* Tige verticale */}
      <polygon points="90,40 130,40 130,185 115,210 80,225 50,210 40,185 40,60 90,60" fill="url(#jg2)"/>
      {/* Partie basse courbée gauche */}
      <polygon points="30,190 80,175 95,205 70,230 30,215" fill="url(#jg3)"/>
      {/* Facettes J */}
      <polygon points="30,20 90,20 90,40 30,40" fill="#2ABFC4" opacity="0.4"/>
      <polygon points="90,40 150,40 130,60 90,60" fill="#1A40B8" opacity="0.6"/>
      <polygon points="40,60 90,60 80,140 40,140" fill="#2060D8" opacity="0.3"/>
      <polygon points="90,60 130,60 110,180 90,185" fill="#4890E8" opacity="0.25"/>

      {/* ═══ LETTRE D ═══ */}
      {/* Corps D */}
      <polygon points="185,20 275,20 315,60 315,215 275,255 185,255" fill="url(#dg1)"/>
      {/* Interior hollow */}
      <polygon points="220,60 270,60 295,90 295,185 270,210 220,210" fill="#060C20"/>
      {/* Facettes D */}
      <polygon points="185,20 245,20 245,50 185,55" fill="#4890E8" opacity="0.4"/>
      <polygon points="245,20 315,60 295,80 245,50" fill="#1A40B8" opacity="0.5"/>
      <polygon points="185,55 220,60 220,210 185,205" fill="#2563EB" opacity="0.3"/>
      <polygon points="295,80 315,60 315,215 295,185" fill="#3A7AE8" opacity="0.35"/>
      <polygon points="185,205 220,210 270,210 275,255 185,255" fill="#1535A0" opacity="0.5"/>
      <polygon points="270,210 295,185 315,215 275,255" fill="#2563EB" opacity="0.4"/>

      {/* ═══ LETTRE B ═══ */}
      {/* Montant vertical gauche */}
      <rect x="345" y="20" width="40" height="235" fill="url(#bg3)"/>
      {/* Bosse haute */}
      <polygon points="385,20 460,20 500,55 500,130 460,140 385,140" fill="url(#bg1)"/>
      {/* Interior bosse haute */}
      <polygon points="415,50 455,50 480,75 480,120 455,130 415,130" fill="#060C20"/>
      {/* Bosse basse */}
      <polygon points="385,140 465,140 510,175 510,215 465,255 385,255" fill="url(#bg2)"/>
      {/* Interior bosse basse */}
      <polygon points="415,165 458,165 485,188 485,210 458,235 415,235" fill="#060C20"/>

      {/* Icône colonnes dans la bosse basse */}
      <rect x="430" y="195" width="5" height="22" fill="white" opacity="0.75"/>
      <rect x="441" y="195" width="5" height="22" fill="white" opacity="0.75"/>
      <rect x="452" y="195" width="5" height="22" fill="white" opacity="0.75"/>
      <polygon points="428,195 460,195 462,198 426,198" fill="white" opacity="0.8"/>
      <rect x="426" y="217" width="37" height="4" fill="white" opacity="0.8"/>
      <polygon points="443.5,183 444.5,183 462,194 425,194" fill="white" opacity="0.8"/>

      {/* Facettes B */}
      <polygon points="385,20 430,20 430,45 385,48" fill="#4ACFD4" opacity="0.35"/>
      <polygon points="430,20 500,55 480,70 430,45" fill="#0F6070" opacity="0.5"/>
      <polygon points="500,55 500,130 480,120 480,75" fill="#2ABFC4" opacity="0.3"/>
      <polygon points="385,140 430,140 430,160 385,158" fill="#1D9098" opacity="0.4"/>
      <polygon points="465,140 510,175 490,185 455,150" fill="#0F6070" opacity="0.5"/>

      {/* ═══ TEXTE JOURNÉE DES BOURSES ═══ */}
      <text
        x="300"
        y="292"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="24"
        fontWeight="300"
        fill="#6AABFF"
        letterSpacing="8"
        opacity="0.8"
      >
        Journée  des  Bourses
      </text>
    </svg>
  );
}
