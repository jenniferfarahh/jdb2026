/**
 * JDB 2026 — Article 10: Capped Proportional Allocation
 *
 * Algorithm (iterative):
 *  Round N:
 *    1. Compute raw_share[i] = (votes[i] / Σvotes_uncapped) × remaining_pool
 *    2. Any project where raw_share[i] ≥ montant[i] is "capped" → gets exactly montant[i]
 *       The surplus (raw_share[i] − montant[i]) flows back into remaining_pool.
 *    3. Remove capped projects. Repeat with new remaining_pool and uncapped set.
 *  Final round (no new caps):
 *    Distribute remaining_pool proportionally. Floor each amount to the nearest cent
 *    (Article 10, footnote 5: "arrondis au centime d'euro par défaut").
 *
 *  Projects with 0 votes always receive 0.
 *  If every project hits its cap before the pool is exhausted, surplus stays unallocated
 *  (all associations have been fully funded — pool larger than total requested).
 */
export function allocateWithCap(
  items: { id: string; votes: number; montant: number }[],
  pool: number,
): Map<string, number> {
  const result = new Map<string, number>()

  // Projects with 0 votes get nothing immediately
  for (const p of items) {
    if (p.votes === 0) result.set(p.id, 0)
  }

  let remaining = pool
  let working   = items.filter(p => p.votes > 0)

  while (working.length > 0 && remaining > 0.005) {
    const totalVotes = working.reduce((s, p) => s + p.votes, 0)
    if (totalVotes === 0) break

    // Proportional shares for this round
    const shares = new Map(
      working.map(p => [p.id, (p.votes / totalVotes) * remaining])
    )

    // Find projects whose share meets or exceeds their requested montant
    const toCapNow = working.filter(p => (shares.get(p.id) ?? 0) >= p.montant)

    if (toCapNow.length === 0) {
      // No more caps in this round — final distribution, floor to cent
      for (const p of working) {
        const amount = Math.floor((shares.get(p.id) ?? 0) * 100) / 100
        result.set(p.id, amount)
      }
      remaining = 0
      break
    }

    // Award capped projects exactly their montant and free up the surplus
    for (const p of toCapNow) {
      result.set(p.id, p.montant)
      remaining -= p.montant
    }

    // Continue with only uncapped projects
    const cappedIds = new Set(toCapNow.map(p => p.id))
    working = working.filter(p => !cappedIds.has(p.id))
  }

  // Any projects still in working that were never assigned (remaining ≈ 0)
  for (const p of working) {
    if (!result.has(p.id)) result.set(p.id, 0)
  }

  return result
}

/**
 * Simple proportional allocation — used for ONGs (Article 13).
 * No cap applies. Floor to nearest cent.
 */
export function allocateProportional(
  items: { id: string; votes: number }[],
  pool: number,
): Map<string, number> {
  const result    = new Map<string, number>()
  const totalVotes = items.reduce((s, p) => s + p.votes, 0)

  for (const p of items) {
    const amount = totalVotes === 0
      ? 0
      : Math.floor((p.votes / totalVotes) * pool * 100) / 100
    result.set(p.id, amount)
  }

  return result
}
