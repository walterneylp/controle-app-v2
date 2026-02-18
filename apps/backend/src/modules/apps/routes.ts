import { Router } from "express";
import { z } from "zod";
import { ValidationError, NotFoundError } from "../../core/errors.js";
import { requireAuth, requireRole } from "../../core/auth.js";
import type { AuthenticatedRequest } from "../../core/types.js";
import { db } from "../../services/database.js";

export const appsRouter = Router();

const createAppSchema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  commercialName: z.string().min(1, "Nome comercial obrigatorio"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
  tags: z.array(z.string()).default([]),
  repositoryUrl: z.string().url().optional().or(z.literal("")),
  documentationUrl: z.string().url().optional().or(z.literal("")),
});

const updateAppSchema = createAppSchema.partial();

// Listar apps
appsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const apps = await db.getApps(search);
  
  res.json({
    success: true,
    data: { apps },
  });
});

// Obter app por ID
appsRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const app = await db.getAppById(id);
  
  if (!app) {
    throw new NotFoundError("App");
  }
  
  res.json({
    success: true,
    data: { app },
  });
});

// Criar app
appsRouter.post("/", requireAuth, requireRole("admin", "editor"), async (req: AuthenticatedRequest, res) => {
  const parsed = createAppSchema.safeParse(req.body);
  
  if (!parsed.success) {
    throw new ValidationError("Dados invalidos", parsed.error.flatten().fieldErrors);
  }
  
  const app = await db.createApp({
    ...parsed.data,
    createdBy: req.user!.id,
  });
  
  const userAgent = req.headers["user-agent"];
  
  // Audit log
  await db.createAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: "create",
    resourceType: "app",
    resourceId: app.id,
    newData: app,
    ipAddress: req.ip,
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
  });
  
  res.status(201).json({
    success: true,
    data: { app },
  });
});

// Atualizar app
appsRouter.put("/:id", requireAuth, requireRole("admin", "editor"), async (req: AuthenticatedRequest, res) => {
  const parsed = updateAppSchema.safeParse(req.body);
  
  if (!parsed.success) {
    throw new ValidationError("Dados invalidos", parsed.error.flatten().fieldErrors);
  }
  
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existingApp = await db.getAppById(id);
  if (!existingApp) {
    throw new NotFoundError("App");
  }
  
  const app = await db.updateApp(id, {
    ...parsed.data,
    updatedBy: req.user!.id,
  });
  
  const userAgent = req.headers["user-agent"];
  
  // Audit log
  await db.createAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: "update",
    resourceType: "app",
    resourceId: id,
    oldData: existingApp,
    newData: app,
    ipAddress: req.ip,
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
  });
  
  res.json({
    success: true,
    data: { app },
  });
});

// Deletar app
appsRouter.delete("/:id", requireAuth, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existingApp = await db.getAppById(id);
  if (!existingApp) {
    throw new NotFoundError("App");
  }
  
  await db.deleteApp(id);
  
  const userAgent = req.headers["user-agent"];
  
  // Audit log
  await db.createAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: "delete",
    resourceType: "app",
    resourceId: id,
    oldData: existingApp,
    ipAddress: req.ip,
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
  });
  
  res.json({
    success: true,
    data: { message: "App deletado com sucesso" },
  });
});
