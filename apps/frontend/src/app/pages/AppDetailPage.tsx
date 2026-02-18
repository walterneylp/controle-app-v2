import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Edit, 
  Package,
  Server,
  Globe,
  Key,
  CreditCard,
  FileText,
  Activity,
  Loader2
} from "lucide-react";
import { getApp, getHostings, deleteHosting } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { cn, formatDate } from "@/lib/utils";

type Tab = "overview" | "hosting" | "domains" | "secrets" | "subscriptions" | "attachments";

export function AppDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [app, setApp] = useState<any>(null);
  const [hostings, setHostings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const user = useAuthStore((state) => state.user);
  const canEdit = user?.role === "admin" || user?.role === "editor";

  useEffect(() => {
    if (id) {
      loadAppData();
    }
  }, [id]);

  async function loadAppData() {
    try {
      setLoading(true);
      const [appRes, hostingsRes] = await Promise.all([
        getApp(id!),
        getHostings(id!),
      ]);
      setApp(appRes.data.app);
      setHostings(hostingsRes.data.hostings);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteHosting(hostingId: string) {
    if (!confirm("Excluir esta hospedagem?")) return;
    
    try {
      await deleteHosting(hostingId);
      setHostings(hostings.filter(h => h.id !== hostingId));
    } catch (err: any) {
      alert(err.message || "Erro ao excluir");
    }
  }

  const tabs = [
    { id: "overview", label: "Visao Geral", icon: Package },
    { id: "hosting", label: "Hospedagem", icon: Server },
    { id: "domains", label: "Dominios", icon: Globe },
    { id: "secrets", label: "Segredos", icon: Key },
    { id: "subscriptions", label: "Assinaturas", icon: CreditCard },
    { id: "attachments", label: "Anexos", icon: FileText },
  ] as const;

  const statusColors: Record<string, string> = {
    active: "badge-success",
    inactive: "badge-warning",
    archived: "badge-danger",
  };

  const statusLabels: Record<string, string> = {
    active: "Ativo",
    inactive: "Inativo",
    archived: "Arquivado",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="space-y-6">
        <Link to="/apps" className="inline-flex items-center gap-2 text-surface-600 hover:text-surface-900">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          {error || "App nao encontrado"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/apps"
            className="p-2 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
                {app.commercialName}
              </h1>
              <span className={cn("badge", statusColors[app.status])}>
                {statusLabels[app.status]}
              </span>
            </div>
            <p className="text-surface-500 dark:text-surface-400">
              {app.name}
            </p>
          </div>
        </div>
        
        {canEdit && (
          <Link
            to={`/apps/${id}/edit`}
            className="btn-secondary inline-flex"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-200 dark:border-surface-800 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {app.description && (
              <div>
                <h3 className="text-sm font-medium text-surface-500 dark:text-surface-400 mb-2">
                  Descricao
                </h3>
                <p className="text-surface-900 dark:text-white">
                  {app.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                <p className="text-xs text-surface-500 dark:text-surface-400">Status</p>
                <p className="font-medium text-surface-900 dark:text-white capitalize">
                  {statusLabels[app.status]}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                <p className="text-xs text-surface-500 dark:text-surface-400">Criado em</p>
                <p className="font-medium text-surface-900 dark:text-white">
                  {formatDate(app.createdAt)}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                <p className="text-xs text-surface-500 dark:text-surface-400">Hospedagens</p>
                <p className="font-medium text-surface-900 dark:text-white">
                  {hostings.length}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                <p className="text-xs text-surface-500 dark:text-surface-400">Tags</p>
                <p className="font-medium text-surface-900 dark:text-white">
                  {app.tags?.length || 0}
                </p>
              </div>
            </div>

            {app.tags?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-surface-500 dark:text-surface-400 mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {app.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "hosting" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                Hospedagens
              </h3>
              {canEdit && (
                <button className="btn-primary text-sm">
                  Adicionar Hospedagem
                </button>
              )}
            </div>

            {hostings.length === 0 ? (
              <div className="text-center py-8">
                <Server className="w-12 h-12 text-surface-400 mx-auto mb-4" />
                <p className="text-surface-500 dark:text-surface-400">
                  Nenhuma hospedagem cadastrada
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {hostings.map((hosting) => (
                  <div
                    key={hosting.id}
                    className="p-4 rounded-lg border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-surface-900 dark:text-white">
                          {hosting.provider}
                        </h4>
                        <p className="text-sm text-surface-500 dark:text-surface-400">
                          {hosting.serverName || "Servidor sem nome"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "badge",
                          hosting.isActive ? "badge-success" : "badge-warning"
                        )}>
                          {hosting.isActive ? "Ativo" : "Inativo"}
                        </span>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => handleDeleteHosting(hosting.id)}
                            className="p-1.5 text-surface-400 hover:text-red-600 rounded"
                          >
                            x
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-surface-500 dark:text-surface-400">Tipo</p>
                        <p className="text-surface-900 dark:text-white capitalize">
                          {hosting.serverType}
                        </p>
                      </div>
                      <div>
                        <p className="text-surface-500 dark:text-surface-400">IP</p>
                        <p className="text-surface-900 dark:text-white font-mono">
                          {hosting.ipAddress || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-surface-500 dark:text-surface-400">Regiao</p>
                        <p className="text-surface-900 dark:text-white">
                          {hosting.region || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-surface-500 dark:text-surface-400">SSH Port</p>
                        <p className="text-surface-900 dark:text-white">
                          {hosting.sshPort}
                        </p>
                      </div>
                    </div>

                    {hosting.notes && (
                      <p className="mt-3 text-sm text-surface-600 dark:text-surface-300">
                        {hosting.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "domains" && (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-500 dark:text-surface-400">
              Modulo de dominios em desenvolvimento
            </p>
          </div>
        )}

        {activeTab === "secrets" && (
          <div className="text-center py-8">
            <Key className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-500 dark:text-surface-400">
              Modulo de segredos em desenvolvimento
            </p>
          </div>
        )}

        {activeTab === "subscriptions" && (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-500 dark:text-surface-400">
              Modulo de assinaturas em desenvolvimento
            </p>
          </div>
        )}

        {activeTab === "attachments" && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-500 dark:text-surface-400">
              Modulo de anexos em desenvolvimento
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
