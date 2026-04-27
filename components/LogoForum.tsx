"use client";
import { useState } from "react";

interface LogoForumProps { className?: string; size?: number; }

export default function LogoForum({ className = "", size = 52 }: LogoForumProps) {
  const [usePng, setUsePng] = useState(true);

  if (usePng) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logo-forum.png"
        alt="Forum CentraleSupélec"
        width={size}
        height={size}
        className={`object-contain forum-logo ${className}`}
        style={{ width: size, height: size }}
        onError={() => setUsePng(false)}
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`forum-logo ${className}`}>
      <polygon points="50,2 66,14 66,44 50,48 34,44 34,14" fill="#1A2A6C"/>
      <polygon points="50,4 64,15 64,43 50,46 36,43 36,15" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3,2"/>
      <text x="50" y="32" textAnchor="middle" fontSize="14" fill="white">𝄛</text>
      <rect x="5" y="46" width="90" height="3" fill="#1A2A6C"/>
      <text x="50" y="68" textAnchor="middle" fontFamily="Georgia, serif" fontSize="22" fontWeight="bold" fontStyle="italic" fill="#0D0D0D">Forum</text>
      <rect x="5" y="72" width="90" height="3" fill="#1A2A6C"/>
      <polygon points="50,98 34,86 34,74 50,78 66,74 66,86" fill="#1A2A6C"/>
      <polygon points="50,96 36,85 36,75 50,76 64,75 64,85" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3,2"/>
    </svg>
  );
}
