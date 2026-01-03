# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gaming Hub is a multiplayer party games platform built with Next.js 14. It features browser-based games designed for mobile-first experiences with real-time synchronization. All games are in Spanish.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **State**: Zustand (local), Neon PostgreSQL (persistence)
- **Real-time**: Polling-based (2-second intervals via custom hooks)
- **UI**: Tailwind CSS + Framer Motion
- **Styling**: Dark theme with game-specific color schemes

### Game Structure Pattern
Each game follows a consistent structure:

```
src/app/{game-name}/
├── page.tsx                    # Game lobby/creation page
├── sala/[roomCode]/page.tsx    # Active game room
└── unirse/[roomCode]/page.tsx  # Join existing game

src/components/{game-name}/     # Game-specific components
src/hooks/use{GameName}.ts      # Game state hook with polling
src/lib/{gameName}Logic.ts      # Pure game logic functions
src/app/api/{game-name}/route.ts # API endpoint (single POST with actions)
```

### State Management Flow
1. **API Route** (`/api/{game}/route.ts`): Single POST endpoint handling all actions via `action` field in body
2. **Game Store** (`src/lib/gameStore.ts`): Abstraction over Neon PostgreSQL with in-memory fallback for local dev
3. **Custom Hook** (`src/hooks/use{Game}.ts`): Polls API every 2 seconds, exposes game state and action methods
4. **Room Page**: Uses hook, renders UI based on game phase

### Adding a New Game
1. Define types in `src/types/game.ts` (GameState, Player, Phase types)
2. Add game logic in `src/lib/{gameName}Logic.ts` (pure functions)
3. Create API route with action switch statement
4. Add store methods in `gameStore.ts` with appropriate prefix
5. Create hook following `useImpostor.ts` pattern
6. Add pages and components
7. Register in `src/lib/games.ts` for home page listing

### API Pattern
All game APIs use a single POST endpoint with action-based routing:
```typescript
// Request body
{ action: 'create' | 'join' | 'start' | 'get' | ..., roomCode?, playerId?, ...data }

// Response
{ success: boolean, data?: { game, playerId? }, error?: string }
```

### Sanitization Pattern
Game state is sanitized before sending to clients to hide sensitive info (other players' roles, words, cards). See `sanitizeGameForPlayer()` functions in API routes.

### Available Games
- **Codigo Secreto**: Team-based word association (Codenames clone)
- **The Mind**: Cooperative card sequencing
- **Impostor**: Social deduction (hidden role)
- **Scout**: Card game with dual-value cards
- **Hipster**: Music timeline guessing with iTunes integration

### Environment Variables
- `DATABASE_URL` or `POSTGRES_URL`: Neon PostgreSQL connection (optional, uses in-memory fallback)
- Pusher credentials (configured but currently using polling instead)

### Key Files
- `src/types/game.ts`: All TypeScript interfaces for game states
- `src/lib/gameStore.ts`: Database abstraction layer
- `src/lib/games.ts`: Game registry for home page
- `tailwind.config.ts`: Custom colors (team-red, team-blue, impostor, civilian, etc.)

## Version Management

**IMPORTANT**: Always update the version on the landing page when committing and pushing changes.

Version is located in `src/app/page.tsx` (search for "Version badge"):
```tsx
<span className="text-white/40 text-xs font-medium">v2.5.0 - Edition Name</span>
```

### Semantic Versioning Rules
Use semantic versioning (MAJOR.MINOR.PATCH) based on the size of the change:

| Change Type | Version Bump | Example | When to Use |
|-------------|--------------|---------|-------------|
| **Patch** | x.x.+1 | 2.5.0 → 2.5.1 | Bug fixes, small UI tweaks, minor improvements |
| **Minor** | x.+1.0 | 2.5.1 → 2.6.0 | New features, significant UI changes, new game mechanics |
| **Major** | +1.0.0 | 2.6.0 → 3.0.0 | Breaking changes, new games, major redesigns |

### Edition Names (Optional)
You can add a fun edition name for significant releases:
- "Hipster Edition" - Music game release
- "Tiempo Edition" - Timeline features
- "Fiesta Edition" - Party features

### Workflow
1. Make your changes
2. Before committing, update the version in `src/app/page.tsx`
3. Commit and push
