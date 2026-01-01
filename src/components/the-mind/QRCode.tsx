'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface QRCodeProps {
  roomCode: string;
}

export function QRCode({ roomCode }: QRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/the-mind/unirse/${roomCode}`
    : '';

  useEffect(() => {
    const generateQR = async () => {
      try {
        const QRCodeLib = await import('qrcode');
        const dataUrl = await QRCodeLib.toDataURL(joinUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#0ea5e9', // sky-500
            light: '#1e293b', // slate-800
          },
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (joinUrl) {
      generateQR();
    }
  }, [joinUrl]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Conecta con The Mind',
          text: `Sincroniza tu mente! Frecuencia: ${roomCode}`,
          url: joinUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-4 border border-sky-500/30">
      <h3 className="text-sky-300 font-semibold text-center mb-4 flex items-center justify-center gap-2">
        <span>∿</span>
        Sincronizar Mentes
      </h3>

      {/* QR Code */}
      <div className="flex justify-center mb-4">
        {qrDataUrl ? (
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img
              src={qrDataUrl}
              alt="QR Code para conectar"
              className="w-40 h-40 rounded-xl"
            />
            {/* Pulsing border */}
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-sky-400/50"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(14, 165, 233, 0.3)',
                  '0 0 0 10px rgba(14, 165, 233, 0)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        ) : (
          <div className="w-40 h-40 bg-slate-700 rounded-xl animate-pulse flex items-center justify-center">
            <span className="text-sky-400/50">Generando...</span>
          </div>
        )}
      </div>

      {/* Room code */}
      <div className="text-center mb-4">
        <p className="text-sky-400/50 text-sm mb-1">Frecuencia Mental</p>
        <p className="text-3xl font-mono font-bold text-sky-400 tracking-wider">
          {roomCode}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={copyLink}
          className={`
            flex-1 py-2 px-4 rounded-xl font-medium transition-all
            flex items-center justify-center gap-2
            ${copied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30'
            }
          `}
        >
          {copied ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copiado
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar
            </>
          )}
        </button>

        <button
          onClick={shareLink}
          className="flex-1 py-2 px-4 rounded-xl font-medium bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Compartir
        </button>
      </div>
    </div>
  );
}
