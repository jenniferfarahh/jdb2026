import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const SECRET      = process.env.SESSION_SECRET ?? 'change-me-in-production-please'
const COOKIE_NAME = 'jdb_session'
const MAX_AGE     = 60 * 60 * 4 // 4 hours in seconds

export interface SessionData {
  sub:      string
  prenom:   string
  nom:      string
  email?:   string
  promo?:   string   // 'P2027' | 'P2028' | 'P2029' | 'Bachelor' | 'Other'
  idToken?: string   // stored for OIDC end_session_endpoint id_token_hint
  exp:      number   // unix timestamp — expiry baked into payload, not just cookie
}

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('base64url')
}

export function encodeSession(data: Omit<SessionData, 'exp'>): string {
  const withExp: SessionData = { ...data, exp: Math.floor(Date.now() / 1000) + MAX_AGE }
  const payload = Buffer.from(JSON.stringify(withExp)).toString('base64url')
  const sig = sign(payload)
  return `${payload}.${sig}`
}

export function decodeSession(token: string): SessionData | null {
  try {
    const dotIndex = token.lastIndexOf('.')
    if (dotIndex === -1) return null
    const payload = token.slice(0, dotIndex)
    const sig     = token.slice(dotIndex + 1)
    if (!payload || !sig) return null

    // Timing-safe comparison — prevents HMAC timing attacks
    const expected = sign(payload)
    const eBuf = Buffer.from(expected, 'utf8')
    const sBuf = Buffer.from(sig,      'utf8')
    if (eBuf.length !== sBuf.length || !timingSafeEqual(eBuf, sBuf)) return null

    const data: SessionData = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))

    // Server-side expiry check — even if the browser ignores cookie maxAge
    if (!data.exp || Math.floor(Date.now() / 1000) > data.exp) return null

    return data
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return decodeSession(token)
  } catch {
    return null
  }
}

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path:     '/',
}

export function setSessionCookie(res: NextResponse, data: Omit<SessionData, 'exp'>): NextResponse {
  res.cookies.set(COOKIE_NAME, encodeSession(data), { ...COOKIE_OPTS, maxAge: MAX_AGE })
  return res
}

export function clearSessionCookie(res: NextResponse): NextResponse {
  // Use identical attributes as set — some browsers won't clear cookies
  // unless the path/domain/secure attributes match exactly.
  res.cookies.set(COOKIE_NAME, '', { ...COOKIE_OPTS, maxAge: 0 })
  return res
}

export function getSessionFromRequest(req: NextRequest): SessionData | null {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return decodeSession(token)
}
