import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

export interface SupabaseConfig {
  url: string | undefined;
  anonKey: string | undefined;
  serviceRoleKey: string | undefined;
  isConfigured: boolean;
}

export const supabaseConfig: SupabaseConfig = {
  url: env.SUPABASE_URL,
  anonKey: env.SUPABASE_ANON_KEY,
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  get isConfigured() {
    return Boolean(this.url && this.serviceRoleKey);
  },
};

// Cliente para operações de auth (anon key)
export const supabaseAuth: SupabaseClient | null = supabaseConfig.url && supabaseConfig.anonKey
  ? createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Cliente para operações administrativas (service role)
export const supabaseAdmin: SupabaseClient | null = supabaseConfig.url && supabaseConfig.serviceRoleKey
  ? createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Helper para verificar se está configurado
export function isSupabaseConfigured(): boolean {
  return supabaseConfig.isConfigured;
}

// Helper para tratar erros do Supabase
export function handleSupabaseError(error: unknown): Error {
  if (error && typeof error === "object" && "message" in error) {
    return new Error(String(error.message));
  }
  return new Error("Erro desconhecido no Supabase");
}
