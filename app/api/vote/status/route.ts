import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-store'
import { voteStore } from '@/lib/vote-store'
import { getVoteStatus } from '@/lib/vote-config'

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req)
  const voteStatus = getVoteStatus()

  if (!session) {
    return NextResponse.json({ authenticated: false, voteStatus })
  }

  const hasVoted = await voteStore.hasVoted(session.sub)

  return NextResponse.json({
    authenticated: true,
    hasVoted,
    voteStatus,
    prenom: session.prenom,
  })
}
