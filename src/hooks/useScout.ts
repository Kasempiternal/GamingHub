'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ScoutGameState } from '@/types/game';
import { getDeviceId } from '@/lib/deviceId';

const POLL_INTERVAL = 1500;

interface UseScoutResult {
  game: ScoutGameState | null;
  playerId: string | null;
  loading: boolean;
  error: string | null;
  createGame: (playerName: string) => Promise<boolean>;
  joinGame: (roomCode: string, playerName: string) => Promise<boolean>;
  rejoinGame: (roomCode: string, playerId: string) => Promise<boolean>;
  startGame: () => Promise<boolean>;
  flipHand: () => Promise<boolean>;
  confirmHand: () => Promise<boolean>;
  show: (cardIds: string[]) => Promise<boolean>;
  scout: (takeFromLeft: boolean, insertAtIndex: number) => Promise<boolean>;
  scoutAndShow: (takeFromLeft: boolean, insertAtIndex: number, showCardIds: string[]) => Promise<boolean>;
  nextRound: () => Promise<boolean>;
  resetGame: () => Promise<boolean>;
}

export function useScout(): UseScoutResult {
  const [game, setGame] = useState<ScoutGameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Restore session from storage
  useEffect(() => {
    const storedPlayerId = sessionStorage.getItem('scoutPlayerId');
    const storedRoomCode = sessionStorage.getItem('scoutRoomCode');

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
        const response = await fetch(`/api/scout?roomCode=${game.roomCode}&playerId=${playerId}`);
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
      const response = await fetch('/api/scout', {
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
          sessionStorage.setItem('scoutPlayerId', result.data.playerId);
        }
        if (result.data.game) {
          setGame(result.data.game);
          sessionStorage.setItem('scoutRoomCode', result.data.game.roomCode);
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
      const response = await fetch('/api/scout', {
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

  const flipHand = useCallback(async (): Promise<boolean> => {
    return apiCall('flipHand');
  }, [apiCall]);

  const confirmHand = useCallback(async (): Promise<boolean> => {
    return apiCall('confirmHand');
  }, [apiCall]);

  const show = useCallback(async (cardIds: string[]): Promise<boolean> => {
    return apiCall('show', { cardIds });
  }, [apiCall]);

  const scout = useCallback(async (takeFromLeft: boolean, insertAtIndex: number): Promise<boolean> => {
    return apiCall('scout', { takeFromLeft, insertAtIndex });
  }, [apiCall]);

  const scoutAndShow = useCallback(async (takeFromLeft: boolean, insertAtIndex: number, showCardIds: string[]): Promise<boolean> => {
    return apiCall('scoutAndShow', { takeFromLeft, insertAtIndex, showCardIds });
  }, [apiCall]);

  const nextRound = useCallback(async (): Promise<boolean> => {
    return apiCall('nextRound');
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
    flipHand,
    confirmHand,
    show,
    scout,
    scoutAndShow,
    nextRound,
    resetGame,
  };
}
