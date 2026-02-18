import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "./errors.js";
import type { AuthenticatedRequest, UserRole } from "./types.js";

// Mock users for development
const mockUsers = [
  { id: "1", email: "admin@controle.app", name: "Administrador", role: "admin" as UserRole, password: "admin123" },
  { id: "2", email: "editor@controle.app", name: "Editor", role: "editor" as UserRole, password: "editor123" },
  { id: "3", email: "viewer@controle.app", name: "Visualizador", role: "viewer" as UserRole, password: "viewer123" },
];

export function getMockUsers() {
  return mockUsers.map(u => ({ ...u, password: undefined }));
}

export function findUserByEmail(email: string) {
  return mockUsers.find(u => u.email === email);
}

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError();
  }

  const token = authHeader.slice(7);
  
  // For now, simple mock validation
  // In production, verify JWT here
  const mockUser = mockUsers[0]; // Simulating authenticated user
  
  if (!mockUser) {
    throw new UnauthorizedError("Token inválido");
  }

  req.user = {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
    role: mockUser.role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  next();
}

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
