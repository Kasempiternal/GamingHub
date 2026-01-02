'use client';

import { motion } from 'framer-motion';

interface ActionButtonsProps {
  onShow?: () => void;
  onScout?: () => void;
  onScoutAndShow?: () => void;
  canShow: boolean;
  canScout: boolean;
  canScoutAndShow: boolean;
  isMyTurn: boolean;
  selectedCardCount: number;
  loading?: boolean;
}

export function ActionButtons({
  onShow,
  onScout,
  onScoutAndShow,
  canShow,
  canScout,
  canScoutAndShow,
  isMyTurn,
  selectedCardCount,
  loading = false,
}: ActionButtonsProps) {
  if (!isMyTurn) {
    return (
      <div className="text-center py-4">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-amber-400/60">🎪</span>
          <span className="text-white/50 text-sm">Esperando tu turno...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Selected cards info */}
      {selectedCardCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-amber-300 text-sm mb-1"
        >
          {selectedCardCount} carta{selectedCardCount > 1 ? 's' : ''} seleccionada{selectedCardCount > 1 ? 's' : ''}
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {/* SHOW button */}
        <motion.button
          onClick={onShow}
          disabled={!canShow || loading}
          className={`
            px-6 py-3 rounded-xl font-bold text-white
            flex items-center gap-2 min-w-[120px] justify-center
            ${canShow && !loading
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }
            transition-all duration-200
          `}
          whileHover={canShow && !loading ? { scale: 1.05 } : {}}
          whileTap={canShow && !loading ? { scale: 0.95 } : {}}
        >
          {loading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              ⏳
            </motion.span>
          ) : (
            <>
              <span>🎭</span>
              <span>Show</span>
            </>
          )}
        </motion.button>

        {/* SCOUT button */}
        <motion.button
          onClick={onScout}
          disabled={!canScout || loading}
          className={`
            px-6 py-3 rounded-xl font-bold text-white
            flex items-center gap-2 min-w-[120px] justify-center
            ${canScout && !loading
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/25'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }
            transition-all duration-200
          `}
          whileHover={canScout && !loading ? { scale: 1.05 } : {}}
          whileTap={canScout && !loading ? { scale: 0.95 } : {}}
        >
          <span>👁️</span>
          <span>Scout</span>
        </motion.button>

        {/* SCOUT & SHOW button */}
        <motion.button
          onClick={onScoutAndShow}
          disabled={!canScoutAndShow || loading}
          className={`
            px-6 py-3 rounded-xl font-bold text-white
            flex items-center gap-2 min-w-[140px] justify-center
            ${canScoutAndShow && !loading
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/25'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }
            transition-all duration-200 relative
          `}
          whileHover={canScoutAndShow && !loading ? { scale: 1.05 } : {}}
          whileTap={canScoutAndShow && !loading ? { scale: 0.95 } : {}}
        >
          <span>⚡</span>
          <span>Scout & Show</span>
          {canScoutAndShow && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full text-[10px] text-black font-bold flex items-center justify-center">
              1
            </span>
          )}
        </motion.button>
      </div>

      {/* Help text */}
      <div className="text-white/40 text-xs text-center mt-2">
        {!canShow && !canScout && (
          <span>Selecciona cartas adyacentes que superen la jugada actual</span>
        )}
        {canScout && !canShow && (
          <span>Puedes tomar una carta del extremo de la jugada</span>
        )}
      </div>
    </div>
  );
}

// Flip hand button for orientation phase
export function FlipHandButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-xl font-bold
        flex items-center gap-2
        ${!disabled
          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'
          : 'bg-slate-700 text-slate-400 cursor-not-allowed'
        }
        transition-all duration-200
      `}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <motion.span
        animate={{ rotateY: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🔄
      </motion.span>
      <span>Voltear Mano</span>
    </motion.button>
  );
}

// Confirm hand button
export function ConfirmHandButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-xl font-bold
        flex items-center gap-2
        ${!disabled
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
          : 'bg-slate-700 text-slate-400 cursor-not-allowed'
        }
        transition-all duration-200
      `}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <span>✓</span>
      <span>Confirmar</span>
    </motion.button>
  );
}

// Start round button (for host)
export function StartGameButton({ onClick, playerCount, disabled }: { onClick: () => void; playerCount: number; disabled: boolean }) {
  const canStart = playerCount >= 3 && playerCount <= 5;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || !canStart}
      className={`
        px-8 py-4 rounded-xl font-bold text-lg
        flex items-center gap-3
        ${canStart && !disabled
          ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white hover:from-amber-600 hover:to-red-700 shadow-xl shadow-amber-500/30'
          : 'bg-slate-700 text-slate-400 cursor-not-allowed'
        }
        transition-all duration-200
      `}
      whileHover={canStart && !disabled ? { scale: 1.05 } : {}}
      whileTap={canStart && !disabled ? { scale: 0.95 } : {}}
    >
      <span className="text-2xl">🎪</span>
      <span>Comenzar Show</span>
    </motion.button>
  );
}

// Next round button
export function NextRoundButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-xl font-bold
        flex items-center gap-2
        ${!disabled
          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'
          : 'bg-slate-700 text-slate-400 cursor-not-allowed'
        }
        transition-all duration-200
      `}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <span>➡️</span>
      <span>Siguiente Ronda</span>
    </motion.button>
  );
}
