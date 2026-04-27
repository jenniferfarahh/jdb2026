import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

const VIAREZO_AUTH_URL = 'https://moncompte.viarezo.fr/oidc/authorize'

export async function GET(req: NextRequest) {
  const state = randomBytes(16).toString('hex')

  // Derive base URL from request host — works on any domain without relying on env vars
  const host     = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'localhost:3000'
  const proto    = req.headers.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  const baseUrl  = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_URL ?? `${proto}://${host}`
  const redirectUri = `${baseUrl}/api/auth/callback`

  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     process.env.VIAREZO_CLIENT_ID!,
    redirect_uri:  redirectUri,
    scope:         'openid profile roles',
    state,
    prompt:        'login',  // OIDC: always show login form
    max_age:       '0',      // OIDC: treat any existing session as expired
  })

  const authUrl = `${VIAREZO_AUTH_URL}?${params.toString()}`

  const res = NextResponse.redirect(authUrl)
  // Store state in cookie for CSRF validation
  res.cookies.set('oidc_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes to complete login
    path: '/',
  })

  return res
}
