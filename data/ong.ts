export type ONG = {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  description: string;
  domaines: string[];
  color: string;
  url: string;
};

export const ongs: ONG[] = [
  {
    id: "anne-lorient",
    name: "Anne-Lorient",
    logo: "🤝",
    tagline: "Aide aux femmes à la rue et familles précaires",
    description: "L'Association Anne Lorient est une association française d'aide aux femmes sans domicile fixe et aux familles précaires, fondée autour du parcours d'Anne Lorient, ancienne sans-abri devenue militante et porte-parole sur les violences subies par les femmes à la rue. L'association met en avant des actions de terrain, des collectes de produits de première nécessité, des interventions de sensibilisation et un modèle participatif impliquant bénévoles et bénéficiaires.",
    domaines: ["Femmes", "Précarité", "Solidarité"],
    color: "#3b82f6",
    url: "https://www.annelorient.com/l-association-anne-lorient/",
  },
  {
    id: "bibliotheques-sans-frontieres",
    name: "Bibliothèques Sans Frontières",
    logo: "📚",
    tagline: "Le savoir pour tous, partout",
    description: "Bibliothèques Sans Frontières (BSF) est une ONG française fondée en 2007, qui renforce le pouvoir d'agir des populations vulnérables en facilitant l'accès à l'éducation, à la culture et à l'information, en France et à l'international. Son positionnement repose à la fois sur le livre, les bibliothèques, des outils mobiles comme l'Ideas Box, et des dispositifs numériques éducatifs ou informationnels.",
    domaines: ["Éducation", "Culture", "Innovation"],
    color: "#f59e0b",
    url: "https://www.bibliosansfrontieres.org/nous-decouvrir/",
  },
  {
    id: "hafb",
    name: "HAFB",
    logo: "🛡️",
    tagline: "Accueil et protection des femmes victimes de violence",
    description: "HAFB, pour Halte Aide aux Femmes Battues, est une association parisienne créée en 1983 pour accueillir, écouter, accompagner et mettre en sécurité les femmes victimes de violences, notamment conjugales, ainsi que leurs enfants. Elle se présente comme l'une des premières structures parisiennes à avoir défendu l'idée que la violence conjugale constitue un phénomène spécifique nécessitant une réponse spécialisée.",
    domaines: ["Violences conjugales", "Femmes", "Protection"],
    color: "#8b5cf6",
    url: "https://hafb.fr/notre-histoire/",
  },
  {
    id: "institut-du-cerveau",
    name: "Institut du Cerveau",
    logo: "🧠",
    tagline: "Comprendre et guérir les maladies du cerveau",
    description: "L'Institut du Cerveau, anciennement Institut du Cerveau et de la Moelle épinière (ICM), est une fondation française à but non lucratif reconnue d'utilité publique, dédiée à la recherche sur le cerveau, les maladies neurologiques, psychiatriques et la moelle épinière. Installé à la Pitié-Salpêtrière à Paris, il se présente comme un centre intégrant recherche fondamentale, clinique, innovation et transfert technologique.",
    domaines: ["Recherche", "Neurologie", "Santé"],
    color: "#06b6d4",
    url: "https://institutducerveau.org/notre-histoire",
  },
  {
    id: "msf-gaza",
    name: "MSF Gaza",
    logo: "🏥",
    tagline: "Soigner sans frontières",
    description: "MSF (Médecins Sans Frontières) est l'une des principales organisations médicales humanitaires opérant à Gaza depuis de nombreuses années. Dans le contexte de la guerre déclenchée après le 7 octobre 2023, l'organisation s'est retrouvée à la fois comme prestataire de soins, témoin public des attaques contre le système de santé, et acteur très exposé politiquement du fait de ses prises de position très dures sur les restrictions d'accès et les attaques visant les civils.",
    domaines: ["Médical", "Urgence", "Humanitaire"],
    color: "#ef4444",
    url: "https://www.msf.fr/gaza-nos-reponses-a-vos-questions",
  },
  {
    id: "ladapt",
    name: "LADAPT",
    logo: "♿",
    tagline: "Vivre et travailler avec un handicap",
    description: "LADAPT, Association pour l'insertion sociale et professionnelle des personnes handicapées, est une grande association française reconnue d'utilité publique, active dans l'accompagnement, le soin, la scolarisation, la formation et l'insertion des personnes en situation de handicap. Elle se présente comme un acteur historique du champ du handicap, présent sur l'ensemble du territoire, avec plus de 20 000 personnes accompagnées chaque année.",
    domaines: ["Handicap", "Insertion", "Emploi"],
    color: "#10b981",
    url: "https://www.ladapt.net/qui-sommes-nous",
  },
  {
    id: "nousaned",
    name: "Nusaned",
    logo: "🌱",
    tagline: "Entraide communautaire et humanitaire au Liban",
    description: "Nusaned est une ONG libanaise créée en 2020, humanitaire, non confessionnelle et apolitique, fondée sur l'action communautaire et bénévole. Elle s'est fait connaître notamment par la réhabilitation de logements après l'explosion du port de Beyrouth, l'aide alimentaire, les programmes d'abris et de moyens de subsistance, ainsi que des interventions d'urgence récentes au Liban.",
    domaines: ["Humanitaire", "Communauté", "Liban"],
    color: "#f97316",
    url: "https://nusaned.org/en/nusaned_pledge",
  },
  {
    id: "planete-urgence",
    name: "Planète Urgence",
    logo: "🌍",
    tagline: "Agir pour la planète et ses habitants",
    description: "Planète Urgence est une ONG française de solidarité internationale et d'aide au développement, créée en 2000, reconnue d'utilité publique et intégrée au Groupe SOS. Elle concentre aujourd'hui son action sur la préservation des forêts tropicales, le développement des communautés locales et l'engagement citoyen, notamment via le Congé Solidaire®.",
    domaines: ["Reforestation", "Volontariat", "Développement"],
    color: "#22c55e",
    url: "https://planete-urgence.org/qui-sommes-nous/",
  },
  {
    id: "sea-shepherd",
    name: "Sea Shepherd",
    logo: "🐋",
    tagline: "Défendre, conserver, protéger les océans",
    description: "Sea Shepherd est un mouvement international de défense des océans et de la faune marine, connu pour ses campagnes très offensives contre la chasse à la baleine, la pêche illégale et d'autres atteintes à la biodiversité marine. Son identité repose sur l'action directe, la médiatisation et l'idée d'intervenir lorsque les États n'appliquent pas assez fermement le droit de la mer ou les règles de protection animale.",
    domaines: ["Océans", "Faune marine", "Conservation"],
    color: "#0ea5e9",
    url: "https://seashepherd.fr/qui-sommes-nous",
  },
];
