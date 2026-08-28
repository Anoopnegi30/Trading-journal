export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

// RFC 6238 TOTP Generator in Web Crypto
function base32ToBytes(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  
  for (let i = 0; i < cleaned.length; i++) {
    const idx = alphabet.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
}

async function generateTOTP(secretBase32: string): Promise<string> {
  try {
    const keyBytes = base32ToBytes(secretBase32);
    if (keyBytes.length === 0) return '';

    const epoch = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(epoch / 30);
    
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setUint32(0, 0, false);
    view.setUint32(4, timeStep, false);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, buffer);
    const hmacBytes = new Uint8Array(signature);
    const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
    
    const binaryCode =
      ((hmacBytes[offset] & 0x7f) << 24) |
      ((hmacBytes[offset + 1] & 0xff) << 16) |
      ((hmacBytes[offset + 2] & 0xff) << 8) |
      (hmacBytes[offset + 3] & 0xff);

    const code = binaryCode % 1000000;
    return code.toString().padStart(6, '0');
  } catch (err) {
    console.error('TOTP generation failed:', err);
    return '';
  }
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
        let { clientId, accessToken, totpSecret, dhanPin, apiKey } = body;

        // If no direct token provided but TOTP secret is present, generate live TOTP
        let currentAccessToken = accessToken;
        if (!currentAccessToken && totpSecret) {
          const liveTotp = await generateTOTP(totpSecret);
          console.log('Generated live TOTP for background sync:', liveTotp);
        }

        if (!clientId || !currentAccessToken) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Missing Dhan Client ID or Access Token. Please provide credentials.' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        // Fetch live executed trades from DhanHQ API
        const dhanRes = await fetch('https://api.dhan.co/v2/trades', {
          method: 'GET',
          headers: {
            'access-token': currentAccessToken.trim(),
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
          const grossPnl = Number((totalSellValue - totalBuyValue).toFixed(2));
          const netPnl = Number((grossPnl - fees).toFixed(2));

          const cleanSymbol = sym
            .replace('Sep2026', '01 SEP')
            .replace('Aug2026', '28 AUG')
            .replace(/-/g, ' ');

          const tradeObj = {
            id: `dhan-${Date.now()}-${sym.replace(/[^a-zA-Z0-9]/g, '')}`,
            date: todayStr,
            time: group.buys[0]?.createTime?.split(' ')[1] || '09:30',
            marketType: 'Indian',
            duration: 'Intraday',
            tradeType: isOptionBuying ? 'Option Buying' : 'Option Selling',
            symbol: cleanSymbol,
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

    // ==========================================
    // Cloud Settings & Challenge Sync Route
    // ==========================================
    if (url.pathname === '/api/settings') {
      if (request.method === 'GET') {
        try {
          if (!env.DB) {
            return new Response(JSON.stringify({ success: true, settings: {} }), {
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }
          const { results } = await env.DB.prepare('SELECT key, value FROM app_settings').all();
          const settings: Record<string, any> = {};
          (results || []).forEach((r: any) => {
            try {
              settings[r.key] = JSON.parse(r.value);
            } catch (e) {
              settings[r.key] = r.value;
            }
          });
          return new Response(JSON.stringify({ success: true, settings }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ success: false, error: e.message, settings: {} }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      }

      if (request.method === 'POST') {
        try {
          const body: any = await request.json();
          const { key, value } = body;
          if (env.DB && key) {
            const valStr = typeof value === 'string' ? value : JSON.stringify(value);
            await env.DB.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)').bind(key, valStr).run();
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
    }

    // ==========================================
    // Real-Time Live Indian Market Ticker Route
    // ==========================================
    if (url.pathname === '/api/market-ticker') {
      try {
        const indices = [
          { symbol: '^NSEI', name: 'Nifty 50' },
          { symbol: '^NSEBANK', name: 'Nifty Bank' },
          { symbol: '^BSESN', name: 'BSE Sensex' },
          { symbol: '^CNXIT', name: 'Nifty IT' },
          { symbol: '^CNXPHARMA', name: 'Nifty Pharma' },
          { symbol: '^CNXMETAL', name: 'Nifty Metal' },
          { symbol: '^CNXAUTO', name: 'Nifty Auto' }
        ];

        const tickerPromises = indices.map(async (item) => {
          try {
            const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.symbol)}?interval=1d`, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });
            if (!res.ok) return null;
            const data: any = await res.json();
            const meta = data.chart?.result?.[0]?.meta;
            if (!meta) return null;
            const price = Number(meta.regularMarketPrice || 0);
            const prevClose = Number(meta.chartPreviousClose || meta.previousClose || price);
            const change = Number((price - prevClose).toFixed(2));
            const changePercent = prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0;
            return {
              symbol: item.name,
              name: item.name,
              value: price,
              change,
              changePercent
            };
          } catch (e) {
            return null;
          }
        });

        const results = (await Promise.all(tickerPromises)).filter(Boolean);

        return new Response(JSON.stringify({ success: true, ticker: results }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=30'
          }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // Serve Frontend Static Assets
    return env.ASSETS.fetch(request);
  }
};
