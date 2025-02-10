import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uixnccusyhnqpgtnxinc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpeG5jY3VzeWhucXBndG54aW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2OTAxMzIsImV4cCI6MjA1NDI2NjEzMn0.2EFU9IoXbIqFluJGKplgHEJYzv4PBn6WTjZ0X7-1cgI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)