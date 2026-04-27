import { NextRequest, NextResponse } from 'next/server'
import { voteStore } from '@/lib/vote-store'
import { calculateAllocations } from '@/lib/vote-calculator'
import { projets } from '@/data/projets'
import { ongs } from '@/data/ong'

export async function GET(req: NextRequest) {
  // Admin protection
  const token = req.headers.get('x-admin-token') ?? req.nextUrl.searchParams.get('token')
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const projectTotals = await voteStore.aggregateProjectVotes()
  const ongTotals     = await voteStore.aggregateOngVotes()
  const stats         = await voteStore.stats()

  // Total pool — set via env var
  const totalPool = Number(process.env.JDB_TOTAL_POOL ?? 35000)
  const ongPool   = Number(process.env.JDB_ONG_POOL ?? 5000)

  // Build project inputs
  const projectInputs = projets.map(p => ({
    id: p.id,
    name: p.name,
    requestedAmount: p.montant,
    totalVotes: projectTotals.get(p.id) ?? 0,
  }))

  // Build ONG inputs — distribute ONG pool equally as cap per ONG
  const ongInputs = ongs.map(o => ({
    id: o.id,
    name: o.name,
    requestedAmount: ongPool / ongs.length,
    totalVotes: ongTotals.get(o.id) ?? 0,
  }))

  const projectResults = calculateAllocations(projectInputs, totalPool)
  const ongResults     = calculateAllocations(ongInputs, ongPool)

  return NextResponse.json({
    stats,
    totalPool,
    ongPool,
    projects: projectResults,
    ongsResults: ongResults,
    generatedAt: new Date().toISOString(),
  })
}
