import Image from 'next/image';
import logoLeiae from '../pngs/Logo_Leiae.png';

export default function Logo({ onDark = false, className = '', priority = false }) {
  return (
    <Image
      src={logoLeiae}
      alt='Logo Leia\u00CA'
      priority={priority}
      sizes='220px'
      className={`${className} ${onDark ? 'brightness-0 invert' : ''}`.trim()}
    />
  );
}
