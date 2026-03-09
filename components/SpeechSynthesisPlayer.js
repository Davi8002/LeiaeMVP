import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeString(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function buildFallbackWords(text) {
  const tokens = text.match(/\S+/g) || [];
  return tokens.map((token, index) => ({
    indice: index,
    texto: token,
    inicio: index * 0.35,
  }));
}

function getLocalWordIndexByChar(segmentWords, charIndex) {
  if (!segmentWords.length) return 0;

  for (let i = 0; i < segmentWords.length; i += 1) {
    if (charIndex < segmentWords[i].charFim) {
      return i;
    }
  }

  return segmentWords.length - 1;
}

function getWordStartSeconds(word, fallbackIndex) {
  if (typeof word?.inicio === 'number' && Number.isFinite(word.inicio)) {
    return word.inicio;
  }

  return fallbackIndex * 0.35;
}

function findWordIndexByTimeline(words, timelineSeconds, minIndex = 0) {
  if (!words.length) return 0;

  const boundedMin = clamp(minIndex, 0, words.length - 1);

  for (let i = boundedMin; i < words.length; i += 1) {
    const nextStart = i < words.length - 1 ? getWordStartSeconds(words[i + 1], i + 1) : Number.POSITIVE_INFINITY;
    if (timelineSeconds < nextStart) {
      return i;
    }
  }

  return words.length - 1;
}

function buildChunkModel(words) {
  if (!Array.isArray(words) || words.length === 0) {
    return {
      ranges: [{ start: 0, end: 0 }],
      chunkStartByWord: [0],
      chunkIndexByWord: [0],
    };
  }

  const ranges = [];
  const chunkStartByWord = new Array(words.length);
  const chunkIndexByWord = new Array(words.length);

  let start = 0;

  while (start < words.length) {
    let end = start;
    let count = 0;

    for (let index = start; index < words.length; index += 1) {
      const token = String(words[index]?.texto || '');
      count += 1;
      end = index;

      const strongBreak = /[.!?…]+[)"'\]»”]*$/.test(token);
      const mediumBreak = /[,;:]+[)"'\]»”]*$/.test(token);

      const shouldBreak =
        (count >= 6 && strongBreak) ||
        (count >= 10 && mediumBreak) ||
        count >= 16 ||
        index === words.length - 1;

      if (shouldBreak) {
        break;
      }
    }

    const chunkIndex = ranges.length;
    ranges.push({ start, end });

    for (let i = start; i <= end; i += 1) {
      chunkStartByWord[i] = start;
      chunkIndexByWord[i] = chunkIndex;
    }

    start = end + 1;
  }

  return {
    ranges,
    chunkStartByWord,
    chunkIndexByWord,
  };
}

function isMobileReadingEnvironment() {
  if (typeof window === 'undefined') return false;

  const ua = window.navigator?.userAgent || '';
  const uaMobile = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(ua);
  const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? false;
  const narrowViewport = window.matchMedia?.('(max-width: 768px)')?.matches ?? false;

  return uaMobile || (coarsePointer && narrowViewport);
}

function estimateCharRate(rate, learnedRateAtOneX = 11.5) {
  const baseline = Number.isFinite(learnedRateAtOneX) && learnedRateAtOneX > 0
    ? learnedRateAtOneX
    : 11.5;

  const safeRate = clamp(Number(rate) || 1, 0.6, 2);
  return Math.max(4.5, baseline * safeRate);
}
function getTokenPauseHoldSeconds(token, rate = 1) {
  const value = String(token || '');
  const strongBreak = /[.!?…]+[)"'\]»”]*$/.test(value);
  const mediumBreak = /[,;:]+[)"'\]»”]*$/.test(value);
  const safeRate = Math.max(Number(rate) || 1, 0.1);

  if (strongBreak) {
    return 0.34 / safeRate;
  }

  if (mediumBreak) {
    return 0.18 / safeRate;
  }

  return 0;
}
function scoreVoice(voice, normalizedGender) {
  const normalizedName = normalizeString(voice?.name);
  const normalizedLang = normalizeString(voice?.lang);

  const maleKeywords = ['male', 'mascul', 'homem', 'man', 'paulo', 'joao', 'carlos', 'daniel', 'ricardo', 'mateus'];
  const femaleKeywords = ['female', 'femin', 'mulher', 'woman', 'ana', 'maria', 'sofia', 'beatriz', 'clara', 'helena'];

  const positiveKeywords = normalizedGender === 'male' ? maleKeywords : femaleKeywords;
  const negativeKeywords = normalizedGender === 'male' ? femaleKeywords : maleKeywords;

  let score = 0;

  if (normalizedLang.startsWith('pt-br')) {
    score += 6;
  } else if (normalizedLang.startsWith('pt')) {
    score += 4;
  }

  if (voice?.localService) {
    score += 0.6;
  }

  positiveKeywords.forEach((keyword) => {
    if (normalizedName.includes(keyword)) {
      score += 2;
    }
  });

  negativeKeywords.forEach((keyword) => {
    if (normalizedName.includes(keyword)) {
      score -= 1.5;
    }
  });

  return score;
}

function pickVoiceByGender(voices, voiceGender) {
  if (!voices.length) return null;

  const normalizedGender = voiceGender === 'male' ? 'male' : 'female';
  const ptVoices = voices.filter((voice) => /^pt(-|$)/i.test(voice?.lang || ''));
  const candidatePool = ptVoices.length > 0 ? ptVoices : voices;

  let bestVoice = candidatePool[0] || null;
  let bestScore = Number.NEGATIVE_INFINITY;

  candidatePool.forEach((voice) => {
    const score = scoreVoice(voice, normalizedGender);
    if (score > bestScore) {
      bestScore = score;
      bestVoice = voice;
    }
  });

  return bestVoice;
}

const SPEECH_SEGMENT_MAX_WORDS = 180;
const SPEECH_SEGMENT_TARGET_CHARS = 1100;
const SPEECH_SEGMENT_HARD_CHARS = 1500;

function PlayIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='currentColor'>
      <path d='M8 6.8c0-1 1.1-1.6 2-1l7.8 4.8c.8.5.8 1.7 0 2.2L10 17.6c-.9.6-2 0-2-1V6.8z' />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='currentColor'>
      <rect x='7' y='6.5' width='3.8' height='11' rx='1.2' />
      <rect x='13.2' y='6.5' width='3.8' height='11' rx='1.2' />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M6 8l6 4-6 4V8zM12 8l6 4-6 4V8z' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

function BackwardIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M18 8l-6 4 6 4V8zM12 8l-6 4 6 4V8z' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

const SpeechSynthesisPlayer = forwardRef(function SpeechSynthesisPlayer({
  text,
  words,
  activeWordIndex,
  initialRate = 1,
  voiceGender = 'female',
  onWordBoundary,
  onPlayStateChange,
  onPlaybackIntent,
  onRateChange,
  onStatusChange,
  externalAction,
  compact = false,
}, ref) {
  const utteranceTokenRef = useRef(0);
  const segmentWordsRef = useRef([]);
  const segmentStartRef = useRef(0);
  const segmentEndRef = useRef(0);
  const segmentTextLengthRef = useRef(0);
  const segmentStartedAtMsRef = useRef(0);
  const segmentExpectedSecondsRef = useRef(0);
  const lastBoundaryCharIndexRef = useRef(0);
  const currentCharRateRef = useRef(0);
  const learnedCharRateAtOneXRef = useRef(11.5);
  const timelineScaleRef = useRef(1);
  const isSeekingRef = useRef(false);
  const pauseAfterStartRef = useRef(false);
  const userPausedRef = useRef(false);
  const pendingPlayRef = useRef(false);
  const lastExternalActionRef = useRef(null);

  const playbackStartMsRef = useRef(0);
  const playbackBaseSecondsRef = useRef(0);
  const playbackRateRef = useRef(clamp(Number(initialRate) || 1, 0.6, 2));
  const pausedAtMsRef = useRef(null);
  const boundarySeenRef = useRef(false);
  const lastBoundaryAtMsRef = useRef(0);

  const activeWordIndexRef = useRef(activeWordIndex);
  const currentWordIndexRef = useRef(0);

  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState('idle');
  const [voiceRate, setVoiceRate] = useState(clamp(Number(initialRate) || 1, 0.6, 2));
  const [seekWordIndex, setSeekWordIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [speechError, setSpeechError] = useState('');
  const [isSeeking, setIsSeeking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [mobileEnvironment, setMobileEnvironment] = useState(false);

  const normalizedWords = useMemo(() => {
    if (Array.isArray(words) && words.length > 0) {
      return words.map((word, index) => ({
        indice: typeof word.indice === 'number' ? word.indice : index,
        texto: word?.texto || '',
        inicio: typeof word?.inicio === 'number' ? word.inicio : null,
      }));
    }

    return buildFallbackWords(text || '');
  }, [text, words]);

  const totalWords = normalizedWords.length;
  const maxIndex = Math.max(totalWords - 1, 0);
  const canUse = supported && Boolean(text?.trim()) && totalWords > 0;
  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';

  const selectedVoice = useMemo(
    () => pickVoiceByGender(availableVoices, voiceGender),
    [availableVoices, voiceGender],
  );

  const isMobileSync = mobileEnvironment;

  const chunkModel = useMemo(
    () => buildChunkModel(normalizedWords),
    [normalizedWords],
  );

  const activeRange = useMemo(() => {
    const bounded = clamp(currentWordIndex, 0, maxIndex);

    if (!isMobileSync) {
      return { start: bounded, end: bounded };
    }

    const chunkIndex = chunkModel.chunkIndexByWord[bounded] ?? 0;
    return chunkModel.ranges[chunkIndex] || { start: bounded, end: bounded };
  }, [chunkModel, currentWordIndex, isMobileSync, maxIndex]);

  const emitWord = useCallback(
    (index, options = {}) => {
      const bounded = clamp(index, 0, maxIndex);
      currentWordIndexRef.current = bounded;
      setCurrentWordIndex(bounded);

      if (options.syncSeek) {
        setSeekWordIndex(bounded);
      }

      onWordBoundary?.(bounded);
    },
    [maxIndex, onWordBoundary],
  );

  const getRuntimePlaybackState = useCallback(() => {
    if (typeof window !== 'undefined' && supported) {
      const speech = window.speechSynthesis;
      if (speech.speaking) {
        return speech.paused ? 'paused' : 'playing';
      }

      if (speech.pending) {
        return 'playing';
      }
    }

    if (status === 'paused') return 'paused';
    if (status === 'playing') return 'idle';
    return 'idle';
  }, [status, supported]);

  const buildSpeechSegment = useCallback(
    (startIndex) => {
      const start = clamp(startIndex, 0, maxIndex);
      let speechText = '';
      const mappedWords = [];
      let end = start;

      for (let index = start; index <= maxIndex; index += 1) {
        const token = normalizedWords[index]?.texto || '';
        const prefix = speechText.length > 0 ? ' ' : '';
        const nextText = `${speechText}${prefix}${token}`;

        if (
          mappedWords.length > 0
          && nextText.length > SPEECH_SEGMENT_HARD_CHARS
        ) {
          break;
        }

        const charInicio = speechText.length + prefix.length;
        speechText = nextText;
        const charFim = speechText.length;

        mappedWords.push({ charInicio, charFim });
        end = index;

        const reachedWordLimit = mappedWords.length >= SPEECH_SEGMENT_MAX_WORDS;
        const reachedTargetChars = speechText.length >= SPEECH_SEGMENT_TARGET_CHARS;
        const isStrongBreak = /[.!?…]+[)"'\]»”]*$/.test(token);

        if (reachedWordLimit || (reachedTargetChars && isStrongBreak)) {
          break;
        }
      }

      return {
        start,
        end,
        speechText,
        mappedWords,
      };
    },
    [maxIndex, normalizedWords],
  );

  const stopSpeech = useCallback(
    (nextStatus = 'idle') => {
      if (!supported || typeof window === 'undefined') return;

      utteranceTokenRef.current += 1;
      window.speechSynthesis.cancel();

      segmentWordsRef.current = [];
      segmentEndRef.current = 0;
      segmentTextLengthRef.current = 0;
      segmentStartedAtMsRef.current = 0;
      segmentExpectedSecondsRef.current = 0;
      lastBoundaryCharIndexRef.current = 0;
      currentCharRateRef.current = 0;
      pauseAfterStartRef.current = false;
      userPausedRef.current = false;
      isSeekingRef.current = false;
      pendingPlayRef.current = false;

      playbackStartMsRef.current = 0;
      playbackBaseSecondsRef.current = 0;
      pausedAtMsRef.current = null;
      boundarySeenRef.current = false;
      lastBoundaryAtMsRef.current = 0;

      setIsSeeking(false);
      setStatus(nextStatus);
      onPlayStateChange?.(false);
      onPlaybackIntent?.(false);
    },
    [onPlayStateChange, onPlaybackIntent, supported],
  );

  const startSpeech = useCallback(
    (targetIndex, options = {}) => {
      if (!canUse || typeof window === 'undefined') return false;

      const pauseAfterStart = Boolean(options.pauseAfterStart);
      const rateOverride = Number(options.rateOverride);
      const retryCount = Number(options.retryCount) || 0;
      const utteranceRate = Number.isFinite(rateOverride) ? rateOverride : voiceRate;

      const { start, end, speechText, mappedWords } = buildSpeechSegment(targetIndex);
      if (!speechText) return false;

      const token = utteranceTokenRef.current + 1;
      utteranceTokenRef.current = token;

      window.speechSynthesis.cancel();

      const segmentStartSeconds = getWordStartSeconds(normalizedWords[start], start);
      const segmentEndSeconds = end < maxIndex
        ? getWordStartSeconds(normalizedWords[end + 1], end + 1)
        : segmentStartSeconds + Math.max(0.35, mappedWords.length * 0.28);

      const startedAt = Date.now();

      segmentStartRef.current = start;
      segmentEndRef.current = end;
      segmentWordsRef.current = mappedWords;
      segmentTextLengthRef.current = speechText.length;
      segmentStartedAtMsRef.current = startedAt;
      segmentExpectedSecondsRef.current = Math.max(segmentEndSeconds - segmentStartSeconds, 0.6);
      lastBoundaryCharIndexRef.current = 0;
      currentCharRateRef.current = estimateCharRate(utteranceRate, learnedCharRateAtOneXRef.current);

      setSeekWordIndex(start);
      setSpeechError('');
      emitWord(start, { syncSeek: true });

      playbackStartMsRef.current = startedAt;
      playbackBaseSecondsRef.current = segmentStartSeconds;
      playbackRateRef.current = utteranceRate;
      pausedAtMsRef.current = null;
      boundarySeenRef.current = false;
      lastBoundaryAtMsRef.current = startedAt;

      pauseAfterStartRef.current = pauseAfterStart;
      userPausedRef.current = pauseAfterStart;

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.pitch = 1;
      utterance.rate = utteranceRate;
      utterance.lang = 'pt-BR';

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        if (token !== utteranceTokenRef.current) return;

        const startedAt = Date.now();
        playbackStartMsRef.current = startedAt;
        segmentStartedAtMsRef.current = startedAt;
        lastBoundaryAtMsRef.current = startedAt;

        if (pauseAfterStartRef.current) {
          pauseAfterStartRef.current = false;
          pausedAtMsRef.current = startedAt;
          setStatus('paused');
          onPlayStateChange?.(false);
          onPlaybackIntent?.(false);
          window.speechSynthesis.pause();
          return;
        }

        userPausedRef.current = false;
        setStatus('playing');
        onPlayStateChange?.(true);
        onPlaybackIntent?.(true);
      };

      utterance.onboundary = (event) => {
        if (token !== utteranceTokenRef.current) return;
        if (isSeekingRef.current || typeof event.charIndex !== 'number') return;

        const now = Date.now();
        const maxCharIndex = Math.max(segmentTextLengthRef.current - 1, 0);
        const boundedCharIndex = clamp(event.charIndex, 0, maxCharIndex);
        const previousBoundaryAt = lastBoundaryAtMsRef.current || now;
        const previousCharIndex = lastBoundaryCharIndexRef.current || 0;
        const deltaChars = boundedCharIndex - previousCharIndex;
        const deltaMs = now - previousBoundaryAt;

        if (deltaChars > 0 && deltaMs > 80) {
          const observedRate = deltaChars / (deltaMs / 1000);

          if (Number.isFinite(observedRate) && observedRate > 1 && observedRate < 60) {
            currentCharRateRef.current = currentCharRateRef.current > 0
              ? currentCharRateRef.current * 0.65 + observedRate * 0.35
              : observedRate;

            const rateAtOneX = observedRate / Math.max(playbackRateRef.current, 0.1);
            if (Number.isFinite(rateAtOneX) && rateAtOneX > 1) {
              learnedCharRateAtOneXRef.current = learnedCharRateAtOneXRef.current * 0.75 + rateAtOneX * 0.25;
            }
          }
        }

        boundarySeenRef.current = true;
        lastBoundaryAtMsRef.current = now;
        lastBoundaryCharIndexRef.current = boundedCharIndex;

        const localWordIndex = getLocalWordIndexByChar(segmentWordsRef.current, boundedCharIndex);
        const globalWordIndex = clamp(segmentStartRef.current + localWordIndex, 0, maxIndex);
        const stableWordIndex = Math.max(currentWordIndexRef.current, globalWordIndex);

        playbackBaseSecondsRef.current = getWordStartSeconds(normalizedWords[stableWordIndex], stableWordIndex);
        playbackStartMsRef.current = now;

        emitWord(stableWordIndex, { syncSeek: true });
      };

      utterance.onpause = () => {
        if (token !== utteranceTokenRef.current) return;

        const speech = window.speechSynthesis;
        const expectedPause = userPausedRef.current || pauseAfterStartRef.current;

        if (!expectedPause && speech.speaking) {
          window.setTimeout(() => {
            if (token !== utteranceTokenRef.current) return;
            if (speech.paused && speech.speaking) {
              speech.resume();
            }
          }, 60);
          return;
        }

        pausedAtMsRef.current = Date.now();
        setStatus('paused');
        onPlayStateChange?.(false);
        onPlaybackIntent?.(false);
      };

      utterance.onresume = () => {
        if (token !== utteranceTokenRef.current) return;

        if (pausedAtMsRef.current) {
          const pauseDelta = Date.now() - pausedAtMsRef.current;
          playbackStartMsRef.current += pauseDelta;
          segmentStartedAtMsRef.current += pauseDelta;

          if (lastBoundaryAtMsRef.current) {
            lastBoundaryAtMsRef.current += pauseDelta;
          }

          pausedAtMsRef.current = null;
        }

        pauseAfterStartRef.current = false;
        userPausedRef.current = false;
        setStatus('playing');
        onPlayStateChange?.(true);
        onPlaybackIntent?.(true);
      };

      utterance.onend = () => {
        if (token !== utteranceTokenRef.current) return;

        pauseAfterStartRef.current = false;

        if (segmentStartedAtMsRef.current && segmentExpectedSecondsRef.current > 0) {
          const finishedAt = Date.now();
          const elapsedSegmentSeconds = Math.max((finishedAt - segmentStartedAtMsRef.current) / 1000, 0.2);
          const nextScale = segmentExpectedSecondsRef.current / elapsedSegmentSeconds;

          if (Number.isFinite(nextScale)) {
            timelineScaleRef.current = clamp((timelineScaleRef.current * 0.75) + (nextScale * 0.25), 0.55, 1.8);
          }
        }

        if (userPausedRef.current && window.speechSynthesis.paused) {
          return;
        }

        if (!userPausedRef.current && segmentEndRef.current < maxIndex) {
          const nextIndex = segmentEndRef.current + 1;
          startSpeech(nextIndex, {
            pauseAfterStart: false,
            rateOverride: playbackRateRef.current,
          });
          return;
        }

        userPausedRef.current = false;
        emitWord(maxIndex, { syncSeek: true });
        setStatus('idle');
        onPlayStateChange?.(false);
        onPlaybackIntent?.(false);
      };

      utterance.onerror = () => {
        if (token !== utteranceTokenRef.current) return;

        pauseAfterStartRef.current = false;
        userPausedRef.current = false;
        setStatus('idle');
        setSpeechError('N\u00e3o foi poss\u00edvel reproduzir a voz autom\u00e1tica neste navegador.');
        onPlayStateChange?.(false);
        onPlaybackIntent?.(false);
      };

      window.speechSynthesis.speak(utterance);

      window.setTimeout(() => {
        if (token !== utteranceTokenRef.current) return;

        const speech = window.speechSynthesis;
        if (speech.speaking || speech.pending || userPausedRef.current) {
          return;
        }

        if (retryCount < 1) {
          startSpeech(start, {
            pauseAfterStart,
            rateOverride: utteranceRate,
            retryCount: retryCount + 1,
          });
          return;
        }

        setStatus('idle');
        onPlayStateChange?.(false);
        onPlaybackIntent?.(false);
      }, 220);

      return true;
    },
    [buildSpeechSegment, canUse, emitWord, maxIndex, normalizedWords, onPlayStateChange, onPlaybackIntent, selectedVoice, voiceRate],
  );

  const restartFromIndex = useCallback(
    (index, options = {}) => {
      const nextIndex = clamp(index, 0, maxIndex);
      const keepPaused = Boolean(options.keepPaused);
      const rateOverride = options.rateOverride;

      if (keepPaused) {
        userPausedRef.current = true;
        setStatus('paused');
        onPlayStateChange?.(false);
        onPlaybackIntent?.(false);
      }

      startSpeech(nextIndex, { pauseAfterStart: keepPaused, rateOverride });
    },
    [maxIndex, onPlayStateChange, onPlaybackIntent, startSpeech],
  );

  const handlePlay = useCallback(() => {
    if (!supported || typeof window === 'undefined') return;

    onPlaybackIntent?.(true);

    if (!canUse) {
      pendingPlayRef.current = true;
      return;
    }

    const speech = window.speechSynthesis;
    const resumeIndex = clamp(currentWordIndexRef.current, 0, maxIndex);

    if (speech.speaking || speech.paused) {
      utteranceTokenRef.current += 1;
      speech.cancel();
    }

    pendingPlayRef.current = false;
    userPausedRef.current = false;
    pauseAfterStartRef.current = false;
    setSpeechError('');

    const started = startSpeech(resumeIndex, { pauseAfterStart: false });
    if (!started) {
      setStatus('idle');
      onPlayStateChange?.(false);
      onPlaybackIntent?.(false);
    }
  }, [canUse, maxIndex, onPlayStateChange, onPlaybackIntent, startSpeech, supported]);

  const handlePause = useCallback(() => {
    if (!supported || typeof window === 'undefined') return;

    const speech = window.speechSynthesis;
    const pauseIndex = clamp(currentWordIndexRef.current, 0, maxIndex);

    onPlaybackIntent?.(false);
    userPausedRef.current = true;
    pauseAfterStartRef.current = false;
    pausedAtMsRef.current = Date.now();

    if (speech.speaking || speech.paused) {
      utteranceTokenRef.current += 1;
      speech.cancel();
    }

    setSeekWordIndex(pauseIndex);
    setStatus('paused');
    onPlayStateChange?.(false);
  }, [maxIndex, onPlayStateChange, onPlaybackIntent, supported]);

  const togglePlayback = useCallback(() => {
    const runtimeState = getRuntimePlaybackState();

    if (runtimeState === 'playing') {
      handlePause();
      return;
    }

    handlePlay();
  }, [getRuntimePlaybackState, handlePause, handlePlay]);

  const handleJump = useCallback(
    (step) => {
      const nextIndex = clamp(currentWordIndexRef.current + step, 0, maxIndex);
      setSeekWordIndex(nextIndex);
      emitWord(nextIndex);

      const runtimeState = getRuntimePlaybackState();

      if (runtimeState === 'playing') {
        restartFromIndex(nextIndex);
        return;
      }

      if (runtimeState === 'paused') {
        emitWord(nextIndex, { syncSeek: true });
      }
    },
    [emitWord, getRuntimePlaybackState, maxIndex, restartFromIndex],
  );

  const handleSeekToIndex = useCallback(
    (index) => {
      const nextIndex = clamp(index, 0, maxIndex);
      setSeekWordIndex(nextIndex);
      emitWord(nextIndex);

      const runtimeState = getRuntimePlaybackState();

      if (runtimeState === 'playing') {
        restartFromIndex(nextIndex);
        return;
      }

      if (runtimeState === 'paused') {
        emitWord(nextIndex, { syncSeek: true });
      }
    },
    [emitWord, getRuntimePlaybackState, maxIndex, restartFromIndex],
  );

  useImperativeHandle(
    ref,
    () => ({
      togglePlayPause: togglePlayback,
      play: handlePlay,
      pause: handlePause,
      stop: () => stopSpeech('idle'),
      jump: (step) => {
        const jumpStep = Number(step) || 0;
        if (jumpStep !== 0) {
          handleJump(jumpStep);
        }
      },
      seek: (index) => {
        const nextIndex = Number(index);
        if (Number.isFinite(nextIndex)) {
          handleSeekToIndex(nextIndex);
        }
      },
      getSnapshot: () => ({
        supported,
        canUse,
        isPlaying,
        isPaused,
        currentWordIndex: currentWordIndexRef.current,
        totalWords,
      }),
    }),
    [canUse, handleJump, handlePause, handlePlay, handleSeekToIndex, isPaused, isPlaying, stopSpeech, supported, togglePlayback, totalWords],
  );

  useEffect(() => {
    const hasSupport = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    setSupported(hasSupport);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const updateEnvironment = () => {
      setMobileEnvironment(isMobileReadingEnvironment());
    };

    updateEnvironment();

    window.addEventListener('resize', updateEnvironment);
    window.addEventListener('orientationchange', updateEnvironment);

    return () => {
      window.removeEventListener('resize', updateEnvironment);
      window.removeEventListener('orientationchange', updateEnvironment);
    };
  }, []);

  useEffect(() => {
    if (!supported || typeof window === 'undefined') return undefined;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  useEffect(() => {
    if (!supported || typeof window === 'undefined') return undefined;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      setAvailableVoices(voices);
    };

    updateVoices();

    const speech = window.speechSynthesis;

    if (typeof speech.addEventListener === 'function') {
      speech.addEventListener('voiceschanged', updateVoices);
      return () => speech.removeEventListener('voiceschanged', updateVoices);
    }

    speech.onvoiceschanged = updateVoices;
    return () => {
      speech.onvoiceschanged = null;
    };
  }, [supported]);

  useEffect(() => {
    activeWordIndexRef.current = activeWordIndex;
  }, [activeWordIndex]);

  useEffect(() => {
    const nextRate = clamp(Number(initialRate) || 1, 0.6, 2);
    setVoiceRate(nextRate);

    if (!isPlaying && !isPaused) {
      playbackRateRef.current = nextRate;
    }
  }, [initialRate, isPaused, isPlaying]);

  useEffect(() => {
    if (!supported) return;

    const initialIndex = typeof activeWordIndexRef.current === 'number'
      ? clamp(activeWordIndexRef.current, 0, maxIndex)
      : 0;

    stopSpeech('idle');
    setSpeechError('');
    setSeekWordIndex(initialIndex);
    currentWordIndexRef.current = initialIndex;
    setCurrentWordIndex(initialIndex);
    onWordBoundary?.(initialIndex);
  }, [maxIndex, onWordBoundary, stopSpeech, supported, text]);

  useEffect(() => {
    if (typeof activeWordIndex !== 'number') return;
    if (isSeekingRef.current) return;

    const runtimeState = getRuntimePlaybackState();
    if (runtimeState === 'playing') return;

    const bounded = clamp(activeWordIndex, 0, maxIndex);
    currentWordIndexRef.current = bounded;
    setCurrentWordIndex(bounded);
    setSeekWordIndex(bounded);
  }, [activeWordIndex, getRuntimePlaybackState, maxIndex]);

  useEffect(() => {
    if (!canUse || !pendingPlayRef.current) return;

    pendingPlayRef.current = false;
    handlePlay();
  }, [canUse, handlePlay]);

  useEffect(() => {
    if (!isPlaying || !canUse || totalWords < 2 || typeof window === 'undefined') return undefined;

    let frameId = 0;

    const tick = () => {
      const now = Date.now();

      if (!playbackStartMsRef.current) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }

      const elapsedSeconds = Math.max(0, (now - playbackStartMsRef.current) / 1000);
      const timelineSeconds = playbackBaseSecondsRef.current + elapsedSeconds * playbackRateRef.current * timelineScaleRef.current;
      const timelineIndex = findWordIndexByTimeline(normalizedWords, timelineSeconds, segmentStartRef.current);

      let nextIndex = timelineIndex;

      if (segmentWordsRef.current.length > 0 && segmentTextLengthRef.current > 0) {
        const anchorTime = lastBoundaryAtMsRef.current || playbackStartMsRef.current || now;
        const anchorChar = lastBoundaryCharIndexRef.current || 0;
        const deltaSeconds = Math.max(0, (now - anchorTime) / 1000);
        const anchorWordIndex = clamp(
          currentWordIndexRef.current,
          segmentStartRef.current,
          Math.max(segmentEndRef.current, segmentStartRef.current),
        );
        const anchorToken = normalizedWords[anchorWordIndex]?.texto || '';
        const punctuationHold = isMobileSync ? 0 : getTokenPauseHoldSeconds(anchorToken, playbackRateRef.current);
        const effectiveDeltaSeconds = Math.max(0, deltaSeconds - punctuationHold);
        const charRate = currentCharRateRef.current > 0
          ? currentCharRateRef.current
          : estimateCharRate(playbackRateRef.current, learnedCharRateAtOneXRef.current);

        const estimatedChar = clamp(
          Math.floor(anchorChar + (charRate * effectiveDeltaSeconds)),
          0,
          Math.max(segmentTextLengthRef.current - 1, 0),
        );

        const localWordIndex = getLocalWordIndexByChar(segmentWordsRef.current, estimatedChar);
        const charIndex = clamp(
          segmentStartRef.current + localWordIndex,
          segmentStartRef.current,
          Math.max(segmentEndRef.current, segmentStartRef.current),
        );

        if (boundarySeenRef.current) {
          nextIndex = charIndex;
        } else {
          const blended = Math.round((charIndex * 0.55) + (timelineIndex * 0.45));
          nextIndex = clamp(
            blended,
            segmentStartRef.current,
            Math.max(segmentEndRef.current, segmentStartRef.current),
          );
        }
      }

      if (nextIndex < currentWordIndexRef.current) {
        nextIndex = currentWordIndexRef.current;
      }

      if (nextIndex !== currentWordIndexRef.current) {
        emitWord(nextIndex, { syncSeek: true });
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [canUse, emitWord, isMobileSync, isPlaying, normalizedWords, totalWords]);

  useEffect(() => {
    if (!externalAction?.id) return;
    if (externalAction.id === lastExternalActionRef.current) return;

    lastExternalActionRef.current = externalAction.id;

    if (externalAction.type === 'toggle-play') {
      togglePlayback();
      return;
    }

    if (externalAction.type === 'stop') {
      stopSpeech('idle');
      return;
    }

    if (externalAction.type === 'jump') {
      const step = Number(externalAction.step) || 0;
      if (step !== 0) {
        handleJump(step);
      }
      return;
    }

    if (externalAction.type === 'seek') {
      const index = Number(externalAction.index);
      if (Number.isFinite(index)) {
        handleSeekToIndex(index);
      }
    }
  }, [externalAction, handleJump, handleSeekToIndex, stopSpeech, togglePlayback]);

  useEffect(() => {
    onStatusChange?.({
      supported,
      canUse,
      isPlaying,
      isPaused,
      currentWordIndex,
      totalWords,
      selectedVoiceName: selectedVoice?.name || '',
      progressPercent: totalWords > 1 ? (currentWordIndex / (totalWords - 1)) * 100 : 0,
      syncMode: isMobileSync ? 'chunk' : 'word',
      activeRange,
    });
  }, [activeRange, canUse, currentWordIndex, isMobileSync, isPaused, isPlaying, onStatusChange, selectedVoice, supported, totalWords]);

  const handleRate = (delta) => {
    setVoiceRate((previous) => {
      const next = clamp(Number((previous + delta).toFixed(1)), 0.6, 2);

      if (next !== previous) {
        onRateChange?.(next);

        const runtimeState = getRuntimePlaybackState();

        if (runtimeState === 'playing') {
          restartFromIndex(currentWordIndexRef.current, { rateOverride: next });
        } else if (runtimeState === 'paused') {
          playbackRateRef.current = next;
        } else {
          playbackRateRef.current = next;
        }
      }

      return next;
    });
  };

  const beginSeek = () => {
    isSeekingRef.current = true;
    setIsSeeking(true);
  };

  const handleSeekChange = (event) => {
    const nextIndex = Number(event.target.value);
    setSeekWordIndex(nextIndex);
    emitWord(nextIndex);
  };

  const applySeek = (force = false) => {
    if (!isSeekingRef.current && !force) return;

    isSeekingRef.current = false;
    setIsSeeking(false);

    const runtimeState = getRuntimePlaybackState();

    if (runtimeState === 'playing') {
      restartFromIndex(seekWordIndex);
      return;
    }

    if (runtimeState === 'paused') {
      emitWord(seekWordIndex, { syncSeek: true });
      return;
    }

    emitWord(seekWordIndex, { syncSeek: true });
  };

  const progressPercent = totalWords > 1 ? (currentWordIndex / (totalWords - 1)) * 100 : 0;

  if (!supported) {
    return (
      <section className='rounded-3xl border border-leiae-dark/10 bg-leiae-paper p-4 shadow-card'>
        <p className='text-sm font-semibold text-leiae-dark/80'>Leitura em voz do navegador n\u00e3o suportada neste dispositivo.</p>
      </section>
    );
  }

  const controls = (
    <>
      <div className='flex flex-wrap items-center justify-center gap-2 sm:gap-3'>
        <button
          type='button'
          onClick={() => handleJump(-8)}
          disabled={!canUse}
          className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-leiae-dark/20 bg-white text-leiae-dark transition-all duration-200 hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45 [touch-action:manipulation] sm:h-11 sm:w-11'
          aria-label='Voltar leitura'
        >
          <BackwardIcon />
        </button>

        <button
          type='button'
          onClick={togglePlayback}
          disabled={!canUse}
          className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-leiae-accent text-leiae-bg shadow transition-all duration-200 hover:bg-leiae-dark disabled:cursor-not-allowed disabled:opacity-50 [touch-action:manipulation] sm:h-14 sm:w-14'
          aria-label={isPlaying ? 'Pausar leitura autom\u00e1tica' : 'Iniciar leitura autom\u00e1tica'}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          type='button'
          onClick={() => handleJump(8)}
          disabled={!canUse}
          className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-leiae-dark/20 bg-white text-leiae-dark transition-all duration-200 hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45 [touch-action:manipulation] sm:h-11 sm:w-11'
          aria-label='Avan\u00e7ar leitura'
        >
          <ForwardIcon />
        </button>
      </div>

      <div className='mt-3 rounded-2xl border border-leiae-dark/10 bg-white/85 p-3'>
        <div className='flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-leiae-dark/75'>
          <span>Palavra {Math.min(currentWordIndex + 1, totalWords)}/{Math.max(totalWords, 1)}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>

        <input
          type='range'
          min={0}
          max={maxIndex}
          value={seekWordIndex}
          onChange={handleSeekChange}
          onMouseDown={beginSeek}
          onTouchStart={beginSeek}
          onPointerDown={beginSeek}
          onMouseUp={() => applySeek()}
          onTouchEnd={() => applySeek()}
          onPointerUp={() => applySeek()}
          onTouchCancel={() => applySeek(true)}
          onPointerCancel={() => applySeek(true)}
          onBlur={() => applySeek(true)}
          onKeyUp={(event) => {
            if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) {
              applySeek(true);
            }
          }}
          className='mt-2 w-full accent-leiae-accent'
          disabled={!canUse}
          aria-label='Barra de progresso da leitura robotizada'
        />

        <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-leiae-dark/10'>
          <div className='h-full rounded-full bg-leiae-accent transition-all duration-200' style={{ width: `${progressPercent}%` }} />
        </div>

        <div className='mt-3 flex flex-wrap items-center justify-center gap-2'>
          <button
            type='button'
            onClick={() => handleRate(-0.1)}
            disabled={voiceRate <= 0.6}
            className='rounded-full border border-leiae-dark/20 px-3 py-1.5 text-sm font-semibold text-leiae-dark transition-all duration-200 hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45 [touch-action:manipulation]'
          >
            Velocidade -
          </button>
          <button
            type='button'
            onClick={() => handleRate(0.1)}
            disabled={voiceRate >= 2}
            className='rounded-full border border-leiae-dark/20 px-3 py-1.5 text-sm font-semibold text-leiae-dark transition-all duration-200 hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45 [touch-action:manipulation]'
          >
            Velocidade +
          </button>
          <span className='rounded-full border border-leiae-dark/15 bg-leiae-bg px-3 py-1 text-xs font-semibold text-leiae-dark/80'>
            {voiceRate.toFixed(1)}x
          </span>
          {isSeeking ? (
            <span className='rounded-full bg-leiae-accent/15 px-3 py-1 text-xs font-semibold text-leiae-dark'>Ajustando posi\u00e7\u00e3o...</span>
          ) : null}
        </div>
      </div>

      {speechError ? (
        <p className='mt-2 rounded-lg bg-leiae-accent/10 px-3 py-2 text-xs font-semibold text-leiae-dark sm:text-sm'>{speechError}</p>
      ) : null}
    </>
  );

  if (compact) {
    return <div>{controls}</div>;
  }

  return (
    <section className='rounded-3xl border border-leiae-dark/10 bg-gradient-to-br from-white/95 via-leiae-paper to-[#f2ddc8] p-4 shadow-warm sm:p-5'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='font-display text-lg font-bold text-leiae-dark'>Player de leitura robotizada</h2>
          <p className='text-sm text-leiae-text/75'>Controle a leitura como em um player de \u00e1udio/v\u00eddeo</p>
        </div>

        <span className='inline-flex items-center gap-2 rounded-full border border-leiae-dark/10 bg-white/80 px-3 py-1 text-xs font-semibold text-leiae-dark/80'>
          <span className={`h-2.5 w-2.5 rounded-full ${isPlaying ? 'animate-pulseSoft bg-leiae-accent' : 'bg-leiae-dark/30'}`} aria-hidden='true' />
          {isPlaying ? 'Reproduzindo' : isPaused ? 'Pausado' : 'Pronto'}
        </span>
      </div>

      {controls}
    </section>
  );
});

export default SpeechSynthesisPlayer;
















