# Team Task Management Web Application

Production-ready full-stack team task management app with JWT authentication, project membership, task Kanban workflows, RBAC, analytics, PostgreSQL, Prisma, tests, and Railway deployment configuration.

## Tech Stack

- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS, dnd-kit, Recharts
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JWT access tokens with refresh-token architecture prepared
- Security: Helmet, CORS allowlist, rate limiting, request sanitization, validation, audit logging
- Tests: Jest + Supertest for backend, Vitest + Testing Library + MSW for frontend
- Deployment: Railway monorepo with separate frontend and backend services

## Repository Structure

```text
.
|-- backend
|   |-- prisma
|   |   |-- schema.prisma
|   |   |-- seed.ts
|   |   `-- ERD.md
|   |-- src
|   |   |-- config
|   |   |-- controllers
|   |   |-- middleware
|   |   |-- rbac
|   |   |-- routes
|   |   |-- types
|   |   |-- utils
|   |   |-- validators
|   |   |-- app.ts
|   |   `-- server.ts
|   |-- tests
|   |-- .env.example
|   |-- Procfile
|   |-- railway.json
|   |-- package.json
|   `-- tsconfig.json
|-- frontend
|   |-- src
|   |   |-- app
|   |   |-- components
|   |   |-- context
|   |   |-- hooks
|   |   |-- lib
|   |   |-- services
|   |   |-- test
|   |   |-- types
|   |   `-- middleware.ts
|   |-- .env.example
|   |-- Procfile
|   |-- railway.json
|   |-- package.json
|   `-- tsconfig.json
`-- docs
    |-- API.md
    `-- DEPLOYMENT.md
```

## Features

- Signup, login, current-user auth
- Password hashing with bcrypt
- JWT access token generation
- Project CRUD
- Project member management
- Admin/member RBAC
- Task CRUD, assignment, status updates
- Kanban task board with drag and drop
- Search, filtering, pagination-ready APIs
- Dashboard analytics with charts
- Overdue task alerts
- Audit logging structure
- Production CORS and security headers

## Local Setup

Prerequisites:

- Node.js 20+
- npm
- PostgreSQL 14+

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run db:seed
npm run dev
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Local URLs:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Environment Variables

Backend:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=use-a-long-random-secret-at-least-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=use-another-long-random-secret-at-least-32-chars
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=https://your-frontend-service.up.railway.app
CORS_ORIGINS=https://your-frontend-service.up.railway.app
```

Frontend:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-service.up.railway.app/api
NEXT_PUBLIC_APP_URL=https://your-frontend-service.up.railway.app
```

## Demo Credentials

The seed script creates:

```text
Admin: admin@teamflow.dev
Members:
- member.one@teamflow.dev
- member.two@teamflow.dev
Password for all seeded users: Password123!
```

## Scripts

Backend:

```bash
npm run dev
npm run build
npm run start:prod
npm run prisma:migrate
npm run prisma:deploy
npm run db:seed
npm run test
npm run typecheck
```

Frontend:

```bash
npm run dev
npm run build
npm run start
npm run start:railway
npm run test
npm run typecheck
npm run lint
```

## Railway Deployment

This is a monorepo. Deploy two Railway services from the same GitHub repo:

1. Backend service with root directory `backend`
2. Frontend service with root directory `frontend`
3. PostgreSQL database service

Railway config files are included:

- `backend/railway.json`
- `frontend/railway.json`
- `backend/Procfile`
- `frontend/Procfile`

Detailed deployment steps are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## API Documentation

See [docs/API.md](docs/API.md).

## Production Checks

Before deploying:

```bash
cd backend
npm install
npm run test
npm run typecheck
npm run build
```

```bash
cd frontend
npm install
npm run test
npm run typecheck
npm run build
```

## Troubleshooting

- If CORS fails, verify backend `CORS_ORIGINS` exactly matches the frontend public URL.
- If Prisma cannot connect, verify Railway injected `DATABASE_URL` into the backend service.
- If migrations do not run, check backend deploy logs for `npm run prisma:deploy`.
- If frontend cannot call the API, verify `NEXT_PUBLIC_API_URL` includes `/api`.
- If Next fails to bind the port, verify Railway uses `npm run start:railway`.
