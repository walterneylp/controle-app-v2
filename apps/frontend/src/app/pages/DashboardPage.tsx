import { useEffect, useState } from "react";
import { 
  Package, 
  Key, 
  CreditCard, 
  FileText, 
  AlertCircle,
  TrendingUp,
  Activity,
  Clock
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  color: "blue" | "green" | "amber" | "purple" | "red";
}

function StatCard({ icon: Icon, label, value, trend, trendUp, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    green: "bg-green-500/10 text-green-600 dark:text-green-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-surface-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp 
                className={cn(
                  "w-4 h-4",
                  trendUp ? "text-green-500" : "text-red-500 rotate-180"
                )} 
              />
              <span className={cn(
                "text-sm font-medium",
                trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

interface ActivityItem {
  id: string;
  type: "create" | "update" | "delete" | "view";
  resource: string;
  description: string;
  user: string;
  timestamp: string;
}

function ActivityFeed() {
  const [activities] = useState<ActivityItem[]>([
    { id: "1", type: "create", resource: "App", description: "Novo app criado: Cliente Portal", user: "Admin", timestamp: "2026-02-17T19:30:00Z" },
    { id: "2", type: "update", resource: "Segredo", description: "API Key atualizada", user: "Editor", timestamp: "2026-02-17T18:15:00Z" },
    { id: "3", type: "view", resource: "Assinatura", description: "Visualização de dados de pagamento", user: "Viewer", timestamp: "2026-02-17T17:45:00Z" },
    { id: "4", type: "delete", resource: "Anexo", description: "Arquivo removido", user: "Admin", timestamp: "2026-02-17T16:20:00Z" },
    { id: "5", type: "create", resource: "Domínio", description: "Novo domínio registrado", user: "Editor", timestamp: "2026-02-17T15:00:00Z" },
  ]);

  const typeIcons = {
    create: "➕",
    update: "✏️",
    delete: "🗑️",
    view: "👁️",
  };

  const typeColors = {
    create: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
    update: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
    delete: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
    view: "text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-800",
  };

  return (
    <div className="card">
      <div className="p-6 border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
            Atividades Recentes
          </h3>
        </div>
      </div>
      <div className="divide-y divide-surface-200 dark:divide-surface-800">
        {activities.map((activity) => (
          <div key={activity.id} className="p-4 flex items-start gap-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg", typeColors[activity.type])}>
              {typeIcons[activity.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 dark:text-white">
                {activity.description}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                {activity.resource} • {activity.user}
              </p>
            </div>
            <span className="text-xs text-surface-400 dark:text-surface-500 whitespace-nowrap">
              {new Date(activity.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AlertItem {
  id: string;
  severity: "high" | "medium" | "low";
  message: string;
  app: string;
}

function AlertsPanel() {
  const [alerts] = useState<AlertItem[]>([
    { id: "1", severity: "high", message: "Domínio expira em 7 dias", app: "Cliente Portal" },
    { id: "2", severity: "medium", message: "Assinatura pendente", app: "API Service" },
    { id: "3", severity: "low", message: "Novo anexo adicionado", app: "E-commerce" },
  ]);

  const severityConfig = {
    high: { label: "Alta", className: "badge-danger" },
    medium: { label: "Média", className: "badge-warning" },
    low: { label: "Baixa", className: "badge-info" },
  };

  return (
    <div className="card">
      <div className="p-6 border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
              Alertas
            </h3>
          </div>
          <span className="badge badge-warning">{alerts.length} pendentes</span>
        </div>
      </div>
      <div className="divide-y divide-surface-200 dark:divide-surface-800">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-4 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-white">
                {alert.message}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                {alert.app}
              </p>
            </div>
            <span className={cn("badge text-xs", severityConfig[alert.severity].className)}>
              {severityConfig[alert.severity].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with time */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Visão geral do seu ambiente
          </p>
        </div>
        <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400 bg-white dark:bg-surface-900 px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-800">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            {currentTime.toLocaleTimeString("pt-BR")}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          label="Total de Apps"
          value={formatNumber(12)}
          trend="+2 este mês"
          trendUp={true}
          color="blue"
        />
        <StatCard
          icon={Key}
          label="Segredos"
          value={formatNumber(48)}
          trend="+5 esta semana"
          trendUp={true}
          color="purple"
        />
        <StatCard
          icon={CreditCard}
          label="Assinaturas"
          value={formatNumber(8)}
          trend="1 vencendo"
          trendUp={false}
          color="amber"
        />
        <StatCard
          icon={FileText}
          label="Anexos"
          value={formatNumber(156)}
          trend="+12 este mês"
          trendUp={true}
          color="green"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed />
        <AlertsPanel />
      </div>

      {/* Quick actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Package, label: "Novo App", color: "bg-blue-500" },
            { icon: Key, label: "Novo Segredo", color: "bg-purple-500" },
            { icon: CreditCard, label: "Nova Assinatura", color: "bg-amber-500" },
            { icon: FileText, label: "Novo Anexo", color: "bg-green-500" },
          ].map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors group"
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", action.color)}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
