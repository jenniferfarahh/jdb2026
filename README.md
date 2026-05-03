# JdB 2026 — Plateforme de vote en ligne

Plateforme de vote pour la **Journée des Bourses** du Forum CentraleSupélec.  
Construite avec Next.js 16, Neon Postgres, et authentification ViaRézo OIDC.

> **Pour l'édition 2027** : ce README contient tout ce qu'il faut savoir pour reprendre le projet, adapter les données et relancer la plateforme.

---

## Table des matières

1. [Architecture](#architecture)
2. [Stack technique](#stack-technique)
3. [Structure du projet](#structure-du-projet)
4. [Démarrage local](#démarrage-local)
5. [Variables d'environnement](#variables-denvironnement)
6. [Adapter le projet pour JdB 2027](#adapter-le-projet-pour-jdb-2027)
7. [Fenêtre de vote](#fenêtre-de-vote)
8. [Règles de vote](#règles-de-vote)
9. [Pages et fonctionnalités](#pages-et-fonctionnalités)
10. [Page admin](#page-admin)
11. [Stand présentiel](#stand-présentiel)
12. [Backup et export des votes](#backup-et-export-des-votes)
13. [Déploiement](#déploiement)
14. [Base de données](#base-de-données)
15. [Nettoyer les données avant la soirée](#nettoyer-les-données-avant-la-soirée)
16. [Checklist avant la soirée](#checklist-avant-la-soirée)

---

## Architecture

```
Navigateur étudiant
       │
       ▼
ViaRézo OIDC (authentification)
       │
       ▼
Next.js App (Vercel ou Dokploy)
       │
       ▼
Neon Postgres (cloud DB — indépendant de l'hébergeur)
```

**Deux déploiements en parallèle :**
- **Dokploy** : `jdb.forum-cs.fr` — site officiel
- **Vercel** : `jdb2026.vercel.app` — fallback de secours

Les deux pointent sur la **même base Neon** — si l'un tombe, l'autre prend le relai sans perte de données.

---

## Stack technique

| Technologie | Usage |
|---|---|
| Next.js 16.2 (App Router) | Framework fullstack |
| TypeScript | Langage |
| Neon Postgres | Base de données cloud |
| Drizzle ORM | Schéma et migrations DB |
| ViaRézo OIDC | Authentification étudiante |
| Vercel | Hébergement de secours |
| Dokploy | Hébergement principal (auto-hébergé) |
| SheetJS (xlsx) | Export Excel côté serveur |
| openpyxl + psycopg2 | Backup Python local |

---

## Structure du projet

```
jdb2026/
├── app/
│   ├── page.tsx                      # Page d'accueil
│   ├── je-vote/page.tsx              # Page de vote (étudiants)
│   ├── projets/page.tsx              # Catalogue des projets
│   ├── ong/page.tsx                  # Catalogue des OBNLs
│   ├── contact/page.tsx              # Page contact
│   ├── admin/
│   │   ├── page.tsx                  # Dashboard admin
│   │   └── presentiel/page.tsx       # Stand de vote présentiel
│   └── api/
│       ├── auth/callback/route.ts    # Callback OIDC ViaRézo
│       ├── auth/login/route.ts       # Initiation du login
│       ├── auth/logout/route.ts      # Logout
│       ├── auth/me/route.ts          # Session courante
│       ├── vote/submit/route.ts      # Soumission d'un vote en ligne
│       ├── vote/presentiel/route.ts  # Soumission d'un vote présentiel
│       ├── vote/status/route.ts      # Statut de la fenêtre de vote
│       ├── admin/votes/route.ts      # Liste des votes (admin)
│       ├── admin/export/route.ts     # Export Excel (admin)
│       └── results/route.ts          # Résultats calculés
├── data/
│   ├── projets.ts                    # ⭐ Liste des projets (à mettre à jour)
│   └── ong.ts                        # ⭐ Liste des OBNLs (à mettre à jour)
├── lib/
│   ├── vote-config.ts                # ⭐ Fenêtre de vote + types promo
│   ├── vote-calculator.ts            # Algorithme de distribution (Art. 10)
│   ├── vote-store.ts                 # Accès DB
│   ├── session-store.ts              # Gestion des sessions cookie
│   └── db/schema.ts                  # Schéma Drizzle
├── scripts/
│   ├── backup.sh                     # Script de backup local
│   └── backup_votes.py               # Génère un Excel depuis la DB
└── public/
    └── logo-jdb.png                  # Logo de la JdB
```

---

## Démarrage local

```bash
# 1. Cloner le repo
git clone https://github.com/jenniferfarahh/jdb2026.git
cd jdb2026

# 2. Installer les dépendances
npm install

# 3. Créer le fichier d'environnement
# Copier le bloc ci-dessous dans un fichier .env.local à la racine

# 4. Lancer en développement
npm run dev
```

Le site tourne sur `http://localhost:3000`.

---

## Variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# Base de données Neon
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?channel_binding=require&sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST-unpooled/neondb?sslmode=require"

# ViaRézo OIDC — créer une app sur https://moncompte.viarezo.fr
VIAREZO_CLIENT_ID=votre_client_id
VIAREZO_CLIENT_SECRET=votre_client_secret

# URL de l'application
NEXT_PUBLIC_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Sécurité des sessions (générer avec: openssl rand -base64 32)
SESSION_SECRET=votre_secret_aleatoire

# Mot de passe admin (accès dashboard + export)
ADMIN_SECRET=votre_mot_de_passe_admin

# Pools financiers
JDB_TOTAL_POOL=34000
JDB_ONG_POOL=5000

# Mode test — true = votes ouverts en permanence (dev uniquement)
VOTE_TEST_MODE=false
NEXT_PUBLIC_VOTE_TEST_MODE=false

# PIN opérateur pour les stands présentiel
PRESENTIEL_PIN=votre_pin
```

### Valeurs utilisées pour JdB 2026

| Variable | Valeur 2026 | À changer pour 2027 |
|---|---|---|
| `ADMIN_SECRET` | `vieasso2026` | ✅ Oui |
| `PRESENTIEL_PIN` | `6767` | ✅ Oui |
| `SESSION_SECRET` | `p/++DrzuUKaf0W52vVN/XeiNo3ATYMnepCqpvE57QLU=` | ✅ Oui (`openssl rand -base64 32`) |
| `JDB_TOTAL_POOL` | `34000` | Selon le budget |
| `JDB_ONG_POOL` | `5000` | Selon le budget |
| `VIAREZO_CLIENT_ID` | `b6e0f8dd13e041a0d7359d59b2d263d5039bdcee` | Si expiré |
| `VIAREZO_CLIENT_SECRET` | `3d25fafee65d5a84270192ecf60381680fe127ab` | Si expiré |

> ⚠️ Ne jamais commiter `.env.local` — il est dans `.gitignore`.

---

## Adapter le projet pour JdB 2027

### 1. Mettre à jour les projets — `data/projets.ts`

Chaque projet suit cette structure :

```typescript
{
  id: 'identifiant-unique',       // slug unique, pas d'espaces ni accents
  name: 'Nom du projet',
  asso: 'Nom de l\'association',
  description: `Description longue...`,
  category: 'Art & events',       // catégorie libre
  vital: false,                   // true = projet vital (affiché différemment)
  color: '#FF8400',               // couleur hex de l'asso
  montant: 1400,                  // montant demandé en euros
  photoURL: '/api/img?id=GOOGLE_DRIVE_ID&sz=w1200',
  logoURL:  '/api/img?id=GOOGLE_DRIVE_ID&sz=w200',
}
```

> Les photos sont servies via `/api/img` qui proxifie Google Drive. Uploader les images sur Drive et copier l'ID depuis l'URL de partage (`https://drive.google.com/file/d/**ID**/view`).

### 2. Mettre à jour les OBNLs — `data/ong.ts`

```typescript
{
  id: 'identifiant-unique',
  name: 'Nom de l\'OBNL',
  logo: '🌍',                      // emoji
  tagline: 'Slogan court',
  description: `Description...`,
  domaines: ['Environnement'],
  color: '#2563EB',
  url: 'https://site-de-l-obnl.fr',
}
```

### 3. Mettre à jour la fenêtre de vote — `lib/vote-config.ts`

```typescript
// Heure en UTC — CEST (été français) = UTC+2
// Exemple : 17h00 Paris = 15h00 UTC
export const VOTE_START = new Date('2027-XX-XXT15:00:00.000Z') // 17h00 CEST
export const VOTE_END   = new Date('2027-XX-XXT19:00:00.000Z') // 21h00 CEST
```

### 4. Mettre à jour les pools financiers

Dans `.env.local` et dans les dashboards Vercel et Dokploy :
```
JDB_TOTAL_POOL=34000
JDB_ONG_POOL=5000
```

> Note : certaines pages affichent "35 000 €" en dur pour la communication (montant brut avant déduction des frais). Seuls les **calculs** utilisent `JDB_TOTAL_POOL`. Si le montant affiché change, le mettre à jour dans `app/projets/page.tsx` et `app/je-vote/page.tsx`.

### 5. Mettre à jour les promos — `app/api/auth/callback/route.ts`

La détection de promo se fait sur les champs ViaRézo `degree_type` et `promo` :

| Promo | Cursus | Mode vote | Nb projets |
|---|---|---|---|
| P2027 | 2A Ingénieur | 🟢 En ligne | 5 |
| P2028 | 1A Ingénieur | 🟢 En ligne | 5 |
| P2026 | 3A / Césure | 🔴 Présentiel | 5 |
| P2029 | Prépa / autre | 🔴 Présentiel | — |
| Bachelor | Bachelor | 🔴 Présentiel | 3 |

Pour JdB 2027, décaler les années d'un an dans la fonction `detectPromo()` de `app/api/auth/callback/route.ts` et dans `lib/vote-config.ts`.

---

## Fenêtre de vote

Le vote s'ouvre et se ferme automatiquement selon `VOTE_START` et `VOTE_END`.

**Pour tester localement** (ignorer la fenêtre horaire) :
```env
VOTE_TEST_MODE=true
NEXT_PUBLIC_VOTE_TEST_MODE=true
```

**⚠️ Toujours mettre `VOTE_TEST_MODE=false` en production avant la soirée.**

---

## Règles de vote

### Article 9 — Qui vote comment

- **Ingénieurs 1A et 2A (P2028, P2027)** → vote en ligne, 5 projets + 3 OBNLs
- **Ingénieurs 3A / Césure (P2026)** → vote présentiel au stand, 5 projets + 3 OBNLs
- **Bachelors** → vote présentiel au stand, 3 projets + 3 OBNLs
- **Autres cursus** → bloqués, pas de vote

### Article 10 — Distribution de l'argent

Algorithme proportionnel avec plafond et redistribution itérative :

1. Chaque votant distribue des points : **5-4-3-2-1** (ingénieurs) ou **3-2-1** (bachelors)
2. La part de chaque projet = `points_projet / total_points × pool`
3. Aucun projet ne peut recevoir **plus que son `montant` demandé**
4. L'excédent est redistribué proportionnellement aux projets sous-financés
5. L'algorithme itère jusqu'à convergence (max 50 tours)

Les OBNLs : **distribution purement proportionnelle, sans plafond**.

---

## Pages et fonctionnalités

| Page | URL | Description |
|---|---|---|
| Accueil | `/` | Présentation de la JdB |
| Projets | `/projets` | Catalogue de tous les projets avec photos et montants |
| OBNLs | `/ong` | Présentation des OBNLs partenaires |
| Vote | `/je-vote` | Flux de vote complet pour les étudiants en ligne |
| Contact | `/contact` | Informations de contact |
| Admin | `/admin` | Dashboard votes + résultats (protégé par mot de passe) |
| Présentiel | `/admin/presentiel` | Stand de vote pour les staffers (protégé par PIN) |

### Flux de vote en ligne (`/je-vote`)

1. Connexion via ViaRézo (OIDC)
2. Détection automatique de la promo
3. Sélection des projets par ordre de préférence
4. Sélection de 3 OBNLs par ordre de préférence
5. Écran de confirmation avec récapitulatif
6. Soumission → écran de succès avec résumé du vote

---

## Page admin

**URL** : `/admin`  
**Mot de passe 2026** : `vieasso2026`

### Onglet Votes
- Compteurs par promo en temps réel
- Liste complète de tous les votants avec leurs choix détaillés
- Recherche par nom ou promo
- Bouton **⬇ Exporter** → fichier Excel avec 2 onglets (Votes + Résultats)

**Export direct sans interface** :
```
https://jdb.forum-cs.fr/api/admin/export?token=vieasso2026
```

### Onglet Résultats
- Classement en temps réel des projets (pts · part % · montant alloué)
- Classement en temps réel des OBNLs (pts · part % · montant alloué)
- Bouton **Actualiser**

---

## Stand présentiel

**URL** : `/admin/presentiel`  
**PIN 2026** : `6767`

Interface pour les staffers aux stands physiques :

1. Entrer le **PIN opérateur** (à communiquer aux staffers avant la soirée)
2. Saisir **Prénom + Nom** en MAJUSCULES, sans accent, sans tiret (vérifier la carte étudiante)
3. Choisir le **cursus** : `3A / Césure` (5 projets) ou `Bachelor` (3 projets)
4. L'étudiant sélectionne ses projets par ordre de préférence
5. L'étudiant sélectionne 3 OBNLs
6. Confirmer → **Étudiant suivant →**

> ⚠️ Si "a déjà voté" s'affiche en rouge : ne pas continuer — un seul vote par personne.

---

## Backup et export des votes

### Export depuis l'interface admin
`/admin` → onglet Votes → **⬇ Exporter**

### Export direct (URL)
```
https://jdb.forum-cs.fr/api/admin/export?token=vieasso2026
```

### Backup local depuis la DB

```bash
bash /chemin/vers/jdb2026/scripts/backup.sh
```

Le script crée automatiquement un venv Python, installe les dépendances, se connecte à Neon et génère un fichier Excel dans `~/Downloads/JDB2026_Export_YYYY-MM-DD_HHMM.xlsx`.

> 💡 Ce script fonctionne même si les deux sites sont down — il se connecte directement à Neon Postgres.

---

## Déploiement

### Vercel

```bash
npm i -g vercel      # Installer le CLI
vercel link          # Lier le projet
vercel deploy --prod # Déployer en production
```

Gérer les variables d'environnement :
```bash
# Ajouter une variable (utiliser printf, pas echo — évite le \n parasite)
printf "valeur" | vercel env add NOM_VARIABLE production

# Supprimer une variable
vercel env rm NOM_VARIABLE production
```

### Dokploy

Dokploy se déploie depuis le repo GitHub `ForumCentraleSupelec/JdB_Production`.  
Configurer les variables d'environnement dans le dashboard Dokploy puis redéployer.

### Variables à configurer sur les deux plateformes

```
DATABASE_URL
VIAREZO_CLIENT_ID
VIAREZO_CLIENT_SECRET
NEXT_PUBLIC_URL          # https://jdb.forum-cs.fr (Dokploy) ou https://jdb2026.vercel.app (Vercel)
NEXTAUTH_URL             # idem
SESSION_SECRET
ADMIN_SECRET
JDB_TOTAL_POOL
JDB_ONG_POOL
VOTE_TEST_MODE=false
NEXT_PUBLIC_VOTE_TEST_MODE=false
PRESENTIEL_PIN
NODE_ENV=production
```

### Plan de récupération en cas de panne

| Scénario | Solution |
|---|---|
| Dokploy down | Utiliser `jdb2026.vercel.app` |
| Vercel down | Utiliser `jdb.forum-cs.fr` |
| Les deux down | `npm run dev` en local — même DB Neon |
| Besoin des données en urgence | `bash scripts/backup.sh` |

---

## Base de données

**Fournisseur** : [Neon Postgres](https://neon.tech) — cloud, serverless, indépendant des hébergeurs.

### Schéma

```sql
vote_sessions    -- Une ligne par votant (identifiant ViaRézo unique)
  - viarezo_sub  -- Identifiant unique ViaRézo (clé d'unicité du vote)
  - prenom, nom, email
  - promo_type   -- P2026 | P2027 | P2028 | P2029 | Bachelor | Other
  - voter_category -- ingenieur | bachelor | other
  - voted_at

project_votes    -- Choix de projets (rank + weight par session)
  - session_id, project_id, rank, weight

ong_votes        -- Choix d'OBNLs (rank + weight par session)
  - session_id, ong_id, rank, weight

audit_log        -- Log des événements
```

### Migrations

```bash
npx drizzle-kit generate   # Générer une migration depuis le schéma
npx drizzle-kit migrate    # Appliquer les migrations en DB
```

---

## Nettoyer les données avant la soirée

> ⚠️ **À faire absolument** avant d'ouvrir les vrais votes — supprimer tous les votes de test.

### Via Python (depuis le terminal)

```bash
# Activer le venv du projet (ou utiliser python3 directement)
/chemin/vers/jdb2026/.venv/bin/python3 -c "
import psycopg2
conn = psycopg2.connect('VOTRE_DATABASE_URL')
cur = conn.cursor()
cur.execute('DELETE FROM project_votes')
cur.execute('DELETE FROM ong_votes')
cur.execute('DELETE FROM vote_sessions')
conn.commit()
cur.execute('SELECT COUNT(*) FROM vote_sessions')
print(f'Votes restants : {cur.fetchone()[0]}')
conn.close()
print('Base nettoyée ✅')
"
```

### Via le dashboard Neon (interface web)

Aller sur [console.neon.tech](https://console.neon.tech), ouvrir l'éditeur SQL et exécuter :

```sql
DELETE FROM project_votes;
DELETE FROM ong_votes;
DELETE FROM vote_sessions;
```

---

## Checklist avant la soirée

### Préparation (J-7)
- [ ] Mettre à jour `data/projets.ts` avec les nouveaux projets et montants
- [ ] Mettre à jour `data/ong.ts` avec les nouveaux OBNLs
- [ ] Mettre à jour `VOTE_START` et `VOTE_END` dans `lib/vote-config.ts`
- [ ] Décaler les années dans `detectPromo()` (`app/api/auth/callback/route.ts`)
- [ ] Changer `ADMIN_SECRET` sur Vercel et Dokploy
- [ ] Changer `PRESENTIEL_PIN` sur Vercel et Dokploy
- [ ] Générer un nouveau `SESSION_SECRET` (`openssl rand -base64 32`)
- [ ] Mettre à jour `JDB_TOTAL_POOL` et `JDB_ONG_POOL` selon le budget
- [ ] Renouveler les credentials ViaRézo si nécessaire

### Le jour J (avant 17h)
- [ ] Vérifier que `VOTE_TEST_MODE=false` sur les deux plateformes
- [ ] **Supprimer tous les votes de test** (voir section ci-dessus)
- [ ] Tester un vote complet sur `jdb.forum-cs.fr` et `jdb2026.vercel.app`
- [ ] Tester le stand présentiel avec le nouveau PIN
- [ ] Tester l'export Excel via `/api/admin/export?token=ADMIN_SECRET`
- [ ] Tester le backup local (`bash scripts/backup.sh`)
- [ ] Communiquer le PIN et le lien `/admin/presentiel` aux staffers des stands
- [ ] Ouvrir l'onglet `/admin` pour surveiller les votes en temps réel

### Après la soirée
- [ ] Télécharger le backup final (`bash scripts/backup.sh`)
- [ ] Exporter l'Excel final depuis `/api/admin/export`
- [ ] Archiver les résultats dans le repo (`JDB20XX_Resultats_Finaux.xlsx`)
- [ ] Pousser tous les commits sur GitHub

---

*Plateforme développée pour le Forum CentraleSupélec — JdB 2026*  
*Contact : jennifer.farah@forum-cs.fr*
