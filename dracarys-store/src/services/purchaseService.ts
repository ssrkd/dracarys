import { supabase } from '../lib/supabase';
import type { Purchase } from '../types/database';

export const purchaseService = {
    async createPurchase(data: Omit<Purchase, 'id' | 'created_at' | 'status' | 'delivery_cost' | 'total_cost'>): Promise<Purchase> {
        const { data: purchase, error } = await supabase
            .from('purchases')
            .insert({
                ...data,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;
        return purchase;
    },

    async createArrivedPurchase(data: Omit<Purchase, 'id' | 'created_at' | 'status' | 'delivery_cost' | 'total_cost'>): Promise<Purchase> {
        const { data: purchase, error } = await supabase
            .from('purchases')
            .insert({
                ...data,
                status: 'arrived'
            })
            .select()
            .single();

        if (error) throw error;
        return purchase;
    },

    async createListedPurchase(data: Omit<Purchase, 'id' | 'created_at' | 'status' | 'delivery_cost' | 'total_cost'>): Promise<Purchase> {
        const { data: purchase, error } = await supabase
            .from('purchases')
            .insert({
                ...data,
                status: 'listed'
            })
            .select()
            .single();

        if (error) throw error;
        return purchase;
    },

    async getArrivedPurchasesByName(name: string): Promise<Purchase[]> {
        const { data, error } = await supabase
            .from('purchases')
            .select('*')
            .eq('name', name)
            .eq('status', 'arrived')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getAllPurchases(): Promise<Purchase[]> {
        const { data, error } = await supabase
            .from('purchases')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getPendingPurchases(): Promise<Purchase[]> {
        const { data, error } = await supabase
            .from('purchases')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async updatePurchaseStatus(
        id: string,
        status: Purchase['status'],
        deliveryCost?: number
    ): Promise<Purchase> {
        const updates: Partial<Purchase> = { status };

        if (status === 'arrived' && !updates.arrival_date) {
            updates.arrival_date = new Date().toISOString();
        }

        if (deliveryCost !== undefined) {
            updates.delivery_cost = deliveryCost;
            // Calculate total_cost if we have delivery_cost
            const { data: purchase } = await supabase
                .from('purchases')
                .select('purchase_price')
                .eq('id', id)
                .single();

            if (purchase) {
                updates.total_cost = purchase.purchase_price + deliveryCost;
            }
        }

        const { data, error } = await supabase
            .from('purchases')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async archivePurchase(id: string): Promise<Purchase> {
        return this.updatePurchaseStatus(id, 'archived');
    },

    async deletePurchase(id: string): Promise<void> {
        const { error } = await supabase
            .from('purchases')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
    ,
    async deleteUnlistedByName(name: string): Promise<void> {
        const { error } = await supabase
            .from('purchases')
            .delete()
            .eq('name', name)
            .in('status', ['pending', 'arrived']);
        if (error) throw error;
    }
};
