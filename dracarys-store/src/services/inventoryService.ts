import { supabase } from '../lib/supabase';
import type { Purchase, Sale } from '../types/database';

export type AvailabilityMap = Record<string, Record<string, number>>; // name -> size -> qty

export const inventoryService = {
  // Fetch availability aggregated by product name and size
  async fetchAvailability(): Promise<AvailabilityMap> {
    if (!supabase) return {} as AvailabilityMap;

    const [purchasesRes, salesRes] = await Promise.all([
      supabase
        .from('purchases')
        .select('*')
        .in('status', ['arrived', 'listed']),
      supabase
        .from('sales')
        .select('*'),
    ]);

    if (purchasesRes.error) throw purchasesRes.error;
    if (salesRes.error) throw salesRes.error;

    const purchases = (purchasesRes.data || []) as Purchase[];
    const sales = (salesRes.data || []) as Sale[];

    const map: AvailabilityMap = {};

    // Add arrived purchases
    purchases.forEach((p) => {
      const name = p.name.trim();
      const size = p.size.trim();
      map[name] = map[name] || {};
      map[name][size] = (map[name][size] || 0) + (p.quantity || 0);
    });

    // Subtract sales
    sales.forEach((s) => {
      const name = s.product_name.trim();
      const size = s.size.trim();
      if (!map[name]) return;
      if (map[name][size] === undefined) return;
      map[name][size] -= s.quantity || 0;
    });

    // Clamp negatives to zero
    Object.keys(map).forEach((name) => {
      Object.keys(map[name]).forEach((size) => {
        if (map[name][size] < 0) map[name][size] = 0;
      });
    });

    return map;
  },

  totalForName(avail: AvailabilityMap, name: string): number {
    const trimmedName = name.trim();
    const sizes = avail[trimmedName] || {};
    return Object.values(sizes).reduce((a, b) => a + b, 0);
  },

  qtyFor(avail: AvailabilityMap, name: string, size?: string): number {
    const trimmedName = name.trim();
    if (!size) return this.totalForName(avail, trimmedName);
    const trimmedSize = size.trim();
    return avail[trimmedName]?.[trimmedSize] ?? 0;
  },
};
