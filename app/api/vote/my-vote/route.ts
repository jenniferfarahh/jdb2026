import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-store'
import { voteStore } from '@/lib/vote-store'

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req)
  if (!session?.sub) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }
  const vote = await voteStore.getVote(session.sub)
  if (!vote) {
    return NextResponse.json({ error: 'Aucun vote trouvé' }, { status: 404 })
  }
  return NextResponse.json(vote)
}
