import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import {
  defaultReadingPreferences,
  loadReadingPreferences,
  normalizeReadingPreferences,
  saveReadingPreferences,
} from '../data/readingPreferences';

function Toggle({ label, value, onToggle }) {
  return (
    <button
      type='button'
      onClick={onToggle}
      aria-pressed={value}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
        value
          ? 'bg-leiae-accent text-leiae-bg shadow'
          : 'border border-leiae-dark/20 bg-white text-leiae-dark hover:bg-leiae-bg'
      }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${value ? 'bg-leiae-bg' : 'bg-leiae-dark/30'}`}
        aria-hidden='true'
      />
      {label}
    </button>
  );
}

export default function AjustesPage() {
  const [loaded, setLoaded] = useState(false);
  const [fontScale, setFontScale] = useState(defaultReadingPreferences.fontScale);
  const [highContrast, setHighContrast] = useState(defaultReadingPreferences.highContrast);
  const [focusMode, setFocusMode] = useState(defaultReadingPreferences.focusMode);
  const [voiceMode, setVoiceMode] = useState(defaultReadingPreferences.voiceMode);
  const [voiceRate, setVoiceRate] = useState(defaultReadingPreferences.voiceRate);
  const [guidedSpeed, setGuidedSpeed] = useState(defaultReadingPreferences.guidedSpeed);
  const [savedNotice, setSavedNotice] = useState('');

  useEffect(() => {
    const preferences = loadReadingPreferences();

    setFontScale(preferences.fontScale);
    setHighContrast(preferences.highContrast);
    setFocusMode(preferences.focusMode);
    setVoiceMode(preferences.voiceMode);
    setVoiceRate(preferences.voiceRate);
    setGuidedSpeed(preferences.guidedSpeed);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const preferences = normalizeReadingPreferences({
      fontScale,
      highContrast,
      focusMode,
      voiceMode,
      voiceRate,
      guidedSpeed,
    });

    saveReadingPreferences(preferences);
    setSavedNotice('Preferências salvas automaticamente no navegador.');

    const timer = setTimeout(() => {
      setSavedNotice('');
    }, 1600);

    return () => clearTimeout(timer);
  }, [loaded, fontScale, highContrast, focusMode, voiceMode, voiceRate, guidedSpeed]);

  const previewTone = highContrast ? 'bg-leiae-dark text-leiae-bg border-leiae-bg/20' : 'bg-white text-leiae-text border-leiae-dark/10';
  const previewTextSize = useMemo(() => ({ fontSize: `${fontScale}rem` }), [fontScale]);

  const resetPreferences = () => {
    const defaults = defaultReadingPreferences;

    setFontScale(defaults.fontScale);
    setHighContrast(defaults.highContrast);
    setFocusMode(defaults.focusMode);
    setVoiceMode(defaults.voiceMode);
    setVoiceRate(defaults.voiceRate);
    setGuidedSpeed(defaults.guidedSpeed);
  };

  return (
    <>
      <Head>
        <meta charSet='UTF-8' />
        <title>Ajustes | LeiaÊ</title>
        <meta name='description' content='Ajustes de leitura do LeiaÊ com preferências padrão salvas no navegador.' />
      </Head>

      <AppShell
        title='LeiaÊ'
        subtitle='Ajustes de leitura'
        activeTab='config'
        darkHeader
        readingHref='/biblioteca'
        maxWidthClass='max-w-[430px] sm:max-w-[700px] md:max-w-5xl lg:max-w-6xl'
      >
        <section className='grid gap-4 lg:grid-cols-[1fr,1fr]'>
          <article className='space-y-4 rounded-3xl border border-leiae-dark/10 bg-leiae-paper p-4 shadow-card sm:p-5'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <h1 className='font-display text-2xl font-bold text-leiae-dark sm:text-3xl'>Ajustes padrão</h1>
              <button
                type='button'
                onClick={resetPreferences}
                className='rounded-full border border-leiae-dark/20 px-3 py-1.5 text-xs font-semibold text-leiae-dark transition hover:bg-leiae-bg'
              >
                Restaurar padrão
              </button>
            </div>

            <section className='rounded-2xl border border-leiae-dark/10 bg-white/75 p-4'>
              <p className='text-sm font-semibold text-leiae-dark'>Tamanho padrão da fonte</p>
              <input
                type='range'
                min={0.9}
                max={1.8}
                step={0.1}
                value={fontScale}
                onChange={(event) => setFontScale(Number(event.target.value))}
                className='mt-3 w-full accent-leiae-accent'
                aria-label='Tamanho padrão da fonte'
              />
              <p className='mt-2 text-xs font-semibold text-leiae-dark/75'>{Math.round(fontScale * 100)}%</p>
            </section>

            <section className='rounded-2xl border border-leiae-dark/10 bg-white/75 p-4'>
              <p className='text-sm font-semibold text-leiae-dark'>Preferências visuais padrão</p>
              <div className='mt-3 flex flex-wrap gap-2'>
                <Toggle label='Alto contraste' value={highContrast} onToggle={() => setHighContrast((previous) => !previous)} />
                <Toggle label='Modo foco' value={focusMode} onToggle={() => setFocusMode((previous) => !previous)} />
              </div>
            </section>

            <section className='rounded-2xl border border-leiae-dark/10 bg-white/75 p-4'>
              <p className='text-sm font-semibold text-leiae-dark'>Modo de voz padrão</p>
              <div className='mt-3 grid gap-2 sm:grid-cols-2'>
                <label className='rounded-xl border border-leiae-accent bg-leiae-accent/10 px-3 py-3 text-sm transition'>
                  <input
                    type='radio'
                    name='default-voice-mode'
                    value='robotic'
                    checked={voiceMode === 'robotic'}
                    onChange={() => setVoiceMode('robotic')}
                    className='mr-2 accent-leiae-accent'
                  />
                  Robotizada
                </label>

                <div className='rounded-xl border border-leiae-dark/10 bg-leiae-paper/70 px-3 py-3 text-sm text-leiae-dark/60'>
                  Humanizada (em breve)
                </div>
              </div>
            </section>

            <section className='rounded-2xl border border-leiae-dark/10 bg-white/75 p-4'>
              <p className='text-sm font-semibold text-leiae-dark'>Velocidade padrão da voz robotizada</p>
              <input
                type='range'
                min={0.6}
                max={2}
                step={0.1}
                value={voiceRate}
                onChange={(event) => setVoiceRate(Number(event.target.value))}
                className='mt-3 w-full accent-leiae-accent'
                aria-label='Velocidade padrão da voz robotizada'
              />
              <p className='mt-2 text-xs font-semibold text-leiae-dark/75'>{voiceRate.toFixed(1)}x</p>
            </section>

            <section className='rounded-2xl border border-leiae-dark/10 bg-white/75 p-4'>
              <p className='text-sm font-semibold text-leiae-dark'>Velocidade inicial da leitura guiada</p>
              <input
                type='range'
                min={0.5}
                max={3}
                step={0.25}
                value={guidedSpeed}
                onChange={(event) => setGuidedSpeed(Number(event.target.value))}
                className='mt-3 w-full accent-leiae-accent'
                aria-label='Velocidade padrão da leitura guiada'
              />
              <p className='mt-2 text-xs font-semibold text-leiae-dark/75'>{guidedSpeed.toFixed(2)}x</p>
            </section>
          </article>

          <aside className='space-y-4 rounded-3xl border border-leiae-dark/10 bg-leiae-paper p-4 shadow-card sm:p-5'>
            <h2 className='font-display text-xl font-bold text-leiae-dark'>Prévia da leitura</h2>
            <p className='text-sm text-leiae-dark/75'>Estas preferências serão aplicadas automaticamente na tela de leitura.</p>

            <div className={`rounded-2xl border p-4 transition ${previewTone} ${focusMode ? 'ring-2 ring-leiae-accent/30' : ''}`} style={previewTextSize}>
              <p>
                Maria abriu o livro e leu no próprio ritmo. Com ajustes de fonte, contraste e foco, a leitura ficou
                confortável e acolhedora.
              </p>
            </div>

            <div className='rounded-2xl border border-leiae-dark/10 bg-white/70 p-4 text-sm text-leiae-dark/80'>
              <p>Modo de voz padrão: <strong>Robotizada</strong></p>
              <p className='mt-1'>Velocidade da voz: <strong>{voiceRate.toFixed(1)}x</strong></p>
              <p className='mt-1'>Leitura guiada: <strong>{guidedSpeed.toFixed(2)}x</strong></p>
            </div>

            {savedNotice ? <p className='text-xs font-semibold text-leiae-accent'>{savedNotice}</p> : null}
          </aside>
        </section>
      </AppShell>
    </>
  );
}



