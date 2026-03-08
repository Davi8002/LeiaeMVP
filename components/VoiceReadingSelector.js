export default function VoiceReadingSelector({ value, onChange }) {
  const optionBase =
    'flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 transition';

  return (
    <section className='rounded-2xl border border-leiae-dark/10 bg-leiae-paper p-4 shadow-card'>
      <div className='flex items-center justify-between gap-3'>
        <h2 className='font-display text-lg font-bold text-leiae-dark'>Tipo de leitura por voz</h2>
        <span className='rounded-full border border-leiae-dark/15 bg-leiae-bg px-3 py-1 text-xs font-semibold text-leiae-dark/75'>
          Escolha única
        </span>
      </div>

      <div className='mt-3 space-y-2'>
        <label
          className={`${optionBase} ${
            value === 'robotic'
              ? 'border-leiae-accent/45 bg-leiae-accent/10'
              : 'border-leiae-dark/10 bg-white/75 hover:border-leiae-accent/30'
          }`}
        >
          <span className='flex items-center gap-3'>
            <input
              type='radio'
              name='voice-mode'
              value='robotic'
              checked={value === 'robotic'}
              onChange={() => onChange('robotic')}
              className='h-4 w-4 accent-leiae-accent'
            />
            <span>
              <span className='block text-sm font-semibold text-leiae-dark'>Leitura robotizada</span>
              <span className='block text-xs text-leiae-dark/65'>Disponível agora</span>
            </span>
          </span>
          <span className='rounded-full bg-leiae-accent px-2.5 py-1 text-xs font-bold text-leiae-bg'>{value === 'robotic' ? 'Ativa' : 'Disponível'}</span>
        </label>

        <label
          className={`${optionBase} ${
            value === 'humanized'
              ? 'border-leiae-accent/45 bg-leiae-accent/10'
              : 'border-leiae-dark/10 bg-leiae-dark/5'
          }`}
        >
          <span className='flex items-center gap-3'>
            <input
              type='radio'
              name='voice-mode'
              value='humanized'
              checked={value === 'humanized'}
              onChange={() => onChange('humanized')}
              className='h-4 w-4 accent-leiae-accent'
            />
            <span>
              <span className='block text-sm font-semibold text-leiae-dark'>Leitura humanizada</span>
              <span className='block text-xs text-leiae-dark/65'>Narradores reais</span>
            </span>
          </span>
          <span className='rounded-full border border-leiae-dark/20 bg-white px-2.5 py-1 text-xs font-bold text-leiae-dark/70'>
            Em breve
          </span>
        </label>
      </div>
    </section>
  );
}

