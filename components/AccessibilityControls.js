export default function AccessibilityControls({
  fontScale,
  setFontScale,
  highContrast,
  setHighContrast,
  focusMode,
  setFocusMode,
}) {
  const adjust = (value) => {
    const next = Math.min(1.8, Math.max(0.9, Number((fontScale + value).toFixed(1))));
    setFontScale(next);
  };

  const buttonBase = 'inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold transition';

  return (
    <section className='rounded-2xl border border-leiae-dark/10 bg-leiae-paper px-4 py-3 shadow-card'>
      <div className='flex flex-wrap items-center gap-2'>
        <p className='mr-1 text-sm font-semibold text-leiae-dark/80'>Tamanho do texto</p>

        <button
          type='button'
          onClick={() => adjust(-0.1)}
          className={`${buttonBase} border border-leiae-dark/20 text-leiae-dark hover:bg-leiae-bg`}
          aria-label='Diminuir fonte'
        >
          A-
        </button>
        <button
          type='button'
          onClick={() => adjust(0.1)}
          className={`${buttonBase} border border-leiae-dark/20 text-leiae-dark hover:bg-leiae-bg`}
          aria-label='Aumentar fonte'
        >
          A+
        </button>

        <span className='rounded-full border border-leiae-dark/15 bg-leiae-bg px-2 py-1 text-xs font-bold text-leiae-dark/80'>
          {Math.round(fontScale * 100)}%
        </span>
      </div>

      <div className='mt-3 flex flex-wrap gap-2'>
        <button
          type='button'
          onClick={() => setHighContrast((prev) => !prev)}
          className={`${buttonBase} ${
            highContrast ? 'bg-leiae-dark text-leiae-bg' : 'border border-leiae-dark/20 text-leiae-dark hover:bg-leiae-bg'
          }`}
        >
          Alto contraste
        </button>

        <button
          type='button'
          onClick={() => setFocusMode((prev) => !prev)}
          className={`${buttonBase} ${
            focusMode ? 'bg-leiae-accent text-leiae-bg' : 'border border-leiae-dark/20 text-leiae-dark hover:bg-leiae-bg'
          }`}
        >
          Modo foco
        </button>
      </div>
    </section>
  );
}
