import { NextRequest, NextResponse } from 'next/server'

// Proxies Google Drive thumbnail requests server-side, bypassing the 429
// that lh3.googleusercontent.com returns to browser-originated requests.
// Usage: /api/img?id=DRIVE_FILE_ID&sz=w1200

const ALLOWED_SIZES = new Set(['w200', 'w400', 'w800', 'w1200'])

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const id = searchParams.get('id')
  const sz = searchParams.get('sz') ?? 'w1200'

  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) {
    return new NextResponse('Bad id', { status: 400 })
  }
  if (!ALLOWED_SIZES.has(sz)) {
    return new NextResponse('Bad sz', { status: 400 })
  }

  const driveUrl = `https://drive.google.com/thumbnail?id=${id}&sz=${sz}`

  try {
    const res = await fetch(driveUrl, {
      headers: {
        // Fetch as a plain script — no Referer, no browser cookies
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-proxy/1.0)',
      },
      redirect: 'follow',
    })

    if (!res.ok) {
      return new NextResponse(`Upstream ${res.status}`, { status: 502 })
    }

    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Not an image', { status: 502 })
    }

    const body = await res.arrayBuffer()

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Cache 24 h in browser, 1 h in CDN edge
        'Cache-Control': 'public, max-age=86400, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    console.error('[img-proxy]', err)
    return new NextResponse('Proxy error', { status: 502 })
  }
}
