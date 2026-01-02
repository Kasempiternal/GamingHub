'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { games, getGameByPath } from '@/lib/games';
import { LeaveGameDialog } from './LeaveGameDialog';

interface NavigationMenuProps {
  currentGame?: string;
  roomCode?: string;
}

export function NavigationMenu({ currentGame, roomCode }: NavigationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Detect if we're in an active game, joining, or lobby
  const isInGame = pathname.includes('/sala/') || pathname.includes('/unirse/');

  // Get current game info from path if not provided
  const currentGameInfo = currentGame
    ? games.find(g => g.id === currentGame)
    : getGameByPath(pathname);

  // Extract room code from pathname if not provided
  const extractedRoomCode = roomCode || pathname.split('/').pop();

  const handleNavigation = (href: string) => {
    // If navigating to current page, just close menu
    if (href === pathname) {
      setIsOpen(false);
      return;
    }

    // If in game screen, show confirmation
    if (isInGame) {
      setPendingNavigation(href);
    } else {
      router.push(href);
      setIsOpen(false);
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
      setIsOpen(false);
    }
  };

  const cancelNavigation = () => {
    setPendingNavigation(null);
  };

  return (
    <>
      {/* Hamburger Button - Fixed position */}
      <motion.button
        className="fixed top-4 left-4 z-50 w-11 h-11 bg-slate-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10 shadow-lg"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Abrir menu"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <svg
          className="w-5 h-5 text-white/80"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </motion.button>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 left-0 bottom-0 w-72 bg-slate-900/95 backdrop-blur-xl z-[70] shadow-2xl border-r border-white/10"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex flex-col h-full p-5" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎮</span>
                    <span className="text-lg font-bold text-white">Menu</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    aria-label="Cerrar menu"
                  >
                    <svg
                      className="w-5 h-5 text-white/60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Hub Link */}
                <button
                  onClick={() => handleNavigation('/')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all mb-4 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                    <span className="text-xl">🏠</span>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium group-hover:text-white/90">
                      Gaming Hub
                    </div>
                    <div className="text-xs text-white/40">
                      Volver al inicio
                    </div>
                  </div>
                </button>

                {/* Divider */}
                <div className="h-px bg-white/10 mb-4" />

                {/* Games Section */}
                <div className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3 px-1">
                  Juegos
                </div>

                {/* Games List */}
                <div className="flex-1 overflow-y-auto space-y-2 -mx-2 px-2">
                  {games.map((game) => {
                    const isCurrentGame = currentGameInfo?.id === game.id;

                    return (
                      <button
                        key={game.id}
                        onClick={() => handleNavigation(game.href)}
                        className={`
                          w-full flex items-center gap-3 p-3 rounded-xl transition-all group
                          ${isCurrentGame
                            ? 'bg-white/10 border border-white/20'
                            : 'hover:bg-white/5'
                          }
                        `}
                      >
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center text-xl
                          ${isCurrentGame
                            ? `bg-gradient-to-br ${game.gradient}`
                            : 'bg-white/5 group-hover:bg-white/10'
                          }
                        `}>
                          {game.icon}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className={`font-medium truncate ${isCurrentGame ? 'text-white' : 'text-white/70 group-hover:text-white/90'}`}>
                            {game.name}
                          </div>
                          <div className="text-xs text-white/40 truncate">
                            {game.players} jugadores
                          </div>
                        </div>
                        {isCurrentGame && (
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-xs text-white/20 text-center">
                    v2.3.0
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Leave Game Confirmation Dialog */}
      <LeaveGameDialog
        isOpen={pendingNavigation !== null}
        onConfirm={confirmNavigation}
        onCancel={cancelNavigation}
        roomCode={extractedRoomCode}
        gameName={currentGameInfo?.name}
      />
    </>
  );
}
