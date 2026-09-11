import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
export const isAdminUser = (user) =>
  Boolean(user?.email) &&
  (user.email.toLowerCase() ===
    import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase() ||
    user.id === "be944c66-8626-4f97-90da-60892b9168e7");
