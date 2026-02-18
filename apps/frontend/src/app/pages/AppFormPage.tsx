import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Package,
  Loader2,
  Github,
  BookOpen
} from "lucide-react";
import { createApp, updateApp, getApp } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AppFormData {
  name: string;
  commercialName: string;
  description: string;
  status: "active" | "inactive" | "archived";
  tags: string;
  repositoryUrl: string;
  documentationUrl: string;
}

export function AppFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<AppFormData>({
    name: "",
    commercialName: "",
    description: "",
    status: "active",
    tags: "",
    repositoryUrl: "",
    documentationUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadApp(id);
    }
  }, [id]);

  async function loadApp(appId: string) {
    try {
      setLoading(true);
      const response = await getApp(appId);
      const app = response.data.app;
      setFormData({
        name: app.name || "",
        commercialName: app.commercialName || "",
        description: app.description || "",
        status: app.status || "active",
        tags: app.tags?.join(", ") || "",
        repositoryUrl: app.repositoryUrl || "",
        documentationUrl: app.documentationUrl || "",
      });
    } catch (err: any) {
      setError(err.message || "Erro ao carregar app");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const data = {
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      };

      if (isEditing && id) {
        await updateApp(id, data);
      } else {
        await createApp(data);
      }

      navigate("/apps");
    } catch (err: any) {
      setError(err.message || "Erro ao salvar app");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/apps"
          className="p-2 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            {isEditing ? "Editar App" : "Novo App"}
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            {isEditing ? "Atualize as informacoes do app" : "Cadastre uma nova aplicacao"}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" />
            Informacoes Basicas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Nome Interno *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="ex: cliente-portal"
              />
              <p className="text-xs text-surface-500 mt-1">
                Identificador unico, sem espacos
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Nome Comercial *
              </label>
              <input
                type="text"
                required
                value={formData.commercialName}
                onChange={(e) => setFormData({ ...formData, commercialName: e.target.value })}
                className="input"
                placeholder="ex: Cliente Portal"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Descricao
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input resize-none"
              placeholder="Descricao do app..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="input"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input"
                placeholder="saas, cliente, portal"
              />
              <p className="text-xs text-surface-500 mt-1">
                Separe por virgulas
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-4 pt-6 border-t border-surface-200 dark:border-surface-800">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
            <Github className="w-5 h-5 text-primary-600" />
            Links
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Repositorio
              </label>
              <input
                type="url"
                value={formData.repositoryUrl}
                onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
                className="input"
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Documentacao
              </label>
              <input
                type="url"
                value={formData.documentationUrl}
                onChange={(e) => setFormData({ ...formData, documentationUrl: e.target.value })}
                className="input"
                placeholder="https://docs..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-surface-200 dark:border-surface-800">
          <Link
            to="/apps"
            className="btn-secondary"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
