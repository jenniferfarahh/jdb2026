#!/usr/bin/env python3
"""
JDB 2026 — Backup des votes
Lance ce script à tout moment pour sauvegarder les votes depuis Neon Postgres.
Les fichiers CSV sont sauvegardés dans ~/Downloads.

Usage:
    /tmp/jdb_venv/bin/python3 /Users/jen/Desktop/jdb2026/scripts/backup_votes.py

Si l'environnement virtuel n'existe pas encore :
    python3 -m venv /tmp/jdb_venv && /tmp/jdb_venv/bin/pip install psycopg2-binary -q
"""

import psycopg2, re, csv, sys
from datetime import datetime
from pathlib import Path

DB_URL       = "postgresql://neondb_owner:npg_XhT4uRDQiaI9@ep-late-tree-amb2gnev-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
POOL_PROJETS = 35000
POOL_ONBS    = 5000
DOWNLOADS    = Path.home() / "Downloads"
REPO         = Path(__file__).parent.parent

def load_projects():
    content = (REPO / "data" / "projets.ts").read_text()
    out = {}
    for m in re.finditer(r"\{\s*id:'([^']+)',\s*name:'([^']+)'.*?montant:(\d+)", content, re.DOTALL):
        out[m.group(1)] = {"name": m.group(2), "montant": int(m.group(3))}
    return out

def load_ongs():
    content = (REPO / "data" / "ong.ts").read_text()
    out = {}
    for m in re.finditer(r"id:\s*['\"]([^'\"]+)['\"].*?name:\s*['\"]([^'\"]+)['\"]", content, re.DOTALL):
        out[m.group(1)] = m.group(2)
    return out

def main():
    print("🔌 Connexion à Neon Postgres…")
    try:
        conn = psycopg2.connect(DB_URL)
    except Exception as e:
        print(f"❌ Erreur de connexion : {e}")
        sys.exit(1)

    cur = conn.cursor()
    projects = load_projects()
    ongs     = load_ongs()
    ts       = datetime.now().strftime("%Y-%m-%d_%H%M")

    # ── Votes individuels ─────────────────────────────────────────────────────
    cur.execute("SELECT id, prenom, nom, email, promo_type, voter_category, voted_at FROM vote_sessions ORDER BY voted_at")
    sessions = cur.fetchall()

    header1 = [
        "Prénom","Nom","Email","Promo","Catégorie","Heure du vote",
        "Projet #1","Poids #1","Projet #2","Poids #2","Projet #3","Poids #3",
        "Projet #4","Poids #4","Projet #5","Poids #5",
        "OBNL #1","Poids #1","OBNL #2","Poids #2","OBNL #3","Poids #3",
    ]
    rows1 = []
    for sid, prenom, nom, email, promo, cat, voted_at in sessions:
        cur.execute("SELECT rank, project_id, weight FROM project_votes WHERE session_id=%s ORDER BY rank", (sid,))
        pvotes = {r: (p, w) for r, p, w in cur.fetchall()}
        cur.execute("SELECT rank, ong_id, weight FROM ong_votes WHERE session_id=%s ORDER BY rank", (sid,))
        ovotes = {r: (o, w) for r, o, w in cur.fetchall()}

        row = [prenom, nom, email or "", promo, cat,
               voted_at.strftime("%d/%m/%Y %H:%M") if voted_at else ""]
        for i in range(1, 6):
            if i in pvotes:
                pid, w = pvotes[i]
                row += [projects.get(pid, {}).get("name", pid), w]
            else:
                row += ["", ""]
        for i in range(1, 4):
            if i in ovotes:
                oid, w = ovotes[i]
                row += [ongs.get(oid, oid), w]
            else:
                row += ["", ""]
        rows1.append(row)

    path1 = DOWNLOADS / f"JDB2026_Votes_{ts}.csv"
    with open(path1, "w", newline="", encoding="utf-8-sig") as f:
        csv.writer(f).writerows([header1] + rows1)
    print(f"✅ {len(rows1)} votes  →  {path1}")

    # ── Résultats ─────────────────────────────────────────────────────────────
    cur.execute("SELECT project_id, SUM(weight), COUNT(*) FROM project_votes GROUP BY project_id ORDER BY SUM(weight) DESC")
    proj_scores   = cur.fetchall()
    total_proj_pts = sum(r[1] for r in proj_scores)

    cur.execute("SELECT ong_id, SUM(weight), COUNT(*) FROM ong_votes GROUP BY ong_id ORDER BY SUM(weight) DESC")
    ong_scores    = cur.fetchall()
    total_ong_pts  = sum(r[1] for r in ong_scores)

    cur.execute("SELECT COUNT(*) FROM vote_sessions")
    total_voters = cur.fetchone()[0]

    path2 = DOWNLOADS / f"JDB2026_Resultats_{ts}.csv"
    with open(path2, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["STATISTIQUES"])
        w.writerow(["Total votants", total_voters])
        cur.execute("SELECT voter_category, COUNT(*) FROM vote_sessions GROUP BY voter_category ORDER BY voter_category")
        for cat, count in cur.fetchall():
            w.writerow([f"  {cat}", count])
        w.writerow([])
        w.writerow(["CLASSEMENT PROJETS", f"Pool: {POOL_PROJETS} €"])
        w.writerow(["Classement","Projet","Points","Part (%)","Montant alloué (€)","Montant demandé (€)","Nb votants"])
        for i, (pid, pts, nb) in enumerate(proj_scores, 1):
            meta  = projects.get(pid, {})
            part  = pts / total_proj_pts if total_proj_pts else 0
            w.writerow([i, meta.get("name", pid), pts, f"{part*100:.1f}%",
                        round(part * POOL_PROJETS), meta.get("montant", 0), nb])
        w.writerow([])
        w.writerow(["CLASSEMENT OBNLs", f"Pool: {POOL_ONBS} €"])
        w.writerow(["Classement","OBNL","Points","Part (%)","Montant alloué (€)","Nb votants"])
        for i, (oid, pts, nb) in enumerate(ong_scores, 1):
            part  = pts / total_ong_pts if total_ong_pts else 0
            w.writerow([i, ongs.get(oid, oid), pts, f"{part*100:.1f}%",
                        round(part * POOL_ONBS), nb])

    print(f"✅ Résultats       →  {path2}")
    conn.close()

if __name__ == "__main__":
    main()
