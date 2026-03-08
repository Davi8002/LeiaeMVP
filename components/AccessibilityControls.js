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

  return (
    <section className='rounded-2xl border border-leiae-dark/15 bg-white/80 p-4 shadow-warm'>
      <h2 className='font-display text-xl text-leiae-dark'>Acessibilidade</h2>

      <div className='mt-4 flex flex-wrap gap-3'>
        <button
          type='button'
          onClick={() => adjust(-0.1)}
          className='rounded-lg border border-leiae-dark/20 px-4 py-2 font-bold text-leiae-dark hover:bg-leiae-bg'
          aria-label='Diminuir fonte'
        >
          A-
        </button>
        <button
          type='button'
          onClick={() => adjust(0.1)}
          className='rounded-lg border border-leiae-dark/20 px-4 py-2 font-bold text-leiae-dark hover:bg-leiae-bg'
          aria-label='Aumentar fonte'
        >
          A+
        </button>
        <button
          type='button'
          onClick={() => setHighContrast((prev) => !prev)}
          className={`rounded-lg px-4 py-2 font-bold transition ${
            highContrast
              ? 'bg-leiae-dark text-leiae-bg'
              : 'border border-leiae-dark/20 text-leiae-dark hover:bg-leiae-bg'
          }`}
        >
          Alto contraste
        </button>
        <button
          type='button'
          onClick={() => setFocusMode((prev) => !prev)}
          className={`rounded-lg px-4 py-2 font-bold transition ${
            focusMode
              ? 'bg-leiae-accent text-leiae-bg'
              : 'border border-leiae-dark/20 text-leiae-dark hover:bg-leiae-bg'
          }`}
        >
          Modo foco
        </button>
      </div>
    </section>
  );
}
