import { NextRequest, NextResponse } from 'next/server'
import { voteStore } from '@/lib/vote-store'
import { projets } from '@/data/projets'
import { ongs } from '@/data/ong'
import { isVoteOpen } from '@/lib/vote-config'
import { randomBytes } from 'crypto'

const VALID_PROJECT_IDS = new Set(projets.map(p => p.id))
const VALID_ONG_IDS     = new Set(ongs.map(o => o.id))

const INGENIEUR_WEIGHTS = [5, 4, 3, 2, 1]
const BACHELOR_WEIGHTS  = [3, 2, 1]
const ONG_WEIGHTS       = [3, 2, 1]

export function normalizeKey(nom: string, prenom: string): string {
  const n = (s: string) =>
    s.toUpperCase()
     .normalize('NFD')
     .replace(/[̀-ͯ]/g, '')
     .replace(/[^A-Z]/g, '')
  return `presentiel_${n(prenom)}${n(nom)}`
}

export async function POST(req: NextRequest) {
  const PIN = process.env.PRESENTIEL_PIN

  let body: {
    pin: string
    nom: string
    prenom: string
    category: 'ingenieur' | 'bachelor'
    projectRanking: string[]
    ongRanking: string[]
  }

  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Corps invalide.' }, { status: 400 }) }

  if (!PIN || body.pin !== PIN)
    return NextResponse.json({ error: 'PIN incorrect.' }, { status: 401 })

  if (!isVoteOpen())
    return NextResponse.json({ error: 'Les votes ne sont pas ouverts.' }, { status: 403 })

  const nom    = body.nom?.trim()
  const prenom = body.prenom?.trim()
  if (!nom || !prenom)
    return NextResponse.json({ error: 'Nom et prénom requis.' }, { status: 400 })

  const sub = normalizeKey(nom, prenom)

  if (await voteStore.hasVoted(sub))
    return NextResponse.json({ error: 'Cette personne a déjà voté.' }, { status: 409 })

  const { category, projectRanking, ongRanking } = body
  const weights     = category === 'bachelor' ? BACHELOR_WEIGHTS : INGENIEUR_WEIGHTS
  const maxProjects = category === 'bachelor' ? 3 : 5

  if (!Array.isArray(projectRanking) || projectRanking.length < 1 || projectRanking.length > maxProjects)
    return NextResponse.json({ error: `Sélectionnez entre 1 et ${maxProjects} projets.` }, { status: 400 })
  if (new Set(projectRanking).size !== projectRanking.length)
    return NextResponse.json({ error: 'Projets dupliqués.' }, { status: 400 })
  if (projectRanking.some(id => !VALID_PROJECT_IDS.has(id)))
    return NextResponse.json({ error: 'ID projet invalide.' }, { status: 400 })

  const validOng = (Array.isArray(ongRanking) ? ongRanking : []).slice(0, 3)
  if (new Set(validOng).size !== validOng.length)
    return NextResponse.json({ error: 'OBNLs dupliqués.' }, { status: 400 })
  if (validOng.some(id => !VALID_ONG_IDS.has(id)))
    return NextResponse.json({ error: 'ID OBNL invalide.' }, { status: 400 })

  try {
    await voteStore.addVote({
      id:            randomBytes(16).toString('hex'),
      viarezоSub:    sub,
      prenom,
      nom,
      email:         '',
      promoType:     category === 'bachelor' ? 'Bachelor' : 'P2029',
      voterCategory: category === 'bachelor' ? 'bachelor' : 'ingenieur',
      votedAt:       new Date().toISOString(),
      projectVotes:  projectRanking.map((id, i) => ({ projectId: id, rank: i + 1, weight: weights[i] })),
      ongVotes:      validOng.map((id, i) => ({ ongId: id, rank: i + 1, weight: ONG_WEIGHTS[i] })),
    })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message.includes('23505') || err.message.includes('unique')))
      return NextResponse.json({ error: 'Cette personne a déjà voté.' }, { status: 409 })
    console.error('[presentiel] vote error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
