'use client';

import { motion } from 'framer-motion';

interface TimerProps {
  timeRemaining: number;
  totalTime: number;
}

export function Timer({ timeRemaining, totalTime }: TimerProps) {
  const progress = timeRemaining / totalTime;
  const seconds = Math.ceil(timeRemaining / 1000);

  // Color based on remaining time
  const getColor = () => {
    if (progress > 0.5) return { stroke: '#22c55e', text: 'text-green-400', bg: 'bg-green-500/20' };
    if (progress > 0.17) return { stroke: '#eab308', text: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { stroke: '#ef4444', text: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const colors = getColor();
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const isLowTime = seconds <= 5;

  return (
    <motion.div
      className={`relative w-28 h-28 md:w-32 md:h-32 ${colors.bg} rounded-full p-2`}
      animate={isLowTime ? { scale: [1, 1.05, 1] } : undefined}
      transition={isLowTime ? { duration: 0.5, repeat: Infinity } : undefined}
    >
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-700"
        />

        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5 }}
        />
      </svg>

      {/* Time display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          key={seconds}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-3xl md:text-4xl font-bold ${colors.text}`}
        >
          {seconds}
        </motion.span>
      </div>

      {/* Pulse ring when low time */}
      {isLowTime && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-500"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.3, opacity: 0 }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
