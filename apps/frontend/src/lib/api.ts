import { useAuthStore } from "@/stores/auth";

const API_BASE = "/api";

async function getToken(): Promise<string | null> {
  return useAuthStore.getState().token;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || "Erro na requisicao");
  }
  
  return data as T;
}

// Auth
export async function login(email: string, password: string) {
  return fetchApi<{ data: { token: string; user: any } }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  return fetchApi<{ data: { user: any } }>("/auth/me");
}

// Apps
export async function getApps(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return fetchApi<{ data: { apps: any[] } }>(`/apps${query}`);
}

export async function getApp(id: string) {
  return fetchApi<{ data: { app: any } }>(`/apps/${id}`);
}

export async function createApp(app: any) {
  return fetchApi<{ data: { app: any } }>("/apps", {
    method: "POST",
    body: JSON.stringify(app),
  });
}

export async function updateApp(id: string, app: any) {
  return fetchApi<{ data: { app: any } }>(`/apps/${id}`, {
    method: "PUT",
    body: JSON.stringify(app),
  });
}

export async function deleteApp(id: string) {
  return fetchApi<{ data: { message: string } }>(`/apps/${id}`, {
    method: "DELETE",
  });
}

// Hostings
export async function getHostings(appId: string) {
  return fetchApi<{ data: { hostings: any[] } }>(`/hostings?appId=${appId}`);
}

export async function createHosting(hosting: any) {
  return fetchApi<{ data: { hosting: any } }>("/hostings", {
    method: "POST",
    body: JSON.stringify(hosting),
  });
}

export async function deleteHosting(id: string) {
  return fetchApi<{ data: { message: string } }>(`/hostings/${id}`, {
    method: "DELETE",
  });
}
