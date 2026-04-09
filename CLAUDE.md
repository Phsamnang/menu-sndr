# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev           # Start Next.js dev server on port 3000

# Build
npm run build         # prisma generate && next build

# Database
npm run db:push       # Push schema changes without migration (dev)
npm run db:migrate    # Create and run a migration
npm run db:seed       # Seed database with initial data
npm run db:studio     # Open Prisma Studio GUI

# Lint
npm run lint          # ESLint via next lint

# E2E tests (Playwright)
npm run test:e2e         # Run all Playwright specs (boots dev server automatically)
npm run test:e2e:ui      # Open Playwright UI mode for interactive debugging
npm run test:e2e:report  # Open the last HTML report
```

E2E specs live in `e2e/`. The suite uses a global setup that logs in as the four
seeded test users (`admin`, `chef`, `waiter`, `order`) and writes their JWTs to
`e2e/.auth/{role}.json`. Tests use the role-based fixtures from
`e2e/fixtures/auth.ts` (e.g. `adminPage`, `chefPage`). Tests run against the
existing seeded Neon dev DB — make sure `npm run db:seed` has been run at least
once.

## Architecture

This is a **Next.js 14 App Router** restaurant management system (POS) with a PostgreSQL database (Neon) via Prisma. The UI uses Tailwind CSS + shadcn/ui components. Timezone is always `Asia/Phnom_Penh`.

### Auth

Authentication uses a **custom JWT flow** — not NextAuth sessions. On login, the API returns a JWT stored in `sessionStorage` (keys: `accessToken`, `user`) via `utils/token.ts`. The `AuthContext` (`contexts/AuthContext.tsx`) reads this token and exposes `useAuth()`. The axios client (`utils/axios-client.ts`) automatically attaches it as a `Bearer` token. On 401, it clears the token and redirects to `/login`.

NextAuth is installed but unused for auth logic — the `SessionProvider` wrapper in `app/providers.tsx` exists only to suppress warnings.

The `middleware.ts` at the root is a **pass-through** (no route protection). Server-side route protection happens via the `withAuth()` HOC in `lib/middleware.ts`, which wraps individual API route handlers.

### API Layer

All API routes are under `app/api/`. The convention is:
- Route handlers call service functions from `services/*.service.ts`
- Services use the shared Prisma client from `lib/prisma.ts`
- All responses use `successResponse()` / `errorResponse()` helpers from `utils/api-response.ts`

The client uses `utils/api-client.ts` (fetch-based) or `utils/axios-client.ts` depending on context. Pages use React Query (`@tanstack/react-query`) with a 60s staleTime.

### Role-Based Access

Roles: `admin`, `order`, `chef`, `waiter`. The admin sidebar (`app/admin/layout.tsx`) filters nav items client-side by `user.role.name`. API routes enforce roles server-side via `withAuth(handler, ["admin", "chef"])`.

### Real-Time Updates

The delivery and chef views both use **Server-Sent Events (SSE)** — stream routes under `app/api/delivery/items/` and `app/api/chef/orders/` poll Prisma and stream diffs. The client hooks are `hooks/useDeliveryStream.ts` and `hooks/useChefStream.ts`. The token is passed as a query param (`?token=...`) because `EventSource` doesn't support custom headers.

### Key Domain Concepts

- **MenuItem** — has a `isCook` flag: `true` = kitchen prepares it, `false` = served directly (e.g., drinks)
- **Order item statuses**: `pending` → `preparing` → `ready` → `served` | `cancelled`
- **Order statuses**: `new`, `on_process`, `completed`, `cancelled`
- **TableType** — determines pricing tiers; each MenuItem can have multiple `Price` entries per TableType
- **Price** — links MenuItem × TableType to a price value

### Directory Structure

```
app/
  admin/          # Protected admin pages (orders, menu, tables, sales, chef, delivery,
                  # inventory, expenses, promotions, reservations, etc.)
    orders/[orderId]/  # POS order entry screen with menu grid + cart sidebar
    chef/         # Kitchen queue view
    delivery/     # Delivery/runner view
  api/admin/      # Admin API routes (require auth)
  api/chef/       # Chef queue + SSE stream
  api/delivery/   # Delivery queue + SSE stream
  api/auth/       # Login endpoint
  api/imagekit/   # ImageKit upload signing
  order/[orderId] # Customer-facing order view (no auth)
services/         # Business logic, one file per domain entity (order, menu-item,
                  # inventory, cash-session, promotion, reservation, etc.)
lib/
  prisma.ts       # Singleton PrismaClient
  middleware.ts   # withAuth() HOC for API routes
  types/          # Shared TypeScript types
utils/
  api-response.ts # successResponse / errorResponse helpers
  axios-client.ts # Axios instance with auth interceptor
  api-client.ts   # Fetch-based client
  token.ts        # sessionStorage token helpers
  imagekit.ts     # ImageKit upload helpers
contexts/
  AuthContext.tsx # JWT auth state
hooks/
  useDeliveryStream.ts  # SSE hook for delivery queue
  useChefStream.ts      # SSE hook for chef/kitchen queue
```

### Image Uploads

Menu item and product images are uploaded to **ImageKit**. Server-side signing lives at `app/api/imagekit/` and helpers in `utils/imagekit.ts`.
