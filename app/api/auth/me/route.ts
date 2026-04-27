import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-store'
import { voteStore } from '@/lib/vote-store'
import { promoToCategory } from '@/lib/vote-config'

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req)
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const hasVoted  = await voteStore.hasVoted(session.sub)
  const promo     = session.promo ?? 'Other'
  const category  = promoToCategory(promo as 'P2027' | 'P2028' | 'P2029' | 'Bachelor' | 'Other')
  const eligible  = category === 'ingenieur'  // Art. 9: P2027 + P2028 uniquement

  return NextResponse.json({
    authenticated: true,
    prenom:   session.prenom,
    nom:      session.nom,
    email:    session.email,
    promo,        // 'P2027' | 'P2028' | 'Bachelor' | 'Other'
    category,     // 'ingenieur' | 'bachelor' | 'other'
    eligible,     // false if not allowed to vote online
    hasVoted,
  })
}
