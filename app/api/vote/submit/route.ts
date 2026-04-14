import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session-store'
import { voteStore } from '@/lib/vote-store'
import {
  isVoteOpen, promoToCategory, VOTER_WEIGHTS, ONG_WEIGHTS,
  type PromoType
} from '@/lib/vote-config'
import { projets } from '@/data/projets'
import { ongs } from '@/data/ong'
import { randomBytes } from 'crypto'

// Whitelists built once at module load — cannot be spoofed by client
const VALID_PROJECT_IDS = new Set(projets.map(p => p.id))
const VALID_ONG_IDS     = new Set(ongs.map(o => o.id))

interface SubmitBody {
  projectRanking: string[]  // ordered project IDs, first = 1st choice
  ongRanking:     string[]  // ordered ONG IDs, first = 1st choice (max 3)
  // NOTE: promo is intentionally NOT accepted from the client.
  // It is read from the server-side signed session cookie only.
}

export async function POST(req: NextRequest) {
  // 0. CSRF — reject requests not originating from our own origin
  const origin   = req.headers.get('origin')
  const appOrigin = process.env.NEXT_PUBLIC_URL ?? process.env.NEXTAUTH_URL ?? ''
  if (origin && appOrigin && origin !== appOrigin) {
    return NextResponse.json({ error: 'Requête non autorisée.' }, { status: 403 })
  }

  // 1. Authenticate — session is HMAC-signed, cannot be forged
  const session = getSessionFromRequest(req)
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié. Connectez-vous via ViaRézo.' }, { status: 401 })
  }

  // 2. Vote window check (server-side, not bypassable by client)
  if (!isVoteOpen()) {
    return NextResponse.json({ error: 'Les votes ne sont pas encore ouverts ou sont fermés.' }, { status: 403 })
  }

  // 3. Already voted?
  if (await voteStore.hasVoted(session.sub)) {
    return NextResponse.json({ error: 'Vous avez déjà voté. Un seul vote par compte.' }, { status: 409 })
  }

  // 4. Read promo FROM SESSION — never from request body
  //    The session was written server-side by the OIDC callback after ViaRézo verified the identity.
  const promo = (session.promo ?? 'Other') as PromoType
  const category = promoToCategory(promo)

  if (category === 'other') {
    return NextResponse.json({
      error: 'Le vote en ligne est réservé aux promotions P2027, P2028, P2029 et Bachelor. Merci de voter en présentiel.'
    }, { status: 403 })
  }

  // 5. Parse body
  let body: SubmitBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 })
  }

  const { projectRanking, ongRanking } = body

  // 6. Validate project choices
  const maxProjects = category === 'ingenieur' ? 5 : 3
  const weights = VOTER_WEIGHTS[category]

  if (!Array.isArray(projectRanking) || projectRanking.length === 0) {
    return NextResponse.json({ error: 'Vous devez sélectionner au moins 1 projet.' }, { status: 400 })
  }
  if (projectRanking.length > maxProjects) {
    return NextResponse.json({ error: `Maximum ${maxProjects} projets pour votre promotion.` }, { status: 400 })
  }
  if (new Set(projectRanking).size !== projectRanking.length) {
    return NextResponse.json({ error: 'Projets dupliqués dans votre classement.' }, { status: 400 })
  }
  // Verify every submitted project ID actually exists — prevents fake ID injection
  const invalidProject = projectRanking.find(id => typeof id !== 'string' || !VALID_PROJECT_IDS.has(id))
  if (invalidProject !== undefined) {
    return NextResponse.json({ error: 'Un ou plusieurs IDs de projets sont invalides.' }, { status: 400 })
  }

  // 7. Validate ONG choices (max 3)
  const rawOng = Array.isArray(ongRanking) ? ongRanking : []
  const validOngRanking = rawOng.slice(0, 3)
  if (new Set(validOngRanking).size !== validOngRanking.length) {
    return NextResponse.json({ error: 'ONGs dupliquées dans votre classement.' }, { status: 400 })
  }
  // Verify every submitted ONG ID actually exists
  const invalidOng = validOngRanking.find(id => typeof id !== 'string' || !VALID_ONG_IDS.has(id))
  if (invalidOng !== undefined) {
    return NextResponse.json({ error: 'Un ou plusieurs IDs d\'ONGs sont invalides.' }, { status: 400 })
  }

  // 8. Build vote record
  const voteSession = {
    id: randomBytes(16).toString('hex'),
    viarezоSub:    session.sub,
    prenom:        session.prenom,
    nom:           session.nom ?? '',
    email:         session.email ?? '',
    promoType:     promo,
    voterCategory: category,
    votedAt:       new Date().toISOString(),
    projectVotes: projectRanking.map((id, i) => ({
      projectId: id,
      rank:      i + 1,
      weight:    weights[i],
    })),
    ongVotes: validOngRanking.map((id, i) => ({
      ongId:  id,
      rank:   i + 1,
      weight: ONG_WEIGHTS[i],
    })),
  }

  // 9. Store — unique constraint on viarezo_sub handles race conditions atomically at DB level
  try {
    await voteStore.addVote(voteSession)
  } catch (err: unknown) {
    // Postgres unique constraint violation (23505) = double-vote caught at DB level
    if (err instanceof Error && (err.message.includes('23505') || err.message.includes('unique'))) {
      return NextResponse.json({ error: 'Vous avez déjà voté.' }, { status: 409 })
    }
    console.error('Vote store error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'Vote enregistré avec succès !',
    projectCount: projectRanking.length,
    ongCount:     validOngRanking.length,
    totalVoix:    weights.slice(0, projectRanking.length).reduce((a, b) => a + b, 0),
  })
}
