import { useEffect, useMemo, useRef } from 'react';

export default function GuidedReadingText({
  story,
  activeWordIndex,
  fontScale,
  highContrast,
  visibleRange,
  centerOnWordToken = 0,
  highlightMode = 'word',
  highlightRange = null,
}) {
  const activeWordRef = useRef(null);

  const wordsByParagraph = useMemo(() => {
    if (!story) return [];

    const start = typeof visibleRange?.start === 'number' ? visibleRange.start : null;
    const end = typeof visibleRange?.end === 'number' ? visibleRange.end : null;
    const hasRange = start !== null && end !== null && end >= start;

    if (!story?.palavras?.length) {
      const fallback = (story.paragrafos || []).map((paragrafo, paragraphIndex) =>
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

    const grouped = (story.paragrafos || []).map(() => []);

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

  const normalizedMode = highlightMode === 'chunk' ? 'chunk' : 'word';
  const chunkStartRaw = typeof highlightRange?.start === 'number' ? highlightRange.start : activeWordIndex;
  const chunkEndRaw = typeof highlightRange?.end === 'number' ? highlightRange.end : activeWordIndex;
  const chunkStart = Math.min(chunkStartRaw, chunkEndRaw);
  const chunkEnd = Math.max(chunkStartRaw, chunkEndRaw);

  useEffect(() => {
    if (!centerOnWordToken) return;

    const activeNode = activeWordRef.current;
    if (!activeNode || typeof window === 'undefined') return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    activeNode.scrollIntoView({
      block: isMobile ? 'center' : 'nearest',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }, [centerOnWordToken]);

  const activeWordClass = highContrast
    ? 'bg-leiae-accent text-leiae-bg shadow-[inset_0_0_0_1px_rgba(247,237,225,0.24)]'
    : 'bg-leiae-accent text-leiae-bg shadow-[inset_0_0_0_1px_rgba(39,21,12,0.08)]';

  const activeChunkClass = highContrast
    ? 'bg-leiae-accent text-leiae-bg shadow-[inset_0_0_0_1px_rgba(247,237,225,0.24)]'
    : 'bg-leiae-accent/35 text-leiae-dark shadow-[inset_0_0_0_1px_rgba(39,21,12,0.08)]';

  const storyId = story?.id || 'story';

  return (
    <div className='mt-4 space-y-5 leading-relaxed' style={{ fontSize: `${fontScale}rem` }}>
      {wordsByParagraph.map((palavras, paragraphIndex) => (
        <p key={`${storyId}-paragraph-${paragraphIndex}`}>
          {palavras.map((palavra, wordPosition) => {
            const isActive = normalizedMode === 'chunk'
              ? palavra.indice >= chunkStart && palavra.indice <= chunkEnd
              : palavra.indice === activeWordIndex;

            const isAnchor = normalizedMode === 'chunk'
              ? palavra.indice === chunkStart
              : isActive;

            const activeClass = normalizedMode === 'chunk' ? activeChunkClass : activeWordClass;

            return (
              <span key={`${storyId}-word-${palavra.indice}-${wordPosition}`}>
                <span
                  ref={isAnchor ? activeWordRef : null}
                  className={`inline-block scroll-mt-24 rounded-md px-[0.22em] py-[0.06em] leading-[1.45] box-decoration-clone transition-colors duration-150 ${
                    isActive ? activeClass : ''
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
