import { supabaseAdmin, isSupabaseConfigured } from "../integrations/supabase.js";
import type { User, UserRole } from "../core/types.js";

// Mock data para desenvolvimento sem Supabase
const mockUsers: Map<string, User & { password: string }> = new Map([
  ["1", { id: "1", email: "admin@controle.app", name: "Administrador", role: "admin" as UserRole, password: "admin123", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  ["2", { id: "2", email: "editor@controle.app", name: "Editor", role: "editor" as UserRole, password: "editor123", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  ["3", { id: "3", email: "viewer@controle.app", name: "Visualizador", role: "viewer" as UserRole, password: "viewer123", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
]);

export class DatabaseService {
  private useSupabase: boolean;

  constructor() {
    this.useSupabase = isSupabaseConfigured();
  }

  // ==================== USERS ====================
  
  async findUserByEmail(email: string): Promise<(User & { password: string }) | null> {
    if (this.useSupabase && supabaseAdmin) {
      // Buscar no Auth do Supabase
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      
      if (error) {
        console.error("Erro ao buscar usuários:", error);
        return null;
      }

      const user = data.users.find(u => u.email === email);
      if (!user) return null;

      // Buscar perfil adicional
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
        password: "", // Senha não é retornada, usamos auth do Supabase
      };
    }

    // Fallback para mock
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
        .select("*")
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

    // Mock
    return [];
  }

  // ==================== SECRETS ====================
  
  async getSecrets(appId: string): Promise<any[]> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("secrets")
        .select("id, app_id, type, label, metadata, created_at, updated_at")
        .eq("app_id", appId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar segredos:", error);
        return [];
      }

      return data || [];
    }

    return [];
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

    return null;
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
    }
  }

  async getAuditLogs(limit: number = 100): Promise<any[]> {
    if (this.useSupabase && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Erro ao buscar logs:", error);
        return [];
      }

      return data || [];
    }

    return [];
  }
}

export const db = new DatabaseService();
