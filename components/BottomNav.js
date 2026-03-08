import Link from 'next/link';

const tabs = [
  { id: 'home', label: 'Início', href: '/' },
  { id: 'biblioteca', label: 'Biblioteca', href: '/biblioteca' },
  { id: 'leitura', label: 'Leitura', href: '/biblioteca' },
  { id: 'config', label: 'Ajustes', href: '/biblioteca' },
];

function Icon({ type }) {
  if (type === 'home') {
    return (
      <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
        <path d='M3 11.5L12 4l9 7.5' strokeLinecap='round' strokeLinejoin='round' />
        <path d='M6.5 10.5v9h11v-9' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    );
  }

  if (type === 'biblioteca') {
    return (
      <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
        <path d='M4 5h7v14H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z' strokeLinecap='round' strokeLinejoin='round' />
        <path d='M20 5h-7v14h7a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    );
  }

  if (type === 'leitura') {
    return (
      <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
        <path d='M4 7a2 2 0 0 1 2-2h5v14H6a2 2 0 0 0-2 2V7z' strokeLinecap='round' strokeLinejoin='round' />
        <path d='M20 7a2 2 0 0 0-2-2h-5v14h5a2 2 0 0 1 2 2V7z' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    );
  }

  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
      <circle cx='12' cy='12' r='3' />
      <path d='M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7' strokeLinecap='round' />
    </svg>
  );
}

export default function BottomNav({ active = 'home', readingHref = '/biblioteca' }) {
  return (
    <nav className='absolute bottom-0 left-0 right-0 border-t border-leiae-dark/10 bg-leiae-paper/95 px-4 pb-5 pt-3 backdrop-blur'>
      <ul className='grid grid-cols-4 gap-1'>
        {tabs.map((item) => {
          const href = item.id === 'leitura' ? readingHref : item.href;
          const activeItem = item.id === active;

          return (
            <li key={item.id}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 rounded-xl px-1 py-1 text-xs font-semibold transition ${
                  activeItem ? 'text-leiae-accent' : 'text-leiae-dark/70 hover:text-leiae-dark'
                }`}
              >
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                    activeItem ? 'bg-leiae-accent text-leiae-bg' : 'bg-transparent'
                  }`}
                >
                  <Icon type={item.id} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
