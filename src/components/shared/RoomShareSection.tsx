'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RoomShareSectionProps {
  roomCode: string;
  gameSlug: string;  // e.g., 'codigo-secreto', 'the-mind'
  accentColor: string;  // e.g., 'amber', 'sky', 'red', 'purple', 'cyan'
  onBack: () => void;
  onContinue: () => void;
  playerName: string;
}

export function RoomShareSection({
  roomCode,
  gameSlug,
  accentColor,
  onBack,
  onContinue,
  playerName,
}: RoomShareSectionProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/${gameSlug}/unirse/${roomCode}`;
    }
    return '';
  };

  useEffect(() => {
    import('qrcode').then(QRCodeLib => {
      QRCodeLib.toDataURL(getShareUrl(), {
        width: 180,
        margin: 1,
        color: {
          dark: '#1a1a2e',
          light: '#ffffff',
        },
      }).then(setQrDataUrl);
    });
  }, [roomCode, gameSlug]);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareViaNavigator = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Unete a mi partida!',
          text: `Unete a mi partida con el codigo: ${roomCode}`,
          url: getShareUrl(),
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      copyShareUrl();
    }
  };

  // Color mapping for different accent colors
  const colorClasses: Record<string, { bg: string; border: string; text: string; buttonBg: string; buttonHover: string }> = {
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-300',
      buttonBg: 'bg-gradient-to-r from-amber-600 to-amber-700',
      buttonHover: 'hover:from-amber-500 hover:to-amber-600',
    },
    sky: {
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      text: 'text-sky-300',
      buttonBg: 'bg-gradient-to-r from-sky-500 to-emerald-500',
      buttonHover: 'hover:from-sky-400 hover:to-emerald-400',
    },
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-300',
      buttonBg: 'bg-gradient-to-r from-red-500 to-red-600',
      buttonHover: 'hover:from-red-400 hover:to-red-500',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-300',
      buttonBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
      buttonHover: 'hover:from-purple-400 hover:to-pink-400',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-300',
      buttonBg: 'bg-gradient-to-r from-cyan-500 to-blue-600',
      buttonHover: 'hover:from-cyan-400 hover:to-blue-500',
    },
    slate: {
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/30',
      text: 'text-slate-300',
      buttonBg: 'bg-gradient-to-r from-red-800 to-red-900',
      buttonHover: 'hover:from-red-700 hover:to-red-800',
    },
  };

  const colors = colorClasses[accentColor] || colorClasses.amber;

  return (
    <div className="space-y-4 relative">
      {/* Back button */}
      <button
        onClick={onBack}
        className={`${colors.text.replace('300', '400/70')} hover:${colors.text} transition-colors flex items-center gap-1`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* Title */}
      <div className="text-center mb-2">
        <h2 className={`text-xl font-bold ${colors.text}`}>Sala Creada!</h2>
        <p className={`${colors.text.replace('300', '400/50')} text-xs`}>
          Hola {playerName}, comparte el codigo para que se unan
        </p>
      </div>

      {/* Room Code Display */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 text-center`}
      >
        <div className={`${colors.text.replace('300', '400/60')} text-xs uppercase tracking-wider mb-1`}>
          Codigo de Sala
        </div>
        <button
          onClick={copyRoomCode}
          className="group relative"
        >
          <div className="text-4xl font-mono font-bold text-white tracking-[0.3em]">
            {roomCode}
          </div>
          <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
            {copied ? 'Copiado!' : 'Toca para copiar'}
          </div>
        </button>
      </motion.div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="bg-white rounded-xl p-3 shadow-lg">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" width={180} height={180} />
          ) : (
            <div className="w-[180px] h-[180px] flex items-center justify-center">
              <motion.div
                className="w-8 h-8 border-2 border-slate-400 border-t-slate-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Share buttons */}
      <div className="flex gap-2">
        <button
          onClick={copyShareUrl}
          className={`flex-1 py-3 px-4 ${colors.bg} border ${colors.border} rounded-xl ${colors.text} font-medium flex items-center justify-center gap-2 hover:bg-opacity-20 transition-colors`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
        <button
          onClick={shareViaNavigator}
          className={`flex-1 py-3 px-4 ${colors.bg} border ${colors.border} rounded-xl ${colors.text} font-medium flex items-center justify-center gap-2 hover:bg-opacity-20 transition-colors`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Compartir
        </button>
      </div>

      {/* Continue button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className={`w-full py-4 px-6 ${colors.buttonBg} ${colors.buttonHover} rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 border border-white/10`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        Entrar a la Sala
      </motion.button>

      <p className={`text-center ${colors.text.replace('300', '400/40')} text-xs`}>
        Tus amigos pueden escanear el QR o usar el codigo
      </p>
    </div>
  );
}
