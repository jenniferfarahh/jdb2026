export type ONG = {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  description: string;
  domaines: string[];
  color: string;
};

export const ongs: ONG[] = [
  {
    id: "anne-lorient",
    name: "Anne-Lorient",
    logo: "🤝",
    tagline: "Solidarité locale et internationale",
    description: "Association engagée dans des actions de solidarité locale et internationale, œuvrant pour l'amélioration des conditions de vie des populations vulnérables.",
    domaines: ["Solidarité", "Humanitaire"],
    color: "#3b82f6",
  },
  {
    id: "bibliotheques-sans-frontieres",
    name: "Bibliothèques Sans Frontières",
    logo: "📚",
    tagline: "Le savoir pour tous, partout",
    description: "BSF démocratise l'accès au savoir et à l'éducation dans les zones de crise et les pays en développement grâce à des bibliothèques mobiles et des outils numériques.",
    domaines: ["Éducation", "Culture", "Innovation"],
    color: "#f59e0b",
  },
  {
    id: "hafb",
    name: "HAFB",
    logo: "🏗️",
    tagline: "Construire un avenir durable",
    description: "Organisation dédiée à la construction d'infrastructures essentielles et au développement durable dans les communautés défavorisées.",
    domaines: ["Infrastructure", "Développement", "Humanitaire"],
    color: "#8b5cf6",
  },
  {
    id: "institut-du-cerveau",
    name: "Institut du Cerveau",
    logo: "🧠",
    tagline: "Comprendre et guérir les maladies du cerveau",
    description: "L'ICM est un centre de recherche mondial sur les maladies neurologiques et psychiatriques. Ses équipes travaillent sur des pathologies comme la sclérose en plaques, Parkinson et Alzheimer.",
    domaines: ["Recherche", "Neurologie", "Santé"],
    color: "#06b6d4",
  },
  {
    id: "ladapt",
    name: "LADAPT",
    logo: "♿",
    tagline: "Vivre et travailler avec un handicap",
    description: "Association française qui accompagne les personnes handicapées dans leur insertion professionnelle et sociale, en favorisant leur autonomie et leur participation à la vie en société.",
    domaines: ["Handicap", "Insertion", "Social"],
    color: "#10b981",
  },
  {
    id: "msf-gaza",
    name: "MSF Gaza",
    logo: "🏥",
    tagline: "Soigner sans frontières",
    description: "Médecins Sans Frontières déploie des équipes médicales d'urgence à Gaza pour soigner les victimes de conflits, garantir l'accès aux soins et défendre le droit humanitaire international.",
    domaines: ["Médical", "Urgence", "Humanitaire"],
    color: "#ef4444",
  },
  {
    id: "nousaned",
    name: "Nousaned",
    logo: "🌱",
    tagline: "Ensemble, nous soutenons",
    description: "Association franco-arabe favorisant la solidarité interculturelle et le soutien aux populations dans le besoin à travers des projets de développement communautaire et d'aide humanitaire.",
    domaines: ["Solidarité", "Interculturel", "Développement"],
    color: "#f97316",
  },
  {
    id: "planete-urgence",
    name: "Planète Urgence",
    logo: "🌍",
    tagline: "Agir pour la planète et ses habitants",
    description: "ONG française spécialisée dans le volontariat de compétences et la reforestation. Elle mobilise des professionnels pour des missions de solidarité internationale et de protection de l'environnement.",
    domaines: ["Environnement", "Volontariat", "Reforestation"],
    color: "#22c55e",
  },
  {
    id: "sea-shepherd",
    name: "Sea Shepherd",
    logo: "🐋",
    tagline: "Défendre, conserver, protéger les océans",
    description: "Organisation internationale de conservation marine qui mène des actions directes non violentes pour protéger la faune marine contre la pêche illégale, le braconnage et la destruction des habitats.",
    domaines: ["Environnement", "Océans", "Conservation"],
    color: "#0ea5e9",
  },
];
