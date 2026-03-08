import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

function CoverPlaceholder() {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#f3dac3] via-[#efcfb2] to-[#f7ede1] p-4 text-center text-leiae-dark'>
      <span className='rounded-full border border-leiae-dark/20 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]'>
        Capa em breve
      </span>
      <p className='mt-3 text-sm font-semibold text-leiae-dark/80'>Espaço reservado para capa</p>
    </div>
  );
}

export default function StoryCard({ story }) {
  const [coverError, setCoverError] = useState(false);

  return (
    <article className='group overflow-hidden rounded-[1.35rem] border border-leiae-dark/10 bg-leiae-paper shadow-card transition hover:-translate-y-1 hover:shadow-warm'>
      <div className='relative aspect-[5/4] overflow-hidden border-b border-leiae-dark/10'>
        {!coverError && story.cover ? (
          <Image
            src={story.cover}
            alt={`Capa de ${story.titulo}`}
            fill
            className='object-cover transition duration-300 group-hover:scale-105'
            sizes='(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw'
            onError={() => setCoverError(true)}
          />
        ) : (
          <CoverPlaceholder />
        )}

        <div className='absolute left-3 top-3 rounded-full bg-leiae-accent px-3 py-1 text-xs font-bold text-leiae-bg shadow'>
          {story.nivel}
        </div>
      </div>

      <div className='p-4'>
        <div className='mb-2 inline-flex rounded-full bg-leiae-dark/10 px-3 py-1 text-xs font-semibold text-leiae-dark/80'>
          {story.duracao} de leitura
        </div>

        <h2 className='font-display text-2xl leading-tight text-leiae-dark'>{story.titulo}</h2>
        <p className='mt-2 text-sm text-leiae-text/90'>{story.descricao}</p>

        <Link
          href={`/livro/${story.id}`}
          className='mt-4 inline-flex items-center rounded-full bg-leiae-accent px-5 py-2.5 text-sm font-bold text-leiae-bg transition hover:bg-leiae-dark'
        >
          Ler agora
        </Link>
      </div>
    </article>
  );
}
