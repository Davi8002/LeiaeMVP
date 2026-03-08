import { useMemo } from 'react';

export default function GuidedReadingText({ story, activeWordIndex, fontScale, highContrast, visibleRange }) {
  const wordsByParagraph = useMemo(() => {
    const start = typeof visibleRange?.start === 'number' ? visibleRange.start : null;
    const end = typeof visibleRange?.end === 'number' ? visibleRange.end : null;
    const hasRange = start !== null && end !== null && end >= start;

    if (!story?.palavras?.length) {
      const fallback = story.paragrafos.map((paragrafo, paragraphIndex) =>
        paragrafo.split(/\s+/).filter(Boolean).map((texto, indice) => ({
          texto,
          indice: paragraphIndex * 1000 + indice,
          paragrafoIndex: paragraphIndex,
        })),
      );

      if (!hasRange) return fallback;

      return fallback
        .map((palavras) => palavras.filter((palavra) => palavra.indice >= start && palavra.indice <= end))
        .filter((palavras) => palavras.length > 0);
    }

    const grouped = story.paragrafos.map(() => []);

    story.palavras.forEach((palavra) => {
      if (hasRange && (palavra.indice < start || palavra.indice > end)) {
        return;
      }

      if (grouped[palavra.paragrafoIndex]) {
        grouped[palavra.paragrafoIndex].push(palavra);
      }
    });

    return grouped.filter((palavras) => palavras.length > 0);
  }, [story, visibleRange]);

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
