import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

function CoverPlaceholder() {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#f3dac3] via-[#efcfb2] to-[#f7ede1] p-3 text-center text-leiae-dark'>
      <span className='rounded-full border border-leiae-dark/20 bg-white/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] sm:px-3 sm:text-xs'>
        Capa em breve
      </span>
      <p className='mt-2 text-[11px] font-semibold text-leiae-dark/80 sm:text-sm'>Espaço para capa</p>
    </div>
  );
}

export default function StoryCard({ story }) {
  const [coverError, setCoverError] = useState(false);

  return (
    <article className='group overflow-hidden rounded-2xl border border-leiae-dark/10 bg-leiae-paper shadow-card transition hover:-translate-y-1 hover:shadow-warm'>
      <div className='relative aspect-[11/18] overflow-hidden border-b border-leiae-dark/10'>
        {!coverError && story.cover ? (
          <Image
            src={story.cover}
            alt={`Capa de ${story.titulo}`}
            fill
            className='object-cover transition duration-300 group-hover:scale-105'
            sizes='(max-width: 639px) 50vw, (max-width: 1279px) 50vw, 33vw'
            onError={() => setCoverError(true)}
          />
        ) : (
          <CoverPlaceholder />
        )}

        <div className='absolute left-2 top-2 rounded-full bg-leiae-accent px-2 py-1 text-[10px] font-bold text-leiae-bg shadow sm:left-3 sm:top-3 sm:px-3 sm:text-xs'>
          {story.nivel}
        </div>
      </div>

      <div className='p-3 sm:p-4'>
        <div className='mb-2 inline-flex rounded-full bg-leiae-dark/10 px-2 py-1 text-[10px] font-semibold text-leiae-dark/80 sm:px-3 sm:text-xs'>
          {story.duracao} de leitura
        </div>

        <h2 className='font-display text-base leading-tight text-leiae-dark sm:text-2xl'>{story.titulo}</h2>
        <p className='mt-2 text-xs text-leiae-text/90 sm:text-sm'>{story.descricao}</p>

        <Link
          href={`/livro/${story.id}`}
          className='mt-3 inline-flex w-full items-center justify-center rounded-full bg-leiae-accent px-3 py-2 text-xs font-bold text-leiae-bg transition hover:bg-leiae-dark sm:mt-4 sm:w-auto sm:px-5 sm:py-2.5 sm:text-sm'
        >
          Ler agora
        </Link>
      </div>
    </article>
  );
}
