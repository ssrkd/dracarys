import { supabase } from '../lib/supabase';
import type { FocalPlan, FocalDiary, FocalGoal, FocalCore, FocalHabit, FocalBrainNote } from '../types/database';

export const focalService = {
    // Core Unified Methods
    async getCoreData(type?: string) {
        let query = supabase.from('focal_core').select('*').order('date', { ascending: false });
        if (type) query = query.eq('type', type);

        const { data, error } = await query;
        if (error) throw error;
        return data as FocalCore[];
    },

    async updateCoreData(id: string, updates: any) {
        const { error } = await supabase.from('focal_core').update(updates).eq('id', id);
        if (error) throw error;
    },

    // Plans (Smart Planner)
    async getPlans(): Promise<FocalPlan[]> {
        const data = await this.getCoreData('plan');
        return data.map(item => ({
            id: item.id,
            title: item.title || '',
            description: item.content,
            category: item.metadata.category || 'General',
            priority: item.metadata.priority || 'Medium',
            revenue_impact: item.metadata.revenue_impact || 0,
            start_date: item.date,
            end_date: item.metadata.end_date || null,
            is_completed: item.metadata.is_completed || false,
            created_at: item.created_at
        }));
    },

    async createPlan(plan: Omit<FocalPlan, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('focal_core')
            .insert([{
                type: 'plan',
                title: plan.title,
                content: plan.description,
                date: plan.start_date,
                metadata: {
                    category: plan.category,
                    priority: plan.priority,
                    revenue_impact: plan.revenue_impact,
                    is_completed: plan.is_completed,
                    end_date: plan.end_date
                }
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updatePlan(id: string, updates: Partial<FocalPlan>) {
        return this.updateGenericItem(id, updates, ['category', 'priority', 'revenue_impact', 'is_completed', 'end_date']);
    },

    async deletePlan(id: string) {
        const { error } = await supabase.from('focal_core').delete().eq('id', id);
        if (error) throw error;
    },

    // Journal (Owner Journal)
    async getDiaryEntries(): Promise<FocalDiary[]> {
        const data = await this.getCoreData('diary');
        return data.map(item => ({
            id: item.id,
            entry: item.content || '',
            revenue: item.metadata.revenue || 0,
            worked: item.metadata.worked || null,
            failed: item.metadata.failed || null,
            ideas: item.metadata.ideas || null,
            mood: item.metadata.mood || 5,
            energy_level: item.metadata.energy_level || 5,
            date: item.date,
            created_at: item.created_at
        }));
    },

    async createDiaryEntry(entry: Omit<FocalDiary, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('focal_core')
            .insert([{
                type: 'diary',
                content: entry.entry,
                date: entry.date,
                metadata: {
                    revenue: entry.revenue,
                    worked: entry.worked,
                    failed: entry.failed,
                    ideas: entry.ideas,
                    mood: entry.mood,
                    energy_level: entry.energy_level
                }
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateDiaryEntry(id: string, updates: Partial<FocalDiary>) {
        // Map 'entry' back to 'content' if it exists in updates
        const mappedUpdates: any = { ...updates };
        if (updates.entry) mappedUpdates.content = updates.entry;
        return this.updateGenericItem(id, mappedUpdates, ['revenue', 'worked', 'failed', 'ideas', 'mood', 'energy_level']);
    },

    async deleteDiaryEntry(id: string) {
        return this.deletePlan(id);
    },

    // Goals (Strategic Goals)
    async getGoals(): Promise<FocalGoal[]> {
        const data = await this.getCoreData('goal');
        return data.map(item => ({
            id: item.id,
            title: item.title || '',
            target_value: item.metadata.target_value || 0,
            current_value: item.metadata.current_value || 0,
            unit: item.metadata.unit || '₸',
            type: item.metadata.type || 'Revenue',
            period: item.metadata.period || 'Monthly',
            start_date: item.date,
            end_date: item.metadata.end_date || null,
            created_at: item.created_at
        }));
    },

    async createGoal(goal: Omit<FocalGoal, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('focal_core')
            .insert([{
                type: 'goal',
                title: goal.title,
                date: goal.start_date,
                metadata: {
                    target_value: goal.target_value,
                    current_value: goal.current_value,
                    unit: goal.unit,
                    type: goal.type,
                    period: goal.period,
                    end_date: goal.end_date
                }
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateGoal(id: string, updates: Partial<FocalGoal>) {
        const mappedUpdates: any = { ...updates };
        if (updates.start_date) mappedUpdates.date = updates.start_date;
        return this.updateGenericItem(id, mappedUpdates, ['target_value', 'current_value', 'unit', 'type', 'period', 'end_date']);
    },

    async deleteGoal(id: string) {
        return this.deletePlan(id);
    },

    // Habits
    async getHabits(): Promise<FocalHabit[]> {
        const data = await this.getCoreData('habit');
        return data.map(item => ({
            id: item.id,
            title: item.title || '',
            history: item.metadata.history || {},
            streak: item.metadata.streak || 0,
            is_active: item.metadata.is_active !== false,
            created_at: item.created_at
        }));
    },

    async createHabit(title: string) {
        const { data, error } = await supabase
            .from('focal_core')
            .insert([{
                type: 'habit',
                title,
                metadata: { history: {}, streak: 0, is_active: true }
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateHabit(id: string, updates: Partial<FocalHabit>) {
        return this.updateGenericItem(id, updates as any, ['history', 'streak', 'is_active']);
    },

    async deleteHabit(id: string) {
        return this.deletePlan(id);
    },

    async toggleHabit(id: string, date: string, completed: boolean) {
        const { data: habit } = await supabase.from('focal_core').select('*').eq('id', id).single();
        if (!habit) return;

        const history = { ...habit.metadata.history };
        if (completed) history[date] = true;
        else delete history[date];

        // Basic streak calc (last consecutive days)
        let streak = 0;
        const checkDate = new Date();
        while (history[checkDate.toISOString().split('T')[0]]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        const { error } = await supabase
            .from('focal_core')
            .update({ metadata: { ...habit.metadata, history, streak } })
            .eq('id', id);
        if (error) throw error;
    },

    // Second Brain
    async getBrainNotes(): Promise<FocalBrainNote[]> {
        const data = await this.getCoreData('brain');
        return data.map(item => ({
            id: item.id,
            title: item.title || '',
            content: item.content || '',
            category: item.metadata.category || 'Strategy',
            tags: item.metadata.tags || [],
            created_at: item.created_at
        }));
    },

    async createBrainNote(note: Omit<FocalBrainNote, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('focal_core')
            .insert([{
                type: 'brain',
                title: note.title,
                content: note.content,
                metadata: { category: note.category, tags: note.tags }
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateBrainNote(id: string, updates: Partial<FocalBrainNote>) {
        return this.updateGenericItem(id, updates as any, ['category', 'tags']);
    },

    async deleteBrainNote(id: string) {
        return this.deletePlan(id);
    },

    // Generic Update Implementation
    async updateGenericItem(id: string, updates: any, metadataFields: string[]) {
        const item: any = { metadata: {} };
        if (updates.title) item.title = updates.title;
        if (updates.content) item.content = updates.content;
        if (updates.date) item.date = updates.date;

        metadataFields.forEach(field => {
            if (updates[field] !== undefined) {
                item.metadata[field] = updates[field];
            }
        });

        // Use RPC if available for deep merge, but since focal_core metadata is usually small,
        // we can fetch-merge-update if RPC is missing. For simplicity, we'll try RPC first.
        try {
            const { data, error } = await supabase
                .rpc('update_focal_metadata', {
                    item_id: id,
                    new_title: item.title || null,
                    new_content: item.content || null,
                    new_date: item.date || null,
                    new_metadata: item.metadata
                });
            if (!error) return data;
        } catch (e) {
            // Fallback
        }

        // Basic fetch-merge fallback
        const { data: current } = await supabase.from('focal_core').select('metadata').eq('id', id).single();
        const mergedMetadata = { ...(current?.metadata || {}), ...item.metadata };

        const finalUpdates: any = { metadata: mergedMetadata };
        if (item.title) finalUpdates.title = item.title;
        if (item.content) finalUpdates.content = item.content;
        if (item.date) finalUpdates.date = item.date;

        const { data, error } = await supabase
            .from('focal_core')
            .update(finalUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
