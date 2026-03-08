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

  const activeWordClass = highContrast ? 'bg-leiae-accent text-leiae-bg' : 'bg-leiae-accent text-leiae-bg';

  return (
    <div className='mt-4 space-y-5 leading-relaxed' style={{ fontSize: `${fontScale}rem` }}>
      {wordsByParagraph.map((palavras, paragraphIndex) => (
        <p key={`${story.id}-paragraph-${paragraphIndex}`}>
          {palavras.map((palavra, wordPosition) => {
            const isActive = palavra.indice === activeWordIndex;

            return (
              <span key={`${story.id}-word-${palavra.indice}-${wordPosition}`}>
                <span
                  className={`inline-block rounded-md px-[0.22em] py-[0.06em] leading-[1.45] transition-colors duration-150 ${
                    isActive ? activeWordClass : 'bg-transparent text-inherit'
                  }`}
                >
                  {palavra.texto}
                </span>
                {wordPosition < palavras.length - 1 ? <span className='whitespace-pre'> </span> : null}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}
