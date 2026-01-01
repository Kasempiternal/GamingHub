'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// Neural network / Telepathy themed background
export function TelepathyBackground({ intensity = 'medium' }: { intensity?: 'low' | 'medium' | 'high' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  const particleCount = intensity === 'low' ? 30 : intensity === 'medium' ? 50 : 80;
  const connectionDistance = 150;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // Update and draw particles
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(14, 165, 233, 0.6)';
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [particleCount, connectionDistance]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050510]">
      {/* Neural network canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Pulsing brain waves */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-500/10"
            initial={{ width: 0, height: 0, opacity: 0.5 }}
            animate={{
              width: [0, 800],
              height: [0, 800],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 1.3,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Ethereal glow spots */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)' }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Constellation pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg className="w-full h-full">
          <pattern id="constellation" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="white"/>
            <circle cx="50" cy="30" r="0.5" fill="white"/>
            <circle cx="80" cy="60" r="1" fill="white"/>
            <circle cx="30" cy="80" r="0.5" fill="white"/>
            <circle cx="70" cy="90" r="1" fill="white"/>
            <line x1="10" y1="10" x2="50" y2="30" stroke="white" strokeWidth="0.2"/>
            <line x1="50" y1="30" x2="80" y2="60" stroke="white" strokeWidth="0.2"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#constellation)"/>
        </svg>
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5,5,16,0.6) 100%)',
        }}
      />
    </div>
  );
}

// Synchronization pulse effect when players are in sync
export function SyncPulse({ isActive, playerPositions = [] }: { isActive: boolean; playerPositions?: { x: number; y: number }[] }) {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Central sync pulse */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-400"
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{
              width: [0, 400],
              height: [0, 400],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 1,
              delay: i * 0.2,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Center glow */}
        <motion.div
          className="w-16 h-16 rounded-full bg-emerald-400 blur-xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 0.5, repeat: 2 }}
        />
      </motion.div>

      {/* Brain icon */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl"
        animate={{
          scale: [1, 1.2, 1],
          filter: ['brightness(1)', 'brightness(2)', 'brightness(1)'],
        }}
        transition={{ duration: 0.8 }}
      >
        🧠
      </motion.div>
    </div>
  );
}

// Tension meter visualization
export function TensionMeter({ level }: { level: number }) {
  // level is 0-100, represents how tense the moment is
  const hue = 120 - (level * 1.2); // Green to red

  return (
    <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: `hsl(${hue}, 70%, 50%)` }}
        initial={{ width: 0 }}
        animate={{
          width: `${level}%`,
          boxShadow: level > 70 ? `0 0 20px hsl(${hue}, 70%, 50%)` : 'none'
        }}
        transition={{ duration: 0.3 }}
      />
      {level > 80 && (
        <motion.div
          className="absolute inset-0 bg-red-500/20"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}
