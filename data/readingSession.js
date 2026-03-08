export const READING_SESSION_KEY = 'leiae-reading-session-v1';

function clampWordIndex(value) {
  const index = Number(value);
  if (!Number.isFinite(index)) return 0;
  return Math.max(0, Math.floor(index));
}

export function loadReadingSession() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(READING_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.storyId !== 'string' || !parsed.storyId.trim()) {
      return null;
    }

    return {
      storyId: parsed.storyId,
      wordIndex: clampWordIndex(parsed.wordIndex),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch (_error) {
    return null;
  }
}

export function saveReadingSession({ storyId, wordIndex }) {
  if (typeof window === 'undefined') return;
  if (!storyId || typeof storyId !== 'string') return;

  try {
    const payload = {
      storyId,
      wordIndex: clampWordIndex(wordIndex),
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(READING_SESSION_KEY, JSON.stringify(payload));
  } catch (_error) {
    // Ignora falhas de armazenamento local.
  }
}

export function buildLastReadingHref(fallbackHref = '/biblioteca') {
  const session = loadReadingSession();
  if (!session) return fallbackHref;

  return `/livro/${session.storyId}?w=${session.wordIndex}`;
}
