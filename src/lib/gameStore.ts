// Gaming Hub - Game Store with Neon PostgreSQL
// Uses in-memory fallback for local development

import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import type { GameState, ImpostorGameState, TimesUpGameState, WavelengthGameState, AsesinatoGameState } from '@/types/game';

const GAME_PREFIX = 'game:';
const IMPOSTOR_PREFIX = 'impostor:';
const TIMESUP_PREFIX = 'timesup:';
const WAVELENGTH_PREFIX = 'wavelength:';
const ASESINATO_PREFIX = 'asesinato:';

// Lazy initialization of Neon SQL client
let sql: NeonQueryFunction<false, false> | null = null;
let isDBConfigured: boolean | null = null;

function getSQL(): NeonQueryFunction<false, false> | null {
  if (isDBConfigured === null) {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    isDBConfigured = !!databaseUrl;
    if (isDBConfigured) {
      sql = neon(databaseUrl!);
    }
  }
  return sql;
}

// Initialize games table if not exists
let dbInitialized = false;
async function initDB() {
  const db = getSQL();
  if (!db || dbInitialized) return;
  try {
    await db`
      CREATE TABLE IF NOT EXISTS games (
        key TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
      )
    `;
    await db`
      CREATE INDEX IF NOT EXISTS idx_games_expires ON games (expires_at)
    `;
    dbInitialized = true;
  } catch (error) {
    console.error('DB init error:', error);
  }
}

async function ensureDB() {
  if (!dbInitialized && getSQL()) {
    await initDB();
  }
}

// In-memory fallback for local development
// Use globalThis to persist across Next.js hot reloads
const globalForGames = globalThis as unknown as {
  localGames: Map<string, GameState>;
  localImpostorGames: Map<string, ImpostorGameState>;
  localTimesUpGames: Map<string, TimesUpGameState>;
  localWavelengthGames: Map<string, WavelengthGameState>;
  localAsesinatoGames: Map<string, AsesinatoGameState>;
};

const localGames = globalForGames.localGames ?? new Map<string, GameState>();
const localImpostorGames = globalForGames.localImpostorGames ?? new Map<string, ImpostorGameState>();
const localTimesUpGames = globalForGames.localTimesUpGames ?? new Map<string, TimesUpGameState>();
const localWavelengthGames = globalForGames.localWavelengthGames ?? new Map<string, WavelengthGameState>();
const localAsesinatoGames = globalForGames.localAsesinatoGames ?? new Map<string, AsesinatoGameState>();

// Store references in globalThis to persist across hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalForGames.localGames = localGames;
  globalForGames.localImpostorGames = localImpostorGames;
  globalForGames.localTimesUpGames = localTimesUpGames;
  globalForGames.localWavelengthGames = localWavelengthGames;
  globalForGames.localAsesinatoGames = localAsesinatoGames;
}

// Generic get/set/delete functions for Neon
async function neonGet<T>(key: string): Promise<T | null> {
  const db = getSQL();
  if (!db) return null;
  await ensureDB();
  try {
    const result = await db`
      SELECT data FROM games
      WHERE key = ${key}
      AND expires_at > NOW()
    `;
    if (result.length === 0) return null;
    return result[0].data as T;
  } catch (error) {
    console.error('DB get error:', error);
    return null;
  }
}

async function neonSet<T>(key: string, data: T): Promise<void> {
  const db = getSQL();
  if (!db) return;
  await ensureDB();
  try {
    await db`
      INSERT INTO games (key, data, expires_at)
      VALUES (${key}, ${JSON.stringify(data)}::jsonb, NOW() + INTERVAL '24 hours')
      ON CONFLICT (key)
      DO UPDATE SET data = ${JSON.stringify(data)}::jsonb, expires_at = NOW() + INTERVAL '24 hours'
    `;
  } catch (error) {
    console.error('DB set error:', error);
    throw error;
  }
}

async function neonDelete(key: string): Promise<boolean> {
  const db = getSQL();
  if (!db) return false;
  await ensureDB();
  try {
    await db`DELETE FROM games WHERE key = ${key}`;
    return true;
  } catch (error) {
    console.error('DB delete error:', error);
    return false;
  }
}

// Codigo Secreto Game Store
export const gameStore = {
  async get(roomCode: string): Promise<GameState | null> {
    const key = GAME_PREFIX + roomCode.toUpperCase();

    if (getSQL()) {
      return await neonGet<GameState>(key);
    }

    return localGames.get(roomCode.toUpperCase()) ?? null;
  },

  async set(roomCode: string, game: GameState): Promise<void> {
    const key = GAME_PREFIX + roomCode.toUpperCase();

    if (getSQL()) {
      await neonSet(key, game);
    } else {
      localGames.set(roomCode.toUpperCase(), game);
    }
  },

  async delete(roomCode: string): Promise<boolean> {
    const key = GAME_PREFIX + roomCode.toUpperCase();

    if (getSQL()) {
      return await neonDelete(key);
    }

    return localGames.delete(roomCode.toUpperCase());
  },

  async has(roomCode: string): Promise<boolean> {
    const game = await this.get(roomCode);
    return game !== null;
  },
};

// Impostor Game Store
export const impostorStore = {
  async get(roomCode: string): Promise<ImpostorGameState | null> {
    const key = IMPOSTOR_PREFIX + roomCode.toUpperCase();

    if (getSQL()) {
      return await neonGet<ImpostorGameState>(key);
    }

    return localImpostorGames.get(roomCode.toUpperCase()) ?? null;
  },

  async set(roomCode: string, game: ImpostorGameState): Promise<void> {
    const key = IMPOSTOR_PREFIX + roomCode.toUpperCase();

    if (getSQL()) {
      await neonSet(key, game);
    } else {
      localImpostorGames.set(roomCode.toUpperCase(), game);
    }
  },

  async delete(roomCode: string): Promise<boolean> {
    const key = IMPOSTOR_PREFIX + roomCode.toUpperCase();

    if (getSQL()) {
      return await neonDelete(key);
    }

    return localImpostorGames.delete(roomCode.toUpperCase());
  },

  async has(roomCode: string): Promise<boolean> {
    const game = await this.get(roomCode);
    return game !== null;
  },
};

// Times Up Game Store
export const timesUpStore = {
  async get(roomCode: string): Promise<TimesUpGameState | null> {
    const key = TIMESUP_PREFIX + roomCode.toUpperCase();

    if (getSQL()) {
      return await neonGet<TimesUpGameState>(key);
    }

    return localTimesUpGames.get(roomCode.toUpperCase()) ?? null;
  },

  async set(roomCode: string, game: TimesUpGameState): Promise<void> {
    const key = TIMESUP_PREFIX + roomCode.toUpperCase();

    if (getSQL()) {
      await neonSet(key, game);
    } else {
      localTimesUpGames.set(roomCode.toUpperCase(), game);
    }
  },

  async delete(roomCode: string): Promise<boolean> {
    const key = TIMESUP_PREFIX + roomCode.toUpperCase();

    if (getSQL()) {
      return await neonDelete(key);
    }

    return localTimesUpGames.delete(roomCode.toUpperCase());
  },

  async has(roomCode: string): Promise<boolean> {
    const game = await this.get(roomCode);
    return game !== null;
  },
};

// Wavelength Game Store
export const wavelengthStore = {
  async get(roomCode: string): Promise<WavelengthGameState | null> {
    const key = WAVELENGTH_PREFIX + roomCode.toUpperCase();

    if (getSQL()) {
      return await neonGet<WavelengthGameState>(key);
    }

    return localWavelengthGames.get(roomCode.toUpperCase()) ?? null;
  },

  async set(roomCode: string, game: WavelengthGameState): Promise<void> {
    const key = WAVELENGTH_PREFIX + roomCode.toUpperCase();

    if (getSQL()) {
      await neonSet(key, game);
    } else {
      localWavelengthGames.set(roomCode.toUpperCase(), game);
    }
  },

  async delete(roomCode: string): Promise<boolean> {
    const key = WAVELENGTH_PREFIX + roomCode.toUpperCase();

    if (getSQL()) {
      return await neonDelete(key);
    }

    return localWavelengthGames.delete(roomCode.toUpperCase());
  },

  async has(roomCode: string): Promise<boolean> {
    const game = await this.get(roomCode);
    return game !== null;
  },
};

// Asesinato en Hong Kong Game Store
export const asesinatoStore = {
  async get(roomCode: string): Promise<AsesinatoGameState | null> {
    const key = ASESINATO_PREFIX + roomCode.toUpperCase();

    if (getSQL()) {
      return await neonGet<AsesinatoGameState>(key);
    }

    return localAsesinatoGames.get(roomCode.toUpperCase()) ?? null;
  },

  async set(roomCode: string, game: AsesinatoGameState): Promise<void> {
    const key = ASESINATO_PREFIX + roomCode.toUpperCase();

    if (getSQL()) {
      await neonSet(key, game);
    } else {
      localAsesinatoGames.set(roomCode.toUpperCase(), game);
    }
  },

  async delete(roomCode: string): Promise<boolean> {
    const key = ASESINATO_PREFIX + roomCode.toUpperCase();

    if (getSQL()) {
      return await neonDelete(key);
    }

    return localAsesinatoGames.delete(roomCode.toUpperCase());
  },

  async has(roomCode: string): Promise<boolean> {
    const game = await this.get(roomCode);
    return game !== null;
  },
};

export default { gameStore, impostorStore, timesUpStore, wavelengthStore, asesinatoStore };
