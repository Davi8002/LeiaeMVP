export default function AccessibilityControls({
  fontScale,
  setFontScale,
  highContrast,
  setHighContrast,
  focusMode,
  setFocusMode,
}) {
  const minScale = 0.9;
  const maxScale = 1.8;
  const canDecrease = fontScale > minScale;
  const canIncrease = fontScale < maxScale;

  const adjust = (value) => {
    const next = Math.min(maxScale, Math.max(minScale, Number((fontScale + value).toFixed(1))));
    setFontScale(next);
  };

  const baseTone = highContrast
    ? 'border-leiae-bg/25 bg-[#3a1f12] text-leiae-bg'
    : 'border-leiae-dark/10 bg-leiae-paper text-leiae-dark';

  const buttonBase =
    'inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45';

  return (
    <section className={`rounded-2xl border px-4 py-3 shadow-card ${baseTone}`}>
      <div className='flex flex-wrap items-center gap-2'>
        <p className={`mr-1 text-sm font-semibold ${highContrast ? 'text-leiae-bg/90' : 'text-leiae-dark/80'}`}>Tamanho do texto</p>

        <button
          type='button'
          onClick={() => adjust(-0.1)}
          disabled={!canDecrease}
          className={`${buttonBase} ${
            highContrast
              ? 'border border-leiae-bg/35 text-leiae-bg hover:bg-leiae-bg/10'
              : 'border border-leiae-dark/20 text-leiae-dark hover:bg-leiae-bg'
          }`}
          aria-label='Diminuir fonte'
        >
          A-
        </button>
        <button
          type='button'
          onClick={() => adjust(0.1)}
          disabled={!canIncrease}
          className={`${buttonBase} ${
            highContrast
              ? 'border border-leiae-bg/35 text-leiae-bg hover:bg-leiae-bg/10'
              : 'border border-leiae-dark/20 text-leiae-dark hover:bg-leiae-bg'
          }`}
          aria-label='Aumentar fonte'
        >
          A+
        </button>

        <span
          className={`rounded-full px-2 py-1 text-xs font-bold ${
            highContrast ? 'border border-leiae-bg/35 bg-leiae-dark text-leiae-bg' : 'border border-leiae-dark/15 bg-leiae-bg text-leiae-dark/80'
          }`}
        >
          {Math.round(fontScale * 100)}%
        </span>
      </div>

      <div className='mt-3 flex flex-wrap gap-2'>
        <button
          type='button'
          onClick={() => setHighContrast((prev) => !prev)}
          aria-pressed={highContrast}
          className={`${buttonBase} ${
            highContrast
              ? 'border border-leiae-bg/30 bg-leiae-bg text-leiae-dark'
              : 'border border-leiae-dark/20 text-leiae-dark hover:bg-leiae-bg'
          }`}
        >
          Alto contraste
        </button>

        <button
          type='button'
          onClick={() => setFocusMode((prev) => !prev)}
          aria-pressed={focusMode}
          className={`${buttonBase} ${
            focusMode
              ? 'bg-leiae-accent text-leiae-bg'
              : highContrast
                ? 'border border-leiae-bg/35 text-leiae-bg hover:bg-leiae-bg/10'
                : 'border border-leiae-dark/20 text-leiae-dark hover:bg-leiae-bg'
          }`}
        >
          Modo foco
        </button>
      </div>
    </section>
  );
}
