import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Moon, Sun, Eye, EyeOff, Loader2 } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";
import { BUILD_NUMBER, VERSION_LABEL } from "@/generated/buildInfo";
import { login as loginApi } from "@/lib/api";

export function LoginPage() {
  const [email, setEmail] = useState("admin@controle.app");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { resolvedTheme, setTheme } = useTheme();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await loginApi(email, password);
      const { token, user } = response.data;
      
      setAuth(user, token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-surface-900" />
        
        {/* Animated circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-20 w-60 h-60 bg-primary-400/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-surface-900/30 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
              <Package className="w-8 h-8" />
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold mb-4">
              Controle Técnico
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Gerencie suas aplicações, infraestrutura e credenciais em um só lugar.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-lg font-bold">01</span>
              </div>
              <div>
                <h3 className="font-semibold">Centralizado</h3>
                <p className="text-sm text-white/70">Todas as informações em um só lugar</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-lg font-bold">02</span>
              </div>
              <div>
                <h3 className="font-semibold">Seguro</h3>
                <p className="text-sm text-white/70">Credenciais criptografadas</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-lg font-bold">03</span>
              </div>
              <div>
                <h3 className="font-semibold">Moderno</h3>
                <p className="text-sm text-white/70">Interface intuitiva e responsiva</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900 dark:text-white">
              Controle v2
            </span>
          </div>

          {/* Theme toggle */}
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-surface-500 dark:text-surface-400">
              Entre com suas credenciais para acessar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-900 border text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all",
                  error
                    ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                    : "border-surface-200 dark:border-surface-700"
                )}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-900 border text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all pr-12",
                    error
                      ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                      : "border-surface-200 dark:border-surface-700"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-medium rounded-xl shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 rounded-xl bg-surface-100 dark:bg-surface-800/50">
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
              Credenciais de demonstração
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-600 dark:text-surface-400">Admin:</span>
                <code className="text-surface-900 dark:text-surface-200">admin@controle.app / admin123</code>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600 dark:text-surface-400">Editor:</span>
                <code className="text-surface-900 dark:text-surface-200">editor@controle.app / editor123</code>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600 dark:text-surface-400">Viewer:</span>
                <code className="text-surface-900 dark:text-surface-200">viewer@controle.app / viewer123</code>
              </div>
            </div>
          </div>

          {/* Version */}
          <div className="mt-8 text-center">
            <p className="text-xs text-surface-400 dark:text-surface-600">
              Build {BUILD_NUMBER} • {VERSION_LABEL}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
