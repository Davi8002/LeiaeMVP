import Link from 'next/link';

const tabs = [
  { id: 'home', label: 'Inicio', href: '/' },
  { id: 'biblioteca', label: 'Biblioteca', href: '/biblioteca' },
  { id: 'leitura', label: 'Leitura', href: '/biblioteca' },
  { id: 'config', label: 'Ajustes', href: '/biblioteca' },
];

function HomeIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M3 11.5L12 4l9 7.5' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M6.5 10.5v9h11v-9' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M4 5h7v14H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M20 5h-7v14h7a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

function ReadIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M4 7a2 2 0 0 1 2-2h5v14H6a2 2 0 0 0-2 2V7z' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M20 7a2 2 0 0 0-2-2h-5v14h5a2 2 0 0 1 2 2V7z' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M12 8v10' strokeLinecap='round' />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5z' />
      <path
        d='M19.4 15a1.2 1.2 0 0 0 .24 1.33l.04.04a1.5 1.5 0 0 1-2.12 2.12l-.04-.04A1.2 1.2 0 0 0 16.2 18a1.2 1.2 0 0 0-.72.24 1.2 1.2 0 0 0-.48.96V20a1.5 1.5 0 0 1-3 0v-.08a1.2 1.2 0 0 0-1.2-1.2 1.2 1.2 0 0 0-.72.24 1.2 1.2 0 0 0-.48.96V20a1.5 1.5 0 0 1-3 0v-.8a1.2 1.2 0 0 0-.48-.96 1.2 1.2 0 0 0-.72-.24 1.2 1.2 0 0 0-1.36.45l-.04.04a1.5 1.5 0 1 1-2.12-2.12l.04-.04A1.2 1.2 0 0 0 4.6 15a1.2 1.2 0 0 0-.24-.72A1.2 1.2 0 0 0 3.4 13.8H2.5a1.5 1.5 0 0 1 0-3h.9a1.2 1.2 0 0 0 .96-.48 1.2 1.2 0 0 0 .24-.72 1.2 1.2 0 0 0-.24-.72 1.2 1.2 0 0 0-.96-.48H2.5a1.5 1.5 0 0 1 0-3h.9a1.2 1.2 0 0 0 .96-.48 1.2 1.2 0 0 0 .24-.72A1.2 1.2 0 0 0 4.6 3.6l-.04-.04a1.5 1.5 0 1 1 2.12-2.12l.04.04A1.2 1.2 0 0 0 8.08 2a1.2 1.2 0 0 0 .72-.24A1.2 1.2 0 0 0 9.28.8V0a1.5 1.5 0 0 1 3 0v.8a1.2 1.2 0 0 0 .48.96 1.2 1.2 0 0 0 .72.24 1.2 1.2 0 0 0 1.36-.45l.04-.04a1.5 1.5 0 0 1 2.12 2.12l-.04.04a1.2 1.2 0 0 0-.24 1.33 1.2 1.2 0 0 0 .96.72h.9a1.5 1.5 0 0 1 0 3h-.9a1.2 1.2 0 0 0-.96.48 1.2 1.2 0 0 0-.24.72 1.2 1.2 0 0 0 .24.72 1.2 1.2 0 0 0 .96.48h.9a1.5 1.5 0 0 1 0 3h-.9a1.2 1.2 0 0 0-.96.48 1.2 1.2 0 0 0-.24.72z'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

const iconMap = {
  home: HomeIcon,
  biblioteca: BookIcon,
  leitura: ReadIcon,
  config: GearIcon,
};

export default function BottomNav({ active = 'home', readingHref = '/biblioteca' }) {
  return (
    <nav className='absolute bottom-0 left-0 right-0 border-t border-leiae-dark/10 bg-leiae-paper/95 px-4 pb-5 pt-3 backdrop-blur'>
      <ul className='grid grid-cols-4 gap-1'>
        {tabs.map((item) => {
          const href = item.id === 'leitura' ? readingHref : item.href;
          const activeItem = item.id === active;
          const Icon = iconMap[item.id];

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
                  <Icon />
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
