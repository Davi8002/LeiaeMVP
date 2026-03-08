import Link from 'next/link';

export default function StoryCard({ story }) {
  return (
    <article className='rounded-2xl border border-leiae-dark/10 bg-white/80 p-6 shadow-warm transition hover:-translate-y-1'>
      <div className='mb-3 flex items-center justify-between gap-3 text-sm'>
        <span className='rounded-full bg-leiae-accent/10 px-3 py-1 font-semibold text-leiae-accent'>
          {story.nivel}
        </span>
        <span className='font-semibold text-leiae-dark/70'>{story.duracao}</span>
      </div>

      <h2 className='font-display text-2xl text-leiae-dark'>{story.titulo}</h2>
      <p className='mt-3 text-leiae-text'>{story.descricao}</p>

      <Link
        href={`/livro/${story.id}`}
        className='mt-6 inline-flex rounded-xl bg-leiae-accent px-5 py-3 font-bold text-leiae-bg transition hover:bg-leiae-dark'
      >
        Ler agora
      </Link>
    </article>
  );
}
