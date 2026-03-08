export default function GuidedReadingControls({
  guidedPlaying,
  onToggleGuided,
  guidedSpeed,
  onIncreaseSpeed,
  onDecreaseSpeed,
  canIncreaseSpeed,
  canDecreaseSpeed,
  syncLabel,
  activeWordIndex,
  totalWords,
}) {
  const buttonBase = 'inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold transition';

  return (
    <section className='rounded-2xl border border-leiae-dark/10 bg-leiae-paper p-4 shadow-card'>
      <div className='flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={onToggleGuided}
          className={`${buttonBase} ${guidedPlaying ? 'bg-leiae-dark text-leiae-bg' : 'bg-leiae-accent text-leiae-bg'}`}
        >
          {guidedPlaying ? 'Pausar leitura guiada' : 'Iniciar leitura guiada'}
        </button>

        <button
          type='button'
          onClick={onDecreaseSpeed}
          disabled={!canDecreaseSpeed}
          className={`${buttonBase} border border-leiae-dark/20 text-leiae-dark hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45`}
        >
          Velocidade -
        </button>

        <button
          type='button'
          onClick={onIncreaseSpeed}
          disabled={!canIncreaseSpeed}
          className={`${buttonBase} border border-leiae-dark/20 text-leiae-dark hover:bg-leiae-bg disabled:cursor-not-allowed disabled:opacity-45`}
        >
          Velocidade +
        </button>
      </div>

      <div className='mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-leiae-dark/80'>
        <span className='rounded-full border border-leiae-dark/15 bg-leiae-bg px-3 py-1'>Velocidade: {guidedSpeed.toFixed(2)}x</span>
        <span className='rounded-full border border-leiae-dark/15 bg-leiae-bg px-3 py-1'>
          Palavra: {Math.min(activeWordIndex + 1, totalWords)}/{totalWords}
        </span>
        <span className='rounded-full bg-leiae-accent px-3 py-1 text-leiae-bg'>{syncLabel}</span>
      </div>
    </section>
  );
}
