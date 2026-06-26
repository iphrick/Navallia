# NAVALLIA — Barbershop Management System

> Plataforma SaaS completa para gestão de barbearias. Dashboard industrial, agendamento online, controle financeiro, estoque com importação de NF-e e muito mais.

---

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Como Rodar Localmente](#como-rodar-localmente)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Deploy na Vercel](#deploy-na-vercel)
- [Permissões e Papéis](#permissões-e-papéis)
- [Página de Agendamento Público](#página-de-agendamento-público)
- [Scripts Disponíveis](#scripts-disponíveis)

---

## Sobre o Projeto

O **NAVALLIA** é um sistema de gestão SaaS desenvolvido para barbearias modernas. Multi-tenant por natureza — cada barbearia tem seu próprio espaço isolado de dados — e com controle de acesso baseado em papéis (owner, manager, barber).

O design segue um tema **industrial barbershop**: escuro, masculino, profissional, com tipografia forte e paleta em marrom couro, carvão e bege.

---

## Funcionalidades

| Módulo | Descrição |
|---|---|
| **Dashboard** | KPIs em tempo real — receita, atendimentos, ticket médio, comissões. Gráfico de evolução de faturamento e ranking de barbeiros/serviços |
| **Agenda** | Cadastro e gestão de agendamentos com status (confirmado, finalizado, cancelado, no-show) |
| **Clientes** | Cadastro completo, histórico de visitas, total gasto e programa de fidelidade com pontos |
| **Barbeiros** | Perfil com foto, especialidades, comissão e desempenho individual |
| **Serviços** | Catálogo de serviços com categorias, preços e duração |
| **Financeiro** | Lançamentos de receitas e despesas com categorias e métodos de pagamento |
| **Estoque** | Controle de produtos, alertas de estoque mínimo e **importação via NF-e XML** |
| **Relatórios** | Exportação de dados e análises de período |
| **Comunicação** | Mensagens e notificações para clientes |
| **Fidelidade** | Sistema de pontos por atendimento com resgate de recompensas |
| **Agendamento público** | Página pública por slug para clientes agendarem online sem login |

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS |
| Fontes | Inter + Oswald (display) |
| Ícones | Lucide React |
| Autenticação | Firebase Authentication |
| Banco de dados | Firebase Firestore |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |
| Deploy | Vercel |

---

## Arquitetura

```
Multi-tenant via barbershopId
─────────────────────────────
Cada documento de barbearia tem um ID único (barbershopId).
Todos os dados (clientes, barbeiros, agenda, financeiro, estoque)
são isolados por esse ID nas coleções do Firestore.

Controle de acesso (RBAC)
─────────────────────────
owner   → acesso total
manager → acesso operacional (sem configurações críticas)
barber  → acesso restrito ao próprio desempenho e agenda

Imagens
───────
Avatares e logos são armazenados como base64 no Firestore.
Não requer Firebase Storage (funciona no plano gratuito Spark).
```

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/                   # Rotas públicas
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (admin)/                  # Rotas protegidas (requer auth)
│   │   ├── dashboard/
│   │   ├── agenda/
│   │   ├── clientes/
│   │   ├── barbeiros/
│   │   ├── servicos/
│   │   ├── financeiro/
│   │   ├── estoque/
│   │   │   └── importar-nfe/     # Importação por nota fiscal XML
│   │   ├── relatorios/
│   │   ├── comunicacao/
│   │   ├── fidelidade/
│   │   └── configuracoes/
│   ├── agendar/[slug]/           # Página pública de agendamento
│   ├── api/
│   │   ├── store-file/           # Upload de avatar via Admin SDK
│   │   └── upload-logo/          # Upload de logo via Admin SDK
│   └── master/                   # Painel super-admin (multi-barbearia)
│
├── components/
│   ├── layout/                   # AdminLayout, Sidebar, Header
│   ├── dashboard/                # MetricCard, RevenueChart, RankingList
│   ├── ui/                       # Button, Input, Card, Avatar, etc.
│   ├── shared/                   # RouteGuard, ToastContainer
│   ├── agenda/
│   ├── barbers/
│   ├── booking/
│   ├── clients/
│   ├── financial/
│   ├── services/
│   └── stock/
│
├── contexts/                     # AuthContext, ThemeContext, ToastContext
├── firebase/                     # config.ts, auth.ts, firestore.ts
├── hooks/                        # useAuth, useDashboard, useBarbers, etc.
├── lib/                          # utils, nfe-parser, image-utils, permissions
├── services/                     # Camada de acesso ao Firestore por módulo
├── types/                        # Interfaces TypeScript por domínio
└── validations/                  # Schemas Zod
```

---

## Como Rodar Localmente

### Pré-requisitos

- Node.js 18+
- Conta no [Firebase](https://firebase.google.com)

### 1. Clone o repositório

```bash
git clone https://github.com/iphrick/Navallia.git
cd Navallia
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite o `.env.local` com suas credenciais (veja a seção abaixo).

### 4. Configure o Firebase Console

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um projeto e adicione um app Web
3. Ative os serviços:
   - **Authentication** → provedor E-mail/Senha
   - **Firestore Database** → criar banco (região `southamerica-east1`)
4. Gere uma chave do **Admin SDK**: Configurações do projeto → Contas de serviço → Gerar nova chave privada

### 5. Inicie o servidor

```bash
npm run dev       # desenvolvimento
npm run build && npm run start   # produção local
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Variáveis de Ambiente

```env
# Firebase Client (público)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (servidor — nunca expor no cliente)
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

> **Atenção:** Nunca suba o `.env.local` para o repositório. Ele está no `.gitignore`.

---

## Deploy na Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new)
2. Framework detectado automaticamente: **Next.js**
3. Configure todas as variáveis de ambiente no painel da Vercel
4. Clique em **Deploy**

A cada `git push` na branch `main` a Vercel faz redeploy automático.

---

## Permissões e Papéis

| Recurso | Owner | Manager | Barber |
|---|:---:|:---:|:---:|
| Dashboard completo | ✅ | ✅ | Próprio |
| Clientes | ✅ | ✅ | — |
| Barbeiros | ✅ | ✅ | — |
| Serviços | ✅ | ✅ | — |
| Agenda | ✅ | ✅ | ✅ |
| Financeiro | ✅ | ✅ | — |
| Estoque | ✅ | ✅ | — |
| Relatórios | ✅ | ✅ | — |
| Configurações | ✅ | — | — |

---

## Página de Agendamento Público

Cada barbearia possui uma URL pública gerada a partir do nome:

```
https://seudominio.com/agendar/nome-da-barbearia
```

O cliente acessa, escolhe o serviço, o barbeiro e o horário — sem precisar criar conta.

---

## Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento com Turbopack
npm run build    # Build otimizado de produção
npm run start    # Inicia o servidor de produção
npm run lint     # Verifica erros de linting
```

---

## Paleta de Cores

| Nome | Hex | Uso |
|---|---|---|
| Charcoal | `#171717` | Background principal |
| Leather Brown | `#92400E` | Cor primária / destaque |
| Steel | `#404040` | Secundária / bordas |
| Beige | `#F5F5DC` | Highlights / texto ativo |
| Smoke | `#A3A3A3` | Texto secundário |

---

Desenvolvido com Next.js + Firebase · Deploy na Vercel
