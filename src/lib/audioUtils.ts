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
