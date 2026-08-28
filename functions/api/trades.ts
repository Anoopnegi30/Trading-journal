interface Env {
  TRADES_KV?: KVNamespace;
  DB?: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { TRADES_KV, DB } = context.env;

    // 1. If Cloudflare D1 SQL is bound
    if (DB) {
      const { results } = await DB.prepare('SELECT data FROM trades ORDER BY created_at DESC').all();
      const trades = results.map((r: any) => JSON.parse(r.data));
      return new Response(JSON.stringify({ success: true, trades }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 2. If Cloudflare KV is bound
    if (TRADES_KV) {
      const raw = await TRADES_KV.get('user_trades');
      const trades = raw ? JSON.parse(raw) : [];
      return new Response(JSON.stringify({ success: true, trades }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Default fallback
    return new Response(JSON.stringify({ success: true, trades: [], message: 'KV/D1 ready to connect' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { TRADES_KV, DB } = context.env;
    const body: any = await context.request.json();

    // 1. If Cloudflare D1 SQL is bound
    if (DB) {
      if (Array.isArray(body)) {
        // Bulk sync
        for (const trade of body) {
          await DB.prepare(
            'INSERT OR REPLACE INTO trades (id, symbol, net_pnl, created_at, data) VALUES (?, ?, ?, ?, ?)'
          ).bind(trade.id, trade.symbol, trade.netPnl, trade.date, JSON.stringify(trade)).run();
        }
      } else {
        await DB.prepare(
          'INSERT OR REPLACE INTO trades (id, symbol, net_pnl, created_at, data) VALUES (?, ?, ?, ?, ?)'
        ).bind(body.id, body.symbol, body.netPnl, body.date, JSON.stringify(body)).run();
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 2. If Cloudflare KV is bound
    if (TRADES_KV) {
      if (Array.isArray(body)) {
        await TRADES_KV.put('user_trades', JSON.stringify(body));
      } else {
        const raw = await TRADES_KV.get('user_trades');
        const list = raw ? JSON.parse(raw) : [];
        const existingIdx = list.findIndex((t: any) => t.id === body.id);
        if (existingIdx >= 0) {
          list[existingIdx] = body;
        } else {
          list.unshift(body);
        }
        await TRADES_KV.put('user_trades', JSON.stringify(list));
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Saved' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const { TRADES_KV, DB } = context.env;
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Missing trade ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (DB) {
      await DB.prepare('DELETE FROM trades WHERE id = ?').bind(id).run();
    }

    if (TRADES_KV) {
      const raw = await TRADES_KV.get('user_trades');
      if (raw) {
        const list = JSON.parse(raw).filter((t: any) => t.id !== id);
        await TRADES_KV.put('user_trades', JSON.stringify(list));
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
