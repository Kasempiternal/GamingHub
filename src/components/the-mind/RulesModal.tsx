'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tabs = [
  { id: 'objetivo', label: 'Objetivo' },
  { id: 'reglas', label: 'Reglas' },
  { id: 'shuriken', label: 'Shuriken' },
];

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const [activeTab, setActiveTab] = useState('objetivo');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-slate-800 rounded-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Como jugar</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-700">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 py-3 text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'text-sky-400 border-b-2 border-sky-400'
                      : 'text-slate-400 hover:text-white'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {activeTab === 'objetivo' && (
                <div className="space-y-4 text-slate-300">
                  <p>
                    <strong className="text-white">The Mind</strong> es un juego de sincronizacion
                    donde todos los jugadores forman un equipo.
                  </p>

                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-center text-lg">
                      🎯 <strong>Objetivo:</strong> Jugar todas las cartas en orden ascendente
                      sin comunicarse.
                    </p>
                  </div>

                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span>📊</span>
                      <span>En cada nivel, reciben mas cartas (nivel 1 = 1 carta, nivel 2 = 2 cartas...)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>🧠</span>
                      <span>Deben desarrollar un sentido del tiempo compartido</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>🏆</span>
                      <span>Completen todos los niveles para ganar</span>
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'reglas' && (
                <div className="space-y-4 text-slate-300">
                  <div>
                    <h3 className="text-white font-medium mb-2">Jugando cartas</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>Cuando sientas que tu carta es la mas baja, jugala</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>No hay turnos - cualquiera puede jugar en cualquier momento</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>Esta PROHIBIDO comunicarse o dar senales</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-2">Errores</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        <span>Si juegas una carta y alguien tenia una mas baja, pierden una vida</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        <span>Las cartas mas bajas se descartan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        <span>Sin vidas = Juego terminado</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-2">Recompensas</h3>
                    <p className="text-sm">
                      Al completar ciertos niveles, ganan vidas (❤️) o shurikens (⭐) extra.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'shuriken' && (
                <div className="space-y-4 text-slate-300">
                  <div className="bg-amber-500/20 rounded-lg p-4 text-center">
                    <span className="text-3xl">⭐</span>
                    <p className="mt-2 text-amber-300 font-medium">El Shuriken</p>
                  </div>

                  <p>
                    El Shuriken es una herramienta de emergencia que permite al equipo
                    descartar su carta mas baja sin riesgo.
                  </p>

                  <div>
                    <h3 className="text-white font-medium mb-2">Como usar</h3>
                    <ol className="space-y-2 text-sm list-decimal list-inside">
                      <li>Un jugador propone usar el Shuriken</li>
                      <li>TODOS los jugadores con cartas deben aceptar</li>
                      <li>Cada jugador descarta su carta mas baja (boca arriba)</li>
                      <li>El juego continua</li>
                    </ol>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-3 text-sm">
                    <p className="text-amber-300">
                      💡 <strong>Consejo:</strong> Usa el Shuriken cuando sientas que el
                      equipo esta bloqueado y no sabe quien debe jugar.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating help button
export function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-slate-700 text-white shadow-lg
        flex items-center justify-center text-xl z-40"
    >
      ?
    </motion.button>
  );
}
