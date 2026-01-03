// Device ID management utilities
// Provides persistent device identification across all games

const DEVICE_ID_KEY = 'gamingHubDeviceId';

/**
 * Gets the device ID from localStorage, creating one if it doesn't exist.
 * This ID persists across browser sessions and is shared across all games.
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Clears the device ID from localStorage.
 * Use this if a user wants to play as a different person on the same device.
 */
export function clearDeviceId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DEVICE_ID_KEY);
  }
}
