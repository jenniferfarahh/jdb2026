import { NextResponse } from 'next/server'
import { voteStore } from '@/lib/vote-store'
import { projets } from '@/data/projets'
import { ongs } from '@/data/ong'
import { getVoteStatus } from '@/lib/vote-config'
import { allocateWithCap, allocateProportional } from '@/lib/allocation'

// ── Money pools ──────────────────────────────────────────────────────────────
const POOL_PROJETS = 35_000   // € allocated to associations (Article 10)
const POOL_ONGS    =  5_000   // € allocated to ONGs         (Article 13)

export const dynamic  = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const [projectWeights, ongWeights, stats] = await Promise.all([
      voteStore.aggregateProjectVotes(),
      voteStore.aggregateOngVotes(),
      voteStore.stats(),
    ])

    // ── Total vote weights ────────────────────────────────────────────────────
    const totalProjectWeight = [...projectWeights.values()].reduce((a, b) => a + b, 0)
    const totalOngWeight     = [...ongWeights.values()].reduce((a, b) => a + b, 0)

    // ── Capped proportional allocation for projects (Article 10) ─────────────
    //
    //  Each project can receive at most its requested `montant`.
    //  If a project's proportional share exceeds its montant, the surplus is
    //  redistributed proportionally to the remaining under-funded projects.
    //  This repeats until no project is over its cap.
    //
    const projectItems = projets.map(p => ({
      id:     p.id,
      votes:  projectWeights.get(p.id) ?? 0,
      montant: p.montant,
    }))

    const projectAmounts = allocateWithCap(projectItems, POOL_PROJETS)

    // ── Simple proportional allocation for ONGs (Article 13) ─────────────────
    const ongItems = ongs.map(o => ({
      id:    o.id,
      votes: ongWeights.get(o.id) ?? 0,
    }))

    const ongAmounts = allocateProportional(ongItems, POOL_ONGS)

    // ── Build result arrays ───────────────────────────────────────────────────
    const projectResults = projets.map(p => {
      const votes  = projectWeights.get(p.id) ?? 0
      const amount = projectAmounts.get(p.id)  ?? 0
      const share  = totalProjectWeight > 0
        ? Math.round((votes / totalProjectWeight) * 10000) / 100   // vote % (2 decimals)
        : 0
      return {
        id:       p.id,
        name:     p.name,
        asso:     p.asso,
        category: p.category,
        vital:    p.vital,
        color:    p.color,
        montant:  p.montant,    // requested amount — for cap display
        votes,
        share,
        amount,
        capped: amount === p.montant && votes > 0,  // true if hit the cap
      }
    }).sort((a, b) => b.votes - a.votes)

    const ongResults = ongs.map(o => {
      const votes  = ongWeights.get(o.id) ?? 0
      const amount = ongAmounts.get(o.id) ?? 0
      const share  = totalOngWeight > 0
        ? Math.round((votes / totalOngWeight) * 10000) / 100
        : 0
      return {
        id:      o.id,
        name:    o.name,
        logo:    o.logo,
        color:   o.color,
        tagline: o.tagline,
        votes,
        share,
        amount,
      }
    }).sort((a, b) => b.votes - a.votes)

    // ── Pool summaries ────────────────────────────────────────────────────────
    const allocatedProjets = projectResults.reduce((s, p) => s + p.amount, 0)
    const allocatedOngs    = ongResults.reduce((s, o) => s + o.amount, 0)

    return NextResponse.json({
      updatedAt:  new Date().toISOString(),
      voteStatus: getVoteStatus(),
      voters:     stats,
      pools: {
        projets: { total: POOL_PROJETS, allocated: Math.round(allocatedProjets * 100) / 100 },
        ongs:    { total: POOL_ONGS,    allocated: Math.round(allocatedOngs    * 100) / 100 },
      },
      totalProjectWeight,
      totalOngWeight,
      projets: projectResults,
      ongs:    ongResults,
    })
  } catch (err) {
    console.error('[dashboard] DB error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
