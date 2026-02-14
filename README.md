# AccessApprovalWorkflow

Sistema de fluxo de aprovação interna para solicitações de equipamentos, viagens e software.

## Tech Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma 7
- **Auth:** Supabase Auth
- **AI:** OpenRouter (openai/gpt-oss-20b:free)

## Próxima Fase: Autenticação e Hierarquia (Fase 1)

### O que será feito
- Integração Supabase Auth (login/logout)
- Modelo de dados: Sector, Role, User (perfil vinculado ao Auth)
- 4 roles fixas: employee, supervisor, manager, general_manager
- General Manager cria usuários via convite (link, usuário define senha no primeiro acesso)
- Seed: 1 General Manager + 1 setor no banco

### O que mudará
- **Prisma schema:** Novos modelos Sector, Role, User; Request com `requester_id`
- **API:** Rotas protegidas; POST/PATCH consideram usuário logado e role
- **UI:** Páginas de login; área do GM para criar usuários; convites

## Setup

```bash
npm install
cp .env.example .env
# Configure DATABASE_URL e OPENROUTER_API_KEY no .env
npm run db:push
npm run dev
```

## Scripts

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run db:push` - Sincroniza schema com o banco
- `npm run db:studio` - Prisma Studio
- `npm run test:day1` - Testes (schema, conexão, API)
