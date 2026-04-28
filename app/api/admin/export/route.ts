import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { voteSessions, projectVotes, ongVotes } from '@/lib/db/schema'
import { eq, asc, sql } from 'drizzle-orm'
import { projets } from '@/data/projets'
import { ongs } from '@/data/ong'

const POOL_PROJETS = Number(process.env.JDB_TOTAL_POOL ?? 35000)
const POOL_ONBS    = Number(process.env.JDB_ONG_POOL   ?? 5000)

export async function GET(req: NextRequest) {
  const auth   = req.headers.get('authorization') ?? ''
  const qtoken = new URL(req.url).searchParams.get('token') ?? ''
  const secret = process.env.ADMIN_SECRET ?? ''
  if (!secret || (auth !== `Bearer ${secret}` && qtoken !== secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const escape = (v: string | number | null | undefined) =>
    `"${String(v ?? '').replace(/"/g, '""')}"`

  // ── Section 1 : votes individuels ─────────────────────────────────────────
  const sessions = await db.select().from(voteSessions).orderBy(asc(voteSessions.votedAt))

  const maxProjects = 5
  const maxOngs     = 3
  const projectHeaders = Array.from({ length: maxProjects }, (_, i) => `Projet #${i+1},Poids Projet #${i+1}`).join(',')
  const ongHeaders     = Array.from({ length: maxOngs },     (_, i) => `OBNL #${i+1},Poids OBNL #${i+1}`).join(',')

  const lines: string[] = [
    `ID,Prénom,Nom,Email,Promo,Catégorie,Heure du vote,${projectHeaders},${ongHeaders}`,
  ]

  for (const s of sessions) {
    const pVotes = await db
      .select({ projectId: projectVotes.projectId, rank: projectVotes.rank, weight: projectVotes.weight })
      .from(projectVotes)
      .where(eq(projectVotes.sessionId, s.id))
      .orderBy(asc(projectVotes.rank))

    const oVotes = await db
      .select({ ongId: ongVotes.ongId, rank: ongVotes.rank, weight: ongVotes.weight })
      .from(ongVotes)
      .where(eq(ongVotes.sessionId, s.id))
      .orderBy(asc(ongVotes.rank))

    const projectCols = Array.from({ length: maxProjects }, (_, i) => {
      const pv = pVotes.find(p => p.rank === i + 1)
      if (!pv) return ','
      const name = projets.find(p => p.id === pv.projectId)?.name ?? pv.projectId
      return `${escape(name)},${pv.weight}`
    }).join(',')

    const ongCols = Array.from({ length: maxOngs }, (_, i) => {
      const ov = oVotes.find(o => o.rank === i + 1)
      if (!ov) return ','
      const name = ongs.find(o => o.id === ov.ongId)?.name ?? ov.ongId
      return `${escape(name)},${ov.weight}`
    }).join(',')

    const votedAt = s.votedAt
      ? new Date(s.votedAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })
      : ''

    lines.push([
      escape(s.id), escape(s.prenom), escape(s.nom), escape(s.email),
      escape(s.promoType), escape(s.voterCategory), escape(votedAt),
      projectCols, ongCols,
    ].join(','))
  }

  // ── Section 2 : classement projets ────────────────────────────────────────
  const projScores = await db
    .select({
      projectId: projectVotes.projectId,
      totalPts:  sql<number>`cast(sum(${projectVotes.weight}) as int)`,
      nbVotes:   sql<number>`cast(count(*) as int)`,
    })
    .from(projectVotes)
    .groupBy(projectVotes.projectId)
    .orderBy(sql`sum(${projectVotes.weight}) desc`)

  const totalProjPts = projScores.reduce((s, r) => s + r.totalPts, 0)

  lines.push('')
  lines.push(`CLASSEMENT PROJETS,,,,,,`)
  lines.push(`Classement,Projet,Points,Part (%),Montant alloué (€),Montant demandé (€),Nb votants`)
  projScores.forEach((r, i) => {
    const meta  = projets.find(p => p.id === r.projectId)
    const name  = meta?.name ?? r.projectId
    const part  = totalProjPts > 0 ? (r.totalPts / totalProjPts) : 0
    const alloc = Math.round(part * POOL_PROJETS)
    const dem   = meta?.montant ?? 0
    lines.push(`${i + 1},${escape(name)},${r.totalPts},${(part * 100).toFixed(1)}%,${alloc},${dem},${r.nbVotes}`)
  })

  // ── Section 3 : classement OBNLs ──────────────────────────────────────────
  const ongScores = await db
    .select({
      ongId:    ongVotes.ongId,
      totalPts: sql<number>`cast(sum(${ongVotes.weight}) as int)`,
      nbVotes:  sql<number>`cast(count(*) as int)`,
    })
    .from(ongVotes)
    .groupBy(ongVotes.ongId)
    .orderBy(sql`sum(${ongVotes.weight}) desc`)

  const totalOngPts = ongScores.reduce((s, r) => s + r.totalPts, 0)

  lines.push('')
  lines.push(`CLASSEMENT OBNLs,,,,,`)
  lines.push(`Classement,OBNL,Points,Part (%),Montant alloué (€),Nb votants`)
  ongScores.forEach((r, i) => {
    const name  = ongs.find(o => o.id === r.ongId)?.name ?? r.ongId
    const part  = totalOngPts > 0 ? (r.totalPts / totalOngPts) : 0
    const alloc = Math.round(part * POOL_ONBS)
    lines.push(`${i + 1},${escape(name)},${r.totalPts},${(part * 100).toFixed(1)}%,${alloc},${r.nbVotes}`)
  })

  const csv      = lines.join('\r\n')
  const filename = `jdb2026_export_${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
