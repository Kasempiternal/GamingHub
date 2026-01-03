'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const [activeTab, setActiveTab] = useState<'rounds' | 'rules' | 'tips'>('rounds');

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
            <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>⏱️</span>
                Reglas de Time&apos;s Up
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
                { id: 'rounds', label: 'Rondas', icon: '🔄' },
                { id: 'rules', label: 'Reglas', icon: '📋' },
                { id: 'tips', label: 'Tips', icon: '💡' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`
                    flex-1 py-3 px-4 text-sm font-medium transition-colors
                    flex items-center justify-center gap-2
                    ${activeTab === tab.id
                      ? 'text-orange-400 border-b-2 border-orange-400 bg-orange-500/10'
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
                {activeTab === 'rounds' && (
                  <motion.div
                    key="rounds"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {/* Round 1 */}
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                          1
                        </div>
                        <div>
                          <h3 className="font-bold text-emerald-400">Descripciones</h3>
                          <p className="text-emerald-300/70 text-sm">Cualquier palabra permitida</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Describe el nombre usando todas las palabras que quieras. No puedes
                        decir el nombre directamente ni rimar con el.
                      </p>
                    </div>

                    {/* Round 2 */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                          2
                        </div>
                        <div>
                          <h3 className="font-bold text-amber-400">Una Palabra</h3>
                          <p className="text-amber-300/70 text-sm">Solo UNA palabra</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Solo puedes decir UNA palabra para que tu equipo adivine.
                        Las mismas cartas de la ronda 1 vuelven a usarse.
                      </p>
                    </div>

                    {/* Round 3 */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                          3
                        </div>
                        <div>
                          <h3 className="font-bold text-red-400">Mimica</h3>
                          <p className="text-red-300/70 text-sm">Sin hablar</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm">
                        No puedes hablar. Usa solo gestos y mimica para que tu equipo
                        adivine. Las mismas cartas vuelven a usarse.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'rules' && (
                  <motion.div
                    key="rules"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shrink-0">
                        <span>30</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Tiempo</h4>
                        <p className="text-slate-400 text-sm">
                          Cada turno dura 30 segundos. Adivina tantas cartas como puedas.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Equipos</h4>
                        <p className="text-slate-400 text-sm">
                          Dos equipos compiten. Los turnos se alternan entre equipos.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-lg shrink-0">
                        +1
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Puntos</h4>
                        <p className="text-slate-400 text-sm">
                          Cada carta adivinada vale 1 punto. Puedes pasar cartas dificiles.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-lg shrink-0">
                        🔄
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Cartas</h4>
                        <p className="text-slate-400 text-sm">
                          Las mismas cartas se usan en las 3 rondas. Memoriza las pistas
                          que funcionaron!
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-xl p-4 mt-4">
                      <h4 className="font-semibold text-white mb-2">Victoria</h4>
                      <p className="text-slate-300 text-sm">
                        El equipo con mas puntos al final de las 3 rondas gana.
                      </p>
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
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                      <p className="text-emerald-400 font-medium text-sm mb-1">Ronda 1</p>
                      <p className="text-slate-300 text-sm">
                        Usa pistas memorables! Tu equipo necesitara recordarlas
                        en las siguientes rondas.
                      </p>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      <p className="text-amber-400 font-medium text-sm mb-1">Ronda 2</p>
                      <p className="text-slate-300 text-sm">
                        Usa la palabra clave de la ronda 1. Si dijiste &quot;astronauta famoso&quot;,
                        ahora solo di &quot;astronauta&quot;.
                      </p>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-400 font-medium text-sm mb-1">Ronda 3</p>
                      <p className="text-slate-300 text-sm">
                        Haz los gestos que mejor representen la palabra clave.
                        Tu equipo ya conoce las cartas!
                      </p>
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                      <p className="text-orange-400 font-medium text-sm mb-1">Estrategia</p>
                      <p className="text-slate-300 text-sm">
                        No pierdas tiempo en cartas dificiles. Es mejor pasar y
                        conseguir puntos con las faciles.
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
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors"
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
      className="fixed bottom-4 left-4 w-14 h-14 bg-orange-600 hover:bg-orange-700 rounded-full shadow-lg flex items-center justify-center text-white z-40"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </motion.button>
  );
}
