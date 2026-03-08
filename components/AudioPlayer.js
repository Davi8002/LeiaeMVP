import { useEffect, useMemo, useRef, useState } from 'react';

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

function PlayIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-6 w-6' fill='currentColor'>
      <path d='M8 6.8c0-1 1.1-1.6 2-1l7.8 4.8c.8.5.8 1.7 0 2.2L10 17.6c-.9.6-2 0-2-1V6.8z' />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-6 w-6' fill='currentColor'>
      <rect x='7' y='6.5' width='3.8' height='11' rx='1.2' />
      <rect x='13.2' y='6.5' width='3.8' height='11' rx='1.2' />
    </svg>
  );
}

export default function AudioPlayer({ src, title }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onError = () => setAudioError(true);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
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

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  return (
    <section className='rounded-2xl border border-leiae-dark/10 bg-leiae-paper p-4 shadow-card'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h2 className='font-display text-lg font-bold text-leiae-dark'>Leitura em audio</h2>
          <p className='text-sm text-leiae-text/75'>Ouvir: {title}</p>
        </div>

        <span className='inline-flex items-center gap-2 text-xs font-semibold text-leiae-dark/70'>
          <span
            className={`h-2.5 w-2.5 rounded-full ${playing ? 'animate-pulseSoft bg-leiae-accent' : 'bg-leiae-dark/30'}`}
            aria-hidden='true'
          />
          {playing ? 'Tocando' : 'Pausado'}
        </span>
      </div>

      <div className='mt-4 flex items-center gap-3'>
        <button
          type='button'
          onClick={togglePlay}
          className='inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-leiae-accent text-leiae-bg shadow hover:bg-leiae-dark'
          aria-label={playing ? 'Pausar audio' : 'Reproduzir audio'}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className='w-full'>
          <div className='h-2 w-full overflow-hidden rounded-full bg-leiae-dark/15'>
            <div className='h-full rounded-full bg-leiae-accent transition-all' style={{ width: `${progress}%` }} />
          </div>
          <div className='mt-2 flex items-center justify-between text-xs font-semibold text-leiae-dark/70'>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {audioError ? (
        <p className='mt-3 rounded-lg bg-leiae-accent/10 px-3 py-2 text-xs font-semibold text-leiae-dark'>
          Nao foi possivel tocar este audio. Verifique se o arquivo MP3 local existe.
        </p>
      ) : null}

      <audio ref={audioRef} src={src} preload='metadata' className='sr-only' aria-label={`Audio da historia ${title}`} />
    </section>
  );
}
