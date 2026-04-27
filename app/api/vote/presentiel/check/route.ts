import { NextRequest, NextResponse } from 'next/server'
import { voteStore } from '@/lib/vote-store'
import { normalizeKey } from '../route'

export async function POST(req: NextRequest) {
  const PIN = process.env.PRESENTIEL_PIN

  let body: { pin: string; nom: string; prenom: string }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Corps invalide.' }, { status: 400 }) }

  if (!PIN || body.pin !== PIN)
    return NextResponse.json({ error: 'PIN incorrect.' }, { status: 401 })

  const nom    = body.nom?.trim()
  const prenom = body.prenom?.trim()
  if (!nom || !prenom)
    return NextResponse.json({ alreadyVoted: false })

  const alreadyVoted = await voteStore.hasVoted(normalizeKey(nom, prenom))
  return NextResponse.json({ alreadyVoted })
}
