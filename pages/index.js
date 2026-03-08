import Link from 'next/link';
import Logo from '../components/Logo';

export default function HomePage() {
  return (
    <main className='min-h-screen bg-leiae-bg px-6 py-12 text-leiae-text'>
      <section className='mx-auto flex w-full max-w-5xl flex-col items-start gap-8 rounded-3xl border border-leiae-dark/10 bg-gradient-to-br from-leiae-bg via-[#f4e2cc] to-[#efcfb2] p-8 shadow-warm md:p-12'>
        <Logo priority className='h-auto w-[190px] sm:w-[220px]' />

        <div className='max-w-2xl'>
          <p className='font-bold uppercase tracking-[0.2em] text-leiae-accent'>Plataforma de leitura</p>
          <h1 className='mt-3 font-display text-4xl leading-tight text-leiae-dark sm:text-5xl'>LeiaE</h1>
          <p className='mt-4 text-2xl font-semibold text-leiae-dark'>Ler com apoio, no seu ritmo.</p>
          <p className='mt-4 text-lg leading-relaxed'>
            LeiaE e um espaco de leitura digital pensado para acolher diferentes ritmos. Escolha uma historia, ajuste a forma como quer ler e use o audio para acompanhar cada pagina com conforto.
          </p>
        </div>

        <Link
          href='/biblioteca'
          className='rounded-xl bg-leiae-accent px-7 py-4 text-lg font-bold text-leiae-bg transition hover:bg-leiae-dark'
        >
          Explorar Biblioteca
        </Link>
      </section>
    </main>
  );
}

