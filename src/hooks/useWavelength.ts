'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { WavelengthGameState, WavelengthPlayer, WavelengthTeam } from '@/types/game';

interface UseWavelengthResult {
  game: WavelengthGameState | null;
  player: WavelengthPlayer | null;
  loading: boolean;
  error: string | null;
  isHost: boolean;
  isPsychic: boolean;
  isMyTeamsTurn: boolean;
  myTeam: WavelengthTeam | null;
  // Actions
  joinTeam: (team: WavelengthTeam) => Promise<void>;
  startGame: () => Promise<void>;
  submitClue: (clue: string) => Promise<void>;
  submitGuess: (position: number) => Promise<void>;
  submitCounter: (direction: 'left' | 'right') => Promise<void>;
  skipCounter: () => Promise<void>;
  reveal: () => Promise<void>;
  nextRound: () => Promise<void>;
  resetGame: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useWavelength(roomCode: string, playerId: string | null): UseWavelengthResult {
  const [game, setGame] = useState<WavelengthGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const player = game?.players.find(p => p.id === playerId) || null;
  const isHost = player?.isHost || false;
  const isPsychic = player?.isPsychic || false;
  const myTeam = player?.team || null;
  const isMyTeamsTurn = myTeam === game?.currentTeam;

  const fetchGame = useCallback(async () => {
    if (!roomCode) return;

    try {
      const response = await fetch('/api/wavelength', {
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
      setError('Error de conexión');
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
      const response = await fetch('/api/wavelength', {
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
      setError('Error de conexión');
    }
  };

  const joinTeam = async (team: WavelengthTeam) => {
    await apiAction('joinTeam', { team });
  };

  const startGame = async () => {
    await apiAction('start');
  };

  const submitClue = async (clue: string) => {
    await apiAction('submitClue', { clue });
  };

  const submitGuess = async (position: number) => {
    await apiAction('submitGuess', { guess: position });
  };

  const submitCounter = async (direction: 'left' | 'right') => {
    await apiAction('submitCounter', { direction });
  };

  const skipCounter = async () => {
    await apiAction('skipCounter');
  };

  const reveal = async () => {
    await apiAction('reveal');
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
    isPsychic,
    isMyTeamsTurn,
    myTeam,
    joinTeam,
    startGame,
    submitClue,
    submitGuess,
    submitCounter,
    skipCounter,
    reveal,
    nextRound,
    resetGame,
    refetch: fetchGame,
  };
}
