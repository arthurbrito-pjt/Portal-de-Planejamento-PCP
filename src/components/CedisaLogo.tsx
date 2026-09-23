import React from 'react';

export type CedisaLogoVariant = 'horizontal' | 'vertical' | 'symbol';
export type CedisaLogoTheme = 'color' | 'white' | 'black' | 'dark' | 'light' | 'print';

interface CedisaLogoProps {
  variant?: CedisaLogoVariant;
  theme?: CedisaLogoTheme;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

export const CedisaLogo: React.FC<CedisaLogoProps> = ({
  variant = 'horizontal',
  theme = 'color',
  size = 'md',
  className = '',
  alt = 'CEDISA Central de Aço'
}) => {
  // Resolve o tema para uma das 3 cores reais: 'color', 'white', ou 'black'
  let resolvedTheme: 'color' | 'white' | 'black' = 'color';
  if (theme === 'white' || theme === 'dark') {
    resolvedTheme = 'white';
  } else if (theme === 'black' || theme === 'print') {
    resolvedTheme = 'black';
  } else {
    resolvedTheme = 'color';
  }

  // Altura proporcional
  const heightClasses = {
    xs: 'h-5',
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
    xl: 'h-16'
  }[size];

  // Resolve o caminho da imagem de acordo com a variante e tema
  let src = '/assets/cedisa-logo-horizontal-color.png';

  if (variant === 'symbol') {
    if (resolvedTheme === 'white') {
      src = '/assets/cedisa-symbol-white.png';
    } else if (resolvedTheme === 'black') {
      src = '/assets/cedisa-symbol-black.png';
    } else {
      src = '/assets/cedisa-symbol-color.png';
    }
  } else if (variant === 'vertical') {
    if (resolvedTheme === 'white') {
      src = '/assets/cedisa-logo-vertical-color.png';
    } else if (resolvedTheme === 'black') {
      src = '/assets/cedisa-logo-vertical-black.png';
    } else {
      src = '/assets/cedisa-logo-vertical-color.png';
    }
  } else {
    // horizontal
    if (resolvedTheme === 'white') {
      src = '/assets/cedisa-logo-horizontal-white.png';
    } else if (resolvedTheme === 'black') {
      src = '/assets/cedisa-logo-horizontal-black.png';
    } else {
      src = '/assets/cedisa-logo-horizontal-color.png';
    }
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${heightClasses} w-auto object-contain shrink-0 transition-opacity ${className}`}
    />
  );
};
