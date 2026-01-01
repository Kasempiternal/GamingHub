import { NextRequest, NextResponse } from 'next/server';
import { impostorStore } from '@/lib/gameStore';
import {
  createGame,
  addPlayer,
  startGame,
  giveDescription,
  startVoting,
  castVote,
  revealVotes,
  startNextRound,
  endGame,
  resetGame,
  rejoinPlayer,
} from '@/lib/impostorLogic';
import type { ImpostorGameState } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create': {
        const { hostName } = body;
        if (!hostName || hostName.trim().length < 2) {
          return NextResponse.json(
            { success: false, error: 'Nombre invalido' },
            { status: 400 }
          );
        }

        const game = createGame(hostName.trim());
        await impostorStore.set(game.roomCode, game);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(game, game.players[0].id),
            playerId: game.players[0].id,
          },
        });
      }

      case 'join': {
        const { roomCode, playerName } = body;
        if (!roomCode || !playerName) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await impostorStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        // Check if player already exists
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

        if (game.phase !== 'lobby') {
          return NextResponse.json(
            { success: false, error: 'La partida ya ha comenzado' },
            { status: 400 }
          );
        }

        if (game.players.length >= 15) {
          return NextResponse.json(
            { success: false, error: 'La partida esta llena' },
            { status: 400 }
          );
        }

        const { game: updatedGame, player } = addPlayer(game, playerName.trim());
        await impostorStore.set(roomCode.toUpperCase(), updatedGame);

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

        const game = await impostorStore.get(roomCode.toUpperCase());
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

        await impostorStore.set(roomCode.toUpperCase(), updatedGame);

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

        const game = await impostorStore.get(roomCode.toUpperCase());
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

      case 'start': {
        const { roomCode, playerId } = body;
        if (!roomCode || !playerId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await impostorStore.get(roomCode.toUpperCase());
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

        await impostorStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'describe': {
        const { roomCode, playerId } = body;
        if (!roomCode || !playerId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await impostorStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const { game: updatedGame, error } = giveDescription(game, playerId);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await impostorStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'startVoting': {
        const { roomCode, playerId } = body;
        if (!roomCode || !playerId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await impostorStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const player = game.players.find(p => p.id === playerId);
        if (!player?.isHost) {
          return NextResponse.json(
            { success: false, error: 'Solo el host puede iniciar votacion' },
            { status: 403 }
          );
        }

        const { game: updatedGame, error } = startVoting(game);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await impostorStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'vote': {
        const { roomCode, playerId, targetId } = body;
        if (!roomCode || !playerId || !targetId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await impostorStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const { game: updatedGame, allVoted, error } = castVote(game, playerId, targetId);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        // If all voted, automatically reveal
        let finalGame = updatedGame;
        if (allVoted) {
          const { game: revealedGame, gameEnded } = revealVotes(updatedGame);
          finalGame = revealedGame;

          if (gameEnded) {
            finalGame = endGame(finalGame);
          }
        }

        await impostorStore.set(roomCode.toUpperCase(), finalGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(finalGame, playerId),
            allVoted,
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

        const game = await impostorStore.get(roomCode.toUpperCase());
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

        const { game: revealedGame, gameEnded } = revealVotes(game);

        let finalGame = revealedGame;
        if (gameEnded) {
          finalGame = endGame(finalGame);
        }

        await impostorStore.set(roomCode.toUpperCase(), finalGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(finalGame, playerId),
            gameEnded,
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

        const game = await impostorStore.get(roomCode.toUpperCase());
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

        const { game: updatedGame, error } = startNextRound(game);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await impostorStore.set(roomCode.toUpperCase(), updatedGame);

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

        const game = await impostorStore.get(roomCode.toUpperCase());
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
        await impostorStore.set(roomCode.toUpperCase(), updatedGame);

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
    console.error('Impostor API error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Sanitize game state to hide other players' words and roles
function sanitizeGameForPlayer(
  game: ImpostorGameState,
  playerId?: string
): ImpostorGameState {
  const isGameOver = game.phase === 'finished' || game.phase === 'reveal';

  return {
    ...game,
    players: game.players.map(player => {
      const isMe = player.id === playerId;

      // In finished/reveal state, show all roles
      if (isGameOver) {
        return player;
      }

      // Always show my own info
      if (isMe) {
        return player;
      }

      // Hide other players' sensitive info during game
      return {
        ...player,
        role: null,
        word: null,
        hint: null,
        votedFor: null, // Hide who they voted for until reveal
      };
    }),
  };
}
