import { NextRequest, NextResponse } from 'next/server';
import { wavelengthStore } from '@/lib/gameStore';
import {
  createGame,
  addPlayer,
  joinTeam,
  startGame,
  submitClue,
  submitTeamGuess,
  submitCounterGuess,
  revealResult,
  nextRound,
  resetGame,
  rejoinPlayer,
  skipCounterGuess,
} from '@/lib/wavelengthLogic';
import type { WavelengthGameState } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create': {
        const { hostName, deviceId } = body;
        if (!hostName || hostName.trim().length < 2) {
          return NextResponse.json(
            { success: false, error: 'Nombre inválido' },
            { status: 400 }
          );
        }

        const game = createGame(hostName.trim(), deviceId);
        await wavelengthStore.set(game.roomCode, game);

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
            { success: false, error: 'Falta código de sala' },
            { status: 400 }
          );
        }

        const game = await wavelengthStore.get(roomCode.toUpperCase());
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
            await wavelengthStore.set(roomCode.toUpperCase(), game);
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
              },
            });
          }
        }

        // New player joining - require name
        if (!playerName) {
          return NextResponse.json(
            { success: false, error: 'Nombre requerido' },
            { status: 400 }
          );
        }

        if (game.phase !== 'lobby') {
          return NextResponse.json(
            { success: false, error: 'La partida ya ha comenzado' },
            { status: 400 }
          );
        }

        if (game.players.length >= 12) {
          return NextResponse.json(
            { success: false, error: 'La partida está llena' },
            { status: 400 }
          );
        }

        const { game: updatedGame, player } = addPlayer(game, playerName.trim(), deviceId);
        await wavelengthStore.set(roomCode.toUpperCase(), updatedGame);

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

        const game = await wavelengthStore.get(roomCode.toUpperCase());
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

        await wavelengthStore.set(roomCode.toUpperCase(), updatedGame);

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
            { success: false, error: 'Falta código de sala' },
            { status: 400 }
          );
        }

        const game = await wavelengthStore.get(roomCode.toUpperCase());
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

      case 'joinTeam': {
        const { roomCode, playerId, team } = body;
        if (!roomCode || !playerId || !team) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        if (team !== 'red' && team !== 'blue') {
          return NextResponse.json(
            { success: false, error: 'Equipo inválido' },
            { status: 400 }
          );
        }

        const game = await wavelengthStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        if (game.phase !== 'lobby') {
          return NextResponse.json(
            { success: false, error: 'La partida ya ha comenzado' },
            { status: 400 }
          );
        }

        const updatedGame = joinTeam(game, playerId, team);
        await wavelengthStore.set(roomCode.toUpperCase(), updatedGame);

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

        const game = await wavelengthStore.get(roomCode.toUpperCase());
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

        const { game: updatedGame, error } = startGame(game);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await wavelengthStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'submitClue': {
        const { roomCode, playerId, clue } = body;
        if (!roomCode || !playerId || !clue) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await wavelengthStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const { game: updatedGame, error } = submitClue(game, playerId, clue);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await wavelengthStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'submitGuess': {
        const { roomCode, playerId, guess } = body;
        if (!roomCode || !playerId || guess === undefined) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await wavelengthStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        // Only team members (non-psychic) can submit guess
        const player = game.players.find(p => p.id === playerId);
        if (!player) {
          return NextResponse.json(
            { success: false, error: 'Jugador no encontrado' },
            { status: 400 }
          );
        }

        if (player.team !== game.currentTeam) {
          return NextResponse.json(
            { success: false, error: 'No es el turno de tu equipo' },
            { status: 400 }
          );
        }

        const { game: updatedGame, error } = submitTeamGuess(game, guess);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await wavelengthStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'submitCounter': {
        const { roomCode, playerId, direction } = body;
        if (!roomCode || !playerId || !direction) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        if (direction !== 'left' && direction !== 'right') {
          return NextResponse.json(
            { success: false, error: 'Dirección inválida' },
            { status: 400 }
          );
        }

        const game = await wavelengthStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        // Only opposing team can submit counter guess
        const player = game.players.find(p => p.id === playerId);
        if (!player) {
          return NextResponse.json(
            { success: false, error: 'Jugador no encontrado' },
            { status: 400 }
          );
        }

        if (player.team === game.currentTeam) {
          return NextResponse.json(
            { success: false, error: 'Solo el equipo contrario puede contra-adivinar' },
            { status: 400 }
          );
        }

        const { game: updatedGame, error } = submitCounterGuess(game, direction);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await wavelengthStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'skipCounter': {
        const { roomCode, playerId } = body;
        if (!roomCode || !playerId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await wavelengthStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const player = game.players.find(p => p.id === playerId);
        if (!player?.isHost) {
          return NextResponse.json(
            { success: false, error: 'Solo el host puede saltar' },
            { status: 403 }
          );
        }

        const { game: updatedGame, error } = skipCounterGuess(game);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await wavelengthStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'reveal': {
        const { roomCode, playerId } = body;
        if (!roomCode || !playerId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await wavelengthStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const player = game.players.find(p => p.id === playerId);
        if (!player?.isHost) {
          return NextResponse.json(
            { success: false, error: 'Solo el host puede revelar' },
            { status: 403 }
          );
        }

        const { game: updatedGame, pointsAwarded, counterPointAwarded } = revealResult(game);
        await wavelengthStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
            pointsAwarded,
            counterPointAwarded,
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

        const game = await wavelengthStore.get(roomCode.toUpperCase());
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

        const { game: updatedGame, error } = nextRound(game);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await wavelengthStore.set(roomCode.toUpperCase(), updatedGame);

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

        const game = await wavelengthStore.get(roomCode.toUpperCase());
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
        await wavelengthStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Acción no válida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Wavelength API error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Sanitize game state to hide target position until reveal
function sanitizeGameForPlayer(
  game: WavelengthGameState,
  playerId?: string
): WavelengthGameState {
  const player = game.players.find(p => p.id === playerId);
  const isPsychic = player?.isPsychic || false;
  const isRevealPhase = game.phase === 'reveal' || game.phase === 'roundEnd' || game.phase === 'finished';

  // If reveal phase or psychic, show target position
  if (isRevealPhase || isPsychic) {
    return game;
  }

  // Hide target position from non-psychics during game
  if (game.currentRound) {
    return {
      ...game,
      currentRound: {
        ...game.currentRound,
        targetPosition: -1, // Hidden
      },
    };
  }

  return game;
}
