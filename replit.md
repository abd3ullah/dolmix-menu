# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### دولمكس - قائمة الطعام (dolmax-menu)
- **Path**: `artifacts/dolmax-menu/`
- **Preview**: `/` (root)
- **Type**: react-vite, pure frontend (no backend)
- **Description**: Premium Arabic RTL restaurant menu and ordering web app for دولمكس restaurant.

**Features**:
- Full RTL Arabic UI with Cairo Google Font
- Dark green premium theme with gold accents
- Menu sections: الفتة, المحاشي (with size selectors), ورق العنب (with size selectors)
- Shopping cart with localStorage persistence
- WhatsApp order checkout (wa.me/9647719461693)
- Fixed call/WhatsApp action buttons
- Real-time search, toast notifications, sticky category nav
- Mobile-first responsive design

**Admin Panel** (at `/admin`):
- Login: `admin` / `dolmix2026` (override via `ADMIN_USER` / `ADMIN_PASS` env vars)
- Dashboard with 4 tiles: categories, items, images, settings
- Full CRUD + reorder + hide/show for categories, items, sizes, piece options
- Image upload via presigned URLs (object storage) or paste URL
- Settings: restaurant name, WhatsApp number, phone number
- All edits go live on the public menu instantly (react-query invalidation)

**Backend** (api-server):
- DB-backed menu in PostgreSQL (Drizzle): `categoriesTable`, `itemsTable`, `sizesTable`, `pieceOptionsTable`, `settingsTable`
- Public `GET /api/menu` returns full menu (visible only) + settings
- Admin routes under `/api/admin/*` gated by express-session (memorystore, cookie `dolmix.sid`)
- Auto-seeds initial menu on first boot if DB is empty
- Object storage paths (`/objects/...`) auto-resolved to `/api/storage/objects/...`

**Key files**:
- `src/data/menuData.ts` — MenuItem TypeScript types (data now from API)
- `src/hooks/useMenu.ts` — react-query fetcher for public menu
- `src/admin/` — admin panel pages and shared API client
- `src/hooks/useCart.ts` — cart state with localStorage sync
- `src/components/CartDrawer.tsx` — cart + checkout form
- `src/index.css` — premium green/gold theme variables
- `artifacts/api-server/src/lib/seed.ts` — initial menu seed
- `artifacts/api-server/src/routes/{auth,menu,admin,storage}.ts` — backend routes
