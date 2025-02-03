import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://suwbktyfyzqyhsdidylx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1d2JrdHlmeXpxeWhzZGlkeWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3Njc4NDYsImV4cCI6MjA0NjM0Mzg0Nn0.p4awQmeUHRqzUY5j1E81VUASbYlqSS8p2I9Cm3BPlwA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)