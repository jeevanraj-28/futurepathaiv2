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

/** Dhruv, the FuturePath polar-bear guide. */
export const Dhruv: React.FC<{
  pose?: DhruvPose;
  size?: number;
  className?: string;
  bob?: boolean;
  decorative?: boolean;
}> = ({ pose = 'wave', size = 120, className, bob, decorative }) => (
  <img
    src={`/mascot/${pose}.png`}
    width={size}
    height={size}
    alt={decorative ? '' : `Dhruv the polar bear ${POSE_ALT[pose]}`}
    aria-hidden={decorative || undefined}
    className={cn('shrink-0 select-none object-contain', bob && 'animate-bob', className)}
    style={{ width: size, height: size }}
    draggable={false}
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
    <img
      src="/brand/icon.png"
      alt={variant === 'icon' ? 'FuturePath AI' : ''}
      className="block shrink-0"
      style={{ width: variant === 'icon' ? height : height * 1.25, height: variant === 'icon' ? height : height * 1.25 }}
    />
  );
  const word = (
    <img
      src={tone === 'light' ? '/brand/logo-light.png' : '/brand/logo.png'}
      alt="FuturePath AI"
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
