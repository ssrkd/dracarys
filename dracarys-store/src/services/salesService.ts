import { supabase } from '../lib/supabase';
import type { Sale } from '../types/database';

export const salesService = {
    async getAllSales(): Promise<Sale[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async addSale(sale: Omit<Sale, 'id' | 'created_at'>): Promise<Sale> {
        if (!supabase) throw new Error('Supabase not configured');
        const { data, error } = await supabase
            .from('sales')
            .insert(sale)
            .select()
            .single();

        if (error) throw error;
        return data as Sale;
    },

    async deleteSale(id: string): Promise<void> {
        if (!supabase) throw new Error('Supabase not configured');
        const { error } = await supabase
            .from('sales')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
