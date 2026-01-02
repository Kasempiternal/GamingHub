'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { HipsterGameState, HipsterSong } from '@/types/game';

const POLL_INTERVAL = 1500; // 1.5 seconds for sync

interface UseHipsterResult {
  game: HipsterGameState | null;
  playerId: string | null;
  loading: boolean;
  error: string | null;
  // Room management
  createGame: (playerName: string, avatar?: string) => Promise<boolean>;
  joinGame: (roomCode: string, playerName: string, avatar?: string) => Promise<boolean>;
  rejoinGame: (roomCode: string, playerId: string) => Promise<boolean>;
  // Music setup (host confirms audio is working)
  confirmMusicReady: () => Promise<boolean>;
  // Collection phase
  startCollecting: () => Promise<boolean>;
  addSong: (song: Omit<HipsterSong, 'addedBy' | 'addedAt'>) => Promise<boolean>;
  removeSong: (songId: string) => Promise<boolean>;
  playerReady: () => Promise<boolean>;
  // Game actions
  startGame: () => Promise<boolean>;
  submitGuess: (position: number) => Promise<boolean>;
  submitBonus: (artist: string, title: string) => Promise<boolean>;
  skipBonus: () => Promise<boolean>;
  useToken: (targetPlayerId: string, cardIndex: number) => Promise<boolean>;
  // Intercept actions
  intercept: (position: number) => Promise<boolean>;
  resolveIntercept: () => Promise<boolean>;
  nextTurn: () => Promise<boolean>;
  resetGame: () => Promise<boolean>;
}

export function useHipster(): UseHipsterResult {
  const [game, setGame] = useState<HipsterGameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Restore session from storage
  useEffect(() => {
    const storedPlayerId = sessionStorage.getItem('hipsterPlayerId');
    const storedRoomCode = sessionStorage.getItem('hipsterRoomCode');

    if (storedPlayerId && storedRoomCode) {
      setPlayerId(storedPlayerId);
      rejoinGame(storedRoomCode, storedPlayerId);
    }
  }, []);

  // Polling for updates
  useEffect(() => {
    if (!game?.roomCode || !playerId) return;

    const poll = async () => {
      try {
        const response = await fetch(`/api/hipster?roomCode=${game.roomCode}&playerId=${playerId}`);
        const data = await response.json();
        if (data.success && data.data?.game) {
          setGame(data.data.game);
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    };

    pollingRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [game?.roomCode, playerId]);

  const apiCall = useCallback(async (action: string, data: Record<string, unknown> = {}): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hipster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          roomCode: game?.roomCode,
          playerId,
          ...data,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        if (result.data.playerId) {
          setPlayerId(result.data.playerId);
          sessionStorage.setItem('hipsterPlayerId', result.data.playerId);
        }
        if (result.data.game) {
          setGame(result.data.game);
          sessionStorage.setItem('hipsterRoomCode', result.data.game.roomCode);
        }
        return true;
      } else {
        setError(result.error || 'Error desconocido');
        return false;
      }
    } catch (e) {
      console.error('API error:', e);
      setError('Error de conexión');
      return false;
    } finally {
      setLoading(false);
    }
  }, [game?.roomCode, playerId]);

  // Room management
  const createGame = useCallback(async (playerName: string, avatar?: string): Promise<boolean> => {
    return apiCall('create', { playerName, avatar });
  }, [apiCall]);

  const joinGame = useCallback(async (roomCode: string, playerName: string, avatar?: string): Promise<boolean> => {
    return apiCall('join', { roomCode, playerName, avatar });
  }, [apiCall]);

  const rejoinGame = useCallback(async (roomCode: string, storedPlayerId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/hipster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rejoin',
          roomCode,
          playerId: storedPlayerId,
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.game) {
        setPlayerId(storedPlayerId);
        setGame(result.data.game);
        return true;
      } else {
        // Session expired, clear storage
        sessionStorage.removeItem('hipsterPlayerId');
        sessionStorage.removeItem('hipsterRoomCode');
        return false;
      }
    } catch (e) {
      console.error('Rejoin error:', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Music ready - host confirms audio is working
  const confirmMusicReady = useCallback(async (): Promise<boolean> => {
    return apiCall('musicReady');
  }, [apiCall]);

  // Collection phase
  const startCollecting = useCallback(async (): Promise<boolean> => {
    return apiCall('startCollecting');
  }, [apiCall]);

  const addSong = useCallback(async (song: Omit<HipsterSong, 'addedBy' | 'addedAt'>): Promise<boolean> => {
    return apiCall('addSong', { song });
  }, [apiCall]);

  const removeSong = useCallback(async (songId: string): Promise<boolean> => {
    return apiCall('removeSong', { songId });
  }, [apiCall]);

  const playerReady = useCallback(async (): Promise<boolean> => {
    return apiCall('playerReady');
  }, [apiCall]);

  // Game actions
  const startGame = useCallback(async (): Promise<boolean> => {
    return apiCall('startGame');
  }, [apiCall]);

  const submitGuess = useCallback(async (position: number): Promise<boolean> => {
    return apiCall('submitGuess', { position });
  }, [apiCall]);

  const submitBonus = useCallback(async (artist: string, title: string): Promise<boolean> => {
    return apiCall('submitBonus', { artist, title });
  }, [apiCall]);

  const skipBonus = useCallback(async (): Promise<boolean> => {
    return apiCall('skipBonus');
  }, [apiCall]);

  const useToken = useCallback(async (targetPlayerId: string, cardIndex: number): Promise<boolean> => {
    return apiCall('useToken', { targetPlayerId, cardIndex });
  }, [apiCall]);

  // Intercept actions
  const intercept = useCallback(async (position: number): Promise<boolean> => {
    return apiCall('intercept', { position });
  }, [apiCall]);

  const resolveIntercept = useCallback(async (): Promise<boolean> => {
    return apiCall('resolveIntercept');
  }, [apiCall]);

  const nextTurn = useCallback(async (): Promise<boolean> => {
    return apiCall('nextTurn');
  }, [apiCall]);

  const resetGame = useCallback(async (): Promise<boolean> => {
    return apiCall('reset');
  }, [apiCall]);

  return {
    game,
    playerId,
    loading,
    error,
    createGame,
    joinGame,
    rejoinGame,
    confirmMusicReady,
    startCollecting,
    addSong,
    removeSong,
    playerReady,
    startGame,
    submitGuess,
    submitBonus,
    skipBonus,
    useToken,
    intercept,
    resolveIntercept,
    nextTurn,
    resetGame,
  };
}
