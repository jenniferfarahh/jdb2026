import { db } from './db'
import { voteSessions, projectVotes, ongVotes } from './db/schema'
import { eq, sql as drizzleSql } from 'drizzle-orm'
import { createHash } from 'crypto'
import type { PromoType, VoterCategory } from './vote-config'

export interface VoteSession {
  id: string
  viarezоSub: string       // unique ViaRézo sub claim (OIDC identity)
  prenom: string
  promoType: PromoType
  voterCategory: VoterCategory
  votedAt: string          // ISO timestamp
  projectVotes: { projectId: string; rank: number; weight: number }[]
  ongVotes:     { ongId: string;     rank: number; weight: number }[]
}

export const voteStore = {
  async hasVoted(sub: string): Promise<boolean> {
    const rows = await db
      .select({ id: voteSessions.id })
      .from(voteSessions)
      .where(eq(voteSessions.viarezоSub, sub))
      .limit(1)
    return rows.length > 0
  },

  async addVote(session: VoteSession): Promise<void> {
    await db.transaction(async (tx) => {
      // INSERT the session — unique constraint on viarezo_sub prevents duplicates atomically
      const [inserted] = await tx.insert(voteSessions).values({
        viarezоSub:    session.viarezоSub,
        prenom:        session.prenom,
        promoType:     session.promoType,
        voterCategory: session.voterCategory,
      }).returning({ id: voteSessions.id })

      // Insert project votes
      if (session.projectVotes.length > 0) {
        await tx.insert(projectVotes).values(
          session.projectVotes.map(v => ({
            sessionId: inserted.id,
            projectId: v.projectId,
            rank:      v.rank,
            weight:    v.weight,
          }))
        )
      }

      // Insert ONG votes
      if (session.ongVotes.length > 0) {
        await tx.insert(ongVotes).values(
          session.ongVotes.map(v => ({
            sessionId: inserted.id,
            ongId:     v.ongId,
            rank:      v.rank,
            weight:    v.weight,
          }))
        )
      }
    })
  },

  async aggregateProjectVotes(): Promise<Map<string, number>> {
    const rows = await db
      .select({
        projectId: projectVotes.projectId,
        total: drizzleSql<number>`sum(${projectVotes.weight})::int`,
      })
      .from(projectVotes)
      .groupBy(projectVotes.projectId)

    return new Map(rows.map(r => [r.projectId, r.total]))
  },

  async aggregateOngVotes(): Promise<Map<string, number>> {
    const rows = await db
      .select({
        ongId:  ongVotes.ongId,
        total:  drizzleSql<number>`sum(${ongVotes.weight})::int`,
      })
      .from(ongVotes)
      .groupBy(ongVotes.ongId)

    return new Map(rows.map(r => [r.ongId, r.total]))
  },

  async stats(): Promise<{ total: number; byCategory: Record<string, number> }> {
    const rows = await db
      .select({
        voterCategory: voteSessions.voterCategory,
        count: drizzleSql<number>`count(*)::int`,
      })
      .from(voteSessions)
      .groupBy(voteSessions.voterCategory)

    const byCategory: Record<string, number> = {}
    let total = 0
    for (const r of rows) {
      byCategory[r.voterCategory] = r.count
      total += r.count
    }
    return { total, byCategory }
  },
}

export function hashSub(sub: string) {
  return createHash('sha256').update(sub).digest('hex').slice(0, 16)
}
