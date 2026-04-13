import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, clearSessionCookie } from '@/lib/session-store'

// OIDC end_session_endpoint from https://auth.viarezo.fr/.well-known/openid-configuration
const VIAREZO_END_SESSION = 'https://moncompte.viarezo.fr/logout'

export async function GET(req: NextRequest) {
  const appUrl  = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'
  const returnTo = `${appUrl}/je-vote`

  // Read session BEFORE clearing — we need the id_token for the hint
  const session = getSessionFromRequest(req)

  // Build ViaRézo end-session URL.
  // id_token_hint  → cryptographic proof of which session to destroy
  // post_logout_redirect_uri → where ViaRézo sends the user after clearing their session
  const params = new URLSearchParams({ post_logout_redirect_uri: returnTo })
  if (session?.idToken) {
    params.set('id_token_hint', session.idToken)
  }
  const logoutUrl = `${VIAREZO_END_SESSION}?${params.toString()}`

  const res = NextResponse.redirect(logoutUrl)
  clearSessionCookie(res)
  return res
}
