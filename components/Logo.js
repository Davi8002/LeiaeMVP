import Image from 'next/image';
import logoLeiae from '../pngs/Logo_Leiae.png';

export default function Logo({ onDark = false, className = '', priority = false }) {
  return (
    <Image
      src={logoLeiae}
      alt='Logo LeiaÊ'
      priority={priority}
      sizes='220px'
      className={`${className} ${onDark ? 'drop-shadow-sm' : ''}`.trim()}
    />
  );
}
