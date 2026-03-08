import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function buildFallbackWords(text) {
  const tokens = text.match(/\S+/g) || [];
  return tokens.map((token, index) => ({
    indice: index,
    texto: token,
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

function ResumeIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M9 6v12l8-6-8-6z' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M5.5 7.5V16.5' strokeLinecap='round' />
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M4 12a8 8 0 1 0 2.3-5.7' strokeLinecap='round' />
      <path d='M4 4v4.5h4.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

export default function SpeechSynthesisPlayer({
  text,
  words,
  activeWordIndex,
  onWordBoundary,
  onPlayStateChange,
}) {
  const utteranceRef = useRef(null);
  const segmentWordsRef = useRef([]);
  const segmentStartRef = useRef(0);
  const pendingRateRestartRef = useRef(false);

  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState('idle');
  const [voiceRate, setVoiceRate] = useState(1);
  const [selectedWordIndex, setSelectedWordIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [speechError, setSpeechError] = useState('');

  const normalizedWords = useMemo(() => {
    if (Array.isArray(words) && words.length > 0) {
      return words.map((word, index) => ({
        indice: typeof word.indice === 'number' ? word.indice : index,
        texto: word?.texto || '',
      }));
    }

    return buildFallbackWords(text || '');
  }, [text, words]);

  const totalWords = normalizedWords.length;
  const maxIndex = Math.max(totalWords - 1, 0);
  const canUse = supported && Boolean(text?.trim()) && totalWords > 0;
  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';

  const emitWord = useCallback(
    (index) => {
      const bounded = clamp(index, 0, maxIndex);
      setCurrentWordIndex(bounded);
      onWordBoundary?.(bounded);
    },
    [maxIndex, onWordBoundary],
  );

  const buildSpeechSegment = useCallback(
    (startIndex) => {
      const start = clamp(startIndex, 0, maxIndex);
      const segment = normalizedWords.slice(start);
      let speechText = '';

      const mappedWords = segment.map((word, localIndex) => {
        if (speechText.length > 0) {
          speechText += ' ';
        }

        const charInicio = speechText.length;
        speechText += word.texto;
        const charFim = speechText.length;

        return {
          localIndex,
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

      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      segmentWordsRef.current = [];
      setStatus(nextStatus);
      onPlayStateChange?.(false);
    },
    [onPlayStateChange, supported],
  );

  const speakFrom = useCallback(
    (targetIndex) => {
      if (!canUse) return;

      const { start, speechText, mappedWords } = buildSpeechSegment(targetIndex);
      if (!speechText) return;

      window.speechSynthesis.cancel();
      segmentStartRef.current = start;
      segmentWordsRef.current = mappedWords;
      setSelectedWordIndex(start);
      setSpeechError('');
      emitWord(start);

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = 'pt-BR';
      utterance.pitch = 1;
      utterance.rate = voiceRate;

      utterance.onstart = () => {
        setStatus('playing');
        onPlayStateChange?.(true);
      };

      utterance.onboundary = (event) => {
        if (typeof event.charIndex !== 'number') return;
        const localWordIndex = getLocalWordIndexByChar(segmentWordsRef.current, event.charIndex);
        const globalWordIndex = clamp(segmentStartRef.current + localWordIndex, 0, maxIndex);
        emitWord(globalWordIndex);
      };

      utterance.onpause = () => {
        setStatus('paused');
        onPlayStateChange?.(false);
      };

      utterance.onresume = () => {
        setStatus('playing');
        onPlayStateChange?.(true);
      };

      utterance.onend = () => {
        emitWord(maxIndex);
        setStatus('idle');
        onPlayStateChange?.(false);
      };

      utterance.onerror = () => {
        setStatus('idle');
        setSpeechError('Não foi possível reproduzir a voz automática neste navegador.');
        onPlayStateChange?.(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [buildSpeechSegment, canUse, emitWord, maxIndex, onPlayStateChange, voiceRate],
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
    if (!supported) return;

    stopSpeech('idle');
    setVoiceRate(1);
    setSpeechError('');
    setSelectedWordIndex(0);
    setCurrentWordIndex(0);
    onWordBoundary?.(0);
  }, [onWordBoundary, stopSpeech, supported, text]);

  useEffect(() => {
    if (typeof activeWordIndex !== 'number') return;
    setCurrentWordIndex(clamp(activeWordIndex, 0, maxIndex));
  }, [activeWordIndex, maxIndex]);

  useEffect(() => {
    if (!pendingRateRestartRef.current) return;

    pendingRateRestartRef.current = false;
    if (isPlaying) {
      speakFrom(currentWordIndex);
    }
  }, [currentWordIndex, isPlaying, speakFrom, voiceRate]);

  const handlePause = () => {
    if (!supported || !canUse) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  };

  const handleContinue = () => {
    if (!supported || !canUse) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };

  const handleRestart = () => {
    setSelectedWordIndex(0);
    speakFrom(0);
  };

  const handleJump = (step) => {
    const nextIndex = clamp(currentWordIndex + step, 0, maxIndex);
    setSelectedWordIndex(nextIndex);
    speakFrom(nextIndex);
  };

  const handleRate = (delta) => {
    setVoiceRate((previous) => {
      const next = clamp(Number((previous + delta).toFixed(1)), 0.6, 2);
      if (next !== previous && isPlaying) {
        pendingRateRestartRef.current = true;
      }
      return next;
    });
  };

  const handleSeekApply = () => {
    if (isPlaying || isPaused) {
      speakFrom(selectedWordIndex);
      return;
    }

    emitWord(selectedWordIndex);
  };

  const progressPercent = totalWords > 1 ? (currentWordIndex / (totalWords - 1)) * 100 : 0;
  const seekPercent = totalWords > 1 ? (selectedWordIndex / (totalWords - 1)) * 100 : 0;

  if (!supported) {
    return (
      <section className='rounded-3xl border border-leiae-dark/10 bg-leiae-paper p-4 shadow-card'>
        <p className='text-sm font-semibold text-leiae-dark/80'>Leitura em voz do navegador não suportada neste dispositivo.</p>
      </section>
    );
  }

  return (
    <section className='rounded-3xl border border-leiae-dark/10 bg-gradient-to-br from-white/95 via-leiae-paper to-[#f2ddc8] p-4 shadow-warm sm:p-5'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='font-display text-lg font-bold text-leiae-dark'>Leitura automática (voz)</h2>
          <p className='text-sm text-leiae-text/75'>Narração com sincronização palavra por palavra</p>
        </div>

        <span className='inline-flex items-center gap-2 rounded-full border border-leiae-dark/10 bg-white/75 px-3 py-1 text-xs font-semibold text-leiae-dark/80'>
          <span className={`h-2.5 w-2.5 rounded-full ${isPlaying ? 'animate-pulseSoft bg-leiae-accent' : 'bg-leiae-dark/30'}`} aria-hidden='true' />
          {isPlaying ? 'Leitura ativa' : isPaused ? 'Pausado' : 'Pronto'}
        </span>
      </div>

      <div className='mt-4 rounded-2xl border border-leiae-dark/10 bg-white/75 p-3'>
        <div className='h-2 w-full overflow-hidden rounded-full bg-leiae-dark/15'>
          <div className='h-full rounded-full bg-leiae-accent transition-all duration-150' style={{ width: `${progressPercent}%` }} />
        </div>
        <div className='mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-leiae-dark/70'>
          <span>Progresso: {Math.min(currentWordIndex + 1, totalWords)}/{Math.max(totalWords, 1)} palavras</span>
          <span>Velocidade: {voiceRate.toFixed(1)}x</span>
        </div>
      </div>

      <div className='mt-4 grid gap-2 sm:grid-cols-2'>
        <button
          type='button'
          onClick={() => speakFrom(selectedWordIndex)}
          disabled={!canUse}
          className='inline-flex items-center justify-center gap-2 rounded-full bg-leiae-accent px-4 py-2.5 text-sm font-bold text-leiae-bg transition hover:bg-leiae-dark disabled:cursor-not-allowed disabled:opacity-50'
        >
          <PlayIcon />
          Iniciar
        </button>

        <button
          type='button'
          onClick={handlePause}
          disabled={!canUse || !isPlaying}
          className='inline-flex items-center justify-center gap-2 rounded-full border border-leiae-dark/25 bg-white px-4 py-2.5 text-sm font-bold text-leiae-dark transition hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45'
        >
          <PauseIcon />
          Pausar
        </button>

        <button
          type='button'
          onClick={handleContinue}
          disabled={!canUse || !isPaused}
          className='inline-flex items-center justify-center gap-2 rounded-full border border-leiae-dark/25 bg-white px-4 py-2.5 text-sm font-bold text-leiae-dark transition hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45'
        >
          <ResumeIcon />
          Continuar
        </button>

        <button
          type='button'
          onClick={handleRestart}
          disabled={!canUse}
          className='inline-flex items-center justify-center gap-2 rounded-full border border-leiae-dark/25 bg-white px-4 py-2.5 text-sm font-bold text-leiae-dark transition hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45'
        >
          <RestartIcon />
          Reiniciar
        </button>
      </div>

      <div className='mt-4 grid gap-3 rounded-2xl border border-leiae-dark/10 bg-white/75 p-3'>
        <label className='text-sm font-semibold text-leiae-dark'>Começar de um ponto específico</label>
        <input
          type='range'
          min={0}
          max={maxIndex}
          value={selectedWordIndex}
          onChange={(event) => setSelectedWordIndex(Number(event.target.value))}
          className='w-full accent-leiae-accent'
          disabled={!canUse}
          aria-label='Selecionar palavra para iniciar a leitura'
        />

        <div className='h-1.5 w-full overflow-hidden rounded-full bg-leiae-dark/10'>
          <div className='h-full rounded-full bg-leiae-accent/60 transition-all duration-150' style={{ width: `${seekPercent}%` }} />
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <button
            type='button'
            onClick={() => handleJump(-10)}
            disabled={!canUse}
            className='rounded-full border border-leiae-dark/20 px-3 py-2 text-sm font-semibold text-leiae-dark transition hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45'
          >
            Voltar 10 palavras
          </button>
          <button
            type='button'
            onClick={() => handleJump(10)}
            disabled={!canUse}
            className='rounded-full border border-leiae-dark/20 px-3 py-2 text-sm font-semibold text-leiae-dark transition hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45'
          >
            Avançar 10 palavras
          </button>
          <button
            type='button'
            onClick={handleSeekApply}
            disabled={!canUse}
            className='rounded-full bg-leiae-dark px-3 py-2 text-sm font-semibold text-leiae-bg transition hover:bg-leiae-accent disabled:cursor-not-allowed disabled:opacity-45'
          >
            Ir para ponto
          </button>
        </div>
      </div>

      <div className='mt-4 flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={() => handleRate(-0.1)}
          disabled={voiceRate <= 0.6}
          className='rounded-full border border-leiae-dark/20 px-3 py-2 text-sm font-semibold text-leiae-dark transition hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45'
        >
          Velocidade -
        </button>
        <button
          type='button'
          onClick={() => handleRate(0.1)}
          disabled={voiceRate >= 2}
          className='rounded-full border border-leiae-dark/20 px-3 py-2 text-sm font-semibold text-leiae-dark transition hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45'
        >
          Velocidade +
        </button>
      </div>

      {speechError ? (
        <p className='mt-3 rounded-lg bg-leiae-accent/10 px-3 py-2 text-sm font-semibold text-leiae-dark'>{speechError}</p>
      ) : null}
    </section>
  );
}
