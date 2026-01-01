'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ImpostorGameState, ImpostorPlayer } from '@/types/game';

interface UseImpostorResult {
  game: ImpostorGameState | null;
  player: ImpostorPlayer | null;
  loading: boolean;
  error: string | null;
  isHost: boolean;
  isMyTurn: boolean;
  startGame: () => Promise<void>;
  giveDescription: () => Promise<void>;
  startVoting: () => Promise<void>;
  vote: (targetId: string) => Promise<void>;
  nextRound: () => Promise<void>;
  resetGame: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useImpostor(roomCode: string, playerId: string | null): UseImpostorResult {
  const [game, setGame] = useState<ImpostorGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const player = game?.players.find(p => p.id === playerId) || null;
  const isHost = player?.isHost || false;
  const isMyTurn = game?.currentSpeaker === playerId;

  const fetchGame = useCallback(async () => {
    if (!roomCode) return;

    try {
      const response = await fetch('/api/impostor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get',
          roomCode,
          playerId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGame(data.data.game);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  }, [roomCode, playerId]);

  // Initial fetch and polling
  useEffect(() => {
    fetchGame();

    // Poll for updates
    pollIntervalRef.current = setInterval(fetchGame, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchGame]);

  const apiAction = async (action: string, additionalData: Record<string, unknown> = {}) => {
    try {
      const response = await fetch('/api/impostor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          roomCode,
          playerId,
          ...additionalData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGame(data.data.game);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error de conexion');
    }
  };

  const startGame = async () => {
    await apiAction('start');
  };

  const giveDescription = async () => {
    await apiAction('describe');
  };

  const startVoting = async () => {
    await apiAction('startVoting');
  };

  const vote = async (targetId: string) => {
    await apiAction('vote', { targetId });
  };

  const nextRound = async () => {
    await apiAction('nextRound');
  };

  const resetGame = async () => {
    await apiAction('reset');
  };

  return {
    game,
    player,
    loading,
    error,
    isHost,
    isMyTurn,
    startGame,
    giveDescription,
    startVoting,
    vote,
    nextRound,
    resetGame,
    refetch: fetchGame,
  };
}
