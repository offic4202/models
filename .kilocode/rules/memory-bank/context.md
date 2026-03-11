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
  - Fan dashboard (/fan) - subscriptions, purchases, messages, wallet
  - Login page with registration
  - API routes for all functionality
  - Docker configuration for deployment
- [x] **Build Fix**: Lazy database initialization to prevent build failures when DB_URL/DB_TOKEN aren't set during build (Cloudflare deployment)
- [x] **Content Types**: Extended schema with video, audio, cam_group, private_show, gallery
- [x] **Model Settings**: Content types enabled, pricing, visibility, tips configuration
- [x] **Studio Model Settings**: Revenue share, permissions per model
- [x] **Email/SMTP Support**: Configurable SMTP with welcome emails, approval notifications, content notifications

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page with models roster | ✅ Complete |
| `src/app/layout.tsx` | Root layout + metadata | ✅ Complete |
| `src/app/globals.css` | Global styles + animations | ✅ Complete |
| `src/app/login/page.tsx` | Login/Register page | ✅ Complete |
| `src/app/admin/page.tsx` | Super Admin panel | ✅ Complete |
| `src/app/studio/page.tsx` | Studio Owner dashboard | ✅ Complete |
| `src/app/model/page.tsx` | Model dashboard with settings | ✅ Complete |
| `src/app/fan/page.tsx` | Fan dashboard | ✅ Complete |
| `src/db/schema.ts` | Database schema | ✅ Complete |
| `src/lib/auth.ts` | Authentication utilities | ✅ Complete |
| `src/app/api/auth/` | Auth API routes | ✅ Complete |
| `src/app/api/admin/` | Admin API routes | ✅ Complete |
| `src/app/api/studio/` | Studio API routes | ✅ Complete |
| `src/app/api/model/` | Model API routes | ✅ Complete |
| `Dockerfile` | Docker build config | ✅ Complete |
| `docker-compose.yml` | Docker Compose for deployment | ✅ Complete |
| `.env.example` | Environment variables | ✅ Complete |
| `next.config.ts` | Next.js config with standalone output | ✅ Complete |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Current Focus

The admin platform is complete with:
- **Super Admin**: Approve/reject studios, models, and content
- **Studio Owner**: Manage models in their studio, set revenue share
- **Model**: Create content (video, audio, gallery, cam-group, private shows), configure pricing, manage settings
- **Fan**: Subscribe to models, purchase content, messages, wallet/credits

### Features Implemented:
- Extended content types: Image, Video, Audio, Gallery, Cam Group, Private Show
- Visibility levels: Public (free), Subscribers, Premium, Private
- Model settings: Content types enabled, pricing per type, tips, online status
- Studio settings: Revenue share percentage per model, content approval

## Quick Start Guide

### To view the website:
The dev server should be running. Open http://localhost:3000

### Login/Registration:
- Go to /login to register or login
- Choose role: Fan, Model, Studio Owner, or Super Admin

### Dashboards:
- `/admin` - Super Admin (approve content, manage users)
- `/studio` - Studio Owner (manage models)
- `/model` - Model (create content, settings, fans, earnings)
- `/fan` - Fan (subscriptions, purchases, messages, wallet)

### Docker Deployment:
```bash
# Build and run with Docker Compose
docker-compose up -d

# For Portainer/NPM, use docker-compose.yml
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
| 2026-02 | Fixed build failure - lazy database initialization for Cloudflare deployment |
| 2026-03 | Added fan dashboard, model settings, extended content types |
| 2026-03 | Added email/SMTP support with notification templates |
