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
- WhatsApp order checkout (wa.me/9647706101600)
- Fixed call/WhatsApp action buttons
- Real-time search, toast notifications, sticky category nav
- Mobile-first responsive design

**Key files**:
- `src/data/menuData.ts` — all menu data (items, sizes, prices)
- `src/hooks/useCart.ts` — cart state with localStorage sync
- `src/components/CartDrawer.tsx` — cart + checkout form
- `src/components/FloatingCartButton.tsx` — floating cart CTA
- `src/index.css` — premium green/gold theme variables
