# Active Context: StreamRay Admin Platform

## Current State

**Project Status**: ✅ Complete - Admin platform with role-based dashboards

A full-featured admin platform for managing models, studios, and content with role-based access control.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] **StreamRay Models website replica** (previous version)
- [x] **Admin Platform**
  - Database schema with Drizzle ORM (SQLite)
  - Authentication system with token-based auth
  - Role-based access control (super_admin, studio_owner, model, fan)
  - Super Admin panel (/admin) - approve/reject studios, models, content
  - Studio Owner dashboard (/studio) - manage models
  - Model dashboard (/model) - manage content, view fans, track earnings
  - Login page with registration
  - API routes for all functionality
  - Docker configuration for deployment

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page with models roster | ✅ Complete |
| `src/app/layout.tsx` | Root layout + metadata | ✅ Complete |
| `src/app/globals.css` | Global styles + animations | ✅ Complete |
| `src/app/login/page.tsx` | Login/Register page | ✅ Complete |
| `src/app/admin/page.tsx` | Super Admin panel | ✅ Complete |
| `src/app/studio/page.tsx` | Studio Owner dashboard | ✅ Complete |
| `src/app/model/page.tsx` | Model dashboard | ✅ Complete |
| `src/db/schema.ts` | Database schema | ✅ Complete |
| `src/lib/auth.ts` | Authentication utilities | ✅ Complete |
| `src/app/api/auth/` | Auth API routes | ✅ Complete |
| `src/app/api/admin/` | Admin API routes | ✅ Complete |
| `src/app/api/studio/` | Studio API routes | ✅ Complete |
| `src/app/api/model/` | Model API routes | ✅ Complete |
| `Dockerfile` | Docker build config | ✅ Complete |
| `docker-compose.yml` | Docker Compose for Coolify | ✅ Complete |
| `.env.example` | Environment variables | ✅ Complete |
| `next.config.ts` | Next.js config with standalone output | ✅ Complete |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Current Focus

The admin platform is complete with:
- **Super Admin**: Approve/reject studios, models, and content
- **Studio Owner**: Manage models in their studio
- **Model**: Create content, view followers, track earnings
- **Fan**: Register and follow models (basic)

## Quick Start Guide

### To view the website:
The dev server should be running. Open http://localhost:3000

### Login/Registration:
- Go to /login to register or login
- Choose role: Fan, Model, Studio Owner, or Super Admin

### Dashboards:
- `/admin` - Super Admin (approve content, manage users)
- `/studio` - Studio Owner (manage models)
- `/model` - Model (create content, view fans, earnings)

### Docker Deployment:
```bash
# Build and run with Docker Compose
docker-compose up -d

# For Coolify, just deploy the docker-compose.yml
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2024 | StreamRay Models website replica - hero, models grid, footer |
| 2024 | Admin platform - auth, dashboards, Docker deployment |
