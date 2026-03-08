import { useMemo } from 'react';

export default function GuidedReadingText({ story, activePhraseIndex, fontScale, highContrast }) {
  const phrasesByParagraph = useMemo(() => {
    if (!story?.frases?.length) {
      return story.paragrafos.map((paragrafo) => [{ texto: paragrafo, indice: -1 }]);
    }

    const grouped = story.paragrafos.map(() => []);
    story.frases.forEach((frase) => {
      if (grouped[frase.paragrafoIndex]) {
        grouped[frase.paragrafoIndex].push(frase);
      }
    });

    return grouped;
  }, [story]);

  return (
    <div className='mt-4 space-y-5 leading-relaxed' style={{ fontSize: `${fontScale}rem` }}>
      {phrasesByParagraph.map((frases, paragraphIndex) => (
        <p key={`${story.id}-paragraph-${paragraphIndex}`}>
          {frases.map((frase, phraseIndex) => {
            const isActive = frase.indice === activePhraseIndex;

            return (
              <span
                key={`${story.id}-phrase-${frase.indice}-${phraseIndex}`}
                className={
                  isActive
                    ? `rounded-md bg-leiae-accent px-1.5 py-0.5 font-semibold ${highContrast ? 'text-leiae-bg' : 'text-leiae-bg'}`
                    : 'text-inherit'
                }
              >
                {frase.texto}
                {phraseIndex < frases.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}
