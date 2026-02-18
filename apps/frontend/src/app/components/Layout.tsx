import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Key, 
  CreditCard, 
  FileText, 
  Users, 
  Settings,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Bell
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/auth";
import { cn, formatDateTime } from "@/lib/utils";
import { BUILD_NUMBER, VERSION_LABEL } from "@/generated/buildInfo";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Package, label: "Aplicações", path: "/apps" },
  { icon: Key, label: "Segredos", path: "/secrets" },
  { icon: CreditCard, label: "Assinaturas", path: "/subscriptions" },
  { icon: FileText, label: "Anexos", path: "/attachments" },
  { icon: Users, label: "Usuários", path: "/users" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useState(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const themeOptions = [
    { value: "light", icon: Sun, label: "Claro" },
    { value: "dark", icon: Moon, label: "Escuro" },
    { value: "system", icon: Monitor, label: "Sistema" },
  ] as const;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 flex flex-col transition-all duration-300 z-50",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-surface-200 dark:border-surface-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="ml-3 font-semibold text-surface-900 dark:text-white">
              Controle v2
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                    : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100",
                  sidebarCollapsed && "justify-center px-2"
                )
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-surface-200 dark:border-surface-800 p-2 space-y-2">
          {/* Theme switcher */}
          {!sidebarCollapsed ? (
            <div className="px-2 py-2">
              <p className="text-xs font-medium text-surface-500 dark:text-surface-500 mb-2">
                Tema
              </p>
              <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-1">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex-1 flex items-center justify-center py-1.5 rounded-md transition-all",
                      theme === option.value
                        ? "bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm"
                        : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                    )}
                    title={option.label}
                  >
                    <option.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="w-full flex justify-center py-2 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          )}

          {/* User info */}
          {!sidebarCollapsed && user && (
            <div className="px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors",
              sidebarCollapsed && "justify-center px-2"
            )}
            title={sidebarCollapsed ? "Sair" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Sair</span>}
          </button>

          {/* Version info */}
          <div className={cn(
            "px-3 py-2 border-t border-surface-200 dark:border-surface-800",
            sidebarCollapsed && "px-2 text-center"
          )}>
            {!sidebarCollapsed ? (
              <>
                <p className="text-[10px] text-surface-400 dark:text-surface-600">
                  Build {BUILD_NUMBER} • {formatDateTime(currentTime)}
                </p>
                <p className="text-[10px] text-surface-400 dark:text-surface-600 truncate" title={VERSION_LABEL}>
                  {VERSION_LABEL}
                </p>
              </>
            ) : (
              <span className="text-[10px] text-surface-400 dark:text-surface-600">
                v{BUILD_NUMBER}
              </span>
            )}
          </div>
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full flex items-center justify-center shadow-sm hover:shadow transition-shadow"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3 h-3 text-surface-500" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-surface-500" />
          )}
        </button>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm border-b border-surface-200 dark:border-surface-800 sticky top-0 z-40">
          <div className="h-full px-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-surface-900 dark:text-white">
              Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
