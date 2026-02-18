# Scripts SQL - Controle App v2

## Como Executar

Execute os arquivos **na ordem numerica** no SQL Editor do Supabase:

1. Acesse: https://crm.apogeuautomacao.ia.br/project/default/sql
2. Clique em **New Query**
3. Cole o conteudo de cada arquivo
4. Clique em **Run**

## Ordem de Execucao

```
00_extensions.sql     -> Extensoes necessarias (uuid-ossp, pgcrypto)
01_profiles.sql       -> Tabela de perfis de usuarios
02_apps.sql           -> Tabela de aplicacoes
03_hostings.sql       -> Tabela de hospedagens
04_domains.sql        -> Tabela de dominios
05_integrations.sql   -> Tabela de integracoes
06_secrets.sql        -> Tabela de segredos
07_subscriptions.sql  -> Tabela de assinaturas
08_attachments.sql    -> Tabela de anexos
09_audit_logs.sql     -> Tabela de auditoria
10_alerts.sql         -> Tabela de alertas
11_storage.sql        -> Configuracao do storage
99_seed.sql           -> Dados iniciais (OPCIONAL)
```

## Passo a Passo

### 1. Criar Usuarios no Auth (ANTES do seed)

Va em: Authentication -> Users -> Add User

Crie 3 usuarios:
| Email | Senha | Role (em App Metadata) |
|-------|-------|------------------------|
| admin@controle.app | admin123 | `{"role": "admin"}` |
| editor@controle.app | editor123 | `{"role": "editor"}` |
| viewer@controle.app | viewer123 | `{"role": "viewer"}` |

### 2. Executar SQL Scripts

Execute os arquivos 00 a 11 na ordem.

### 3. Configurar Backend

Copie o arquivo de exemplo:
```bash
cp apps/backend/.env.example apps/backend/.env
```

Edite com suas credenciais do Supabase:
```env
SUPABASE_URL=https://crm.apogeuautomacao.ia.br
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
ENCRYPTION_KEY=sua-chave-de-32-caracteres
```

### 4. Popular com Dados de Teste (Opcional)

**IMPORTANTE**: Antes de executar o `99_seed.sql`, atualize os UUIDs no arquivo com os IDs reais dos usuarios criados no Auth.

Para encontrar os UUIDs:
```sql
SELECT id, email FROM auth.users;
```

## Solucao de Problemas

### Erro "relation does not exist"
Execute os arquivos em ordem numerica.

### Erro "violates row-level security policy"
Verifique se a tabela `profiles` foi criada corretamente.

### Erro de encoding/caracteres
Todos os arquivos usam apenas caracteres ASCII (sem acentos).

## Tabelas Criadas

| Tabela | Descricao |
|--------|-----------|
| profiles | Perfis de usuarios |
| apps | Aplicacoes SaaS |
| hostings | Servidores |
| domains | Dominios |
| integrations | APIs e servicos |
| secrets | Credenciais criptografadas |
| subscriptions | Assinaturas |
| attachments | Arquivos |
| audit_logs | Logs de auditoria |
| alerts | Alertas do sistema |
