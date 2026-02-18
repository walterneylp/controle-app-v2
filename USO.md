# Guia de Uso - Controle App v2

## Iniciar Aplicacao

```bash
cd kimi
npm run dev:backend    # Terminal 1
npm run dev:frontend   # Terminal 2
```

Acesse: http://localhost:5173

## Fluxos Disponiveis

### 1. Login
- Use: `admin@controle.app` / `admin123`
- Ou: `editor@controle.app` / `editor123`
- Ou: `viewer@controle.app` / `viewer123`

### 2. Dashboard
- Visualize estatisticas gerais
- Veja atividades recentes
- Veja alertas do sistema

### 3. Gerenciar Apps

#### Criar App
1. Va em **Aplicacoes** no menu
2. Clique em **Novo App**
3. Preencha:
   - Nome interno (ex: `cliente-portal`)
   - Nome comercial (ex: `Cliente Portal`)
   - Descricao (opcional)
   - Status (ativo/inativo/arquivado)
   - Tags (separadas por virgula)
   - Links de repo/docs (opcional)
4. Clique **Salvar**

#### Editar App
1. Na lista de apps, clique no icone de **editar** (lápis)
2. Altere os dados
3. Clique **Salvar**

#### Excluir App
1. Na lista de apps, clique no icone de **lixeira** (apenas admin)
2. Confirme a exclusao

#### Ver Detalhes do App
1. Clique no nome do app ou no icone de **olho**
2. Navegue pelas abas:
   - **Visao Geral**: Informacoes basicas e estatisticas
   - **Hospedagem**: Lista de servidores (com IP, regiao, etc.)
   - **Dominios**: Em desenvolvimento
   - **Segredos**: Em desenvolvimento
   - **Assinaturas**: Em desenvolvimento
   - **Anexos**: Em desenvolvimento

## Permissoes por Perfil

| Acao | Admin | Editor | Viewer |
|------|-------|--------|--------|
| Ver apps | ✅ | ✅ | ✅ |
| Criar apps | ✅ | ✅ | ❌ |
| Editar apps | ✅ | ✅ | ❌ |
| Excluir apps | ✅ | ❌ | ❌ |
| Ver segredos | ✅ | ✅ | ❌ |
| Revelar segredos | ✅ | ❌ | ❌ |
| Ver audit logs | ✅ | ❌ | ❌ |

## Dicas

- Use a **barra de busca** para filtrar apps rapidamente
- O **tema** pode ser alterado no menu lateral (claro/escuro/sistema)
- O **numero do build** aparece no rodape do menu lateral
- Toda acao importante e registrada nos **logs de auditoria**

## Solucao de Problemas

### "Erro ao carregar apps"
Verifique se o backend esta rodando em http://localhost:3333

### "Token invalido"
Faca logout e login novamente

### "Sem permissao"
Verifique se seu usuario tem a role correta (admin/editor/viewer)
