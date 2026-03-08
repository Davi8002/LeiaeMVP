import { useEffect, useMemo, useRef, useState } from 'react';

function getWordIndexByChar(words, charIndex) {
  if (!words?.length) return 0;

  for (let i = 0; i < words.length; i += 1) {
    if (charIndex < words[i].charFim) {
      return words[i].indice;
    }
  }

  return words[words.length - 1].indice;
}

export default function SpeechSynthesisPlayer({
  text,
  words,
  onWordBoundary,
  onPlayStateChange,
}) {
  const utteranceRef = useRef(null);
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

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

    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setSpeaking(false);
    setPaused(false);
    onPlayStateChange?.(false);
  }, [onPlayStateChange, supported, text]);

  const canUse = useMemo(() => supported && Boolean(text?.trim()), [supported, text]);

  const playSpeech = () => {
    if (!canUse) return;

    if (paused && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      setSpeaking(true);
      onPlayStateChange?.(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setSpeaking(true);
      setPaused(false);
      onPlayStateChange?.(true);
      onWordBoundary?.(0);
    };

    utterance.onboundary = (event) => {
      if (typeof event.charIndex !== 'number') return;
      const index = getWordIndexByChar(words, event.charIndex);
      onWordBoundary?.(index);
    };

    utterance.onpause = () => {
      setSpeaking(false);
      setPaused(true);
      onPlayStateChange?.(false);
    };

    utterance.onresume = () => {
      setSpeaking(true);
      setPaused(false);
      onPlayStateChange?.(true);
    };

    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
      onPlayStateChange?.(false);
    };

    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
      onPlayStateChange?.(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    if (!canUse) return;

    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setSpeaking(false);
      setPaused(true);
      onPlayStateChange?.(false);
    }
  };

  if (!supported) {
    return (
      <section className='rounded-2xl border border-leiae-dark/10 bg-leiae-paper p-4 shadow-card'>
        <p className='text-sm font-semibold text-leiae-dark/80'>Leitura em voz do navegador não suportada neste dispositivo.</p>
      </section>
    );
  }

  return (
    <section className='rounded-2xl border border-leiae-dark/10 bg-leiae-paper p-4 shadow-card'>
      <div className='flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={playSpeech}
          className='rounded-full bg-leiae-accent px-4 py-2 text-sm font-bold text-leiae-bg transition hover:bg-leiae-dark'
        >
          {paused ? 'Continuar voz automática' : 'Reproduzir voz automática'}
        </button>

        <button
          type='button'
          onClick={pauseSpeech}
          className='rounded-full border border-leiae-dark/20 px-4 py-2 text-sm font-bold text-leiae-dark transition hover:bg-leiae-bg'
        >
          Pausar voz
        </button>
      </div>

      <p className='mt-3 text-sm font-semibold text-leiae-dark/75'>
        {speaking ? 'Lendo com voz do navegador' : paused ? 'Voz pausada' : 'Pronto para leitura automática'}
      </p>
    </section>
  );
}
