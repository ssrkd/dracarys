import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-supabase-url') &&
    supabaseUrl.startsWith('https://');

if (!isConfigured) {
    console.warn(
        '⚠️ Supabase не настроен. Пожалуйста, укажите реальные URL и ключ в .env файле.'
    );
}

// Создаем клиент только если есть валидный URL, иначе используем заглушку
export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (null as any);

// Добавляем проверку в сервис
export const isSupabaseConfigured = isConfigured;
