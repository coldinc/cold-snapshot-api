// api/health.ts     ← exact filename

export const runtime = 'edge';          // tell Vercel this is an Edge Function

export default function health() {
  return new Response(
    JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
}
