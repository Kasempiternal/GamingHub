import { NextRequest, NextResponse } from 'next/server';
import { asesinatoStore } from '@/lib/gameStore';
import {
  createGame,
  addPlayer,
  startGame,
  proceedToMurderSelection,
  selectMurderSolution,
  selectSceneTileOption,
  confirmClues,
  replaceSceneTile,
  makeAccusation,
  nextRound,
  resetGame,
  rejoinPlayer,
} from '@/lib/asesinatoLogic';
import type { AsesinatoGameState, AsesinatoPlayer } from '@/types/game';

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
        await asesinatoStore.set(game.roomCode, game);

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

        const game = await asesinatoStore.get(roomCode.toUpperCase());
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
            await asesinatoStore.set(roomCode.toUpperCase(), game);
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
            { success: false, error: 'La partida esta llena (max 12)' },
            { status: 400 }
          );
        }

        const { game: updatedGame, player } = addPlayer(game, playerName.trim(), deviceId);
        await asesinatoStore.set(roomCode.toUpperCase(), updatedGame);

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

        const game = await asesinatoStore.get(roomCode.toUpperCase());
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

        await asesinatoStore.set(roomCode.toUpperCase(), updatedGame);

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

        const game = await asesinatoStore.get(roomCode.toUpperCase());
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

        const game = await asesinatoStore.get(roomCode.toUpperCase());
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

        await asesinatoStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'proceedToMurderSelection': {
        const { roomCode, playerId } = body;
        if (!roomCode || !playerId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await asesinatoStore.get(roomCode.toUpperCase());
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

        const { game: updatedGame, error } = proceedToMurderSelection(game);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await asesinatoStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'selectSolution': {
        const { roomCode, playerId, clueCardId, meansCardId } = body;
        if (!roomCode || !playerId || !clueCardId || !meansCardId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await asesinatoStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const { game: updatedGame, error } = selectMurderSolution(game, playerId, clueCardId, meansCardId);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await asesinatoStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'selectTileOption': {
        const { roomCode, playerId, tileId, optionIndex } = body;
        if (!roomCode || !playerId || !tileId || optionIndex === undefined) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await asesinatoStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const { game: updatedGame, error } = selectSceneTileOption(game, playerId, tileId, optionIndex);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await asesinatoStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'confirmClues': {
        const { roomCode, playerId } = body;
        if (!roomCode || !playerId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await asesinatoStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const { game: updatedGame, error } = confirmClues(game, playerId);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await asesinatoStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'replaceTile': {
        const { roomCode, playerId, oldTileId, newTileId } = body;
        if (!roomCode || !playerId || !oldTileId || !newTileId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await asesinatoStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const { game: updatedGame, error } = replaceSceneTile(game, playerId, oldTileId, newTileId);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await asesinatoStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
          },
        });
      }

      case 'accuse': {
        const { roomCode, playerId, targetPlayerId, clueCardId, meansCardId } = body;
        if (!roomCode || !playerId || !targetPlayerId || !clueCardId || !meansCardId) {
          return NextResponse.json(
            { success: false, error: 'Faltan datos' },
            { status: 400 }
          );
        }

        const game = await asesinatoStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const { game: updatedGame, isCorrect, error } = makeAccusation(
          game,
          playerId,
          targetPlayerId,
          clueCardId,
          meansCardId
        );

        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await asesinatoStore.set(roomCode.toUpperCase(), updatedGame);

        return NextResponse.json({
          success: true,
          data: {
            game: sanitizeGameForPlayer(updatedGame, playerId),
            isCorrect,
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

        const game = await asesinatoStore.get(roomCode.toUpperCase());
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Partida no encontrada' },
            { status: 404 }
          );
        }

        const { game: updatedGame, error } = nextRound(game, playerId);
        if (error) {
          return NextResponse.json(
            { success: false, error },
            { status: 400 }
          );
        }

        await asesinatoStore.set(roomCode.toUpperCase(), updatedGame);

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

        const game = await asesinatoStore.get(roomCode.toUpperCase());
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
        await asesinatoStore.set(roomCode.toUpperCase(), updatedGame);

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
    console.error('Asesinato API error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Sanitize game state to hide sensitive information from players
function sanitizeGameForPlayer(
  game: AsesinatoGameState,
  playerId?: string
): AsesinatoGameState {
  const player = game.players.find(p => p.id === playerId);
  const isForensicScientist = player?.role === 'forensicScientist';
  const isMurderer = player?.role === 'murderer';
  const isAccomplice = player?.role === 'accomplice';
  const isWitness = player?.role === 'witness';
  const isGameOver = game.phase === 'finished';

  // Solution visibility: FS, Murderer, Accomplice can see; others cannot until game over
  const canSeeSolution = isForensicScientist || isMurderer || isAccomplice || isGameOver;

  return {
    ...game,
    // Hide solution from investigators and witness
    solution: canSeeSolution ? game.solution : null,
    // Hide available scene tiles from non-FS players (to prevent card counting)
    availableSceneTiles: isForensicScientist ? game.availableSceneTiles : [],
    // Role visibility - players only see their own role (except witness sees murderer/accomplice)
    players: game.players.map(p => {
      const isSelf = p.id === playerId;

      // Always show own role
      if (isSelf) {
        return p;
      }

      // Game over - show all roles
      if (isGameOver) {
        return p;
      }

      // Witness can see who is Murderer/Accomplice (but not their role name)
      // Actually in the game, Witness knows the identities of Murderer and Accomplice
      if (isWitness && (p.role === 'murderer' || p.role === 'accomplice')) {
        // Witness sees them but UI will show it differently
        return {
          ...p,
          role: p.role, // Witness can see these roles
        };
      }

      // Murderer and Accomplice know each other
      if ((isMurderer || isAccomplice) && (p.role === 'murderer' || p.role === 'accomplice')) {
        return {
          ...p,
          role: p.role,
        };
      }

      // Hide role from others during gameplay
      return {
        ...p,
        role: null,
      };
    }),
  };
}
