# Railway Deployment Guide

This project is deployed as three Railway services:

1. PostgreSQL
2. Backend API from `backend/`
3. Frontend web app from `frontend/`

Railway's monorepo workflow supports configuring a service root directory. This project includes `railway.json` inside both service directories so each service can build and start independently.

## 1. Create Railway Project

1. Create a new Railway project.
2. Add a PostgreSQL database service.
3. Add a backend service from the GitHub repo.
4. Add a frontend service from the same GitHub repo.

## 2. Configure Root Directories

Backend service:

```text
Root Directory: /backend
```

Frontend service:

```text
Root Directory: /frontend
```

## 3. Backend Environment Variables

Set these on the backend service:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate-long-random-secret>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<generate-different-long-random-secret>
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=https://your-frontend-service.up.railway.app
CORS_ORIGINS=https://your-frontend-service.up.railway.app
```

Notes:

- Railway PostgreSQL exposes a `DATABASE_URL`; reference it from the backend service.
- `JWT_SECRET` and `JWT_REFRESH_SECRET` must be different and at least 32 characters.
- `CORS_ORIGINS` can contain multiple origins separated by commas.

## 4. Frontend Environment Variables

Set these on the frontend service:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-service.up.railway.app/api
NEXT_PUBLIC_APP_URL=https://your-frontend-service.up.railway.app
```

Important:

- `NEXT_PUBLIC_API_URL` must include `/api`.
- After changing public frontend environment variables, redeploy the frontend.

## 5. Build and Start Commands

Backend `backend/railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run railway:build"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "preDeployCommand": "npm run prisma:deploy",
    "healthcheckPath": "/api/health"
  }
}
```

Frontend `frontend/railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run railway:build"
  },
  "deploy": {
    "startCommand": "npm run start:railway",
    "healthcheckPath": "/login"
  }
}
```

## 6. Deployment Commands

Using GitHub integration:

```bash
git add .
git commit -m "Prepare Railway deployment"
git push
```

Using Railway CLI from each service directory:

```bash
cd backend
railway up
```

```bash
cd frontend
railway up
```

## 7. Database Migration and Seed

Migrations run automatically before backend deploy through:

```bash
npm run prisma:deploy
```

To seed production manually:

```bash
cd backend
railway run npm run db:seed
```

Demo credentials after seeding:

```text
admin@teamflow.dev / Password123!
member.one@teamflow.dev / Password123!
member.two@teamflow.dev / Password123!
```

## 8. Troubleshooting

### Backend deploy fails during Prisma generate

Check:

- `DATABASE_URL` exists on the backend service.
- PostgreSQL service is running.
- Backend root directory is `/backend`.

### Backend health check fails

Open:

```text
https://your-backend-service.up.railway.app/api/health
```

If it fails:

- Check deploy logs for database connection errors.
- Confirm migrations ran.
- Confirm `PORT` is not hardcoded by the app. Railway injects `PORT`.

### Frontend cannot call backend

Check:

- `NEXT_PUBLIC_API_URL` is set on the frontend service.
- It includes `/api`.
- Backend `CORS_ORIGINS` includes the exact frontend URL.
- Backend `CLIENT_URL` matches the frontend URL.

### CORS error in browser

Set:

```bash
CORS_ORIGINS=https://your-frontend-service.up.railway.app
CLIENT_URL=https://your-frontend-service.up.railway.app
```

Then redeploy backend.

### Prisma migration fails

Run:

```bash
cd backend
railway run npm run prisma:deploy
```

If the database is empty and local migrations have not been generated, create one locally first:

```bash
cd backend
npm run prisma:migrate -- --name init
```

Commit the generated `prisma/migrations` folder.

### Public env vars changed but frontend still calls old API

Next.js inlines `NEXT_PUBLIC_*` variables at build time. Redeploy the frontend service after changing them.

## 9. Production Checklist

- Backend and frontend have separate Railway services.
- Backend root directory is `/backend`.
- Frontend root directory is `/frontend`.
- PostgreSQL is provisioned.
- Backend `DATABASE_URL` references Railway Postgres.
- Backend `CORS_ORIGINS` contains frontend URL.
- Frontend `NEXT_PUBLIC_API_URL` contains backend URL ending in `/api`.
- Migrations are committed and deployed.
- Seed is run only if demo data is desired.
- Secrets are long and unique.
