import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { voteSessions, projectVotes, ongVotes } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.ADMIN_SECRET ?? ''
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sessions = await db.select().from(voteSessions).orderBy(asc(voteSessions.votedAt))

  const result = await Promise.all(sessions.map(async (s) => {
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
    return {
      id: s.id,
      prenom: s.prenom,
      promoType: s.promoType,
      voterCategory: s.voterCategory,
      votedAt: s.votedAt,
      projectVotes: pVotes,
      ongVotes: oVotes,
    }
  }))

  return NextResponse.json({ total: result.length, votes: result })
}
