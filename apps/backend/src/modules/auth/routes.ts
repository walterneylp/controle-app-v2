import { Router } from "express";
import { z } from "zod";
import { ValidationError } from "../../core/errors.js";
import type { AuthenticatedRequest } from "../../core/types.js";
import { requireAuth, generateToken, authenticateWithSupabase } from "../../core/auth.js";
import { db } from "../../services/database.js";
import { isSupabaseConfigured } from "../../integrations/supabase.js";
import { env } from "../../config/env.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ValidationError("Dados inválidos", parsed.error.flatten().fieldErrors);
  }

  const { email, password } = parsed.data;

  // Tentar autenticar com Supabase primeiro (se configurado)
  if (isSupabaseConfigured()) {
    const supabaseAuth = await authenticateWithSupabase(email, password);
    if (supabaseAuth) {
      return res.json({
        success: true,
        data: {
          token: supabaseAuth.token,
          user: supabaseAuth.user,
        },
      });
    }
  }

  // Fallback: autenticação local (para desenvolvimento)
  const user = await db.findUserByEmail(email);

  if (!user || user.password !== password) {
    throw new ValidationError("Email ou senha incorretos");
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Registrar log de auditoria
  await db.createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: "login",
    resourceType: "auth",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: {
      token,
      user: userWithoutPassword,
    },
  });
});

authRouter.get("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});

authRouter.get("/users", requireAuth, async (_req, res) => {
  const users = await db.getUsers();
  res.json({
    success: true,
    data: { users },
  });
});

authRouter.post("/logout", requireAuth, async (req: AuthenticatedRequest, res) => {
  // Registrar log de auditoria
  await db.createAuditLog({
    userId: req.user?.id,
    userEmail: req.user?.email,
    action: "logout",
    resourceType: "auth",
  });

  res.json({
    success: true,
    data: { message: "Logout realizado com sucesso" },
  });
});

// Rota para verificar configuração
authRouter.get("/config", (_req, res) => {
  res.json({
    success: true,
    data: {
      supabaseConfigured: isSupabaseConfigured(),
      environment: env.NODE_ENV,
    },
  });
});
