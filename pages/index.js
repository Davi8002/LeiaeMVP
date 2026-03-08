import Link from 'next/link';
import AppShell from '../components/AppShell';
import Logo from '../components/Logo';

export default function HomePage() {
  return (
    <AppShell title='Leia\u00ca' subtitle='Ler com apoio, no seu ritmo.' activeTab='home' darkHeader>
      <section className='space-y-4'>
        <div className='rounded-3xl border border-leiae-dark/10 bg-gradient-to-br from-leiae-paper via-leiae-bg to-[#efcfb2] p-5 shadow-card'>
          <div className='rounded-2xl border border-leiae-dark/10 bg-white/70 p-4'>
            <Logo priority className='mx-auto h-auto w-[210px]' />
          </div>

          <h1 className='mt-5 font-display text-3xl font-bold leading-tight text-leiae-dark'>Ler com apoio, no seu ritmo.</h1>
          <p className='mt-3 text-base text-leiae-text/90'>
            Um aplicativo de leitura acolhedor com recursos de acessibilidade para desenvolver o habito de leitura sem pressa.
          </p>

          <Link
            href='/biblioteca'
            className='mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-leiae-accent px-5 py-3 text-base font-bold text-leiae-bg transition hover:bg-leiae-dark'
          >
            Explorar Biblioteca
          </Link>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <article className='rounded-2xl border border-leiae-dark/10 bg-leiae-paper p-4 shadow-card'>
            <p className='text-sm font-semibold text-leiae-dark/70'>Ajuste instantaneo</p>
            <p className='mt-1 text-xl font-bold text-leiae-dark'>Fonte e contraste</p>
          </article>
          <article className='rounded-2xl border border-leiae-dark/10 bg-leiae-paper p-4 shadow-card'>
            <p className='text-sm font-semibold text-leiae-dark/70'>Leitura guiada</p>
            <p className='mt-1 text-xl font-bold text-leiae-dark'>Audio local MP3</p>
          </article>
        </div>
      </section>
    </AppShell>
  );
}

