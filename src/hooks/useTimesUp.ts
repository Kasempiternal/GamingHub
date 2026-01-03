'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimesUpGameState, TimesUpPlayer, TimesUpTeam, TimesUpCard } from '@/types/game';

interface UseTimesUpResult {
  game: TimesUpGameState | null;
  player: TimesUpPlayer | null;
  loading: boolean;
  error: string | null;
  isHost: boolean;
  isMyTurn: boolean;
  currentCard: TimesUpCard | null;
  timeRemaining: number;           // Seconds remaining in turn

  // Actions
  setTeam: (team: TimesUpTeam | null) => Promise<void>;
  startGame: () => Promise<void>;
  startTurn: () => Promise<void>;
  guessCorrect: () => Promise<void>;
  skipCard: () => Promise<void>;
  endTurn: () => Promise<void>;
  nextRound: () => Promise<void>;
  resetGame: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTimesUp(roomCode: string, playerId: string | null): UseTimesUpResult {
  const [game, setGame] = useState<TimesUpGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const player = game?.players.find(p => p.id === playerId) || null;
  const isHost = player?.isHost || false;
  const isMyTurn = game?.currentTurn?.playerId === playerId && game?.currentTurn?.isActive;

  // Get current card from remainingCards at currentCardIndex
  const currentCard = game?.currentTurn?.isActive && game?.remainingCards
    ? game.remainingCards[game.currentTurn.currentCardIndex] || null
    : null;

  const fetchGame = useCallback(async () => {
    if (!roomCode) return;

    try {
      const response = await fetch('/api/timesup', {
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

  // Initial fetch and polling (faster for timer sync)
  useEffect(() => {
    fetchGame();

    // Poll for updates every 500ms (faster because of timer)
    pollIntervalRef.current = setInterval(fetchGame, 500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchGame]);

  // Local countdown timer (updates every 100ms for smooth display)
  useEffect(() => {
    // Clear previous timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Only run timer if turn is active
    if (!game?.currentTurn?.isActive || !game.currentTurn.endsAt) {
      setTimeRemaining(0);
      return;
    }

    // Calculate and update time remaining
    const updateTimeRemaining = () => {
      const now = Date.now();
      const endsAt = game.currentTurn!.endsAt;
      const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
      setTimeRemaining(remaining);

      // If time is up, trigger a fetch to sync state
      if (remaining === 0) {
        fetchGame();
      }
    };

    // Initial update
    updateTimeRemaining();

    // Update every 100ms for smooth countdown
    timerIntervalRef.current = setInterval(updateTimeRemaining, 100);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [game?.currentTurn?.isActive, game?.currentTurn?.endsAt, fetchGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const apiAction = async (action: string, additionalData: Record<string, unknown> = {}) => {
    try {
      const response = await fetch('/api/timesup', {
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

  const setTeam = async (team: TimesUpTeam | null) => {
    await apiAction('setTeam', { team });
  };

  const startGame = async () => {
    await apiAction('start');
  };

  const startTurn = async () => {
    await apiAction('startTurn');
  };

  const guessCorrect = async () => {
    await apiAction('guessCorrect');
  };

  const skipCard = async () => {
    await apiAction('skipCard');
  };

  const endTurn = async () => {
    await apiAction('endTurn');
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
    currentCard,
    timeRemaining,
    setTeam,
    startGame,
    startTurn,
    guessCorrect,
    skipCard,
    endTurn,
    nextRound,
    resetGame,
    refetch: fetchGame,
  };
}
