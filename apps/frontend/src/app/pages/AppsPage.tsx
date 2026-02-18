import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Package, 
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Server,
  Globe,
  Key
} from "lucide-react";
import { getApps, deleteApp } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { cn, formatDate } from "@/lib/utils";

interface App {
  id: string;
  name: string;
  commercialName: string;
  description?: string;
  status: "active" | "inactive" | "archived";
  tags: string[];
  createdAt: string;
}

export function AppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = useAuthStore((state) => state.user);

  const canEdit = user?.role === "admin" || user?.role === "editor";

  useEffect(() => {
    loadApps();
  }, []);

  async function loadApps() {
    try {
      setLoading(true);
      const response = await getApps();
      setApps(response.data.apps);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar apps");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este app?")) return;
    
    try {
      await deleteApp(id);
      setApps(apps.filter((app) => app.id !== id));
    } catch (err: any) {
      alert(err.message || "Erro ao excluir app");
    }
  }

  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.commercialName.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    active: "badge-success",
    inactive: "badge-warning",
    archived: "badge-danger",
  };

  const statusLabels = {
    active: "Ativo",
    inactive: "Inativo",
    archived: "Arquivado",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Aplicacoes
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Gerencie seus apps e SaaS
          </p>
        </div>
        
        {canEdit && (
          <Link
            to="/apps/new"
            className="btn-primary inline-flex"
          >
            <Plus className="w-5 h-5" />
            Novo App
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text"
            placeholder="Buscar apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Apps Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-12 h-12 text-surface-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
            Nenhum app encontrado
          </h3>
          <p className="text-surface-500 dark:text-surface-400">
            {search ? "Tente outra busca" : "Crie seu primeiro app para comecar"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="card hover:shadow-lg transition-shadow group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-white">
                        {app.commercialName}
                      </h3>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        {app.name}
                      </p>
                    </div>
                  </div>
                  <span className={cn("badge", statusColors[app.status])}>
                    {statusLabels[app.status]}
                  </span>
                </div>

                {/* Description */}
                {app.description && (
                  <p className="text-sm text-surface-600 dark:text-surface-300 mb-4 line-clamp-2">
                    {app.description}
                  </p>
                )}

                {/* Tags */}
                {app.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {app.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400"
                      >
                        {tag}
                      </span>
                    ))}
                    {app.tags.length > 3 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-500">
                        +{app.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-surface-200 dark:border-surface-800">
                  <span className="text-xs text-surface-500 dark:text-surface-400">
                    Criado em {formatDate(app.createdAt)}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/apps/${app.id}`}
                      className="p-2 text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                      title="Ver detalhes"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    
                    {canEdit && (
                      <>
                        <Link
                          to={`/apps/${app.id}/edit`}
                          className="p-2 text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        
                        {user?.role === "admin" && (
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-2 text-surface-500 hover:text-red-600 dark:text-surface-400 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
