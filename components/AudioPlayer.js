import { useEffect, useRef, useState } from 'react';

export default function AudioPlayer({ src, title }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => setPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnd);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch (_error) {
        setPlaying(false);
      }
    } else {
      audio.pause();
    }
  };

  return (
    <section className='rounded-2xl border border-leiae-dark/15 bg-white/80 p-4 shadow-warm'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h2 className='font-display text-xl text-leiae-dark'>Leitura em audio</h2>
        <span className='inline-flex items-center gap-2 text-sm font-semibold text-leiae-dark/80'>
          <span
            className={`h-2.5 w-2.5 rounded-full ${playing ? 'animate-pulseSoft bg-leiae-accent' : 'bg-leiae-dark/30'}`}
            aria-hidden='true'
          />
          {playing ? 'Tocando' : 'Pausado'}
        </span>
      </div>

      <button
        type='button'
        onClick={togglePlay}
        className='mt-4 rounded-xl bg-leiae-accent px-5 py-3 font-bold text-leiae-bg transition hover:bg-leiae-dark'
      >
        {playing ? 'Pausar' : 'Reproduzir'}
      </button>

      <audio ref={audioRef} src={src} preload='metadata' className='mt-4 w-full' controls aria-label={`Audio da historia ${title}`} />
    </section>
  );
}
