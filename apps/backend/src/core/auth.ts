import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError, ForbiddenError } from "./errors.js";
import type { AuthenticatedRequest, UserRole, User } from "./types.js";
import { db } from "../services/database.js";
import { isSupabaseConfigured, supabaseAuth } from "../integrations/supabase.js";

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Gera um JWT token
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
}

/**
 * Verifica e decodifica um JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Middleware para requerer autenticação
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  
  console.log("[Auth] Header recebido:", authHeader ? authHeader.substring(0, 20) + "..." : "null");

  if (!authHeader?.startsWith("Bearer ")) {
    console.log("[Auth] Header nao comeca com Bearer");
    throw new UnauthorizedError();
  }

  const token = authHeader.slice(7);
  console.log("[Auth] Token extraido, tamanho:", token.length);
  
  const payload = verifyToken(token);
  console.log("[Auth] Payload verificado:", payload ? "valido" : "invalido");

  if (!payload) {
    throw new UnauthorizedError("Token inválido ou expirado");
  }

  // Buscar usuário completo no banco
  const user = await db.findUserByEmail(payload.email);

  if (!user) {
    throw new UnauthorizedError("Usuário não encontrado");
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  next();
}

/**
 * Middleware para requerer roles específicas
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError();
    }

    next();
  };
}

/**
 * Autenticação via Supabase Auth (alternativa ao JWT local)
 */
export async function authenticateWithSupabase(
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  if (!isSupabaseConfigured() || !supabaseAuth) {
    return null;
  }

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return null;
  }

  const supabaseUser = data.user;
  const role = (supabaseUser.app_metadata?.role as UserRole) || "viewer";

  const user: User = {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    name: supabaseUser.user_metadata?.name || supabaseUser.email!,
    role,
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
  };

  // Gerar nosso próprio token JWT
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
}
