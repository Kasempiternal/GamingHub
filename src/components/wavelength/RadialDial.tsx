'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RadialDialProps {
  leftConcept: string;
  rightConcept: string;
  targetPosition?: number;     // 0-100, only shown to psychic or during reveal
  showTarget: boolean;         // Whether to show the target zone
  currentGuess?: number;       // Current guess position (0-100)
  onGuessChange?: (position: number) => void;
  interactive?: boolean;       // Whether user can use the slider
  revealMode?: boolean;        // Reveal animation mode
  size?: number;               // Diameter in pixels
}

export function RadialDial({
  leftConcept,
  rightConcept,
  targetPosition = 50,
  showTarget,
  currentGuess = 50,
  onGuessChange,
  interactive = false,
  revealMode = false,
  size = 300,
}: RadialDialProps) {
  const [localGuess, setLocalGuess] = useState(currentGuess);

  // Update local guess when prop changes
  useEffect(() => {
    setLocalGuess(currentGuess);
  }, [currentGuess]);

  // Convert position (0-100) to angle (0 = left, 100 = right)
  // The dial goes from -90° (left) to 90° (right)
  const positionToAngle = (position: number) => {
    return -90 + (position / 100) * 180;
  };

  const radius = size / 2 - 20;
  const center = size / 2;
  const guessAngle = positionToAngle(localGuess);
  const targetAngle = positionToAngle(targetPosition);

  // Calculate scoring zones for target (in degrees)
  const bullseyeWidth = (5 / 100) * 180; // ±5 = 4 points
  const closeWidth = (10 / 100) * 180;    // ±10 = 3 points
  const okWidth = (15 / 100) * 180;       // ±15 = 2 points

  // Create arc path for scoring zones
  const createArc = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = center + outerRadius * Math.cos(startRad);
    const y1 = center + outerRadius * Math.sin(startRad);
    const x2 = center + outerRadius * Math.cos(endRad);
    const y2 = center + outerRadius * Math.sin(endRad);
    const x3 = center + innerRadius * Math.cos(endRad);
    const y3 = center + innerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(startRad);
    const y4 = center + innerRadius * Math.sin(startRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setLocalGuess(value);
    onGuessChange?.(value);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Spectrum Labels */}
      <div className="w-full flex justify-between mb-2 px-4" style={{ maxWidth: size }}>
        <span className="text-sm font-medium text-cyan-400 truncate max-w-[45%]">{leftConcept}</span>
        <span className="text-sm font-medium text-cyan-400 truncate max-w-[45%] text-right">{rightConcept}</span>
      </div>

      {/* Dial (visual only) */}
      <svg
        width={size}
        height={size / 2 + 40}
        viewBox={`0 0 ${size} ${size / 2 + 40}`}
        className="select-none"
      >
        {/* Background arc */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="#334155"
          strokeWidth={40}
          strokeLinecap="round"
        />

        {/* Gradient spectrum background */}
        <defs>
          <linearGradient id="spectrumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="url(#spectrumGradient)"
          strokeWidth={38}
        />

        {/* Target zones (only shown to psychic or during reveal) */}
        <AnimatePresence>
          {showTarget && (
            <motion.g
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: revealMode ? 0.8 : 0.3 }}
            >
              {/* OK zone (2 points) - Yellow */}
              <path
                d={createArc(targetAngle - okWidth, targetAngle + okWidth, radius - 18, radius + 18)}
                fill="#eab308"
                opacity={0.6}
              />
              {/* Close zone (3 points) - Orange */}
              <path
                d={createArc(targetAngle - closeWidth, targetAngle + closeWidth, radius - 18, radius + 18)}
                fill="#f97316"
                opacity={0.7}
              />
              {/* Bullseye zone (4 points) - Green */}
              <path
                d={createArc(targetAngle - bullseyeWidth, targetAngle + bullseyeWidth, radius - 18, radius + 18)}
                fill="#22c55e"
                opacity={0.8}
              />
              {/* Target line */}
              <motion.line
                x1={center}
                y1={center}
                x2={center + (radius - 5) * Math.cos((targetAngle - 90) * Math.PI / 180)}
                y2={center + (radius - 5) * Math.sin((targetAngle - 90) * Math.PI / 180)}
                stroke="#ffffff"
                strokeWidth={3}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: revealMode ? 0.5 : 0.2, delay: revealMode ? 0.3 : 0 }}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((pos) => {
          const angle = positionToAngle(pos);
          const rad = (angle - 90) * (Math.PI / 180);
          const innerR = radius - 25;
          const outerR = radius + 25;
          return (
            <line
              key={pos}
              x1={center + innerR * Math.cos(rad)}
              y1={center + innerR * Math.sin(rad)}
              x2={center + outerR * Math.cos(rad)}
              y2={center + outerR * Math.sin(rad)}
              stroke="#64748b"
              strokeWidth={2}
            />
          );
        })}

        {/* Guess indicator - animated dial hand */}
        {(() => {
          const angleRad = (guessAngle - 90) * (Math.PI / 180);
          const handLength = radius - 10;
          const handEndX = center + handLength * Math.cos(angleRad);
          const handEndY = center + handLength * Math.sin(angleRad);
          return (
            <>
              {/* Dial hand */}
              <motion.line
                x1={center}
                y1={center}
                animate={{ x2: handEndX, y2: handEndY }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                stroke="#ffffff"
                strokeWidth={4}
                strokeLinecap="round"
              />
              {/* Hand tip */}
              <motion.circle
                animate={{ cx: handEndX, cy: handEndY }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                r={8}
                fill="#06b6d4"
                stroke="#ffffff"
                strokeWidth={2}
              />
            </>
          );
        })()}

        {/* Center pivot */}
        <circle
          cx={center}
          cy={center}
          r={15}
          fill="#1e293b"
          stroke="#64748b"
          strokeWidth={2}
        />
        <circle
          cx={center}
          cy={center}
          r={8}
          fill="#06b6d4"
        />

        {/* Base line */}
        <line
          x1={center - radius - 10}
          y1={center + 5}
          x2={center + radius + 10}
          y2={center + 5}
          stroke="#334155"
          strokeWidth={3}
        />
      </svg>

      {/* Position indicator */}
      <div className="mt-2 text-center">
        <span className="text-2xl font-bold text-white">{Math.round(localGuess)}</span>
        <span className="text-sm text-white/60 ml-1">/ 100</span>
      </div>

      {/* Slider control (only when interactive) */}
      {interactive && (
        <div className="w-full mt-4 px-2" style={{ maxWidth: size }}>
          <input
            type="range"
            min="0"
            max="100"
            value={localGuess}
            onChange={handleSliderChange}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-8
              [&::-webkit-slider-thumb]:h-8
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-cyan-400
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:border-4
              [&::-webkit-slider-thumb]:border-white
              [&::-moz-range-thumb]:w-8
              [&::-moz-range-thumb]:h-8
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-cyan-400
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:border-4
              [&::-moz-range-thumb]:border-white"
          />
          <div className="flex justify-between text-xs text-white/50 mt-1 px-1">
            <span>{leftConcept}</span>
            <span>{rightConcept}</span>
          </div>
        </div>
      )}

      {/* Scoring legend (during reveal) */}
      {showTarget && revealMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-3 flex gap-3 text-xs"
        >
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-white/70">4 pts</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-white/70">3 pts</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-white/70">2 pts</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
