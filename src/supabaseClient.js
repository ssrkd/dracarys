import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://jkzaykobcywanvfgbvci.supabase.co'
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpremF5a29iY3l3YW52ZmdidmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODQ5ODQsImV4cCI6MjA3NDU2MDk4NH0.YhrscD_zAgVQCysWcr_P94mZbabJkxasxIITlnatwIs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})
