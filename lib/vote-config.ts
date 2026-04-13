export const VOTE_START = new Date('2026-04-28T15:30:00.000Z') // 17h30 CEST
export const VOTE_END   = new Date('2026-04-28T19:00:00.000Z') // 21h00 CEST

export type PromoType = 'P2027' | 'P2028' | 'P2029' | 'Bachelor' | 'Other'
export type VoterCategory = 'ingenieur' | 'bachelor' | 'other'

export const VOTER_WEIGHTS: Record<'ingenieur' | 'bachelor', number[]> = {
  ingenieur: [5, 4, 3, 2, 1],
  bachelor:  [3, 2, 1],
}

export const ONG_WEIGHTS = [3, 2, 1]

export function promoToCategory(promo: PromoType): VoterCategory {
  if (promo === 'P2027' || promo === 'P2028' || promo === 'P2029') return 'ingenieur'
  if (promo === 'Bachelor') return 'bachelor'
  return 'other'
}

// Set VOTE_TEST_MODE=true in .env.local to bypass the vote window during dev/testing
const TEST_MODE = process.env.VOTE_TEST_MODE === 'true'

export function isVoteOpen(now = new Date()): boolean {
  if (TEST_MODE) return true
  return now >= VOTE_START && now <= VOTE_END
}

export function getVoteStatus(now = new Date()): 'before' | 'open' | 'closed' {
  if (TEST_MODE) return 'open'
  if (now < VOTE_START) return 'before'
  if (now <= VOTE_END) return 'open'
  return 'closed'
}
