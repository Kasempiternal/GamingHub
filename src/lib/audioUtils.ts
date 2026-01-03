// Simple audio utilities using Web Audio API
// No audio files needed - generates tones programmatically

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// Play a simple tone
export function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio not supported or blocked
    console.log('Audio playback not available');
  }
}

// Play a success sound (ascending tones)
export function playSuccessSound() {
  playTone(440, 0.1, 'sine', 0.2); // A4
  setTimeout(() => playTone(554, 0.1, 'sine', 0.2), 100); // C#5
  setTimeout(() => playTone(659, 0.2, 'sine', 0.3), 200); // E5
}

// Play an error/failure sound (descending tones)
export function playErrorSound() {
  playTone(440, 0.15, 'square', 0.15);
  setTimeout(() => playTone(349, 0.2, 'square', 0.15), 150);
}

// Play a notification sound (single pleasant tone)
export function playNotificationSound() {
  playTone(523, 0.15, 'sine', 0.25); // C5
}

// Play a dramatic reveal sound
export function playRevealSound() {
  playTone(220, 0.3, 'sine', 0.2); // A3
  setTimeout(() => playTone(277, 0.3, 'sine', 0.2), 200); // C#4
  setTimeout(() => playTone(330, 0.4, 'sine', 0.25), 400); // E4
}

// Play a tick sound for timer
export function playTickSound() {
  playTone(800, 0.05, 'sine', 0.1);
}

// Play warning sound (for low timer)
export function playWarningSound() {
  playTone(880, 0.1, 'square', 0.2);
}

// Play victory fanfare
export function playVictorySound() {
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.25), i * 150);
  });
}

// Play defeat sound
export function playDefeatSound() {
  const notes = [392, 349, 311, 294]; // G4, F4, D#4, D4
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'sine', 0.2), i * 200);
  });
}

// Play click sound for UI interactions
export function playClickSound() {
  playTone(1000, 0.03, 'sine', 0.1);
}

// Play selection sound
export function playSelectSound() {
  playTone(600, 0.08, 'sine', 0.15);
}

// ============================================
// ASESINATO NIGHT PHASE AUDIO
// ============================================

// Play countdown "3, 2, 1" beeps
export function playCountdownSound(): Promise<void> {
  return new Promise((resolve) => {
    // "3" - high beep
    playTone(880, 0.25, 'sine', 0.3);
    setTimeout(() => {
      // "2" - medium beep
      playTone(660, 0.25, 'sine', 0.3);
    }, 600);
    setTimeout(() => {
      // "1" - low long beep
      playTone(440, 0.4, 'sine', 0.35);
    }, 1200);
    // Resolve after countdown finishes
    setTimeout(resolve, 1800);
  });
}

// Sleeping ambience - returns a stop function
// Creates a peaceful ambient drone using layered oscillators
let sleepingAmbienceNodes: { oscillators: OscillatorNode[]; gains: GainNode[] } | null = null;

export function startSleepingAmbience(): () => void {
  try {
    const ctx = getAudioContext();
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    // Layer 1: Deep bass drone (very quiet)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    oscillators.push(osc1);
    gains.push(gain1);

    // Layer 2: Gentle mid tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(110, ctx.currentTime); // A2
    gain2.gain.setValueAtTime(0.05, ctx.currentTime);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    oscillators.push(osc2);
    gains.push(gain2);

    // Layer 3: Very subtle shimmer with slow LFO
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(220, ctx.currentTime); // A3
    gain3.gain.setValueAtTime(0.02, ctx.currentTime);
    // Add subtle volume modulation
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // Very slow
    lfoGain.gain.setValueAtTime(0.01, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(gain3.gain);
    lfo.start();
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    oscillators.push(osc3);
    oscillators.push(lfo);
    gains.push(gain3);
    gains.push(lfoGain);

    // Start all oscillators
    oscillators.forEach(osc => osc.start());

    sleepingAmbienceNodes = { oscillators, gains };

    // Return stop function
    return () => {
      if (sleepingAmbienceNodes) {
        sleepingAmbienceNodes.gains.forEach(gain => {
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        });
        setTimeout(() => {
          sleepingAmbienceNodes?.oscillators.forEach(osc => {
            try { osc.stop(); } catch { /* already stopped */ }
          });
          sleepingAmbienceNodes = null;
        }, 600);
      }
    };
  } catch (e) {
    console.log('Audio not available for sleeping ambience');
    return () => {}; // No-op stop function
  }
}

// Stop sleeping ambience (convenience function)
export function stopSleepingAmbience() {
  if (sleepingAmbienceNodes) {
    try {
      const ctx = getAudioContext();
      sleepingAmbienceNodes.gains.forEach(gain => {
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      });
      setTimeout(() => {
        sleepingAmbienceNodes?.oscillators.forEach(osc => {
          try { osc.stop(); } catch { /* already stopped */ }
        });
        sleepingAmbienceNodes = null;
      }, 400);
    } catch (e) {
      sleepingAmbienceNodes = null;
    }
  }
}

// Wake up alert sound with rising tones
export function playWakeUpSound() {
  // Rising fanfare
  playTone(440, 0.15, 'sine', 0.25); // A4
  setTimeout(() => playTone(554, 0.15, 'sine', 0.3), 150); // C#5
  setTimeout(() => playTone(659, 0.15, 'sine', 0.35), 300); // E5
  setTimeout(() => playTone(880, 0.3, 'sine', 0.4), 450); // A5
}

// Trigger vibration if supported
export function triggerWakeVibration() {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
  } catch (e) {
    // Vibration not supported
  }
}
