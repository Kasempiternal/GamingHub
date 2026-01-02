'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface LeaveGameDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  roomCode?: string;
  gameName?: string;
}

export function LeaveGameDialog({
  isOpen,
  onConfirm,
  onCancel,
  roomCode,
  gameName,
}: LeaveGameDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-700"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Salir del juego?
              </h3>
              <p className="text-slate-400">
                {gameName
                  ? `Estas en ${gameName}. `
                  : 'Estas en una partida. '}
                Si sales, podras volver con el codigo:
              </p>
            </div>

            {/* Room Code Display */}
            {roomCode && (
              <div className="mb-6 py-4 px-6 bg-slate-900/50 rounded-xl border border-slate-600">
                <span className="text-2xl font-bold text-amber-400 tracking-widest font-mono">
                  {roomCode}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all transform hover:scale-105"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all transform hover:scale-105"
              >
                Salir
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
