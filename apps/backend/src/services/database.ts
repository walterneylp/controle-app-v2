import { supabaseAdmin, isSupabaseConfigured } from "../integrations/supabase.js";
import type { User, UserRole } from "../core/types.js";
import { env } from "../config/env.js";

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
      console.log('[Database] Usando modo mock (dados em memória)');
    }
  }

  // ==================== USERS ====================
  
  async findUserByEmail(email: string): Promise<(User & { password: string }) | null> {
    if (this.useSupabase && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();
        
        if (error) {
          console.log("[Database] Erro Supabase, usando fallback mock:", error.message || error);
          // Fallback para mock
          const user = Array.from(mockUsers.values()).find(u => u.email === email);
          return user || null;
        }

        const user = data.users.find(u => u.email === email);
        if (!user) return null;

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        return {
          id: user.id,
          email: user.email!,
          name: profile?.name || user.user_metadata?.name || user.email!,
          role: profile?.role || user.app_metadata?.role || "viewer",
          avatar: profile?.avatar_url,
          createdAt: user.created_at,
          updatedAt: user.updated_at || user.created_at,
          password: "",
        };
      } catch (err) {
        console.log("[Database] Exceção Supabase, usando fallback mock:", err instanceof Error ? err.message : err);
        // Fallback para mock
        const user = Array.from(mockUsers.values()).find(u => u.email === email);
        return user || null;
      }
    }

    const user = Array.from(mockUsers.values()).find(u => u.email === email);
    return user || null;
  }

  async getUsers(): Promise<User[]> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar perfis:", error);
        return [];
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

    return Array.from(mockUsers.values()).map(({ password, ...user }) => user);
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
        console.error("Erro ao buscar apps:", error);
        return [];
      }

      return data || [];
    }

    return Array.from(mockApps.values());
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

    return mockApps.get(id) || null;
  }

  async createApp(app: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("apps")
        .insert(app)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const id = crypto.randomUUID();
    const newApp = { ...app, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    mockApps.set(id, newApp);
    return newApp;
  }

  async updateApp(id: string, updates: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("apps")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const existing = mockApps.get(id);
    if (!existing) throw new Error("App not found");
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    mockApps.set(id, updated);
    return updated;
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

    mockApps.delete(id);
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

    return Array.from(mockHostings.values()).filter(h => h.appId === appId);
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

    return mockHostings.get(id) || null;
  }

  async createHosting(hosting: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("hostings")
        .insert(hosting)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const id = crypto.randomUUID();
    const newHosting = { ...hosting, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    mockHostings.set(id, newHosting);
    return newHosting;
  }

  async updateHosting(id: string, updates: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("hostings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const existing = mockHostings.get(id);
    if (!existing) throw new Error("Hosting not found");
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    mockHostings.set(id, updated);
    return updated;
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

    mockHostings.delete(id);
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

    return Array.from(mockDomains.values()).filter(d => d.appId === appId);
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

    return mockDomains.get(id) || null;
  }

  async createDomain(domain: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("domains")
        .insert(domain)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const id = crypto.randomUUID();
    const newDomain = { ...domain, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    mockDomains.set(id, newDomain);
    return newDomain;
  }

  async updateDomain(id: string, updates: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("domains")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const existing = mockDomains.get(id);
    if (!existing) throw new Error("Domain not found");
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    mockDomains.set(id, updated);
    return updated;
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

    mockDomains.delete(id);
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

    return Array.from(mockSecrets.values())
      .filter(s => s.appId === appId)
      .map(({ encryptedValue, iv, authTag, ...rest }) => rest);
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

    return mockSecrets.get(id) || null;
  }

  async createSecret(secret: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("secrets")
        .insert(secret)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const id = crypto.randomUUID();
    const newSecret = { ...secret, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    mockSecrets.set(id, newSecret);
    return { ...newSecret, encryptedValue: undefined, iv: undefined, authTag: undefined };
  }

  async updateSecret(id: string, updates: any): Promise<any> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("secrets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const existing = mockSecrets.get(id);
    if (!existing) throw new Error("Secret not found");
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    mockSecrets.set(id, updated);
    return { ...updated, encryptedValue: undefined, iv: undefined, authTag: undefined };
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

    mockSecrets.delete(id);
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
      mockAuditLogs.push({ ...log, createdAt: new Date().toISOString() });
    }
  }

  async getAuditLogs(limit: number = 100): Promise<any[]> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) return [];
      return data || [];
    }

    return mockAuditLogs.slice(-limit).reverse();
  }
}

export const db = new DatabaseService();
