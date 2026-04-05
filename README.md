# Finance Dashboard Project

## 1. Overview
This project is a full stack finance management system with role based access control.

It includes:
- A TypeScript + Express backend with Prisma and PostgreSQL
- A React + Vite frontend with route based pages
- Authentication using JWT bearer tokens
- Role based permissions for Viewer, Analyst, and Admin
- Financial records with filtering, pagination, search, and soft delete
- Dashboard analytics endpoints
- Seeded demo data for quick testing

## 2. Repository Structure

- `finance-backend` : API server, database schema, seed script, tests
- `finance-frontend` : React client application
- `start.sh` : backend start script used by deployment
- `railway.toml` : Railway build and deploy config

## 3. Roles and Access Model

### Viewer
- Can view recent dashboard activity
- Cannot access records endpoints
- Cannot access summary, categories, or trends analytics
- Cannot manage users

### Analyst
- Can access summary, categories, trends, and recent analytics
- Can access insight focused dashboard data only
- Cannot access records CRUD endpoints
- Cannot manage users

### Admin
- Full access to records and dashboard analytics
- Can manage users
- Can create Viewer and Analyst accounts from user management

## 4. Tech Stack

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod validation
- JWT auth
- Jest + Supertest

### Frontend
- React
- TypeScript
- Vite
- React Router
- Tailwind CSS

## 5. Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL

## 6. Environment Setup

### Backend env
Create `finance-backend/.env` with values based on `finance-backend/.env.example`.

Required keys:
- `PORT`
- `NODE_ENV`
- `DATABASE_URL`
- `TEST_DATABASE_URL`
- `FRONTEND_ORIGIN`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `BCRYPT_SALT_ROUNDS`

Current local default in this workspace:
- Backend port: `5001`
- Frontend origin: `http://localhost:5173`

### Frontend env
Create `finance-frontend/.env` with values based on `finance-frontend/.env.example`.

Required key:
- `VITE_API_BASE_URL`

Current local default in this workspace:
- `VITE_API_BASE_URL=http://localhost:5001/api/v1`

## 7. Installation and Run

### Backend
```bash
cd finance-backend
npm install
npm run db:generate
npx prisma db push
npm run db:seed
npm run dev
```

### Frontend
```bash
cd finance-frontend
npm install
npm run dev
```

### Build checks
```bash
cd finance-backend
npm run build

cd ../finance-frontend
npm run build
```

## 8. Database and Seed Data

The schema contains two main tables:
- `users`
- `financial_records`

Important schema capabilities:
- UUID primary keys
- Role and status enums for users
- Record type enum (`INCOME`, `EXPENSE`)
- Soft delete flag on records (`isDeleted`)
- Indexes for common query fields

Seed script location:
- `finance-backend/prisma/seed.ts`

Seed includes:
- Admin, Analyst, and Viewer users
- Active and inactive user status examples
- Income and expense records across multiple categories and dates

### Admin demo credentials
- Email: `admin@gmail.com`
- Password: `admintester1234`

## 9. API Overview

Base URL:
- `http://localhost:5001/api/v1`

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Users (admin only)
- `GET /users`
- `GET /users/:slug`
- `POST /users`
- `PATCH /users/:slug`
- `DELETE /users/:slug` (deactivate)

### Records (admin only)
- `GET /records`
- `GET /records/:slug`
- `POST /records`
- `PATCH /records/:slug`
- `DELETE /records/:slug` (soft delete)

### Dashboard
- `GET /dashboard/summary`
- `GET /dashboard/categories`
- `GET /dashboard/trends?year=YYYY`
- `GET /dashboard/recent?limit=N`

## 10. Record Listing Features

`GET /records` supports:
- Pagination: `page`, `limit`
- Search: `search` (category, notes, slug)
- Filtering by type: `type=INCOME|EXPENSE`
- Filtering by category: `category=<value>`
- Date range: `startDate`, `endDate`

## 11. Validation and Error Handling

The backend includes:
- Request body validation with Zod
- Query and route param validation
- Structured validation errors with status `422`
- Authentication failures with status `401`
- Authorization failures with status `403`
- Not found handling with status `404`
- Unique conflict handling with status `409`
- Global error middleware with consistent response shape

Common response shape:
- Success: `success`, `data`, `timestamp`
- Error: `success`, `message`, optional `errors`, `timestamp`

## 12. Security and Operational Features

- JWT bearer token authentication
- Role guard middleware for route level authorization
- Helmet security headers
- CORS with env based allowed origins
- Express rate limiting (100 requests per 15 minutes)
- Password hashing using bcrypt

## 13. Assumptions

- PostgreSQL is the required database engine
- Frontend and backend are run separately in local development
- Admin is the only role that can access user management endpoints
- User deletion in this project means account deactivation
- Record deletion is soft delete and records remain in database history

## 14. Tradeoffs Considered

- Chose JWT stateless auth over server sessions for simpler scaling and API integration
- Implemented route level role guards for clarity and maintainability
- Kept soft delete only for financial records to preserve audit history
- Kept user removal as status update instead of hard delete to reduce data loss risk
- Search is implemented on core text fields (`category`, `notes`, `slug`) for practical performance and simplicity
- Test suite currently expects a reachable local test PostgreSQL database for integration tests

## 15. Known Development Notes

- `finance-frontend/.env` and `finance-backend/.env` are intentionally ignored by git
- `.env.example` files are tracked and should be used as templates
- Integration tests require `TEST_DATABASE_URL` to point to a running PostgreSQL instance

## 16. Quick Verification Checklist

1. Backend starts on configured port
2. Frontend points to backend API base URL
3. Seed completes without errors
4. Admin can login with seeded credentials
5. Viewer cannot access records endpoints
6. Analyst cannot access records endpoints and can access dashboard insights
7. Admin can perform full records CRUD and manage users
8. Records list supports pagination, search, and filters
9. Deleted records are not returned in active listings
10. Rate limiting returns throttling behavior under burst traffic
