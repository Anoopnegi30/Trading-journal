export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ==========================================
    // DhanHQ Live Trade Sync API Route
    // ==========================================
    if (url.pathname === '/api/dhan-sync' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const { clientId, accessToken } = body;

        if (!clientId || !accessToken) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Missing Dhan Client ID or Access Token' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        // Fetch live executed trades from DhanHQ API
        const dhanRes = await fetch('https://api.dhan.co/v2/trades', {
          method: 'GET',
          headers: {
            'access-token': accessToken.trim(),
            'client-id': clientId.trim(),
            'Content-Type': 'application/json'
          }
        });

        if (!dhanRes.ok) {
          const errorText = await dhanRes.text();
          let parsedError = errorText;
          try {
            const errJson = JSON.parse(errorText);
            parsedError = errJson.internalErrorMessage || errJson.errorMessage || errJson.message || errorText;
          } catch (e) {}

          return new Response(JSON.stringify({
            success: false,
            error: `DhanHQ API Error (${dhanRes.status}): ${parsedError}`
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const rawDhanTrades: any = await dhanRes.json();
        const list = Array.isArray(rawDhanTrades) ? rawDhanTrades : (rawDhanTrades.data || []);

        if (list.length === 0) {
          return new Response(JSON.stringify({
            success: true,
            count: 0,
            trades: [],
            message: 'No executed trades found on Dhan for today.'
          }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        // Group trades by Symbol to pair Buy & Sell executions
        const symbolMap = new Map<string, { buys: any[]; sells: any[] }>();
        for (const item of list) {
          const sym = item.tradingSymbol || item.customSymbol || 'NIFTY';
          const group = symbolMap.get(sym) || { buys: [], sells: [] };
          const type = (item.transactionType || '').toUpperCase();
          if (type === 'BUY') group.buys.push(item);
          else group.sells.push(item);
          symbolMap.set(sym, group);
        }

        const parsedTrades: any[] = [];
        const todayStr = new Date().toISOString().split('T')[0];

        for (const [sym, group] of symbolMap.entries()) {
          const totalBuyQty = group.buys.reduce((sum, b) => sum + (b.tradedQuantity || b.quantity || 0), 0);
          const totalSellQty = group.sells.reduce((sum, s) => sum + (s.tradedQuantity || s.quantity || 0), 0);
          const matchedQty = Math.min(totalBuyQty, totalSellQty) || totalBuyQty || totalSellQty || 1;

          const totalBuyValue = group.buys.reduce((sum, b) => sum + ((b.tradedPrice || b.price || 0) * (b.tradedQuantity || b.quantity || 0)), 0);
          const totalSellValue = group.sells.reduce((sum, s) => sum + ((s.tradedPrice || s.price || 0) * (s.tradedQuantity || s.quantity || 0)), 0);

          const avgBuyPrice = totalBuyQty > 0 ? Number((totalBuyValue / totalBuyQty).toFixed(2)) : 0;
          const avgSellPrice = totalSellQty > 0 ? Number((totalSellValue / totalSellQty).toFixed(2)) : 0;

          // For Option Buyer: Profit = (Sell - Buy) * Qty
          const isOptionBuying = sym.toUpperCase().includes('CE') || sym.toUpperCase().includes('PE') || group.buys.length > 0;
          const entryPrice = isOptionBuying ? avgBuyPrice : (avgSellPrice || avgBuyPrice);
          const exitPrice = isOptionBuying ? avgSellPrice : avgBuyPrice;
          // Exact Indian F&O Brokerage & Government Taxes:
          // Brokerage: ₹20/order (Buy: ₹20 + Sell: ₹20 = ₹40)
          // STT: 0.0625% on sell premium turnover
          // Exchange Turnover (NSE): 0.03503%
          // GST: 18% on (Brokerage + Exchange)
          // Stamp Duty: 0.003% on Buy side + SEBI turnover
          const numOrders = (group.buys.length || 1) + (group.sells.length || 1);
          const brokerage = numOrders * 20;
          const stt = totalSellValue * 0.000625;
          const exchangeCharges = (totalBuyValue + totalSellValue) * 0.0003503;
          const gst = (brokerage + exchangeCharges) * 0.18;
          const stampDuty = totalBuyValue * 0.00003;
          const sebiCharges = (totalBuyValue + totalSellValue) * 0.000001;
          const fees = Number((brokerage + stt + exchangeCharges + gst + stampDuty + sebiCharges).toFixed(2)) || 55.0;
          const grossPnl = entryPrice > 0 && exitPrice > 0 ? (exitPrice - entryPrice) * matchedQty : 0;
          const netPnl = Number((grossPnl - fees).toFixed(2));

          const tradeObj = {
            id: `dhan-${Date.now()}-${sym.replace(/[^a-zA-Z0-9]/g, '')}`,
            date: todayStr,
            time: group.buys[0]?.createTime?.split(' ')[1] || '09:30',
            marketType: 'Indian',
            duration: 'Intraday',
            tradeType: isOptionBuying ? 'Option Buying' : 'Option Selling',
            symbol: sym,
            direction: sym.toUpperCase().includes('PE') ? 'Short' : 'Long',
            entryPrice: entryPrice || 100,
            exitPrice: exitPrice || 100,
            quantity: matchedQty,
            totalAmount: (entryPrice || 100) * matchedQty,
            fees,
            pnl: grossPnl,
            netPnl,
            pnlPercent: entryPrice > 0 ? Number(((grossPnl / (entryPrice * matchedQty)) * 100).toFixed(2)) : 0,
            riskReward: '1:2.0',
            strategy: 'Dhan Auto-Sync',
            outcome: netPnl >= 0 ? 'Full Success' : 'Loss',
            emotion: 'Disciplined',
            confidence: 90,
            mistakes: [],
            followedPlan: true,
            followedRisk: true,
            notes: `Auto-imported via DhanHQ API. (Buy: ₹${avgBuyPrice}, Sell: ₹${avgSellPrice}, Qty: ${matchedQty})`,
            createdAt: new Date().toISOString()
          };

          parsedTrades.push(tradeObj);

          // Save to Cloudflare D1 SQL
          if (env.DB) {
            await env.DB.prepare(
              'INSERT OR REPLACE INTO trades (id, symbol, net_pnl, created_at, data) VALUES (?, ?, ?, ?, ?)'
            ).bind(tradeObj.id, tradeObj.symbol, tradeObj.netPnl, tradeObj.date, JSON.stringify(tradeObj)).run();
          }
        }

        return new Response(JSON.stringify({
          success: true,
          count: parsedTrades.length,
          trades: parsedTrades
        }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });

      } catch (error: any) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message || 'Failed to sync with DhanHQ API'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // ==========================================
    // Standard CRUD Routes for Cloudflare D1 Database
    // ==========================================
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
