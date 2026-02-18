import { supabaseAdmin, isSupabaseConfigured } from "../integrations/supabase.js";
import type { User, UserRole } from "../core/types.js";
import { env } from "../config/env.js";

// Helper para converter camelCase para snake_case
function toSnakeCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    acc[snakeKey] = toSnakeCase(obj[key]);
    return acc;
  }, {} as any);
}

// Mock data para desenvolvimento sem Supabase
const mockUsers: Map<string, User & { password: string }> = new Map([
  ["1", { id: "1", email: "admin@controle.app", name: "Administrador", role: "admin" as UserRole, password: "admin123", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  ["2", { id: "2", email: "editor@controle.app", name: "Editor", role: "editor" as UserRole, password: "editor123", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  ["3", { id: "3", email: "viewer@controle.app", name: "Visualizador", role: "viewer" as UserRole, password: "viewer123", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
]);

const mockApps: Map<string, any> = new Map();
const mockHostings: Map<string, any> = new Map();
const mockDomains: Map<string, any> = new Map();
const mockIntegrations: Map<string, any> = new Map();
const mockSecrets: Map<string, any> = new Map();
const mockSubscriptions: Map<string, any> = new Map();
const mockAttachments: Map<string, any> = new Map();
const mockAuditLogs: any[] = [];

export class DatabaseService {
  private useSupabase: boolean;

  constructor() {
    this.useSupabase = isSupabaseConfigured();
    if (this.useSupabase) {
      console.log('[Database] Usando Supabase');
    } else {
      console.log('[Database] Usando Supabase');
    }
  }

  // ==================== USERS ====================
  
  private passwordColumnExists: boolean | null = null;

  async checkPasswordColumn(): Promise<boolean> {
    if (this.passwordColumnExists !== null) return this.passwordColumnExists;
    
    if (!supabaseAdmin) {
      this.passwordColumnExists = false;
      return false;
    }
    
    try {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("password")
        .limit(1);
      
      this.passwordColumnExists = !error;
      return this.passwordColumnExists;
    } catch {
      this.passwordColumnExists = false;
      return false;
    }
  }

  private getDefaultPassword(email: string): string {
    // Senhas padrão baseadas no email (temporário até adicionar coluna)
    const passwords: Record<string, string> = {
      "admin@controle.app": "admin123",
      "editor@controle.app": "editor123",
      "viewer@controle.app": "viewer123",
    };
    return passwords[email] || "";
  }

  async findUserByEmail(email: string): Promise<(User & { password: string }) | null> {
    if (this.useSupabase && supabaseAdmin) {
      const hasPasswordCol = await this.checkPasswordColumn();
      
      // Buscar com ou sem a coluna password
      const selectFields = hasPasswordCol 
        ? "*" 
        : "id, email, name, role, avatar_url, created_at, updated_at";
      
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select(selectFields)
        .eq("email", email)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error("[Database] Erro ao buscar usuario:", error);
        throw new Error("Erro de conexão com o banco de dados");
      }

      if (!data) return null;

      const userData = data as any;
      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar_url,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        password: hasPasswordCol ? (userData.password || "") : this.getDefaultPassword(email),
      };
    }

    throw new Error("Supabase não configurado");
  }

  async getUsers(): Promise<User[]> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Database] Erro ao buscar perfis:", error);
        throw new Error("Erro de conexão com o banco de dados");
      }

      return data.map(p => ({
        id: p.id,
        email: p.email,
        name: p.name,
        role: p.role,
        avatar: p.avatar_url,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
    }

    throw new Error("Supabase não configurado");
  }

  // ==================== APPS ====================
  
  async getApps(search?: string): Promise<any[]> {
    if (this.useSupabase && supabaseAdmin) {
      let query = supabaseAdmin
        .from("apps")
        .select("*, profiles!apps_owner_id_fkey(name)")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,commercial_name.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("[Database] Erro ao buscar apps:", error);
        throw new Error("Erro de conexão com o banco de dados");
      }

      return data || [];
    }

    throw new Error("Supabase não configurado");
  }

  async getAppById(id: string): Promise<any | null> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("apps")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return null;
      return data;
    }

    throw new Error("Supabase não configurado");
  }

  async createApp(app: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("apps")
        .insert(toSnakeCase(app))
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    throw new Error("Supabase não configurado");
  }

  async updateApp(id: string, updates: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("apps")
        .update(toSnakeCase(updates))
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    throw new Error("Supabase não configurado");
  }

  async deleteApp(id: string): Promise<void> {
    if (this.useSupabase && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("apps")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return;
    }

    throw new Error("Supabase não configurado");
  }

  // ==================== HOSTINGS ====================
  
  async getHostingsByApp(appId: string): Promise<any[]> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("hostings")
        .select("*")
        .eq("app_id", appId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar hostings:", error);
        return [];
      }

      return data || [];
    }

    throw new Error("Supabase não configurado");
  }

  async getHostingById(id: string): Promise<any | null> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("hostings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return null;
      return data;
    }

    throw new Error("Supabase não configurado");
  }

  async createHosting(hosting: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("hostings")
        .insert(toSnakeCase(hosting))
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const id = crypto.randomUUID();
    const newHosting = { ...hosting, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    throw new Error("Supabase não configurado");
  }

  async updateHosting(id: string, updates: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("hostings")
        .update(toSnakeCase(updates))
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    throw new Error("Supabase não configurado");
  }

  async deleteHosting(id: string): Promise<void> {
    if (this.useSupabase && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("hostings")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return;
    }

    throw new Error("Supabase não configurado");
  }

  // ==================== DOMAINS ====================
  
  async getDomainsByApp(appId: string): Promise<any[]> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("domains")
        .select("*")
        .eq("app_id", appId)
        .order("created_at", { ascending: false });

      if (error) return [];
      return data || [];
    }

    throw new Error("Supabase não configurado");
  }

  async getDomainById(id: string): Promise<any | null> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("domains")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return null;
      return data;
    }

    throw new Error("Supabase não configurado");
  }

  async createDomain(domain: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("domains")
        .insert(toSnakeCase(domain))
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const id = crypto.randomUUID();
    const newDomain = { ...domain, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    throw new Error("Supabase não configurado");
  }

  async updateDomain(id: string, updates: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("domains")
        .update(toSnakeCase(updates))
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    throw new Error("Supabase não configurado");
  }

  async deleteDomain(id: string): Promise<void> {
    if (this.useSupabase && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("domains")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return;
    }

    throw new Error("Supabase não configurado");
  }

  // ==================== SECRETS ====================
  
  async getSecrets(appId: string): Promise<any[]> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("secrets")
        .select("id, app_id, secret_type, label, metadata, created_at, updated_at")
        .eq("app_id", appId)
        .order("created_at", { ascending: false });

      if (error) return [];
      return data || [];
    }

    throw new Error("Supabase não configurado");
  }

  async getSecretById(id: string): Promise<any | null> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("secrets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return null;
      return data;
    }

    throw new Error("Supabase não configurado");
  }

  async createSecret(secret: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("secrets")
        .insert(toSnakeCase(secret))
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const id = crypto.randomUUID();
    const newSecret = { ...secret, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    throw new Error("Supabase não configurado");
  }

  async updateSecret(id: string, updates: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("secrets")
        .update(toSnakeCase(updates))
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    throw new Error("Supabase não configurado");
  }

  async deleteSecret(id: string): Promise<void> {
    if (this.useSupabase && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("secrets")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return;
    }

    throw new Error("Supabase não configurado");
  }

  // ==================== AUDIT LOGS ====================
  
  async createAuditLog(log: {
    userId?: string;
    userEmail?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    if (this.useSupabase && supabaseAdmin) {
      const { error } = await supabaseAdmin.from("audit_logs").insert({
        user_id: log.userId,
        user_email: log.userEmail,
        action: log.action,
        resource_type: log.resourceType,
        resource_id: log.resourceId,
        old_data: log.oldData,
        new_data: log.newData,
        ip_address: log.ipAddress,
        user_agent: log.userAgent,
      });

      if (error) {
        console.error("Erro ao criar log de auditoria:", error);
      }
    } else {
      throw new Error("Supabase não configurado");
    }
  }

  async getAuditLogs(limit: number = 100): Promise<any[]> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw new Error("Erro de conexão com o banco de dados");
      return data || [];
    }

    throw new Error("Supabase não configurado");
  }
}

export const db = new DatabaseService();
