import Head from 'next/head';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import AccessibilityControls from '../../components/AccessibilityControls';
import AudioPlayer from '../../components/AudioPlayer';
import GuidedReadingControls from '../../components/GuidedReadingControls';
import GuidedReadingText from '../../components/GuidedReadingText';
import SpeechSynthesisPlayer from '../../components/SpeechSynthesisPlayer';
import { getStoryById } from '../../data/stories';

function getWordIndexByTime(words, time) {
  if (!words?.length) return 0;

  const foundIndex = words.findIndex((word, index) => {
    const nextStart = words[index + 1]?.inicio;
    if (typeof nextStart === 'number') {
      return time >= word.inicio && time < nextStart;
    }

    return time >= word.inicio && time <= word.fim + 0.35;
  });

  if (foundIndex === -1) {
    return words.length - 1;
  }

  return foundIndex;
}

export default function LeituraPage() {
  const router = useRouter();
  const { id } = router.query;

  const story = useMemo(() => (typeof id === 'string' ? getStoryById(id) : null), [id]);

  const [fontScale, setFontScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const [guidedPlaying, setGuidedPlaying] = useState(false);
  const [guidedSpeed, setGuidedSpeed] = useState(1);
  const [guidedWordIndex, setGuidedWordIndex] = useState(0);

  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const [speechPlaying, setSpeechPlaying] = useState(false);

  const totalWords = story?.palavras?.length ?? 1;
  const pageTitle = story ? `${story.titulo} | LeiaÊ` : 'Leitura | LeiaÊ';

  const audioSyncActive = audioPlaying && audioDuration > 0 && (story?.palavras?.length ?? 0) > 0;
  const speechSyncActive = speechPlaying && (story?.palavras?.length ?? 0) > 0;

  const canIncreaseSpeed = guidedSpeed < 3;
  const canDecreaseSpeed = guidedSpeed > 0.5;

  const syncLabel = speechSyncActive
    ? 'Sincronizado com voz automática'
    : audioSyncActive
      ? 'Sincronizado com áudio'
      : 'Modo visual independente';

  useEffect(() => {
    if (!story) return;

    setGuidedPlaying(false);
    setGuidedSpeed(1);
    setGuidedWordIndex(0);
    setAudioCurrentTime(0);
    setAudioDuration(0);
    setAudioPlaying(false);
    setSpeechPlaying(false);
  }, [story]);

  const syncFromAudio = useCallback(
    (time) => {
      if (!story?.palavras?.length) return;
      const nextIndex = getWordIndexByTime(story.palavras, time);
      setGuidedWordIndex(nextIndex);
    },
    [story],
  );

  useEffect(() => {
    if (!audioSyncActive || speechSyncActive) return;

    syncFromAudio(audioCurrentTime);
  }, [audioCurrentTime, audioSyncActive, speechSyncActive, syncFromAudio]);

  useEffect(() => {
    if (!guidedPlaying || audioSyncActive || speechSyncActive || totalWords <= 1) return undefined;

    const intervalMs = Math.max(110, Math.round(450 / guidedSpeed));

    const timer = setInterval(() => {
      setGuidedWordIndex((previous) => {
        if (previous >= totalWords - 1) {
          return previous;
        }

        return previous + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [audioSyncActive, guidedPlaying, guidedSpeed, speechSyncActive, totalWords]);

  useEffect(() => {
    if (!guidedPlaying || audioSyncActive || speechSyncActive) return;

    if (guidedWordIndex >= totalWords - 1) {
      setGuidedPlaying(false);
    }
  }, [audioSyncActive, guidedPlaying, guidedWordIndex, speechSyncActive, totalWords]);

  const toggleGuided = () => {
    if (guidedPlaying) {
      setGuidedPlaying(false);
      return;
    }

    if (guidedWordIndex >= totalWords - 1) {
      setGuidedWordIndex(0);
    }

    setGuidedPlaying(true);
  };

  const increaseSpeed = () => {
    setGuidedSpeed((previous) => Number(Math.min(3, previous + 0.25).toFixed(2)));
  };

  const decreaseSpeed = () => {
    setGuidedSpeed((previous) => Number(Math.max(0.5, previous - 0.25).toFixed(2)));
  };

  if (!router.isReady) {
    return null;
  }

  if (!story) {
    return (
      <>
        <Head>
          <meta charSet='UTF-8' />
          <title>Leitura | LeiaÊ</title>
          <meta name='description' content='Tela de leitura acessível do LeiaÊ.' />
        </Head>

        <main className='flex min-h-screen items-center justify-center bg-leiae-bg px-6 text-center text-leiae-dark'>
          <div>
            <p className='text-xl font-semibold'>História não encontrada.</p>
            <Link href='/biblioteca' className='mt-5 inline-flex rounded-xl bg-leiae-accent px-5 py-3 font-bold text-leiae-bg'>
              Voltar para biblioteca
            </Link>
          </div>
        </main>
      </>
    );
  }

  const pageTone = highContrast ? 'bg-[#1d1009] text-leiae-bg' : focusMode ? 'bg-[#f0dfca]' : 'bg-leiae-paper';
  const metaCardTone = highContrast
    ? 'border-leiae-bg/25 bg-[#3a1f12] text-leiae-bg'
    : 'border-leiae-dark/10 bg-leiae-paper/95 text-leiae-dark';
  const readingCardTone = highContrast
    ? 'border-leiae-bg/25 bg-leiae-dark text-leiae-bg shadow-none'
    : 'border-leiae-dark/10 bg-white/90 text-leiae-text shadow-card';
  const focusReadingClass = focusMode ? 'mx-auto max-w-3xl ring-2 ring-leiae-accent/25' : '';

  return (
    <>
      <Head>
        <meta charSet='UTF-8' />
        <title>{pageTitle}</title>
        <meta name='description' content={`Leitura da história ${story.titulo} no LeiaÊ.`} />
      </Head>

      <AppShell
        title='LeiaÊ'
        subtitle='Modo leitura'
        activeTab='leitura'
        darkHeader
        showTopNav={false}
        backHref='/biblioteca'
        readingHref={`/livro/${story.id}`}
        maxWidthClass='max-w-[430px] sm:max-w-[700px] md:max-w-5xl lg:max-w-6xl'
      >
        <section className={`rounded-3xl p-3 transition sm:p-4 ${pageTone}`}>
          <div className='grid gap-4 lg:grid-cols-[320px,1fr] xl:grid-cols-[340px,1fr]'>
            <div className='space-y-4'>
              <div className={`rounded-2xl border p-4 ${metaCardTone}`}>
                <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${highContrast ? 'text-leiae-bg/75' : 'text-leiae-dark/60'}`}>
                  {story.nivel} | {story.duracao}
                </p>
                <h1 className={`mt-1 font-display text-3xl font-bold ${highContrast ? 'text-leiae-bg' : 'text-leiae-dark'}`}>
                  {story.titulo}
                </h1>
                <p className={`text-sm ${highContrast ? 'text-leiae-bg/85' : 'text-leiae-text/80'}`}>{story.autor}</p>
              </div>

              <AccessibilityControls
                fontScale={fontScale}
                setFontScale={setFontScale}
                highContrast={highContrast}
                setHighContrast={setHighContrast}
                focusMode={focusMode}
                setFocusMode={setFocusMode}
              />

              <GuidedReadingControls
                guidedPlaying={guidedPlaying}
                onToggleGuided={toggleGuided}
                guidedSpeed={guidedSpeed}
                onIncreaseSpeed={increaseSpeed}
                onDecreaseSpeed={decreaseSpeed}
                canIncreaseSpeed={canIncreaseSpeed}
                canDecreaseSpeed={canDecreaseSpeed}
                syncLabel={syncLabel}
                activeWordIndex={guidedWordIndex}
                totalWords={totalWords}
              />

              <AudioPlayer
                src={story.audio}
                title={story.titulo}
                onTimeUpdate={setAudioCurrentTime}
                onPlayStateChange={setAudioPlaying}
                onDurationChange={setAudioDuration}
              />

              <SpeechSynthesisPlayer
                text={story.textoNarracao}
                words={story.palavras}
                activeWordIndex={guidedWordIndex}
                onWordBoundary={setGuidedWordIndex}
                onPlayStateChange={setSpeechPlaying}
              />
            </div>

            <article className={`rounded-2xl border p-5 transition sm:p-6 ${readingCardTone} ${focusReadingClass}`}>
              <h2 className={`font-display text-2xl ${highContrast ? 'text-leiae-bg' : 'text-leiae-dark'}`}>Leitura</h2>

              <GuidedReadingText
                story={story}
                activeWordIndex={guidedWordIndex}
                fontScale={fontScale}
                highContrast={highContrast}
              />
            </article>
          </div>
        </section>
      </AppShell>
    </>
  );
}

