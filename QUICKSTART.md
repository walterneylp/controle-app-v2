# Quick Start - Controle App v2

## 1. Configurar Banco de Dados (Supabase)

### Passo 1: Criar Usuarios no Auth
1. Acesse: https://crm.apogeuautomacao.ia.br/project/default
2. Va em **Authentication** → **Users** → **Add User**
3. Crie 3 usuarios:

| Email | Senha | App Metadata |
|-------|-------|--------------|
| admin@controle.app | admin123 | `{"role": "admin"}` |
| editor@controle.app | editor123 | `{"role": "editor"}` |
| viewer@controle.app | viewer123 | `{"role": "viewer"}` |

### Passo 2: Executar Scripts SQL
1. Va em **SQL Editor** → **New Query**
2. Execute os arquivos em `infra/supabase/sql_scripts/` na ordem:
   - `00_extensions.sql`
   - `01_profiles.sql`
   - `02_apps.sql`
   - ... (continue ate o 11)

### Passo 3: Anotar UUIDs dos Usuarios
```sql
SELECT id, email FROM auth.users;
```
Anote os 3 UUIDs retornados.

## 2. Configurar Backend

```bash
cd kimi
cp apps/backend/.env.example apps/backend/.env
```

Edite `apps/backend/.env`:
```env
SUPABASE_URL=https://crm.apogeuautomacao.ia.br
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
ENCRYPTION_KEY=sua-chave-de-32-caracteres-aqui
```

## 3. Iniciar Aplicacao

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

Acesse: http://localhost:5173

Login: admin@controle.app / admin123

## 4. Popular Dados de Teste (Opcional)

Edite `99_seed.sql` com os UUIDs dos usuarios e execute no SQL Editor.

## Estrutura de Arquivos SQL

```
infra/supabase/sql_scripts/
├── 00_extensions.sql      -> Extensoes
├── 01_profiles.sql        -> Perfis de usuarios
├── 02_apps.sql            -> Aplicacoes
├── 03_hostings.sql        -> Hospedagens
├── 04_domains.sql         -> Dominios
├── 05_integrations.sql    -> Integracoes
├── 06_secrets.sql         -> Segredos
├── 07_subscriptions.sql   -> Assinaturas
├── 08_attachments.sql     -> Anexos
├── 09_audit_logs.sql      -> Auditoria
├── 10_alerts.sql          -> Alertas
├── 11_storage.sql         -> Storage
├── 99_seed.sql            -> Dados iniciais
└── README.md              -> Documentacao
```

## Comandos Uteis

```bash
# Build
npm run build

# Deploy para GitHub
npm run deploy

# Verificar status do banco
npm run db:status
```
