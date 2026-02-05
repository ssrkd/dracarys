import { supabase } from '../lib/supabase';
import type { Purchase, Sale } from '../types/database';

export type AvailabilityMap = Record<string, Record<string, Record<string, number>>>; // name -> color -> size -> qty

export const inventoryService = {
  // Fetch availability aggregated by product name, color and size
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
      const color = (p.color || 'Без цвета').trim();
      const size = p.size.trim();

      map[name] = map[name] || {};
      map[name][color] = map[name][color] || {};
      map[name][color][size] = (map[name][color][size] || 0) + (p.quantity || 0);
    });

    // Subtract sales
    sales.forEach((s) => {
      const name = s.product_name.trim();
      const color = (s.color || 'Без цвета').trim();
      const size = s.size.trim();

      if (!map[name] || !map[name][color] || map[name][color][size] === undefined) return;
      map[name][color][size] -= s.quantity || 0;
    });

    // Clamp negatives to zero
    Object.keys(map).forEach((name) => {
      Object.keys(map[name]).forEach((color) => {
        Object.keys(map[name][color]).forEach((size) => {
          if (map[name][color][size] < 0) map[name][color][size] = 0;
        });
      });
    });

    return map;
  },

  totalForName(avail: AvailabilityMap, name: string): number {
    const trimmedName = name.trim();
    const colors = avail[trimmedName] || {};
    let total = 0;
    Object.values(colors).forEach(sizes => {
      Object.values(sizes).forEach(qty => {
        total += qty;
      });
    });
    return total;
  },

  totalVisibleForProduct(avail: AvailabilityMap, name: string, hiddenColors: string[] = []): number {
    const trimmedName = name.trim();
    const colors = avail[trimmedName] || {};
    let total = 0;
    Object.entries(colors).forEach(([color, sizes]) => {
      if (hiddenColors.includes(color)) return;
      Object.values(sizes).forEach(qty => {
        total += qty;
      });
    });
    return total;
  },

  qtyFor(avail: AvailabilityMap, name: string, color?: string, size?: string): number {
    const trimmedName = name.trim();
    if (!color && !size) return this.totalForName(avail, trimmedName);

    const trimmedColor = (color || 'Без цвета').trim();
    if (size) {
      const trimmedSize = size.trim();
      return avail[trimmedName]?.[trimmedColor]?.[trimmedSize] ?? 0;
    }

    // Total for color
    const sizes = avail[trimmedName]?.[trimmedColor] || {};
    return Object.values(sizes).reduce((a, b) => a + b, 0);
  },
};
