# Supabase - Configuração do Banco de Dados

## 📋 Estrutura

```
supabase/
├── migrations/          # Migrações do schema
│   └── 001_initial_schema.sql
├── seeds/              # Dados iniciais
│   └── initial_data.sql
├── functions/          # Funções SQL
│   └── exec_sql.sql
└── migrate.mjs         # Script de migração
```

## 🚀 Configuração Rápida

### Opção 1: SQL Editor do Supabase (Recomendado)

1. Acesse o [Dashboard do Supabase](https://crm.apogeuautomacao.ia.br/project/default)
2. Vá em **SQL Editor** → **New Query**
3. Cole o conteúdo do arquivo `migrations/001_initial_schema.sql`
4. Execute clicando em **Run**
5. Repita para `functions/exec_sql.sql`
6. (Opcional) Execute `seeds/initial_data.sql` para dados de teste

### Opção 2: Script Automático (requer service role key)

```bash
# Definir variável de ambiente
export SUPABASE_SERVICE_ROLE_KEY="sua-chave-aqui"
export SUPABASE_URL="https://crm.apogeuautomacao.ia.br"

# Executar migrations
node infra/supabase/migrate.mjs up

# Popular com dados iniciais
node infra/supabase/migrate.mjs seed

# Verificar status
node infra/supabase/migrate.mjs status
```

## 🔐 Configuração de Autenticação

### 1. Criar usuários no Auth

No Dashboard do Supabase:
1. Vá em **Authentication** → **Users**
2. Clique em **Add User** → **Create New User**
3. Crie os 3 usuários de teste:
   - `admin@controle.app` / `admin123`
   - `editor@controle.app` / `editor123`
   - `viewer@controle.app` / `viewer123`

### 2. Configurar metadados (role)

Para cada usuário criado, adicione os metadados:

```json
{
  "role": "admin"
}
```

Ou execute via SQL:

```sql
-- Atualizar roles (substitua os UUIDs pelos IDs reais dos usuários)
UPDATE auth.users 
SET raw_app_meta_data = '{"role": "admin"}'
WHERE email = 'admin@controle.app';

UPDATE auth.users 
SET raw_app_meta_data = '{"role": "editor"}'
WHERE email = 'editor@controle.app';

UPDATE auth.users 
SET raw_app_meta_data = '{"role": "viewer"}'
WHERE email = 'viewer@controle.app';
```

### 3. Criar perfis

Após criar os usuários, execute o seed ou crie manualmente:

```sql
INSERT INTO public.profiles (id, email, name, role)
SELECT id, email, 
  CASE email
    WHEN 'admin@controle.app' THEN 'Administrador'
    WHEN 'editor@controle.app' THEN 'Editor'
    ELSE 'Visualizador'
  END,
  COALESCE(raw_app_meta_data->>'role', 'viewer')
FROM auth.users
WHERE email IN ('admin@controle.app', 'editor@controle.app', 'viewer@controle.app');
```

## 🗄️ Schema do Banco

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de usuários (estende auth.users) |
| `apps` | Aplicações/SaaS cadastrados |
| `hostings` | Servidores e hospedagens |
| `domains` | Domínios registrados |
| `integrations` | Integrações com APIs |
| `secrets` | Credenciais criptografadas |
| `subscriptions` | Assinaturas e pagamentos |
| `attachments` | Arquivos anexados |
| `audit_logs` | Logs de auditoria |
| `alerts` | Alertas do sistema |

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com políticas:
- **Viewers**: Podem visualizar dados
- **Editors**: Podem criar e editar
- **Admins**: Acesso total

## 🔧 Configuração do Backend

Adicione ao `.env` do backend:

```env
# Supabase (opcional - sem isso usa mock data)
SUPABASE_URL=https://crm.apogeuautomacao.ia.br
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# Criptografia (obrigatório - mínimo 32 caracteres)
ENCRYPTION_KEY=sua-chave-secreta-de-32-caracteres-minimo
```

## 📊 Storage

Criar bucket para anexos:

```sql
-- Executar no SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false);
```

## 🧪 Testando

Após configurar:

```bash
cd kimi
npm install
npm run dev:backend
npm run dev:frontend
```

Acesse http://localhost:5173 e faça login com:
- Email: `admin@controle.app`
- Senha: `admin123`

## 📝 Troubleshooting

### Erro: "relation does not exist"
Execute as migrations na ordem correta.

### Erro: "new row violates row-level security policy"
Verifique se o service role key está configurado corretamente.

### Erro: "invalid input syntax for type uuid"
Certifique-se de que os UUIDs nos seeds correspondem aos usuários criados no Auth.

## 🔒 Segurança

- Nunca compartilhe a `SUPABASE_SERVICE_ROLE_KEY`
- Use a `SUPABASE_ANON_KEY` apenas no frontend
- A `ENCRYPTION_KEY` deve ter exatamente 32 caracteres
- Em produção, use variáveis de ambiente seguras
