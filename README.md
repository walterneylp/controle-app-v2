# Controle App v2

Sistema de controle técnico SaaS/APP com design moderno e interface renovada.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Build**: Build number automático com timestamp
- **Deploy**: Script automatizado para GitHub

## 📁 Estrutura

```
kimi/
├── apps/
│   ├── backend/       # API RESTful
│   └── frontend/      # React SPA
├── scripts/
│   ├── bump-build.mjs # Incrementa build number
│   └── deploy.mjs     # Deploy para GitHub
├── build-meta.json    # Controle de versão
└── docker-compose.yml
```

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Desenvolvimento (ambos)
npm run dev:backend   # porta 3333
npm run dev:frontend  # porta 5173

# Build (incrementa versão automaticamente)
npm run build
```

## 🔐 Login

- **Admin**: admin@controle.app / admin123
- **Editor**: editor@controle.app / editor123
- **Viewer**: viewer@controle.app / viewer123

## 🐳 Docker

```bash
docker-compose up -d
# Frontend: http://localhost:8080
# Backend: http://localhost:3333
```

## ☁️ Deploy GitHub

Configure o remote:
```bash
git remote add origin https://github.com/SEU_USUARIO/controle-app-v2.git
```

Execute o deploy:
```bash
npm run deploy
```

Isso irá:
1. Incrementar o build number
2. Commitar as alterações
3. Enviar para o GitHub

## 🎨 Temas

- Claro/Escuro/Sistema (automático)
- Design moderno com Tailwind CSS
- Animações suaves
- Responsivo

## 📝 Versionamento

O controle de versão é automático via `build-meta.json`:

```json
{
  "major": 2,
  "minor": 0,
  "build": 1
}
```

A cada build, o número é incrementado e exibido no menu lateral.

## 📄 Licença

Privado - Uso interno
