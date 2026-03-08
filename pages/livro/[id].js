import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import AccessibilityControls from '../../components/AccessibilityControls';
import AudioPlayer from '../../components/AudioPlayer';
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

  const pageTone = highContrast ? 'bg-[#1d1009] text-leiae-bg' : focusMode ? 'bg-[#f0dfca]' : 'bg-leiae-paper';
  const metaCardTone = highContrast
    ? 'border-leiae-bg/25 bg-[#3a1f12] text-leiae-bg'
    : 'border-leiae-dark/10 bg-leiae-paper/95 text-leiae-dark';
  const readingCardTone = highContrast
    ? 'border-leiae-bg/25 bg-leiae-dark text-leiae-bg shadow-none'
    : 'border-leiae-dark/10 bg-white/90 text-leiae-text shadow-card';

  return (
    <AppShell
      title="Leia\u00CA"
      subtitle="Modo leitura"
      activeTab='leitura'
      darkHeader
      showTopNav={false}
      backHref='/biblioteca'
      readingHref={`/livro/${story.id}`}
    >
      <section className={`space-y-4 rounded-3xl p-3 transition ${pageTone}`}>
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

        <article className={`rounded-2xl border p-5 transition ${readingCardTone}`}>
          <h2 className={`font-display text-2xl ${highContrast ? 'text-leiae-bg' : 'text-leiae-dark'}`}>Leitura</h2>
          <div className='mt-4 space-y-5 leading-relaxed' style={{ fontSize: `${fontScale}rem` }}>
            {story.paragrafos.map((paragrafo, index) => (
              <p key={`${story.id}-${index}`}>{paragrafo}</p>
            ))}
          </div>
        </article>

        <AudioPlayer src={story.audio} title={story.titulo} />
      </section>
    </AppShell>
  );
}


