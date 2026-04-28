import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { voteSessions, projectVotes, ongVotes } from '@/lib/db/schema'
import { eq, asc, sql } from 'drizzle-orm'
import { projets } from '@/data/projets'
import { ongs } from '@/data/ong'
import * as XLSX from 'xlsx'

const POOL_PROJETS = Number(process.env.JDB_TOTAL_POOL ?? 35000)
const POOL_ONBS    = Number(process.env.JDB_ONG_POOL   ?? 5000)

export async function GET(req: NextRequest) {
  const auth   = req.headers.get('authorization') ?? ''
  const qtoken = new URL(req.url).searchParams.get('token') ?? ''
  const secret = process.env.ADMIN_SECRET ?? ''
  if (!secret || (auth !== `Bearer ${secret}` && qtoken !== secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Onglet 1 : Votes individuels ──────────────────────────────────────────
  const sessions = await db.select().from(voteSessions).orderBy(asc(voteSessions.votedAt))

  const votesRows: (string | number)[][] = [[
    'Prénom','Nom','Email','Promo','Catégorie','Heure du vote',
    'Projet #1','Poids #1','Projet #2','Poids #2','Projet #3','Poids #3',
    'Projet #4','Poids #4','Projet #5','Poids #5',
    'OBNL #1','Poids #1','OBNL #2','Poids #2','OBNL #3','Poids #3',
  ]]

  for (const s of sessions) {
    const pVotes = await db
      .select({ projectId: projectVotes.projectId, rank: projectVotes.rank, weight: projectVotes.weight })
      .from(projectVotes).where(eq(projectVotes.sessionId, s.id)).orderBy(asc(projectVotes.rank))
    const oVotes = await db
      .select({ ongId: ongVotes.ongId, rank: ongVotes.rank, weight: ongVotes.weight })
      .from(ongVotes).where(eq(ongVotes.sessionId, s.id)).orderBy(asc(ongVotes.rank))

    const row: (string | number)[] = [
      s.prenom ?? '', s.nom ?? '', s.email ?? '', s.promoType ?? '', s.voterCategory ?? '',
      s.votedAt ? new Date(s.votedAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) : '',
    ]
    for (let i = 1; i <= 5; i++) {
      const pv = pVotes.find(p => p.rank === i)
      row.push(pv ? (projets.find(p => p.id === pv.projectId)?.name ?? pv.projectId) : '')
      row.push(pv ? pv.weight : '')
    }
    for (let i = 1; i <= 3; i++) {
      const ov = oVotes.find(o => o.rank === i)
      row.push(ov ? (ongs.find(o => o.id === ov.ongId)?.name ?? ov.ongId) : '')
      row.push(ov ? ov.weight : '')
    }
    votesRows.push(row)
  }

  // ── Onglet 2 : Résultats ──────────────────────────────────────────────────
  const projScores = await db
    .select({
      projectId: projectVotes.projectId,
      totalPts:  sql<number>`cast(sum(${projectVotes.weight}) as int)`,
      nbVotes:   sql<number>`cast(count(*) as int)`,
    })
    .from(projectVotes).groupBy(projectVotes.projectId)
    .orderBy(sql`sum(${projectVotes.weight}) desc`)

  const ongScores = await db
    .select({
      ongId:    ongVotes.ongId,
      totalPts: sql<number>`cast(sum(${ongVotes.weight}) as int)`,
      nbVotes:  sql<number>`cast(count(*) as int)`,
    })
    .from(ongVotes).groupBy(ongVotes.ongId)
    .orderBy(sql`sum(${ongVotes.weight}) desc`)

  const totalProjPts = projScores.reduce((s, r) => s + r.totalPts, 0)
  const totalOngPts  = ongScores.reduce((s, r) => s + r.totalPts, 0)

  const resultsRows: (string | number)[][] = []

  // Stats
  const totalVoters = sessions.length
  const byCategory: Record<string, number> = {}
  for (const s of sessions) byCategory[s.voterCategory ?? ''] = (byCategory[s.voterCategory ?? ''] ?? 0) + 1

  resultsRows.push(['STATISTIQUES', ''])
  resultsRows.push(['Total votants', totalVoters])
  for (const [cat, count] of Object.entries(byCategory).sort()) {
    resultsRows.push([`  ${cat}`, count])
  }
  resultsRows.push(['', ''])

  // Projets
  resultsRows.push([`CLASSEMENT PROJETS — Pool: ${POOL_PROJETS} €`, '', '', '', '', ''])
  resultsRows.push(['Classement','Projet','Points','Part (%)','Montant alloué (€)','Montant demandé (€)','Nb votants'])
  for (let i = 0; i < projScores.length; i++) {
    const { projectId, totalPts, nbVotes } = projScores[i]
    const meta  = projets.find(p => p.id === projectId)
    const part  = totalProjPts > 0 ? totalPts / totalProjPts : 0
    resultsRows.push([
      i + 1, meta?.name ?? projectId, totalPts,
      `${(part * 100).toFixed(1)}%`,
      Math.round(part * POOL_PROJETS),
      meta?.montant ?? 0,
      nbVotes,
    ])
  }
  resultsRows.push(['', ''])

  // OBNLs
  resultsRows.push([`CLASSEMENT OBNLs — Pool: ${POOL_ONBS} €`, '', '', '', ''])
  resultsRows.push(['Classement','OBNL','Points','Part (%)','Montant alloué (€)','Nb votants'])
  for (let i = 0; i < ongScores.length; i++) {
    const { ongId, totalPts, nbVotes } = ongScores[i]
    const ong  = ongs.find(o => o.id === ongId)
    const part = totalOngPts > 0 ? totalPts / totalOngPts : 0
    resultsRows.push([
      i + 1, ong?.name ?? ongId, totalPts,
      `${(part * 100).toFixed(1)}%`,
      Math.round(part * POOL_ONBS),
      nbVotes,
    ])
  }

  // ── Build .xlsx ────────────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(votesRows),   'Votes')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resultsRows), 'Résultats')

  const buf      = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const filename = `JDB2026_Export_${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
