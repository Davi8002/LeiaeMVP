import { useMemo } from 'react';

export default function GuidedReadingText({ story, activeWordIndex, fontScale, highContrast }) {
  const wordsByParagraph = useMemo(() => {
    if (!story?.palavras?.length) {
      return story.paragrafos.map((paragrafo, paragraphIndex) =>
        paragrafo.split(/\s+/).filter(Boolean).map((texto, indice) => ({
          texto,
          indice: paragraphIndex * 1000 + indice,
          paragrafoIndex: paragraphIndex,
        })),
      );
    }

    const grouped = story.paragrafos.map(() => []);

    story.palavras.forEach((palavra) => {
      if (grouped[palavra.paragrafoIndex]) {
        grouped[palavra.paragrafoIndex].push(palavra);
      }
    });

    return grouped;
  }, [story]);

  return (
    <div className='mt-4 space-y-5 leading-relaxed' style={{ fontSize: `${fontScale}rem` }}>
      {wordsByParagraph.map((palavras, paragraphIndex) => (
        <p key={`${story.id}-paragraph-${paragraphIndex}`}>
          {palavras.map((palavra, wordPosition) => {
            const isActive = palavra.indice === activeWordIndex;

            return (
              <span
                key={`${story.id}-word-${palavra.indice}-${wordPosition}`}
                className={
                  isActive
                    ? `rounded-md bg-leiae-accent px-1.5 py-0.5 font-semibold ${highContrast ? 'text-leiae-bg' : 'text-leiae-bg'}`
                    : 'text-inherit'
                }
              >
                {palavra.texto}
                {wordPosition < palavras.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}
