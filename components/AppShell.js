import Link from 'next/link';
import Logo from './Logo';
import BottomNav from './BottomNav';

function BackArrow() {
  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M15 18l-6-6 6-6' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

export default function AppShell({
  children,
  title = 'Leia\u00ca',
  subtitle = 'Leitura acessivel',
  activeTab = 'home',
  darkHeader = true,
  showTopNav = true,
  showBottomNav = true,
  backHref,
  readingHref = '/biblioteca',
  maxWidthClass = 'max-w-[430px]',
}) {
  return (
    <main className='min-h-screen bg-grainWarm px-0 py-0 sm:px-4 sm:py-6'>
      <div
        className={`relative mx-auto flex min-h-screen w-full ${maxWidthClass} flex-col overflow-hidden border border-leiae-dark/15 bg-leiae-bg shadow-app sm:min-h-[calc(100vh-3rem)] sm:rounded-app`}
      >
        <header
          className={`px-4 pb-4 pt-4 ${
            darkHeader
              ? 'bg-gradient-to-r from-leiae-accent to-[#9f3b21] text-leiae-bg'
              : 'border-b border-leiae-dark/10 bg-leiae-paper text-leiae-dark'
          }`}
        >
          <div className='flex items-center justify-between gap-3'>
            {backHref ? (
              <Link
                href={backHref}
                aria-label='Voltar'
                className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-current/30 bg-black/5'
              >
                <BackArrow />
              </Link>
            ) : (
              <span className='h-9 w-9' aria-hidden='true' />
            )}

            <div className='flex items-center gap-3'>
              <Logo onDark={darkHeader} className='h-auto w-[110px]' />
              <div>
                <p className='font-display text-lg font-bold leading-tight'>{title}</p>
                <p className={`text-xs ${darkHeader ? 'text-leiae-bg/85' : 'text-leiae-dark/65'}`}>{subtitle}</p>
              </div>
            </div>

            <span className='h-9 w-9 rounded-full border border-current/20 bg-black/5' aria-hidden='true' />
          </div>

          {showTopNav && !backHref ? (
            <nav className='mt-4 flex gap-2'>
              <Link
                href='/'
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  activeTab === 'home'
                    ? darkHeader
                      ? 'bg-leiae-bg text-leiae-accent'
                      : 'bg-leiae-accent text-leiae-bg'
                    : darkHeader
                      ? 'bg-black/15 text-leiae-bg/90'
                      : 'bg-leiae-dark/10 text-leiae-dark/80'
                }`}
              >
                Inicio
              </Link>
              <Link
                href='/biblioteca'
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  activeTab === 'biblioteca'
                    ? darkHeader
                      ? 'bg-leiae-bg text-leiae-accent'
                      : 'bg-leiae-accent text-leiae-bg'
                    : darkHeader
                      ? 'bg-black/15 text-leiae-bg/90'
                      : 'bg-leiae-dark/10 text-leiae-dark/80'
                }`}
              >
                Biblioteca
              </Link>
            </nav>
          ) : null}
        </header>

        <section className='relative flex-1 overflow-y-auto px-4 pb-28 pt-5'>{children}</section>

        {showBottomNav ? <BottomNav active={activeTab} readingHref={readingHref} /> : null}
      </div>
    </main>
  );
}

