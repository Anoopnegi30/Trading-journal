export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API Routes for Cloudflare D1 Database
    if (url.pathname === '/api/trades') {
      if (request.method === 'GET') {
        try {
          if (!env.DB) {
            return new Response(JSON.stringify({ success: true, trades: [] }), {
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }
          const { results } = await env.DB.prepare('SELECT data FROM trades ORDER BY created_at DESC').all();
          const trades = (results || []).map((r: any) => JSON.parse(r.data));
          return new Response(JSON.stringify({ success: true, trades }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ success: false, error: e.message, trades: [] }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      }

      if (request.method === 'POST') {
        try {
          const body: any = await request.json();
          if (env.DB) {
            if (Array.isArray(body)) {
              for (const t of body) {
                await env.DB.prepare(
                  'INSERT OR REPLACE INTO trades (id, symbol, net_pnl, created_at, data) VALUES (?, ?, ?, ?, ?)'
                ).bind(t.id, t.symbol, t.netPnl, t.date, JSON.stringify(t)).run();
              }
            } else {
              await env.DB.prepare(
                'INSERT OR REPLACE INTO trades (id, symbol, net_pnl, created_at, data) VALUES (?, ?, ?, ?, ?)'
              ).bind(body.id, body.symbol, body.netPnl, body.date, JSON.stringify(body)).run();
            }
          }
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ success: false, error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      }

      if (request.method === 'DELETE') {
        try {
          const id = url.searchParams.get('id');
          if (id && env.DB) {
            await env.DB.prepare('DELETE FROM trades WHERE id = ?').bind(id).run();
          }
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ success: false, error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }

    // Serve Frontend Static Assets
    return env.ASSETS.fetch(request);
  }
};
