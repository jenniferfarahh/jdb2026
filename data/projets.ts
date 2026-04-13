export type Projet = {
  id: string;
  name: string;        // project name  e.g. "Automathon"
  asso: string;        // association   e.g. "Automatans"
  description: string; // short blurb shown on card
  category: string;    // must match a Category label below
  vital: boolean;      // ❤️ vital badge — project depends on this grant
  color: string;       // hex brand color used for card tint + accents
  montant: number;     // € requested
  photoURL: string;    // large cover photo (Google Drive direct-link or /images/…)
  logoURL: string;     // square asso logo (Google Drive direct-link or /images/…)
};

export type Category = {
  id: string;
  label: string;
  color: string;
};

export const categories: Category[] = [
  { id: "tous",        label: "Tous",                    color: "#a855f7" },
  { id: "sportif",     label: "Sportif",                 color: "#10b981" },
  { id: "communaute",  label: "Communauté & caritatif",  color: "#3b82f6" },
  { id: "art",         label: "Art & events",            color: "#ec4899" },
  { id: "culturel",    label: "Culturel",                color: "#f59e0b" },
  { id: "science",     label: "Science & digital",       color: "#6366f1" },
];

export const projets: Projet[] = [
  // ── Science & digital ──────────────────────────────────────────────────────
  {
    id: "automatans-automathon",
    name: "Automathon",
    asso: "Automatans",
    description:
      "Un hackathon de 24 h centré sur l'IA, réunissant étudiants et professionnels pour relever des défis algorithmiques ambitieux.",
    category: "Science & digital",
    vital: false,
    color: "#FF8400",
    montant: 1000,
    photoURL: "https://drive.google.com/uc?export=view&id=1rtUsL7fYBE1Pj6T3NPYOmoA_sd2YgQ_5",
    logoURL:  "https://drive.google.com/uc?export=view&id=12edm3I8Y0LOPYi-2IiP8DWLicjEY1dej",
  },

  // ── Art & events ───────────────────────────────────────────────────────────
  {
    id: "commus-catch-me",
    name: "Catch Me If You Can",
    asso: "CommuS'",
    description:
      "Une comédie musicale portée par les étudiants de CentraleSupélec — adaptation scénique haute en couleur du célèbre film.",
    category: "Art & events",
    vital: false,
    color: "#800080",
    montant: 1400,
    photoURL: "https://drive.google.com/uc?export=view&id=1DJwd5syHsMTKPxNhZv4HxKGonSRTrEUL",
    logoURL:  "https://drive.google.com/uc?export=view&id=1Opq7-PHjMpWRz5ggzJP3s3vjH-oq5Ucj",
  },
];
