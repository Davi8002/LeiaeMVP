import Link from 'next/link';
import Logo from '../components/Logo';
import StoryCard from '../components/StoryCard';
import { stories } from '../data/stories';

export default function BibliotecaPage() {
  return (
    <main className='min-h-screen bg-leiae-bg px-6 py-10 text-leiae-text'>
      <section className='mx-auto w-full max-w-6xl'>
        <header className='mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <div>
            <Logo className='h-auto w-[160px] sm:w-[190px]' />
            <h1 className='mt-4 font-display text-4xl text-leiae-dark'>Biblioteca</h1>
            <p className='mt-2 max-w-2xl text-lg'>
              Escolha uma historia curta e leia no seu ritmo, com apoio de recursos de acessibilidade.
            </p>
          </div>

          <Link href='/' className='rounded-lg border border-leiae-dark/20 px-4 py-2 font-bold text-leiae-dark hover:bg-white/70'>
            Voltar ao inicio
          </Link>
        </header>

        <div className='grid gap-5 md:grid-cols-2'>
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>
    </main>
  );
}
