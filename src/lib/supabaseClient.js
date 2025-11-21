import { createClient } from "@supabase/supabase-js";

// Cliente de conexión usando variables de entorno
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
