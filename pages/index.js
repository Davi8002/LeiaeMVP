import Head from 'next/head';
import Link from 'next/link';
import AppShell from '../components/AppShell';
import Logo from '../components/Logo';

export default function HomePage() {
  return (
    <>
      <Head>
        <meta charSet='UTF-8' />
        <title>LeiaÊ | Ler com apoio, no seu ritmo.</title>
        <meta
          name='description'
          content='LeiaÊ é uma plataforma de leitura digital acessível com histórias, áudio e ajustes de leitura em tempo real.'
        />
      </Head>

      <AppShell
        title='LeiaÊ'
        subtitle='Ler com apoio, no seu ritmo.'
        activeTab='home'
        darkHeader
        maxWidthClass='max-w-[430px] sm:max-w-[680px] md:max-w-5xl lg:max-w-6xl'
      >
        <section className='grid gap-4 lg:grid-cols-[1.1fr,0.9fr] xl:gap-6'>
          <article className='rounded-3xl border border-leiae-dark/10 bg-gradient-to-br from-leiae-paper via-leiae-bg to-[#efcfb2] p-5 shadow-card sm:p-6'>
            <p className='text-sm font-semibold uppercase tracking-[0.16em] text-leiae-dark/60'>Plataforma de leitura</p>
            <h1 className='mt-3 font-display text-3xl font-bold leading-tight text-leiae-dark sm:text-4xl'>
              Ler com apoio, no seu ritmo.
            </h1>
            <p className='mt-3 max-w-xl text-base text-leiae-text/90 sm:text-lg'>
              O LeiaÊ ajuda pessoas a desenvolverem ou retomarem o hábito da leitura com uma experiência confortável, acolhedora e acessível.
            </p>

            <Link
              href='/biblioteca'
              className='mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-leiae-accent px-5 py-3 text-base font-bold text-leiae-bg transition hover:bg-leiae-dark sm:w-auto'
            >
              Explorar Biblioteca
            </Link>

            <div className='mt-5 grid gap-3 sm:grid-cols-2'>
              <div className='rounded-2xl border border-leiae-dark/10 bg-white/70 p-4'>
                <p className='text-sm font-semibold text-leiae-dark/70'>Acessibilidade</p>
                <p className='mt-1 text-lg font-bold text-leiae-dark'>Fonte, contraste e foco</p>
              </div>
              <div className='rounded-2xl border border-leiae-dark/10 bg-white/70 p-4'>
                <p className='text-sm font-semibold text-leiae-dark/70'>Leitura guiada</p>
                <p className='mt-1 text-lg font-bold text-leiae-dark'>Áudio local em MP3</p>
              </div>
            </div>
          </article>

          <aside className='rounded-3xl border border-leiae-dark/10 bg-leiae-paper p-5 shadow-card sm:p-6'>
            <div className='rounded-2xl border border-leiae-dark/10 bg-white/70 p-4'>
              <Logo priority className='mx-auto h-auto w-[230px] sm:w-[260px]' />
            </div>
            <p className='mt-4 text-sm font-semibold text-leiae-dark/70'>Leitura digital inspirada na cultura nordestina.</p>
          </aside>
        </section>
      </AppShell>
    </>
  );
}
