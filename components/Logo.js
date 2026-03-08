import Image from 'next/image';

export default function Logo({ onDark = false, className = '', priority = false }) {
  const src = onDark ? '/logos/leiae-dark.svg' : '/logos/leiae-light.svg';

  return (
    <Image
      src={src}
      alt='Logo LeiaE'
      width={220}
      height={92}
      priority={priority}
      className={className}
    />
  );
}


