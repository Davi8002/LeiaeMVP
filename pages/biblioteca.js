import Head from 'next/head';
import { useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import StoryCard from '../components/StoryCard';
import { stories } from '../data/stories';

function SearchIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
      <circle cx='11' cy='11' r='7' />
      <path d='M20 20l-3.5-3.5' strokeLinecap='round' />
    </svg>
  );
}

function normalizeText(value) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function BibliotecaPage() {
  const [search, setSearch] = useState('');

  const filteredStories = useMemo(() => {
    const normalizedSearch = normalizeText(search.trim());
    if (!normalizedSearch) return stories;

    return stories.filter((story) => {
      const title = normalizeText(story.titulo);
      const description = normalizeText(story.descricao);
      return title.includes(normalizedSearch) || description.includes(normalizedSearch);
    });
  }, [search]);

  return (
    <>
      <Head>
        <meta charSet='UTF-8' />
        <title>Biblioteca | LeiaÊ</title>
        <meta name='description' content='Biblioteca de histórias do LeiaÊ com leitura acessível e áudio local.' />
      </Head>

      <AppShell
        title='LeiaÊ'
        subtitle='Biblioteca de histórias'
        activeTab='biblioteca'
        darkHeader
        maxWidthClass='max-w-[430px] sm:max-w-[700px] md:max-w-5xl lg:max-w-6xl'
        readingHref='/biblioteca'
      >
        <section className='space-y-5'>
          <div className='rounded-2xl border border-leiae-dark/10 bg-leiae-paper p-4 shadow-card sm:p-5'>
            <p className='text-sm font-semibold uppercase tracking-[0.12em] text-leiae-dark/65'>Biblioteca</p>
            <h1 className='mt-1 font-display text-3xl font-bold text-leiae-dark'>Escolha sua próxima leitura</h1>

            <label className='mt-4 flex items-center gap-2 rounded-xl border border-leiae-dark/10 bg-white/70 px-3 py-2 text-leiae-dark/70'>
              <SearchIcon />
              <input
                type='text'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder='Buscar título ou descrição'
                className='w-full bg-transparent text-sm outline-none'
                aria-label='Buscar histórias'
              />
            </label>
          </div>

          {filteredStories.length > 0 ? (
            <div className='grid auto-rows-fr grid-cols-2 items-stretch gap-2.5 sm:gap-4 lg:grid-cols-3 xl:gap-5'>
              {filteredStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className='rounded-2xl border border-leiae-dark/10 bg-leiae-paper p-6 text-center shadow-card'>
              <p className='text-lg font-semibold text-leiae-dark'>Nenhum livro encontrado.</p>
              <p className='mt-2 text-sm text-leiae-text/80'>Tente buscar por outras palavras do título ou da descrição.</p>
            </div>
          )}
        </section>
      </AppShell>
    </>
  );
}
