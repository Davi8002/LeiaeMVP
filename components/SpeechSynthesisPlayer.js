import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

function pickVoiceByGender(voices, voiceGender) {
  if (!voices.length) return null;

  const normalizedGender = voiceGender === 'male' ? 'male' : 'female';
  const preferredLocales = voices.filter((voice) => /^pt(-|$)/i.test(voice.lang || ''));
  const candidates = preferredLocales.length ? preferredLocales : voices;

  const maleKeywords = ['male', 'mascul', 'homem', 'man', 'paulo', 'joao', 'carlos', 'daniel', 'ricardo', 'mateus'];
  const femaleKeywords = ['female', 'femin', 'mulher', 'woman', 'ana', 'maria', 'sofia', 'beatriz', 'clara', 'helena'];
  const positiveKeywords = normalizedGender === 'male' ? maleKeywords : femaleKeywords;
  const negativeKeywords = normalizedGender === 'male' ? femaleKeywords : maleKeywords;

  let bestVoice = candidates[0] || null;
  let bestScore = Number.NEGATIVE_INFINITY;

  candidates.forEach((voice) => {
    const normalizedName = normalizeString(voice.name);
    const normalizedLang = normalizeString(voice.lang);

    let score = 0;

    if (normalizedLang.startsWith('pt-br')) {
      score += 4;
    } else if (normalizedLang.startsWith('pt')) {
      score += 2;
    }

    if (voice.localService) {
      score += 0.4;
    }

    positiveKeywords.forEach((keyword) => {
      if (normalizedName.includes(keyword)) {
        score += 2;
      }
    });

    negativeKeywords.forEach((keyword) => {
      if (normalizedName.includes(keyword)) {
        score -= 2;
      }
    });

    if (score > bestScore) {
      bestScore = score;
      bestVoice = voice;
    }
  });

  return bestVoice;
}

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

export default function SpeechSynthesisPlayer({
  text,
  words,
  activeWordIndex,
  initialRate = 1,
  voiceGender = 'female',
  onWordBoundary,
  onPlayStateChange,
  onRateChange,
  onStatusChange,
  externalAction,
  compact = false,
}) {
  const utteranceTokenRef = useRef(0);
  const segmentWordsRef = useRef([]);
  const segmentStartRef = useRef(0);
  const isSeekingRef = useRef(false);
  const pauseAfterStartRef = useRef(false);
  const lastExternalActionRef = useRef(null);
  const playbackStartMsRef = useRef(0);
  const playbackBaseSecondsRef = useRef(0);
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

  const buildSpeechSegment = useCallback(
    (startIndex) => {
      const start = clamp(startIndex, 0, maxIndex);
      const segment = normalizedWords.slice(start);
      let speechText = '';

      const mappedWords = segment.map((word) => {
        if (speechText.length > 0) {
          speechText += ' ';
        }

        const charInicio = speechText.length;
        speechText += word.texto;
        const charFim = speechText.length;

        return {
          charInicio,
          charFim,
        };
      });

      return {
        start,
        speechText,
        mappedWords,
      };
    },
    [maxIndex, normalizedWords],
  );

  const stopSpeech = useCallback(
    (nextStatus = 'idle') => {
      if (!supported) return;

      utteranceTokenRef.current += 1;
      window.speechSynthesis.cancel();
      segmentWordsRef.current = [];
      pauseAfterStartRef.current = false;
      pausedAtMsRef.current = null;
      playbackStartMsRef.current = 0;
      playbackBaseSecondsRef.current = 0;
      boundarySeenRef.current = false;
      lastBoundaryAtMsRef.current = 0;

      setStatus(nextStatus);
      onPlayStateChange?.(false);
    },
    [onPlayStateChange, supported],
  );

  const speakFrom = useCallback(
    (targetIndex, rateOverride) => {
      if (!canUse) return;

      const { start, speechText, mappedWords } = buildSpeechSegment(targetIndex);
      if (!speechText) return;

      const token = utteranceTokenRef.current + 1;
      utteranceTokenRef.current = token;
      window.speechSynthesis.cancel();

      segmentStartRef.current = start;
      segmentWordsRef.current = mappedWords;
      setSeekWordIndex(start);
      setSpeechError('');
      emitWord(start);

      playbackStartMsRef.current = Date.now();
      playbackBaseSecondsRef.current = getWordStartSeconds(normalizedWords[start], start);
      pausedAtMsRef.current = null;
      boundarySeenRef.current = false;
      lastBoundaryAtMsRef.current = 0;

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.pitch = 1;
      utterance.rate = typeof rateOverride === 'number' ? rateOverride : voiceRate;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang || 'pt-BR';
      } else {
        utterance.lang = 'pt-BR';
      }

      utterance.onstart = () => {
        if (token !== utteranceTokenRef.current) return;

        if (pauseAfterStartRef.current) {
          pauseAfterStartRef.current = false;
          setStatus('paused');
          onPlayStateChange?.(false);
          window.speechSynthesis.pause();
          return;
        }

        setStatus('playing');
        onPlayStateChange?.(true);
      };

      utterance.onboundary = (event) => {
        if (token !== utteranceTokenRef.current) return;
        if (isSeekingRef.current || typeof event.charIndex !== 'number') return;

        boundarySeenRef.current = true;
        lastBoundaryAtMsRef.current = Date.now();

        const localWordIndex = getLocalWordIndexByChar(segmentWordsRef.current, event.charIndex);
        const globalWordIndex = clamp(segmentStartRef.current + localWordIndex, 0, maxIndex);

        playbackBaseSecondsRef.current = getWordStartSeconds(normalizedWords[globalWordIndex], globalWordIndex);
        playbackStartMsRef.current = Date.now();

        emitWord(globalWordIndex, { syncSeek: true });
      };

      utterance.onpause = () => {
        if (token !== utteranceTokenRef.current) return;
        pausedAtMsRef.current = Date.now();
        setStatus('paused');
        onPlayStateChange?.(false);
      };

      utterance.onresume = () => {
        if (token !== utteranceTokenRef.current) return;

        if (pausedAtMsRef.current) {
          playbackStartMsRef.current += Date.now() - pausedAtMsRef.current;
          pausedAtMsRef.current = null;
        }

        setStatus('playing');
        onPlayStateChange?.(true);
      };

      utterance.onend = () => {
        if (token !== utteranceTokenRef.current) return;
        emitWord(maxIndex, { syncSeek: true });
        setStatus('idle');
        onPlayStateChange?.(false);
      };

      utterance.onerror = () => {
        if (token !== utteranceTokenRef.current) return;
        setStatus('idle');
        setSpeechError('Não foi possível reproduzir a voz automática neste navegador.');
        onPlayStateChange?.(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [buildSpeechSegment, canUse, emitWord, maxIndex, normalizedWords, onPlayStateChange, selectedVoice, voiceRate],
  );

  useEffect(() => {
    const hasSupport = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    setSupported(hasSupport);
  }, []);

  useEffect(() => {
    if (!supported) return undefined;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  useEffect(() => {
    if (!supported) return undefined;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      setAvailableVoices(voices);
    };

    updateVoices();

    const speechSynthesis = window.speechSynthesis;
    if (typeof speechSynthesis.addEventListener === 'function') {
      speechSynthesis.addEventListener('voiceschanged', updateVoices);
      return () => speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    }

    speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [supported]);

  useEffect(() => {
    activeWordIndexRef.current = activeWordIndex;
  }, [activeWordIndex]);

  useEffect(() => {
    const nextRate = clamp(Number(initialRate) || 1, 0.6, 2);
    setVoiceRate(nextRate);
  }, [initialRate]);

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

    const bounded = clamp(activeWordIndex, 0, maxIndex);
    currentWordIndexRef.current = bounded;
    setCurrentWordIndex(bounded);

    if (!isPlaying) {
      setSeekWordIndex(bounded);
    }
  }, [activeWordIndex, isPlaying, maxIndex]);

  useEffect(() => {
    if (!isPlaying || !canUse || totalWords < 2) return undefined;

    const timer = window.setInterval(() => {
      const now = Date.now();

      if (boundarySeenRef.current && now - lastBoundaryAtMsRef.current < 900) {
        return;
      }

      if (!playbackStartMsRef.current) {
        return;
      }

      const elapsedSeconds = (now - playbackStartMsRef.current) / 1000;
      const timelineSeconds = playbackBaseSecondsRef.current + elapsedSeconds * voiceRate;
      const nextIndex = findWordIndexByTimeline(normalizedWords, timelineSeconds, segmentStartRef.current);

      if (nextIndex !== currentWordIndexRef.current) {
        emitWord(nextIndex, { syncSeek: true });
      }
    }, 120);

    return () => {
      window.clearInterval(timer);
    };
  }, [canUse, emitWord, isPlaying, normalizedWords, totalWords, voiceRate]);

  const handlePlay = useCallback(() => {
    if (!supported || !canUse) return;

    if (window.speechSynthesis.paused) {
      setStatus('playing');
      onPlayStateChange?.(true);
      window.speechSynthesis.resume();
      return;
    }

    setStatus('playing');
    onPlayStateChange?.(true);
    speakFrom(seekWordIndex);
  }, [canUse, onPlayStateChange, seekWordIndex, speakFrom, supported]);

  const handlePause = useCallback(() => {
    if (!supported || !canUse) return;

    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      setStatus('paused');
      onPlayStateChange?.(false);
      window.speechSynthesis.pause();

      if (typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(() => {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
          }
        });
      }
      return;
    }

    // Se o áudio ainda está iniciando, pausar assim que começar.
    pauseAfterStartRef.current = true;
    setStatus('paused');
    onPlayStateChange?.(false);
  }, [canUse, onPlayStateChange, supported]);

  const restartFromIndex = useCallback(
    (index, options = {}) => {
      const nextIndex = clamp(index, 0, maxIndex);
      const keepPaused = Boolean(options.keepPaused);
      const rateOverride = options.rateOverride;

      if (keepPaused) {
        pauseAfterStartRef.current = true;
        setStatus('paused');
        onPlayStateChange?.(false);
      }

      speakFrom(nextIndex, rateOverride);
    },
    [maxIndex, onPlayStateChange, speakFrom],
  );

  const handleJump = useCallback(
    (step) => {
      const nextIndex = clamp(currentWordIndexRef.current + step, 0, maxIndex);
      setSeekWordIndex(nextIndex);
      emitWord(nextIndex);

      if (isPlaying) {
        restartFromIndex(nextIndex);
        return;
      }

      if (isPaused) {
        restartFromIndex(nextIndex, { keepPaused: true });
      }
    },
    [emitWord, isPaused, isPlaying, maxIndex, restartFromIndex],
  );

  const handleSeekToIndex = useCallback(
    (index) => {
      const nextIndex = clamp(index, 0, maxIndex);
      setSeekWordIndex(nextIndex);
      emitWord(nextIndex);

      if (isPlaying) {
        restartFromIndex(nextIndex);
        return;
      }

      if (isPaused) {
        restartFromIndex(nextIndex, { keepPaused: true });
      }
    },
    [emitWord, isPaused, isPlaying, maxIndex, restartFromIndex],
  );

  useEffect(() => {
    if (!externalAction?.id) return;
    if (externalAction.id === lastExternalActionRef.current) return;

    lastExternalActionRef.current = externalAction.id;

    if (externalAction.type === 'toggle-play') {
      if (isPlaying) {
        handlePause();
      } else {
        handlePlay();
      }
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
  }, [externalAction, handleJump, handlePause, handlePlay, handleSeekToIndex, isPlaying]);

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
    });
  }, [canUse, currentWordIndex, isPaused, isPlaying, onStatusChange, selectedVoice, supported, totalWords]);

  const handleRate = (delta) => {
    setVoiceRate((previous) => {
      const next = clamp(Number((previous + delta).toFixed(1)), 0.6, 2);

      if (next !== previous) {
        onRateChange?.(next);

        if (isPlaying) {
          restartFromIndex(currentWordIndexRef.current, { rateOverride: next });
        } else if (isPaused) {
          restartFromIndex(currentWordIndexRef.current, { keepPaused: true, rateOverride: next });
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

    if (isPlaying) {
      restartFromIndex(seekWordIndex);
      return;
    }

    if (isPaused) {
      restartFromIndex(seekWordIndex, { keepPaused: true });
      return;
    }

    emitWord(seekWordIndex, { syncSeek: true });
  };

  const progressPercent = totalWords > 1 ? (currentWordIndex / (totalWords - 1)) * 100 : 0;

  if (!supported) {
    return (
      <section className='rounded-3xl border border-leiae-dark/10 bg-leiae-paper p-4 shadow-card'>
        <p className='text-sm font-semibold text-leiae-dark/80'>Leitura em voz do navegador não suportada neste dispositivo.</p>
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
          className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-leiae-dark/20 bg-white text-leiae-dark transition-all duration-200 hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45 sm:h-11 sm:w-11'
          aria-label='Voltar leitura'
        >
          <BackwardIcon />
        </button>

        <button
          type='button'
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={!canUse}
          className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-leiae-accent text-leiae-bg shadow transition-all duration-200 hover:bg-leiae-dark disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:w-14'
          aria-label={isPlaying ? 'Pausar leitura automática' : 'Iniciar leitura automática'}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          type='button'
          onClick={() => handleJump(8)}
          disabled={!canUse}
          className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-leiae-dark/20 bg-white text-leiae-dark transition-all duration-200 hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45 sm:h-11 sm:w-11'
          aria-label='Avançar leitura'
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
          onMouseUp={() => applySeek()}
          onTouchEnd={() => applySeek()}
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
            className='rounded-full border border-leiae-dark/20 px-3 py-1.5 text-sm font-semibold text-leiae-dark transition-all duration-200 hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45'
          >
            Velocidade -
          </button>
          <button
            type='button'
            onClick={() => handleRate(0.1)}
            disabled={voiceRate >= 2}
            className='rounded-full border border-leiae-dark/20 px-3 py-1.5 text-sm font-semibold text-leiae-dark transition-all duration-200 hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45'
          >
            Velocidade +
          </button>
          <span className='rounded-full border border-leiae-dark/15 bg-leiae-bg px-3 py-1 text-xs font-semibold text-leiae-dark/80'>
            {voiceRate.toFixed(1)}x
          </span>
          {isSeeking ? (
            <span className='rounded-full bg-leiae-accent/15 px-3 py-1 text-xs font-semibold text-leiae-dark'>Ajustando posição...</span>
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
          <p className='text-sm text-leiae-text/75'>Controle a leitura como em um player de áudio/vídeo</p>
        </div>

        <span className='inline-flex items-center gap-2 rounded-full border border-leiae-dark/10 bg-white/80 px-3 py-1 text-xs font-semibold text-leiae-dark/80'>
          <span className={`h-2.5 w-2.5 rounded-full ${isPlaying ? 'animate-pulseSoft bg-leiae-accent' : 'bg-leiae-dark/30'}`} aria-hidden='true' />
          {isPlaying ? 'Reproduzindo' : isPaused ? 'Pausado' : 'Pronto'}
        </span>
      </div>

      {controls}
    </section>
  );
}

