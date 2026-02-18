import { Router } from "express";
import { z } from "zod";
import { ValidationError } from "../../core/errors.js";
import type { AuthenticatedRequest } from "../../core/types.js";
import { findUserByEmail, getMockUsers, requireAuth } from "../../core/auth.js";

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
  const user = findUserByEmail(email);

  if (!user || user.password !== password) {
    throw new ValidationError("Email ou senha incorretos");
  }

  // Generate mock token (in production, use JWT)
  const token = `mock-token-${user.id}-${Date.now()}`;

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
  });
});

authRouter.get("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});

authRouter.get("/users", requireAuth, (_req, res) => {
  res.json({
    success: true,
    data: { users: getMockUsers() },
  });
});
