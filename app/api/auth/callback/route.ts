import { NextRequest, NextResponse } from 'next/server'
import { setSessionCookie } from '@/lib/session-store'

const VIAREZO_TOKEN_URL    = 'https://moncompte.viarezo.fr/oidc/token'
const VIAREZO_USERINFO_URL = 'https://moncompte.viarezo.fr/oidc/userinfo'

type PromoType = 'P2027' | 'P2028' | 'P2029' | 'Bachelor' | 'Other'

/**
 * Detect promotion from ViaRézo userinfo.
 *
 * Confirmed ViaRézo fields (from live response):
 *   user.degree_type : "INGE_CS" | "INGE_CS_CY" | ... | "BC_AIDAMS" | "BC_BOGE" | ...
 *   user.promo       : "2027" | "2028" | "1" (1st year = P2029) | ...
 *
 * Rules (JDB règlement Art. 9):
 *   INGE_CS* + promo 2027 → P2027   (online vote, 5 choices)
 *   INGE_CS* + promo 2028 → P2028   (online vote, 5 choices)
 *   INGE_CS* + promo 1    → P2029   (présentiel only)
 *   BC_* / BACH* (Bachelor) → Bachelor (présentiel only, 3 choices in-person)
 *   anything else           → Other  (présentiel only)
 */
function detectPromo(user: Record<string, unknown>): PromoType {
  const degreeType = typeof user.degree_type === 'string' ? user.degree_type.toUpperCase() : ''
  const promoYear  = typeof user.promo === 'string' ? user.promo.trim() : ''

  // Bachelor — BC_AIDAMS, BC_BOGE, BACH_CS, etc. → présentiel only
  if (degreeType.startsWith('BC_') || degreeType.includes('BACH')) return 'Bachelor'

  // Ingénieur CentraleSupélec (INGE_CS, INGE_CS_CY, INGE_CS_EL, etc.)
  if (degreeType.startsWith('INGE_CS')) {
    if (promoYear === '2027') return 'P2027'
    if (promoYear === '2028') return 'P2028'
    if (promoYear === '1')    return 'P2029'  // 1st year → présentiel
    return 'Other'
  }

  // Fallback: degree_type absent but promo year present
  if (promoYear === '2027') return 'P2027'
  if (promoYear === '2028') return 'P2028'

  return 'Other'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/je-vote?error=${encodeURIComponent(error)}`, req.url))
  }
  if (!code) {
    return NextResponse.redirect(new URL('/je-vote?error=no_code', req.url))
  }

  // CSRF state check
  const storedState = req.cookies.get('oidc_state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(new URL('/je-vote?error=invalid_state', req.url))
  }

  try {
    const redirectUri = `${process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_URL}/api/auth/callback`

    // Exchange code → access token
    const tokenRes = await fetch(VIAREZO_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.VIAREZO_CLIENT_ID!,
        client_secret: process.env.VIAREZO_CLIENT_SECRET!,
        code,
        redirect_uri: redirectUri,
      }).toString(),
    })

    if (!tokenRes.ok) {
      console.error('Token exchange failed:', await tokenRes.text())
      return NextResponse.redirect(new URL('/je-vote?error=token_failed', req.url))
    }

    const tokenData = await tokenRes.json()

    // Fetch userinfo
    const userRes = await fetch(VIAREZO_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/je-vote?error=userinfo_failed', req.url))
    }

    const user = await userRes.json()

    // Debug logging — only in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('━━━ ViaRézo userinfo ━━━')
      console.log(JSON.stringify(user, null, 2))
      console.log('━━━━━━━━━━━━━━━━━━━━━━━')
    }

    const sub: string = user.sub
    if (!sub) {
      return NextResponse.redirect(new URL('/je-vote?error=no_sub', req.url))
    }

    const prenom  = user.given_name || user.name?.split(' ')[0] || 'Étudiant'
    const nom     = user.family_name || user.name?.split(' ').slice(1).join(' ') || ''
    const email   = user.email || ''
    const promo   = detectPromo(user)
    const idToken = typeof tokenData.id_token === 'string' ? tokenData.id_token : undefined

    console.log(`✅ Auth: ${prenom} ${nom} — promo détectée: ${promo}`)

    const res = NextResponse.redirect(new URL('/je-vote', req.url))
    setSessionCookie(res, { sub, prenom, nom, email, promo, idToken })
    res.cookies.set('oidc_state', '', { maxAge: 0 })

    return res
  } catch (err) {
    console.error('Auth callback error:', err)
    return NextResponse.redirect(new URL('/je-vote?error=server_error', req.url))
  }
}
