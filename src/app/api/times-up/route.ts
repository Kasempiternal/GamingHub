import { NextRequest, NextResponse } from 'next/server';
import { timesUpStore } from '@/lib/gameStore';
import {
  createGame,
  addPlayer,
  setPlayerTeam,
  startGame,
  startTurn,
  guessCorrect,
  skipCard,
  endTurn,
  startNextRound,
  endGame,
  resetGame,
  rejoinPlayer,
} from '@/lib/timesUpLogic';
import type { TimesUpGameState } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create': {
        const { hostName, deviceId } = body;
        if (!hostName || hostName.trim().length < 2) {
          return NextResponse.json(
            { success: false, error: 'Nombre invalido' },
            { status: 400 }
          );
        }

        const game = createGame(hostName.trim(), deviceId);
        await timesUpStore.set(game.roomCode, game);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(game, game.players[0].id),
            playerId: game.players[0].id,
          },
        });
      }

      case 'join': {
        const { roomCode, playerName, deviceId } = body;
        if (!roomCode) {
          return NextResponse.json(
            { success: false, error: 'Falta codigo de sala' },
            { status: 400 }
          );
        }

        const game = await timesUpStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        // Check if device already has a player in this game (auto-reconnect)
        if (deviceId) {
          const existingByDevice = game.players.find(p => p.deviceId === deviceId);
          if (existingByDevice) {
            game.lastActivity = Date.now();
            await timesUpStore.set(roomCode.toUpperCase(), game);
            return NextResponse.json({
              success: true,
              data: {
                game: sanitizeGameForPlayer(game, existingByDevice.id),
                playerId: existingByDevice.id,
                reconnected: true,
              },
            });
          }
        }

        // Check if player already exists by name (legacy reconnect)
        if (playerName) {
          const existingPlayer = game.players.find(
            p => p.name.toLowerCase() === playerName.toLowerCase().trim()
          );

          if (existingPlayer) {
            return NextResponse.json({
              success: true,
              data: {
                game: sanitizeGameForPlayer(game, existingPlayer.id),
                playerId: existingPlayer.id,
                reconnected: true,
              },
            });
          }
        }

        // New player joining - require name
        if (!playerName || playerName.trim().length < 2) {
          return NextResponse.json(
            { success: false, error: 'Nombre requerido (minimo 2 caracteres)' },
            { status: 400 }
          );
        }

        if (game.phase !== 'lobby') {
          return NextResponse.json(
            { success: false, error: 'La partida ya ha comenzado' },
            { status: 400 }
          );
        }

        if (game.players.length >= 20) {
          return NextResponse.json(
            { success: false, error: 'La partida esta llena' },
            { status: 400 }
          );
        }

        const { game: updatedGame, player } = addPlayer(game, playerName.trim(), deviceId);
        await timesUpStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, player.id),
            playerId: player.id,
          },
        });
      }

      case 'rejoin': {
        const { roomCode, playerName } = body;
        if (!roomCode || !playerName) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await timesUpStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const { game: updatedGame, player, error } = rejoinPlayer(game, playerName.trim());

        if (error || !player) {
          return NextResponse.json(
            { success: false, error: error || 'No se pudo unir' },
            { status: 400 }
          );
        }

        await timesUpStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, player.id),
            playerId: player.id,
          },
        });
      }

      case 'get': {
        const { roomCode, playerId } = body;
        if (!roomCode) {
          return NextResponse.json(
            { success: false, error: 'Falta codigo de sala' },
            { status: 400 }
          );
        }

        const game = await timesUpStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(game, playerId),
          },
        });
      }

      case 'setTeam': {
        const { roomCode, playerId, team } = body;
        if (!roomCode || !playerId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await timesUpStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        if (game.phase !== 'lobby') {
          return NextResponse.json(
            { success: false, error: 'No se puede cambiar equipo durante la partida' },
            { status: 400 }
          );
        }

        // Validate team value
        if (team !== null && team !== 'orange' && team !== 'blue') {
          return NextResponse.json(
            { success: false, error: 'Equipo invalido' },
            { status: 400 }
          );
        }

        const updatedGame = setPlayerTeam(game, playerId, team);
        await timesUpStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'start': {
        const { roomCode, playerId } = body;
        if (!roomCode || !playerId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await timesUpStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const player = game.players.find(p => p.id === playerId);
        if (!player?.isHost) {
          return NextResponse.json(
            { success: false, error: 'Solo el host puede iniciar' },
            { status: 403 }
          );
        }

        if (game.phase !== 'lobby') {
          return NextResponse.json(
            { success: false, error: 'La partida ya ha comenzado' },
            { status: 400 }
          );
        }

        const { game: updatedGame, error } = startGame(game);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await timesUpStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'startTurn': {
        const { roomCode, playerId } = body;
        if (!roomCode || !playerId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await timesUpStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        // Check if it's a playing phase
        if (!['round1', 'round2', 'round3'].includes(game.phase)) {
          return NextResponse.json(
            { success: false, error: 'No se puede iniciar turno en esta fase' },
            { status: 400 }
          );
        }

        // Check if current turn is already active
        if (game.currentTurn?.isActive) {
          return NextResponse.json(
            { success: false, error: 'Ya hay un turno activo' },
            { status: 400 }
          );
        }

        // Verify it's the current player's turn
        const currentPlayerId = game.turnOrder[game.currentTurnIndex];
        if (currentPlayerId !== playerId) {
          return NextResponse.json(
            { success: false, error: 'No es tu turno' },
            { status: 403 }
          );
        }

        const { game: updatedGame, error } = startTurn(game);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await timesUpStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'guess': {
        const { roomCode, playerId } = body;
        if (!roomCode || !playerId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await timesUpStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        // Verify it's a playing phase
        if (!['round1', 'round2', 'round3'].includes(game.phase)) {
          return NextResponse.json(
            { success: false, error: 'No se puede adivinar en esta fase' },
            { status: 400 }
          );
        }

        // Verify there's an active turn
        if (!game.currentTurn?.isActive) {
          return NextResponse.json(
            { success: false, error: 'No hay turno activo' },
            { status: 400 }
          );
        }

        // Verify it's the current player's turn
        if (game.currentTurn.playerId !== playerId) {
          return NextResponse.json(
            { success: false, error: 'No es tu turno' },
            { status: 403 }
          );
        }

        const { game: updatedGame, roundEnded, error } = guessCorrect(game);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        let finalGame = updatedGame;

        // If round ended (all cards guessed), check if game should end or go to next round
        if (roundEnded) {
          if (updatedGame.currentRound >= 3) {
            // End the game after round 3
            finalGame = endGame(updatedGame);
          } else {
            // End the current turn for next round transition
            const { game: endedTurnGame } = endTurn(updatedGame);
            finalGame = {
              ...endedTurnGame,
              phase: 'roundEnd' as const,
            };
          }
        }

        await timesUpStore.set(roomCode.toUpperCase(), finalGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(finalGame, playerId),
            roundEnded,
          },
        });
      }

      case 'skip': {
        const { roomCode, playerId } = body;
        if (!roomCode || !playerId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await timesUpStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        // Verify there's an active turn
        if (!game.currentTurn?.isActive) {
          return NextResponse.json(
            { success: false, error: 'No hay turno activo' },
            { status: 400 }
          );
        }

        // Verify it's the current player's turn
        if (game.currentTurn.playerId !== playerId) {
          return NextResponse.json(
            { success: false, error: 'No es tu turno' },
            { status: 403 }
          );
        }

        const { game: updatedGame, error } = skipCard(game);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await timesUpStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'endTurn': {
        const { roomCode, playerId } = body;
        if (!roomCode || !playerId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await timesUpStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        // Verify there's a current turn
        if (!game.currentTurn) {
          return NextResponse.json(
            { success: false, error: 'No hay turno activo' },
            { status: 400 }
          );
        }

        // Verify it's the current player's turn (or host can end turns)
        const player = game.players.find(p => p.id === playerId);
        if (game.currentTurn.playerId !== playerId && !player?.isHost) {
          return NextResponse.json(
            { success: false, error: 'No es tu turno' },
            { status: 403 }
          );
        }

        const { game: updatedGame, error } = endTurn(game);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await timesUpStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'nextRound': {
        const { roomCode, playerId } = body;
        if (!roomCode || !playerId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await timesUpStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const player = game.players.find(p => p.id === playerId);
        if (!player?.isHost) {
          return NextResponse.json(
            { success: false, error: 'Solo el host puede continuar' },
            { status: 403 }
          );
        }

        // Verify we're in roundEnd phase or between turns
        if (game.phase !== 'roundEnd' && !['round1', 'round2', 'round3'].includes(game.phase)) {
          return NextResponse.json(
            { success: false, error: 'No se puede avanzar ronda en esta fase' },
            { status: 400 }
          );
        }

        const { game: updatedGame, error } = startNextRound(game);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await timesUpStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'reset': {
        const { roomCode, playerId } = body;
        if (!roomCode || !playerId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await timesUpStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const player = game.players.find(p => p.id === playerId);
        if (!player?.isHost) {
          return NextResponse.json(
            { success: false, error: 'Solo el host puede reiniciar' },
            { status: 403 }
          );
        }

        const updatedGame = resetGame(game);
        await timesUpStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Accion no valida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Times Up API error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Sanitize game state for player - Times Up has no hidden information
function sanitizeGameForPlayer(
  game: TimesUpGameState,
  playerId?: string
): TimesUpGameState {
  // Update lastActivity timestamp
  return {
    ...game,
    lastActivity: Date.now(),
  };
}
