'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TheMindGameState } from '@/types/game';
import { getDeviceId } from '@/lib/deviceId';

const POLL_INTERVAL = 1500; // 1.5 seconds for faster sync

interface UseTheMindResult {
  game: TheMindGameState | null;
  playerId: string | null;
  loading: boolean;
  error: string | null;
  createGame: (playerName: string) => Promise<boolean>;
  joinGame: (roomCode: string, playerName: string) => Promise<boolean>;
  rejoinGame: (roomCode: string, playerId: string) => Promise<boolean>;
  startGame: () => Promise<boolean>;
  playerReady: () => Promise<boolean>;
  playCard: (cardValue: number) => Promise<boolean>;
  nextLevel: () => Promise<boolean>;
  proposeShuriken: () => Promise<boolean>;
  cancelShuriken: () => Promise<boolean>;
  resetGame: () => Promise<boolean>;
}

export function useTheMind(): UseTheMindResult {
  const [game, setGame] = useState<TheMindGameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Restore session from storage
  useEffect(() => {
    const storedPlayerId = sessionStorage.getItem('theMindPlayerId');
    const storedRoomCode = sessionStorage.getItem('theMindRoomCode');

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
        const response = await fetch(`/api/the-mind?roomCode=${game.roomCode}&playerId=${playerId}`);
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
      const response = await fetch('/api/the-mind', {
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
          sessionStorage.setItem('theMindPlayerId', result.data.playerId);
        }
        if (result.data.game) {
          setGame(result.data.game);
          sessionStorage.setItem('theMindRoomCode', result.data.game.roomCode);
        }
        return true;
      } else {
        setError(result.error || 'Error desconocido');
        return false;
      }
    } catch (e) {
      setError('Error de conexion');
      console.error('API call error:', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, [game?.roomCode, playerId]);

  const createGame = useCallback(async (playerName: string): Promise<boolean> => {
    const deviceId = getDeviceId();
    return apiCall('create', { playerName, deviceId });
  }, [apiCall]);

  const joinGame = useCallback(async (roomCode: string, playerName: string): Promise<boolean> => {
    const deviceId = getDeviceId();
    return apiCall('join', { roomCode, playerName, deviceId });
  }, [apiCall]);

  const rejoinGame = useCallback(async (roomCode: string, storedPlayerId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/the-mind', {
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
        setGame(result.data.game);
        setPlayerId(storedPlayerId);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Rejoin error:', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const startGame = useCallback(async (): Promise<boolean> => {
    return apiCall('start');
  }, [apiCall]);

  const playerReady = useCallback(async (): Promise<boolean> => {
    return apiCall('ready');
  }, [apiCall]);

  const playCard = useCallback(async (cardValue: number): Promise<boolean> => {
    return apiCall('playCard', { cardValue });
  }, [apiCall]);

  const nextLevel = useCallback(async (): Promise<boolean> => {
    return apiCall('nextLevel');
  }, [apiCall]);

  const proposeShuriken = useCallback(async (): Promise<boolean> => {
    return apiCall('proposeShuriken');
  }, [apiCall]);

  const cancelShuriken = useCallback(async (): Promise<boolean> => {
    return apiCall('cancelShuriken');
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
    startGame,
    playerReady,
    playCard,
    nextLevel,
    proposeShuriken,
    cancelShuriken,
    resetGame,
  };
}
