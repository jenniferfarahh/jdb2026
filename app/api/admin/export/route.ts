import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { voteSessions, projectVotes, ongVotes } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { projets } from '@/data/projets'
import { ongs } from '@/data/ong'

export async function GET(req: NextRequest) {
  // Auth: Bearer token OR ?token= query param (for direct URL access)
  const auth    = req.headers.get('authorization') ?? ''
  const qtoken  = new URL(req.url).searchParams.get('token') ?? ''
  const secret  = process.env.ADMIN_SECRET ?? ''
  if (!secret || (auth !== `Bearer ${secret}` && qtoken !== secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sessions = await db.select().from(voteSessions).orderBy(asc(voteSessions.votedAt))

  // Build CSV rows
  const maxProjects = 5
  const maxOngs     = 3
  const projectHeaders = Array.from({ length: maxProjects }, (_, i) => `Projet #${i+1},Poids Projet #${i+1}`).join(',')
  const ongHeaders     = Array.from({ length: maxOngs },     (_, i) => `OBNL #${i+1},Poids OBNL #${i+1}`).join(',')
  const header = `ID,Prénom,Nom,Email,Promo,Catégorie,Heure du vote,${projectHeaders},${ongHeaders}`

  const lines: string[] = [header]

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

    const escape = (v: string | null | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`

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

    const votedAt = s.votedAt ? new Date(s.votedAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) : ''

    lines.push([
      escape(s.id),
      escape(s.prenom),
      escape(s.nom),
      escape(s.email),
      escape(s.promoType),
      escape(s.voterCategory),
      escape(votedAt),
      projectCols,
      ongCols,
    ].join(','))
  }

  const csv = lines.join('\r\n')
  const filename = `jdb2026_votes_${new Date().toISOString().slice(0,10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
