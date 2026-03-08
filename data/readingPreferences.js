export const READING_PREFERENCES_KEY = 'leiae-reading-preferences-v1';

export const defaultReadingPreferences = {
  fontScale: 1,
  highContrast: false,
  focusMode: false,
  voiceMode: 'robotic',
  voiceGender: 'female',
  voiceRate: 1,
  guidedSpeed: 1,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeReadingPreferences(preferences = {}) {
  const fontScale = Number(preferences.fontScale);
  const voiceRate = Number(preferences.voiceRate);
  const guidedSpeed = Number(preferences.guidedSpeed);

  return {
    fontScale: Number.isFinite(fontScale) ? Number(clamp(fontScale, 0.9, 1.8).toFixed(1)) : defaultReadingPreferences.fontScale,
    highContrast: Boolean(preferences.highContrast),
    focusMode: Boolean(preferences.focusMode),
    voiceMode: 'robotic',
    voiceGender: preferences.voiceGender === 'male' ? 'male' : 'female',
    voiceRate: Number.isFinite(voiceRate) ? Number(clamp(voiceRate, 0.6, 2).toFixed(1)) : defaultReadingPreferences.voiceRate,
    guidedSpeed: Number.isFinite(guidedSpeed) ? Number(clamp(guidedSpeed, 0.5, 3).toFixed(2)) : defaultReadingPreferences.guidedSpeed,
  };
}

export function loadReadingPreferences() {
  if (typeof window === 'undefined') {
    return defaultReadingPreferences;
  }

  try {
    const raw = window.localStorage.getItem(READING_PREFERENCES_KEY);
    if (!raw) return defaultReadingPreferences;

    const parsed = JSON.parse(raw);
    return normalizeReadingPreferences(parsed);
  } catch (_error) {
    return defaultReadingPreferences;
  }
}

export function saveReadingPreferences(preferences) {
  if (typeof window === 'undefined') return;

  try {
    const normalized = normalizeReadingPreferences(preferences);
    window.localStorage.setItem(READING_PREFERENCES_KEY, JSON.stringify(normalized));
  } catch (_error) {
    // Ignora falha de armazenamento local.
  }
}
