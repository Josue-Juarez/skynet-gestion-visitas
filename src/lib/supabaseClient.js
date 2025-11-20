import { createClient } from '@supabase/supabase-js'


const SUPABASE_URL = 'https://ycmldismmvfzgbciuzvx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbWxkaXNtbXZmemdiY2l1enZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NDMxODQsImV4cCI6MjA3ODMxOTE4NH0.IjJL3wBQutq-DItwqdhYaxZO2-1HbIVcHXFf9Xnas4g'

// Cliente de conexión
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)


