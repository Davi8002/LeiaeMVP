import Head from 'next/head';
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

export default function BibliotecaPage() {
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
                readOnly
                placeholder='Buscar história, autor ou nível'
                className='w-full bg-transparent text-sm outline-none'
                aria-label='Campo de busca visual'
              />
            </label>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5'>
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      </AppShell>
    </>
  );
}
