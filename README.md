# Navallia — Gestão Inteligente para Barbearias

> Plataforma SaaS moderna de gestão para barbearias — Módulo 1: Fundação

---

## ⚡ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 (App Router) + React + TypeScript |
| Estilo | Tailwind CSS |
| Componentes | Shadcn/UI + Lucide React |
| Autenticação | Firebase Authentication |
| Banco de Dados | Firebase Firestore |
| Storage | Firebase Storage |
| Formulários | React Hook Form + Zod |

---

## 🚀 Como rodar o projeto

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure o Firebase

Copie o arquivo de exemplo e preencha com suas credenciais do Firebase:

```bash
cp .env.local.example .env.local
```

Edite o `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

> **Como obter as credenciais:** Acesse [console.firebase.google.com](https://console.firebase.google.com), crie um projeto, adicione um app Web e copie a configuração.

### 3. Configure o Firebase Console

No Firebase Console:

1. **Authentication** → Habilite o provedor **E-mail/Senha**
2. **Firestore** → Crie o banco de dados (modo teste para desenvolvimento)
3. **Storage** → Ative o Storage (modo teste para desenvolvimento)

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📁 Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/              # Rotas públicas (login, cadastro, recuperação)
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   └── (admin)/             # Rotas protegidas (requer autenticação)
│       ├── dashboard/
│       ├── clientes/
│       ├── servicos/
│       ├── barbeiros/
│       ├── agenda/
│       ├── financeiro/
│       ├── estoque/
│       ├── relatorios/
│       └── configuracoes/
├── components/
│   ├── ui/                  # Componentes base reutilizáveis
│   ├── layout/              # Sidebar, Header, AdminLayout
│   └── shared/              # RouteGuard, ToastContainer
├── contexts/                # AuthContext, ThemeContext, ToastContext
├── firebase/                # Configuração e serviços Firebase
├── hooks/                   # useAuth, useTheme, useToast
├── lib/                     # Utilitários (cn, formatCurrency, etc.)
├── types/                   # TypeScript types e interfaces
└── validations/             # Schemas Zod para formulários
```

---

## 🔐 Autenticação

| Rota | Descrição |
|---|---|
| `/login` | Login com e-mail e senha |
| `/register` | Cadastro com nome, e-mail e senha |
| `/forgot-password` | Recuperação de senha por e-mail |

Todas as rotas internas são protegidas e redirecionam para `/login` se o usuário não estiver autenticado.

---

## 🎨 Identidade Visual

| Cor | Hex |
|---|---|
| Azul primário | `#2563EB` |
| Preto | `#111827` |
| Branco | `#FFFFFF` |
| Cinza escuro | `#374151` |
| Cinza claro | `#F3F4F6` |

---

## 🌙 Temas

- **Light Mode** e **Dark Mode** implementados
- Alternância instantânea via botão no Header
- Persistência em `localStorage`
- Respeita preferência do sistema operacional na primeira visita

---

## 📦 Módulos Planejados

- ✅ **Módulo 1** — Fundação (atual)
- 🔜 **Módulo 2** — Multiempresa (Multi-Tenant)
- 🔜 **Módulo 3** — Gestão de Clientes
- 🔜 **Módulo 4** — Agenda e Agendamentos
- 🔜 **Módulo 5** — Financeiro
- 🔜 **Módulo 6** — Relatórios e Analytics

---

## 🛠️ Scripts disponíveis

```bash
npm run dev      # Inicia em modo desenvolvimento
npm run build    # Gera o build de produção
npm run start    # Inicia o servidor de produção
npm run lint     # Verifica erros de linting
```
