export interface Env {
  UPSTREAM_URL: string
  ALLOWED_ORIGINS: string
  CACHE_TTL_SECONDS: string
}

const MAX_BODY_BYTES = 64 * 1024

function json(body: unknown, status: number, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

/** Origine autorisée à lire la réponse, ou null. */
function allowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin')
  if (!origin) return null
  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  return allowed.includes(origin) ? origin : null
}

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin) return {}
  return { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Réponse avec les en-têtes CORS de la requête courante (jamais stockés en cache). */
function withCors(response: Response, origin: string | null, cache: 'HIT' | 'MISS' | null): Response {
  const res = new Response(response.body, response)
  res.headers.delete('Cache-Control')
  for (const [k, v] of Object.entries(corsHeaders(origin))) res.headers.set(k, v)
  if (cache) res.headers.set('X-Proxy-Cache', cache)
  return res
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname !== '/graphql' && url.pathname !== '/') {
      return json({ errors: [{ message: 'not found' }] }, 404)
    }

    const hasOrigin = request.headers.has('Origin')
    const origin = allowedOrigin(request, env)

    if (request.method === 'OPTIONS') {
      if (!origin) return new Response(null, { status: 403 })
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
          Vary: 'Origin',
        },
      })
    }

    if (request.method !== 'POST') {
      return json({ errors: [{ message: 'method not allowed' }] }, 405, { Allow: 'POST, OPTIONS' })
    }

    if (hasOrigin && !origin) {
      return json({ errors: [{ message: 'origin not allowed' }] }, 403)
    }

    const declaredLength = Number(request.headers.get('Content-Length') ?? 0)
    if (declaredLength > MAX_BODY_BYTES) {
      return json({ errors: [{ message: 'payload too large' }] }, 413, corsHeaders(origin))
    }
    const body = await request.arrayBuffer()
    if (body.byteLength > MAX_BODY_BYTES) {
      return json({ errors: [{ message: 'payload too large' }] }, 413, corsHeaders(origin))
    }

    const cacheKey = new Request(`${url.origin}/__cache/${await sha256Hex(body)}`)
    const cache = caches.default
    const cached = await cache.match(cacheKey)
    if (cached) return withCors(cached, origin, 'HIT')

    let upstream: Response
    try {
      upstream = await fetch(env.UPSTREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body,
      })
    } catch {
      return json({ errors: [{ message: 'upstream unreachable' }] }, 502, corsHeaders(origin))
    }

    const text = await upstream.text()
    const headers = { 'Content-Type': 'application/json' }

    if (upstream.status === 200 && isCacheable(text)) {
      const ttl = Number(env.CACHE_TTL_SECONDS) || 3600
      ctx.waitUntil(
        cache.put(
          cacheKey,
          new Response(text, { status: 200, headers: { ...headers, 'Cache-Control': `public, max-age=${ttl}` } }),
        ),
      )
    }

    return withCors(new Response(text, { status: upstream.status, headers }), origin, 'MISS')
  },
} satisfies ExportedHandler<Env>

/** Une réponse GraphQL sans `errors` de premier niveau. */
function isCacheable(text: string): boolean {
  try {
    const data: unknown = JSON.parse(text)
    return typeof data === 'object' && data !== null && !('errors' in data)
  } catch {
    return false
  }
}
