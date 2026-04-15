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

### Community Events (Mobile App)
- **Path**: `artifacts/community-events/`
- **Type**: Expo (React Native)
- **Purpose**: Social event management app for shared housing communities (dorms, student housing)
- **Storage**: AsyncStorage (local, no backend needed)
- **Key features**:
  - Browse upcoming events with spot counts (e.g. "3 of 10 spots filled") and progress bars
  - Category filtering: Social, Fitness, Food, Study, Entertainment, Other
  - Sign up / cancel with confirmation dialog
  - Sign-up deadlines with countdown display
  - Create new events (title, description, location, category, total spots, date, deadline)
  - "My Events" tab to see events you've joined
  - Sample events preloaded on first launch
- **Context**: `context/EventsContext.tsx` — handles all state with AsyncStorage persistence
- **Components**: `EventCard`, `CategoryFilter`, `CreateEventModal`
- **Colors**: Teal primary (`#0d9488`), category-specific accent colors

### API Server
- **Path**: `artifacts/api-server/`
- **Type**: Express 5 + TypeScript
- **Purpose**: Shared backend for all artifacts (currently only health check)
