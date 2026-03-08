import Head from 'next/head';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import AccessibilityControls from '../../components/AccessibilityControls';
import GuidedReadingControls from '../../components/GuidedReadingControls';
import GuidedReadingText from '../../components/GuidedReadingText';
import SpeechSynthesisPlayer from '../../components/SpeechSynthesisPlayer';
import {
  defaultReadingPreferences,
  loadReadingPreferences,
  saveReadingPreferences,
} from '../../data/readingPreferences';
import { loadReadingSession, saveReadingSession } from '../../data/readingSession';
import { getStoryById } from '../../data/stories';

function PanelToggleIcon({ collapsed }) {
  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
      {collapsed ? (
        <>
          <path d='M6 8h12M6 12h8M6 16h12' strokeLinecap='round' />
          <path d='M15 10l3 2-3 2' strokeLinecap='round' strokeLinejoin='round' />
        </>
      ) : (
        <>
          <path d='M6 8h12M6 12h8M6 16h12' strokeLinecap='round' />
          <path d='M18 10l-3 2 3 2' strokeLinecap='round' strokeLinejoin='round' />
        </>
      )}
    </svg>
  );
}

function FullscreenIcon({ active }) {
  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
      {active ? (
        <path d='M9 4H4v5M20 9V4h-5M15 20h5v-5M4 15v5h5' strokeLinecap='round' strokeLinejoin='round' />
      ) : (
        <path d='M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5' strokeLinecap='round' strokeLinejoin='round' />
      )}
    </svg>
  );
}

function ArrowIcon({ direction = 'left' }) {
  return (
    <svg viewBox='0 0 24 24' className='h-4 w-4' fill='none' stroke='currentColor' strokeWidth='2'>
      {direction === 'left' ? (
        <path d='M14 6l-6 6 6 6' strokeLinecap='round' strokeLinejoin='round' />
      ) : (
        <path d='M10 6l6 6-6 6' strokeLinecap='round' strokeLinejoin='round' />
      )}
    </svg>
  );
}

function QuickBackIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-4 w-4' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M19 6l-6 6 6 6' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M13 6l-6 6 6 6' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M5 7v10' strokeLinecap='round' />
    </svg>
  );
}

function QuickForwardIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-4 w-4' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M5 6l6 6-6 6' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M11 6l6 6-6 6' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M19 7v10' strokeLinecap='round' />
    </svg>
  );
}

function QuickPlayIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-4 w-4' fill='currentColor'>
      <path d='M8 6.8c0-1 1.1-1.6 2-1l7.8 4.8c.8.5.8 1.7 0 2.2L10 17.6c-.9.6-2 0-2-1V6.8z' />
    </svg>
  );
}

function QuickPauseIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-4 w-4' fill='currentColor'>
      <rect x='7' y='6.5' width='3.8' height='11' rx='1.2' />
      <rect x='13.2' y='6.5' width='3.8' height='11' rx='1.2' />
    </svg>
  );
}

function buildPageRanges(words) {
  if (!Array.isArray(words) || words.length === 0) {
    return [{ start: 0, end: 0 }];
  }

  const ranges = [];
  const wordsPerPage = 110;
  const minWordsPerPage = 78;
  let start = 0;

  while (start < words.length) {
    const isLastChunk = start + wordsPerPage >= words.length;
    let end = isLastChunk ? words.length - 1 : start + wordsPerPage - 1;

    if (!isLastChunk) {
      const searchStart = Math.max(start + minWordsPerPage - 1, start);
      for (let i = end; i >= searchStart; i -= 1) {
        if (/[.!?…]$/.test(words[i].texto)) {
          end = i;
          break;
        }
      }
    }

    ranges.push({ start, end });
    start = end + 1;
  }

  return ranges;
}

export default function LeituraPage() {
  const router = useRouter();
  const { id } = router.query;
  const readingSurfaceRef = useRef(null);
  const speechActionIdRef = useRef(0);

  const story = useMemo(() => (typeof id === 'string' ? getStoryById(id) : null), [id]);

  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [fontScale, setFontScale] = useState(defaultReadingPreferences.fontScale);
  const [highContrast, setHighContrast] = useState(defaultReadingPreferences.highContrast);
  const [focusMode, setFocusMode] = useState(defaultReadingPreferences.focusMode);
  const [voiceMode, setVoiceMode] = useState(defaultReadingPreferences.voiceMode);
  const [voiceRate, setVoiceRate] = useState(defaultReadingPreferences.voiceRate);

  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [guidedPlaying, setGuidedPlaying] = useState(false);
  const [guidedSpeed, setGuidedSpeed] = useState(defaultReadingPreferences.guidedSpeed);
  const [guidedWordIndex, setGuidedWordIndex] = useState(0);

  const [speechPlaying, setSpeechPlaying] = useState(false);
  const [speechAction, setSpeechAction] = useState(null);
  const [speechStatus, setSpeechStatus] = useState({
    supported: true,
    canUse: false,
    isPlaying: false,
    isPaused: false,
    currentWordIndex: 0,
    totalWords: 0,
    progressPercent: 0,
  });

  const totalWords = story?.palavras?.length ?? 1;
  const pageTitle = story ? `${story.titulo} | LeiaÊ` : 'Leitura | LeiaÊ';

  const roboticVoiceActive = voiceMode === 'robotic';
  const showSidePanel = !controlsCollapsed;

  const speechSyncActive = roboticVoiceActive && speechPlaying && (story?.palavras?.length ?? 0) > 0;

  const canIncreaseSpeed = guidedSpeed < 3;
  const canDecreaseSpeed = guidedSpeed > 0.5;

  const syncLabel = speechSyncActive
    ? 'Sincronizado com voz robotizada'
    : 'Modo visual independente';

  const pageRanges = useMemo(() => buildPageRanges(story?.palavras), [story]);

  const currentPageIndex = useMemo(() => {
    if (!pageRanges.length) return 0;

    const index = pageRanges.findIndex((range) => guidedWordIndex >= range.start && guidedWordIndex <= range.end);
    if (index === -1) return pageRanges.length - 1;
    return index;
  }, [guidedWordIndex, pageRanges]);

  const currentPageRange = pageRanges[currentPageIndex] || pageRanges[0];

  const dispatchSpeechAction = useCallback((type, payload = {}) => {
    speechActionIdRef.current += 1;
    setSpeechAction({
      id: speechActionIdRef.current,
      type,
      ...payload,
    });
  }, []);

  useEffect(() => {
    const preferences = loadReadingPreferences();

    setFontScale(preferences.fontScale);
    setHighContrast(preferences.highContrast);
    setFocusMode(preferences.focusMode);
    setVoiceMode(preferences.voiceMode);
    setVoiceRate(preferences.voiceRate);
    setGuidedSpeed(preferences.guidedSpeed);
    setPreferencesLoaded(true);
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;

    saveReadingPreferences({
      fontScale,
      highContrast,
      focusMode,
      voiceMode,
      voiceRate,
      guidedSpeed,
    });
  }, [preferencesLoaded, fontScale, highContrast, focusMode, voiceMode, voiceRate, guidedSpeed]);

  useEffect(() => {
    if (!story || !router.isReady) return;

    const queryWord = Number(router.query.w);
    let initialWordIndex = 0;

    if (Number.isFinite(queryWord) && queryWord >= 0) {
      initialWordIndex = Math.floor(queryWord);
    } else {
      const session = loadReadingSession();
      if (session?.storyId === story.id) {
        initialWordIndex = session.wordIndex;
      }
    }

    const maxWordIndex = Math.max((story.palavras?.length ?? 1) - 1, 0);

    setControlsCollapsed(false);
    setGuidedPlaying(false);
    setGuidedWordIndex(Math.min(initialWordIndex, maxWordIndex));
    setSpeechPlaying(false);
  }, [story, router.isReady, router.query.w]);

  useEffect(() => {
    if (!story) return;

    const timer = setTimeout(() => {
      saveReadingSession({
        storyId: story.id,
        wordIndex: guidedWordIndex,
      });
    }, 240);

    return () => clearTimeout(timer);
  }, [guidedWordIndex, story]);

  useEffect(() => {
    if (roboticVoiceActive) return;
    setSpeechPlaying(false);
  }, [roboticVoiceActive]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (typeof document === 'undefined') return;

    try {
      if (!document.fullscreenElement) {
        await readingSurfaceRef.current?.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (_error) {
      // Ignora erro de permissão/ambiente.
    }
  };

  useEffect(() => {
    if (!guidedPlaying || speechSyncActive || totalWords <= 1) return undefined;

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
  }, [guidedPlaying, guidedSpeed, speechSyncActive, totalWords]);

  useEffect(() => {
    if (!guidedPlaying || speechSyncActive) return;

    if (guidedWordIndex >= totalWords - 1) {
      setGuidedPlaying(false);
    }
  }, [guidedPlaying, guidedWordIndex, speechSyncActive, totalWords]);

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

  const quickDisabled = !roboticVoiceActive || !speechStatus.canUse;

  const handleQuickJump = (step) => {
    if (quickDisabled) return;
    dispatchSpeechAction('jump', { step });
  };

  const handleQuickToggle = () => {
    if (quickDisabled) return;
    dispatchSpeechAction('toggle-play');
  };

  const navigatePage = (delta) => {
    if (!pageRanges.length) return;

    const nextPage = Math.max(0, Math.min(pageRanges.length - 1, currentPageIndex + delta));
    const targetIndex = pageRanges[nextPage].start;

    setGuidedWordIndex(targetIndex);

    if (roboticVoiceActive) {
      dispatchSpeechAction('seek', { index: targetIndex });
    }
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
        readingHref={`/livro/${story.id}?w=${guidedWordIndex}`}
        maxWidthClass='max-w-[430px] sm:max-w-[700px] md:max-w-5xl lg:max-w-6xl'
      >
        <section ref={readingSurfaceRef} className={`rounded-3xl p-3 transition sm:p-4 ${pageTone}`}>
          <div className={`grid gap-4 ${showSidePanel ? 'lg:grid-cols-[300px,1fr]' : ''}`}>
            {showSidePanel ? (
              <aside className='space-y-4'>
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
              </aside>
            ) : null}

            <article className={`rounded-2xl border p-5 transition sm:p-6 ${readingCardTone} ${focusMode ? 'ring-2 ring-leiae-accent/25' : ''}`}>
              <div className='sticky top-2 z-20 mb-4 flex justify-end'>
                <div className='rounded-full border border-leiae-dark/10 bg-leiae-paper/95 px-2 py-1 shadow-sm backdrop-blur'>
                  <div className='flex flex-wrap items-center gap-1 text-[11px] font-semibold text-leiae-dark sm:text-xs'>
                    <span className='rounded-full bg-leiae-accent/10 px-2 py-1'>Leitura</span>
                    <button
                      type='button'
                      onClick={() => handleQuickJump(-3)}
                      disabled={quickDisabled}
                      className='inline-flex h-7 w-7 items-center justify-center rounded-full border border-leiae-dark/20 bg-white transition hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45'
                      aria-label='Voltar 3 palavras'
                      title='Voltar 3 palavras'
                    >
                      <QuickBackIcon />
                    </button>
                    <button
                      type='button'
                      onClick={handleQuickToggle}
                      disabled={quickDisabled}
                      className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-leiae-accent text-leiae-bg transition hover:bg-leiae-dark disabled:cursor-not-allowed disabled:opacity-45'
                      aria-label={speechStatus.isPlaying ? 'Pausar leitura' : 'Retomar leitura'}
                      title={speechStatus.isPlaying ? 'Pausar leitura' : 'Retomar leitura'}
                    >
                      {speechStatus.isPlaying ? <QuickPauseIcon /> : <QuickPlayIcon />}
                    </button>
                    <button
                      type='button'
                      onClick={() => handleQuickJump(3)}
                      disabled={quickDisabled}
                      className='inline-flex h-7 w-7 items-center justify-center rounded-full border border-leiae-dark/20 bg-white transition hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45'
                      aria-label='Avançar 3 palavras'
                      title='Avançar 3 palavras'
                    >
                      <QuickForwardIcon />
                    </button>
                  </div>
                </div>
              </div>

              <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
                <h2 className={`font-display text-2xl ${highContrast ? 'text-leiae-bg' : 'text-leiae-dark'}`}>Leitura</h2>
                <span className='rounded-full border border-leiae-dark/15 bg-leiae-paper/70 px-3 py-1 text-xs font-semibold text-leiae-dark/70'>
                  {syncLabel}
                </span>
              </div>

              <GuidedReadingText
                story={story}
                activeWordIndex={guidedWordIndex}
                fontScale={fontScale}
                highContrast={highContrast}
                visibleRange={currentPageRange}
              />

              <div className='mt-8 border-t border-leiae-dark/10 pt-4'>
                <div className='flex items-center justify-center gap-3'>
                  <button
                    type='button'
                    onClick={() => navigatePage(-1)}
                    disabled={currentPageIndex <= 0}
                    className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-leiae-dark/20 bg-white text-leiae-dark transition hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45'
                    aria-label='Página anterior'
                  >
                    <ArrowIcon direction='left' />
                  </button>

                  <span className='rounded-full bg-leiae-dark/10 px-3 py-1 text-xs font-semibold text-leiae-dark/75'>
                    Página {currentPageIndex + 1}/{pageRanges.length}
                  </span>

                  <button
                    type='button'
                    onClick={() => navigatePage(1)}
                    disabled={currentPageIndex >= pageRanges.length - 1}
                    className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-leiae-dark/20 bg-white text-leiae-dark transition hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45'
                    aria-label='Próxima página'
                  >
                    <ArrowIcon direction='right' />
                  </button>
                </div>
              </div>
            </article>
          </div>

          <section className='sticky bottom-2 z-30 mt-4 rounded-2xl border border-leiae-dark/15 bg-leiae-paper/95 p-3 shadow-warm backdrop-blur sm:p-4'>
            <div className='grid grid-cols-[auto,1fr,auto] items-start gap-3'>
              <button
                type='button'
                onClick={() => setControlsCollapsed((previous) => !previous)}
                className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-leiae-dark/20 bg-white text-leiae-dark transition hover:bg-leiae-bg'
                aria-label={showSidePanel ? 'Recolher painel lateral' : 'Expandir painel lateral'}
              >
                <PanelToggleIcon collapsed={!showSidePanel} />
              </button>

              <div className='min-w-0 space-y-2'>
                <div className='flex flex-wrap items-center justify-center gap-2 text-xs font-semibold sm:justify-between'>
                  <span className='rounded-full bg-leiae-dark/10 px-2.5 py-1 text-leiae-dark/75'>Leitura organizada</span>
                  <span className='rounded-full bg-leiae-accent/10 px-2.5 py-1 text-leiae-dark/80'>Texto sempre visível</span>
                  <button
                    type='button'
                    onClick={() => setFocusMode((previous) => !previous)}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                      focusMode
                        ? 'bg-leiae-accent text-leiae-bg'
                        : 'border border-leiae-dark/20 bg-white text-leiae-dark hover:bg-leiae-bg'
                    }`}
                  >
                    {focusMode ? 'Foco ativo' : 'Modo foco'}
                  </button>
                </div>

                <div className='flex flex-wrap items-center justify-center gap-2'>
                  <button
                    type='button'
                    onClick={() => setVoiceMode('robotic')}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      roboticVoiceActive
                        ? 'bg-leiae-accent text-leiae-bg'
                        : 'border border-leiae-dark/20 bg-white text-leiae-dark hover:bg-leiae-bg'
                    }`}
                  >
                    Robotizada
                  </button>

                  <button
                    type='button'
                    disabled
                    className='rounded-full border border-leiae-dark/20 bg-white/70 px-3 py-1.5 text-xs font-semibold text-leiae-dark/65'
                  >
                    Humanizada (em breve)
                  </button>
                </div>

                {roboticVoiceActive ? (
                  <SpeechSynthesisPlayer
                    text={story.textoNarracao}
                    words={story.palavras}
                    activeWordIndex={guidedWordIndex}
                    initialRate={voiceRate}
                    onWordBoundary={setGuidedWordIndex}
                    onPlayStateChange={setSpeechPlaying}
                    onRateChange={setVoiceRate}
                    onStatusChange={setSpeechStatus}
                    externalAction={speechAction}
                    compact
                  />
                ) : (
                  <div className='rounded-2xl border border-leiae-dark/10 bg-white/80 px-3 py-2 text-center text-xs font-semibold text-leiae-dark/75'>
                    Leitura humanizada ainda não disponível.
                  </div>
                )}
              </div>

              <button
                type='button'
                onClick={toggleFullscreen}
                className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-leiae-dark/20 bg-white text-leiae-dark transition hover:bg-leiae-bg'
                aria-label={isFullscreen ? 'Sair da tela cheia' : 'Ativar tela cheia'}
              >
                <FullscreenIcon active={isFullscreen} />
              </button>
            </div>
          </section>
        </section>
      </AppShell>
    </>
  );
}


