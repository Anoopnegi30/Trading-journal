import { Trade } from '../types/trade';

export async function fetchCloudTrades(): Promise<Trade[] | null> {
  try {
    const res = await fetch('/api/trades');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && Array.isArray(data.trades) && data.trades.length > 0) {
      return data.trades;
    }
  } catch (e) {
    console.log('Cloud sync running in local-first mode:', e);
  }
  return null;
}

export async function saveTradeToCloud(trade: Trade): Promise<boolean> {
  try {
    const res = await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trade)
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to sync trade to cloud:', e);
    return false;
  }
}

export async function syncAllTradesToCloud(trades: Trade[]): Promise<boolean> {
  try {
    const res = await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trades)
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to bulk sync trades to cloud:', e);
    return false;
  }
}

export async function deleteTradeFromCloud(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/trades?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete trade from cloud:', e);
    return false;
  }
}

export async function syncDhanTrades(
  clientId: string, 
  accessToken: string
): Promise<{ success: boolean; count: number; trades?: Trade[]; error?: string; message?: string }> {
  try {
    const res = await fetch('/api/dhan-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, accessToken })
    });
    const data = await res.json();
    return data;
  } catch (e: any) {
    return { success: false, count: 0, error: e.message || 'Network error connecting to DhanHQ API' };
  }
}
