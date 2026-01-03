'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AsesinatoGameState, AsesinatoPlayer } from '@/types/game';

export interface UseAsesinatoResult {
  game: AsesinatoGameState | null;
  player: AsesinatoPlayer | null;
  loading: boolean;
  error: string | null;

  // Derived state
  isHost: boolean;
  isForensicScientist: boolean;
  isMurderer: boolean;
  isAccomplice: boolean;
  isWitness: boolean;
  isInvestigator: boolean;
  canAccuse: boolean;
  discussionTimeRemaining: number;

  // Actions
  startGame: () => Promise<void>;
  proceedToMurderSelection: () => Promise<void>;
  selectSolution: (clueCardId: string, meansCardId: string) => Promise<void>;
  selectTileOption: (tileId: string, optionIndex: number) => Promise<void>;
  confirmClues: () => Promise<void>;
  replaceTile: (oldTileId: string, newTileId: string) => Promise<void>;
  accuse: (targetPlayerId: string, clueCardId: string, meansCardId: string) => Promise<{ isCorrect: boolean }>;
  nextRound: () => Promise<void>;
  resetGame: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useAsesinato(roomCode: string, playerId: string | null): UseAsesinatoResult {
  const [game, setGame] = useState<AsesinatoGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [discussionTimeRemaining, setDiscussionTimeRemaining] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const player = game?.players.find(p => p.id === playerId) || null;
  const isHost = player?.isHost || false;
  const isForensicScientist = player?.role === 'forensicScientist';
  const isMurderer = player?.role === 'murderer';
  const isAccomplice = player?.role === 'accomplice';
  const isWitness = player?.role === 'witness';
  const isInvestigator = player?.role === 'investigator';
  const canAccuse = !player?.hasAccused &&
    player?.role !== 'forensicScientist' &&
    player?.role !== 'murderer' &&
    player?.role !== 'accomplice' &&
    game?.phase === 'discussion';

  // Update discussion timer
  useEffect(() => {
    if (game?.discussionDeadline) {
      const updateTimer = () => {
        const remaining = Math.max(0, game.discussionDeadline! - Date.now());
        setDiscussionTimeRemaining(remaining);
      };

      updateTimer();
      timerIntervalRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    } else {
      setDiscussionTimeRemaining(0);
    }
  }, [game?.discussionDeadline]);

  const fetchGame = useCallback(async () => {
    if (!roomCode) return;

    try {
      const response = await fetch('/api/asesinato-hk', {
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
      const response = await fetch('/api/asesinato-hk', {
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
        return data;
      } else {
        setError(data.error);
        return data;
      }
    } catch (err) {
      setError('Error de conexion');
      return { success: false, error: 'Error de conexion' };
    }
  };

  const startGame = async () => {
    await apiAction('start');
  };

  const proceedToMurderSelection = async () => {
    await apiAction('proceedToMurderSelection');
  };

  const selectSolution = async (clueCardId: string, meansCardId: string) => {
    await apiAction('selectSolution', { clueCardId, meansCardId });
  };

  const selectTileOption = async (tileId: string, optionIndex: number) => {
    await apiAction('selectTileOption', { tileId, optionIndex });
  };

  const confirmClues = async () => {
    await apiAction('confirmClues');
  };

  const replaceTile = async (oldTileId: string, newTileId: string) => {
    await apiAction('replaceTile', { oldTileId, newTileId });
  };

  const accuse = async (targetPlayerId: string, clueCardId: string, meansCardId: string) => {
    const result = await apiAction('accuse', { targetPlayerId, clueCardId, meansCardId });
    return { isCorrect: result.data?.isCorrect || false };
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
    isForensicScientist,
    isMurderer,
    isAccomplice,
    isWitness,
    isInvestigator,
    canAccuse,
    discussionTimeRemaining,
    startGame,
    proceedToMurderSelection,
    selectSolution,
    selectTileOption,
    confirmClues,
    replaceTile,
    accuse,
    nextRound,
    resetGame,
    refetch: fetchGame,
  };
}
