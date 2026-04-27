export interface ProjectInput {
  id: string
  name: string
  requestedAmount: number // montant demandé en €
  totalVotes: number      // total weighted votes received
}

export interface ProjectResult extends ProjectInput {
  allocated: number       // amount allocated after pro-rata + redistribution
  percentage: number      // share of total votes
}

/**
 * Article 10: Pro-rata allocation with cap + iterative redistribution.
 * Each vote = equal share of total pool.
 * No project can receive more than its requestedAmount.
 * Excess is redistributed to projects that didn't receive full funding.
 */
export function calculateAllocations(
  projects: ProjectInput[],
  totalPool: number
): ProjectResult[] {
  if (projects.length === 0 || totalPool <= 0) return []

  const totalVotes = projects.reduce((s, p) => s + p.totalVotes, 0)
  if (totalVotes === 0) return projects.map(p => ({ ...p, allocated: 0, percentage: 0 }))

  // Initialize results
  let results: ProjectResult[] = projects.map(p => ({
    ...p,
    allocated: 0,
    percentage: totalVotes > 0 ? (p.totalVotes / totalVotes) * 100 : 0,
  }))

  let remainingPool = totalPool
  let maxIterations = 50

  while (remainingPool > 0.005 && maxIterations-- > 0) {
    // Projects that still need more funding
    const needsFunding = results.filter(p => p.allocated < p.requestedAmount)
    if (needsFunding.length === 0) break

    const votesInPool = needsFunding.reduce((s, p) => s + p.totalVotes, 0)
    if (votesInPool === 0) break

    let distributed = 0
    let capped = false

    for (const project of needsFunding) {
      const share = (project.totalVotes / votesInPool) * remainingPool
      const canReceive = project.requestedAmount - project.allocated
      const give = Math.min(share, canReceive)
      project.allocated += give
      distributed += give
      if (give < share) capped = true
    }

    remainingPool -= distributed

    if (!capped) break // All got their pro-rata share, no capping happened
    remainingPool = Math.max(0, remainingPool)
  }

  // Round to cents
  return results
    .map(p => ({ ...p, allocated: Math.floor(p.allocated * 100) / 100 }))
    .sort((a, b) => b.totalVotes - a.totalVotes)
}
