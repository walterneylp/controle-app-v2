# Guia: Criar Usuarios com Roles no Supabase

## Passo 1: Acessar a Tela de Usuarios

1. Acesse: https://crm.apogeuautomacao.ia.br/project/default
2. No menu lateral esquerdo, clique em **Authentication** (icone de pessoa/cadeado)
3. Clique em **Users**
4. Clique no botao **Add User** (canto superior direito)
5. Selecione **Create New User**

## Passo 2: Preencher Dados Basicos

Na tela "Create a new user", voce vera:

```
+------------------------+
|  Email *               |
|  [admin@controle.app]  |
+------------------------+

+------------------------+
|  Password *            |
|  [admin123]            |
+------------------------+

+------------------------+
|  Confirm Password *    |
|  [admin123]            |
+------------------------+

[ ] Auto-confirm email?  <- MARQUE ESTA CAIXA
```

**IMPORTANTE**: Marque a caixa **"Auto-confirm email?"** para nao precisar confirmar por email.

## Passo 3: Adicionar o App Metadata (O MAIS IMPORTANTE)

Role a pagina para baixo. Voce vera uma secao chamada **"User Metadata"** ou **"App Metadata"**.

Procure por um campo/area que diga:
- `raw_app_meta_data` ou
- `App Metadata` ou
- `User App Metadata`

Neste campo, cole exatamente isto:

### Para o Admin:
```json
{"role": "admin"}
```

### Para o Editor:
```json
{"role": "editor"}
```

### Para o Viewer:
```json
{"role": "viewer"}
```

## Passo 4: Criar Usuario

Clique no botao **"Create User"** (ou "Add User")

## Passo 5: Verificar se Salvou Corretamente

1. Na lista de usuarios, clique no usuario criado
2. Va na aba **"Raw App Meta Data"** ou **"App Metadata"**
3. Deve aparecer:
```json
{
  "role": "admin"
}
```

## Alternativa: Atualizar via SQL (se esqueceu de colocar na criacao)

Se voce ja criou o usuario e esqueceu de colocar o role, execute no SQL Editor:

```sql
-- Listar usuarios para ver os IDs
SELECT id, email, raw_app_meta_data 
FROM auth.users 
WHERE email IN ('admin@controle.app', 'editor@controle.app', 'viewer@controle.app');

-- Atualizar o admin (substitua o UUID pelo ID real)
UPDATE auth.users 
SET raw_app_meta_data = '{"role": "admin"}'
WHERE email = 'admin@controle.app';

-- Atualizar o editor
UPDATE auth.users 
SET raw_app_meta_data = '{"role": "editor"}'
WHERE email = 'editor@controle.app';

-- Atualizar o viewer
UPDATE auth.users 
SET raw_app_meta_data = '{"role": "viewer"}'
WHERE email = 'viewer@controle.app';
```

## Resumo dos 3 Usuarios

| Email | Senha | App Metadata | Auto-confirm |
|-------|-------|--------------|--------------|
| admin@controle.app | admin123 | `{"role": "admin"}` | Sim ✓ |
| editor@controle.app | editor123 | `{"role": "editor"}` | Sim ✓ |
| viewer@controle.app | viewer123 | `{"role": "viewer"}` | Sim ✓ |

## Depois de Criar os Usuarios

1. Anote os UUIDs (IDs) dos 3 usuarios
2. Atualize o arquivo `99_seed.sql` com esses UUIDs
3. Execute o seed no SQL Editor

## Troubleshooting

### "Nao aparece o campo App Metadata"
Algumas versoes do Supabase mostram como "User Metadata". Se nao aparecer nenhum, voce pode:
1. Criar o usuario sem o metadata
2. Depois atualizar via SQL (secao "Alternativa" acima)

### "Role nao esta funcionando"
Verifique se o JSON esta correto:
- ❌ Errado: `role: admin` (sem aspas, sem chaves)
- ❌ Errado: `"role": "admin"` (aspas curvas)
- ✅ Certo: `{"role": "admin"}` (JSON valido)
