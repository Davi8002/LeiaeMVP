import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import AccessibilityControls from '../../components/AccessibilityControls';
import AudioPlayer from '../../components/AudioPlayer';
import Logo from '../../components/Logo';
import { getStoryById } from '../../data/stories';

export default function LeituraPage() {
  const router = useRouter();
  const { id } = router.query;

  const story = useMemo(() => (typeof id === 'string' ? getStoryById(id) : null), [id]);

  const [fontScale, setFontScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  if (!router.isReady) {
    return null;
  }

  if (!story) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-leiae-bg px-6 text-center text-leiae-dark'>
        <div>
          <p className='text-xl font-semibold'>Historia nao encontrada.</p>
          <Link href='/biblioteca' className='mt-5 inline-flex rounded-xl bg-leiae-accent px-5 py-3 font-bold text-leiae-bg'>
            Voltar para biblioteca
          </Link>
        </div>
      </main>
    );
  }

  const readingClass = highContrast
    ? 'bg-leiae-dark text-leiae-bg border-leiae-bg/30'
    : 'bg-white/80 text-leiae-text border-leiae-dark/15';

  return (
    <main className={`min-h-screen px-6 py-10 transition ${focusMode ? 'bg-[#f1dec4]' : 'bg-leiae-bg'}`}>
      <section className='mx-auto flex w-full max-w-4xl flex-col gap-5'>
        <header className='flex flex-wrap items-center justify-between gap-4'>
          <Logo onDark={highContrast} className='h-auto w-[160px]' />

          <Link
            href='/biblioteca'
            className={`rounded-lg px-4 py-2 font-bold transition ${
              highContrast
                ? 'border border-leiae-bg/40 text-leiae-bg hover:bg-leiae-bg/10'
                : 'border border-leiae-dark/20 text-leiae-dark hover:bg-white/60'
            }`}
          >
            Voltar para biblioteca
          </Link>
        </header>

        <AccessibilityControls
          fontScale={fontScale}
          setFontScale={setFontScale}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
          focusMode={focusMode}
          setFocusMode={setFocusMode}
        />

        <article className={`rounded-2xl border p-6 shadow-warm transition ${readingClass}`}>
          <p className={`mb-2 text-sm font-bold uppercase tracking-[0.2em] ${highContrast ? 'text-leiae-bg/80' : 'text-leiae-accent'}`}>
            {story.nivel} � {story.duracao}
          </p>
          <h1 className='font-display text-3xl sm:text-4xl'>{story.titulo}</h1>

          <div className='mt-6 space-y-5 leading-relaxed' style={{ fontSize: `${fontScale}rem` }}>
            {story.paragrafos.map((paragrafo, index) => (
              <p key={`${story.id}-${index}`}>{paragrafo}</p>
            ))}
          </div>
        </article>

        <AudioPlayer src={story.audio} title={story.titulo} />
      </section>
    </main>
  );
}

