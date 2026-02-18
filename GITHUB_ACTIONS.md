# Deploy Automático

## Opções de Deploy

### 1. Deploy Manual (recomendado para controle total)

```bash
npm run deploy
```

Isso vai:
- Compilar o projeto
- Criar commit com mensagem padrão
- Enviar para o GitHub

### 2. Deploy Automático (rápido)

```bash
# Deploy com mensagem padrão
npm run ship

# Ou com mensagem personalizada
npm run ship "feat: Adicionar nova funcionalidade"
```

Isso vai:
- Incrementar o build number
- Compilar o projeto
- Criar commit automaticamente
- Enviar para o GitHub

### 3. Deploy Ultra-Rápido (apenas push)

Se você já fez as alterações e só quer enviar:

```bash
git add .
git commit -m "sua mensagem"
git push
```

## O que o Deploy Automático Faz?

1. ✅ Incrementa o número do build automaticamente
2. ✅ Compila backend e frontend
3. ✅ Adiciona todos os arquivos alterados
4. ✅ Cria commit com mensagem descritiva
5. ✅ Envia para o GitHub (origin HEAD)

## Exemplos de Uso

```bash
# Deploy rápido sem pensar
npm run ship

# Deploy com mensagem específica
npm run ship "fix: Corrigir bug no login"

# Deploy de feature
npm run ship "feat: Adicionar página de relatórios"

# Deploy de ajuste
npm run ship "chore: Atualizar dependências"
```

## Verificar Status

```bash
# Ver qual versão será deployada
cat build-meta.json

# Ver commits pendentes
git log --oneline -5

# Ver alterações não commitadas
git status
```

## Resolvendo Problemas

### "Erro: remote not found"
Configure o remote do GitHub:
```bash
git remote add origin https://github.com/walterneylp/controle-app-v2.git
```

### "Erro: não tem permissão"
Verifique se você está logado no Git:
```bash
git config user.name
git config user.email
```

### "Erro: conflito de merge"
Resolva os conflitos manualmente antes de fazer deploy.
