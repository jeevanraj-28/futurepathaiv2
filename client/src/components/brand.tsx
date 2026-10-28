import React from 'react';
import { cn } from '../lib/utils';

export type DhruvPose =
  | 'wave' | 'celebrate' | 'run' | 'read' | 'relax' | 'thumbsup'
  | 'love' | 'think' | 'sleep' | 'backpack' | 'cheer' | 'thanks';

const POSE_ALT: Record<DhruvPose, string> = {
  wave: 'waving', celebrate: 'celebrating', run: 'running', read: 'reading a book',
  relax: 'relaxing', thumbsup: 'giving a thumbs up', love: 'holding a heart',
  think: 'thinking', sleep: 'sleeping', backpack: 'ready to go with a backpack',
  cheer: 'cheering', thanks: 'saying thank you',
};

/** WebP with a PNG fallback; `src` is the path without its extension. */
const Picture: React.FC<{
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  eager?: boolean;
  decorative?: boolean;
}> = ({ src, alt, className, style, width, height, eager, decorative }) => (
  <picture className="contents">
    <source srcSet={`${src}.webp`} type="image/webp" />
    <img
      src={`${src}.png`}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      aria-hidden={decorative || undefined}
      className={className}
      style={style}
      draggable={false}
    />
  </picture>
);

/** Dhruv, the FuturePath polar-bear guide. */
export const Dhruv: React.FC<{
  pose?: DhruvPose;
  size?: number;
  className?: string;
  bob?: boolean;
  decorative?: boolean;
  /** Pass true for art that is visible on first paint, so it isn't lazy-loaded. */
  eager?: boolean;
}> = ({ pose = 'wave', size = 120, className, bob, decorative, eager }) => (
  <Picture
    src={`/mascot/${pose}`}
    alt={decorative ? '' : `Dhruv the polar bear ${POSE_ALT[pose]}`}
    width={size}
    height={size}
    eager={eager}
    className={cn('shrink-0 select-none object-contain', bob && 'animate-bob', className)}
    style={{ width: size, height: size }}
    decorative={decorative}
  />
);

/** The FuturePath wordmark, the bear app icon, or both side by side. */
export const Logo: React.FC<{
  variant?: 'wordmark' | 'icon' | 'lockup';
  tone?: 'dark' | 'light';
  height?: number;
  className?: string;
}> = ({ variant = 'wordmark', tone = 'dark', height = 34, className }) => {
  const icon = (
    <Picture
      src="/brand/icon"
      alt={variant === 'icon' ? 'FuturePath AI' : ''}
      eager
      className="block shrink-0"
      style={{ width: variant === 'icon' ? height : height * 1.25, height: variant === 'icon' ? height : height * 1.25 }}
    />
  );
  const word = (
    <Picture
      src={tone === 'light' ? '/brand/logo-light' : '/brand/logo'}
      alt="FuturePath AI"
      eager
      className="block w-auto"
      style={{ height }}
    />
  );
  return (
    <span className={cn('inline-flex items-center gap-2.5 leading-none', className)}>
      {variant !== 'wordmark' && icon}
      {variant !== 'icon' && word}
    </span>
  );
};
