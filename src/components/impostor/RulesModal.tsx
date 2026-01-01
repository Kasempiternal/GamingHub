'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const [activeTab, setActiveTab] = useState<'roles' | 'gameplay' | 'tips'>('roles');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-slate-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-amber-600 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🎭</span>
                Reglas del Impostor
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-700">
              {[
                { id: 'roles', label: 'Roles', icon: '👥' },
                { id: 'gameplay', label: 'Juego', icon: '🎮' },
                { id: 'tips', label: 'Tips', icon: '💡' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`
                    flex-1 py-3 px-4 text-sm font-medium transition-colors
                    flex items-center justify-center gap-2
                    ${activeTab === tab.id
                      ? 'text-red-400 border-b-2 border-red-400 bg-red-500/10'
                      : 'text-slate-400 hover:text-white'
                    }
                  `}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <AnimatePresence mode="wait">
                {activeTab === 'roles' && (
                  <motion.div
                    key="roles"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {/* Civilian */}
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">👤</span>
                        <div>
                          <h3 className="font-bold text-green-400">Civil</h3>
                          <p className="text-green-300/70 text-sm">La mayoria de jugadores</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Tienes la palabra correcta. Describe tu palabra sin revelarla directamente
                        y encuentra a los impostores votando.
                      </p>
                    </div>

                    {/* Impostor */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">🕵️</span>
                        <div>
                          <h3 className="font-bold text-red-400">Impostor</h3>
                          <p className="text-red-300/70 text-sm">1-3 jugadores</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Tienes una palabra diferente pero relacionada. Intenta mezclarte con los
                        civiles sin que descubran que tu palabra es distinta.
                      </p>
                    </div>

                    {/* Mr. White */}
                    <div className="bg-gray-400/10 border border-gray-400/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">👻</span>
                        <div>
                          <h3 className="font-bold text-gray-300">Mr. White</h3>
                          <p className="text-gray-400 text-sm">0-1 jugador</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm">
                        No tienes palabra, solo una pista. Debes adivinar la palabra de los civiles
                        usando las descripciones de los demas.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'gameplay' && (
                  <motion.div
                    key="gameplay"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">1</div>
                      <div>
                        <h4 className="font-semibold text-white">Descripcion</h4>
                        <p className="text-slate-400 text-sm">
                          Cada jugador describe su palabra en turno. Usa pistas sutiles que no
                          revelen tu palabra directamente.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold shrink-0">2</div>
                      <div>
                        <h4 className="font-semibold text-white">Discusion</h4>
                        <p className="text-slate-400 text-sm">
                          Discutan quienes podrian ser los impostores basandose en las descripciones.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold shrink-0">3</div>
                      <div>
                        <h4 className="font-semibold text-white">Votacion</h4>
                        <p className="text-slate-400 text-sm">
                          Voten por quien creen que es el impostor. El jugador con mas votos es eliminado.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold shrink-0">4</div>
                      <div>
                        <h4 className="font-semibold text-white">Revelacion</h4>
                        <p className="text-slate-400 text-sm">
                          Se revela el rol del jugador eliminado. El juego continua hasta que un
                          equipo gane.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-xl p-4 mt-4">
                      <h4 className="font-semibold text-white mb-2">🏆 Condiciones de Victoria</h4>
                      <ul className="text-slate-300 text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-green-400">•</span>
                          <span><strong className="text-green-400">Civiles ganan:</strong> Eliminan a todos los impostores</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400">•</span>
                          <span><strong className="text-red-400">Impostores ganan:</strong> Igualan o superan en numero a los civiles</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'tips' && (
                  <motion.div
                    key="tips"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-3"
                  >
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-green-400 font-medium text-sm mb-1">👤 Como Civil</p>
                      <p className="text-slate-300 text-sm">
                        Da descripciones especificas pero no obvias. Observa quien da descripciones
                        vagas o que no encajan bien.
                      </p>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-400 font-medium text-sm mb-1">🕵️ Como Impostor</p>
                      <p className="text-slate-300 text-sm">
                        Escucha las descripciones de los demas antes de hablar. Usa la pista para
                        dar descripciones que podrian aplicar a ambas palabras.
                      </p>
                    </div>

                    <div className="bg-gray-400/10 border border-gray-400/20 rounded-lg p-3">
                      <p className="text-gray-300 font-medium text-sm mb-1">👻 Como Mr. White</p>
                      <p className="text-slate-300 text-sm">
                        Presta atencion a todas las descripciones. Intenta deducir la palabra
                        de los civiles y da una descripcion que encaje.
                      </p>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      <p className="text-amber-400 font-medium text-sm mb-1">🎯 Estrategia General</p>
                      <p className="text-slate-300 text-sm">
                        No reveles demasiado en la primera ronda. Observa las reacciones de los
                        demas a las descripciones.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700">
              <button
                onClick={onClose}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function RulesButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-4 right-4 w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full shadow-lg flex items-center justify-center text-white z-40"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </motion.button>
  );
}
