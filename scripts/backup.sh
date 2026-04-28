#!/bin/bash
# JDB 2026 — Backup des votes
# Lance ce script dans le terminal :
#   bash /Users/jen/Desktop/jdb2026/scripts/backup.sh

REPO="/Users/jen/Desktop/jdb2026"
VENV="$REPO/.venv"
SCRIPT="$REPO/scripts/backup_votes.py"

# Recrée le venv si nécessaire (après redémarrage ou suppression)
if [ ! -f "$VENV/bin/python3" ]; then
  echo "⚙️  Création de l'environnement Python…"
  python3 -m venv "$VENV"
  echo "⚙️  Installation des dépendances…"
  "$VENV/bin/pip" install psycopg2-binary openpyxl -q
  echo "✅ Environnement prêt"
fi

# Lance le backup
"$VENV/bin/python3" "$SCRIPT"
