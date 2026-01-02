'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-amber-500/30 z-50 overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-800 to-amber-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🎪</span>
                Como Jugar SCOUT
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Overview */}
              <section className="mb-6">
                <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                  <span>🎯</span> Objetivo
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Eres un director de circo compitiendo por reclutar a los mejores artistas.
                  Consigue la mayor cantidad de puntos capturando cartas y evitando quedarte con cartas en la mano.
                </p>
              </section>

              {/* Cards */}
              <section className="mb-6">
                <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                  <span>🃏</span> Las Cartas
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-2">
                  Cada carta tiene <span className="text-amber-300 font-bold">dos numeros</span> (arriba y abajo).
                  Solo uno esta activo segun la orientacion de tu mano.
                </p>
                <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-white/60">
                  <span className="text-amber-300">⚠️ Importante:</span> No puedes reordenar las cartas en tu mano.
                  Solo puedes voltear toda la mano al inicio de cada ronda.
                </div>
              </section>

              {/* Actions */}
              <section className="mb-6">
                <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                  <span>🎭</span> Acciones
                </h3>

                <div className="space-y-3">
                  {/* Show */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-amber-400 font-bold">🎭 Show</span>
                    </div>
                    <p className="text-white/70 text-sm">
                      Juega cartas <span className="text-amber-300">adyacentes</span> que superen la jugada actual.
                      Puedes jugar sets (mismo valor) o escaleras (valores consecutivos).
                    </p>
                  </div>

                  {/* Scout */}
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-purple-400 font-bold">👁️ Scout</span>
                    </div>
                    <p className="text-white/70 text-sm">
                      Toma una carta del extremo de la jugada actual y colocala donde quieras en tu mano.
                      El dueno de la jugada recibe un token Scout (+1 punto).
                    </p>
                  </div>

                  {/* Scout & Show */}
                  <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-teal-400 font-bold">⚡ Scout & Show</span>
                      <span className="bg-yellow-400 text-black text-[10px] px-1 rounded">1x POR RONDA</span>
                    </div>
                    <p className="text-white/70 text-sm">
                      Combina ambas acciones: toma una carta y luego juega una combinacion ganadora.
                      Solo puedes usarlo una vez por ronda.
                    </p>
                  </div>
                </div>
              </section>

              {/* Beating plays */}
              <section className="mb-6">
                <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                  <span>⬆️</span> Superar Jugadas
                </h3>
                <ul className="text-white/70 text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-amber-400">•</span>
                    Mas cartas siempre ganan
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-400">•</span>
                    Mismo numero de cartas: escalera supera set
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-400">•</span>
                    Mismo tipo y cantidad: valor mayor gana
                  </li>
                </ul>
              </section>

              {/* Scoring */}
              <section className="mb-6">
                <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                  <span>⭐</span> Puntuacion
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center">
                    <div className="text-green-400 font-bold">+1</div>
                    <div className="text-white/60 text-xs">Carta capturada</div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 text-center">
                    <div className="text-purple-400 font-bold">+1</div>
                    <div className="text-white/60 text-xs">Token Scout</div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-center col-span-2">
                    <div className="text-red-400 font-bold">-1</div>
                    <div className="text-white/60 text-xs">Por cada carta en mano (excepto quien termina la ronda)</div>
                  </div>
                </div>
              </section>

              {/* End round */}
              <section className="mb-6">
                <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                  <span>🏁</span> Fin de Ronda
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  La ronda termina cuando alguien se queda sin cartas o nadie puede/quiere superar la jugada actual.
                  Se juegan tantas rondas como jugadores hay.
                </p>
              </section>

              {/* Players */}
              <section>
                <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                  <span>👥</span> Jugadores
                </h3>
                <p className="text-white/70 text-sm">
                  3-5 jugadores. Se ajusta el mazo segun el numero de jugadores.
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-amber-500/20">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Help button to open rules
export function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 text-xl hover:bg-amber-500/30 transition-colors z-40"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      ?
    </motion.button>
  );
}
