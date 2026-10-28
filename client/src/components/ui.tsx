import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn, fitBand, type FitTone } from '../lib/utils';
import { Dhruv, type DhruvPose } from './brand';
import { bandKey, useT } from '../lib/i18n';

/* ---------- Button ---------- */

type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'ghost' | 'white' | 'whatsapp' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-royal-500 text-white hover:bg-royal-600',
  secondary: 'border border-line-strong bg-white text-ink hover:bg-mist',
  dark: 'bg-ink text-white hover:bg-night-2',
  ghost: 'text-royal-500 hover:bg-royal-50',
  white: 'bg-white text-ink hover:bg-royal-50',
  whatsapp: 'bg-whatsapp text-white hover:bg-[#0B6533]',
  danger: 'border border-danger-600/30 bg-white text-danger-600 hover:bg-danger-50',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-[40px] px-3.5 text-sm',
  md: 'min-h-[48px] px-5 text-[15px]',
  lg: 'min-h-[56px] px-7 text-[17px] font-bold',
};

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  to?: string;
  href?: string;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', to, href, loading, className, children, ...rest
}) => {
  const classes = cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className);
  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  );
  if (to) return <Link to={to} className={classes}>{content}</Link>;
  if (href) return <a href={href} className={classes} target="_blank" rel="noopener noreferrer">{content}</a>;
  return (
    <button type="button" className={classes} disabled={loading || rest.disabled} {...rest}>
      {content}
    </button>
  );
};

/* ---------- Badges ---------- */

const BADGE_TONES: Record<FitTone | 'neutral' | 'danger' | 'night', string> = {
  leaf: 'bg-leaf-50 text-leaf-700',
  royal: 'bg-royal-50 text-royal-600',
  saffron: 'bg-saffron-50 text-saffron-700',
  neutral: 'border border-line bg-mist text-ink-2',
  danger: 'bg-danger-50 text-danger-600',
  night: 'bg-night-2 text-white',
};

export const Badge: React.FC<{
  tone?: keyof typeof BADGE_TONES;
  className?: string;
  children: React.ReactNode;
}> = ({ tone = 'neutral', className, children }) => (
  <span className={cn('inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-bold', BADGE_TONES[tone], className)}>
    {children}
  </span>
);

/** Leads with the band ("Strong fit"); the raw score is optional secondary detail. */
export const FitBadge: React.FC<{ score: number; showScore?: boolean; className?: string }> = ({ score, showScore, className }) => {
  const band = fitBand(score);
  const { t } = useT();
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-2', className)}>
      <Badge tone={band.tone}>{t(bandKey(band.label))}</Badge>
      {showScore && <span className="text-[13px] text-ink-3">{t('score', { n: Math.round(score) })}</span>}
    </span>
  );
};

/* ---------- Layout helpers ---------- */

export const SectionHeader: React.FC<{
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2';
}> = ({ eyebrow, title, description, action, className, as = 'h2' }) => {
  const Heading = as;
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="flex max-w-2xl flex-col gap-3">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Heading className="h-section">{title}</Heading>
        {description && <p className="text-lg leading-relaxed text-ink-2">{description}</p>}
      </div>
      {action}
    </div>
  );
};

export const PageHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  leading?: React.ReactNode;
}> = ({ title, subtitle, actions, leading }) => (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div className="flex items-center gap-4">
      {leading}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.025em] sm:text-[32px]">{title}</h1>
        {subtitle && <p className="text-base text-ink-2">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
  </div>
);

/* ---------- Form fields ---------- */

export const Field: React.FC<{
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, htmlFor, hint, error, children, className }) => (
  <div className={cn('flex flex-col gap-2', className)}>
    <label htmlFor={htmlFor} className="text-[15px] font-semibold text-ink">{label}</label>
    {children}
    {error ? <span className="text-sm font-semibold text-danger-600">{error}</span> : hint && <span className="text-sm text-ink-3">{hint}</span>}
  </div>
);

export const Segmented = <T extends string>({
  options, value, onChange, label, className, size = 'md',
}: {
  options: Array<{ value: T; label: React.ReactNode }>;
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
  size?: 'sm' | 'md';
}) => (
  <div role="group" aria-label={label} className={cn('inline-flex rounded-xl border border-line bg-white p-1', className)}>
    {options.map((o) => {
      const on = o.value === value;
      return (
        <button
          key={o.value}
          type="button"
          aria-pressed={on}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-[9px] font-semibold transition-colors',
            size === 'sm' ? 'min-h-[36px] px-3 text-sm' : 'min-h-[44px] px-4 text-[15px]',
            on ? 'bg-ink text-white' : 'text-ink-2 hover:text-ink'
          )}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

/** Large tappable choice used for class, board, roles and answers. */
export const ChoiceTile: React.FC<{
  selected: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
  role?: 'radio' | 'checkbox';
}> = ({ selected, onClick, className, children, role }) => (
  <button
    type="button"
    role={role}
    aria-checked={role ? selected : undefined}
    aria-pressed={role ? undefined : selected}
    onClick={onClick}
    className={cn(
      'min-h-[52px] rounded-xl text-left transition-colors',
      selected ? 'border-2 border-royal-500 bg-royal-50 text-royal-600' : 'border border-line-strong bg-white text-ink hover:border-royal-300',
      className
    )}
  >
    {children}
  </button>
);

/* ---------- Feedback ---------- */

export const ProgressBar: React.FC<{ value: number; max?: number; tone?: 'royal' | 'saffron' | 'leaf'; className?: string; label?: string }> = ({
  value, max = 100, tone = 'royal', className, label,
}) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = tone === 'saffron' ? 'bg-saffron-500' : tone === 'leaf' ? 'bg-leaf-600' : 'bg-royal-500';
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-label={label}
      className={cn('h-2.5 overflow-hidden rounded-full bg-[#EDF0F5]', className)}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-500', fill)} style={{ width: `${pct}%` }} />
    </div>
  );
};

export const Spinner: React.FC<{ label?: string; className?: string }> = ({ label = 'Loading', className }) => (
  <div role="status" className={cn('flex items-center justify-center gap-3 py-16 text-ink-3', className)}>
    <Loader2 className="h-6 w-6 animate-spin text-royal-500" aria-hidden="true" />
    <span className="text-[15px]">{label}…</span>
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse rounded-lg bg-[#E9EDF3]', className)} aria-hidden="true" />
);

/** One pattern for every empty, error and offline state: Dhruv, a plain title, what happened, one next step. */
export const StateMessage: React.FC<{
  pose?: DhruvPose;
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}> = ({ pose = 'relax', title, body, action, className, compact }) => (
  <div className={cn('flex flex-col items-center gap-3 text-center', compact ? 'py-8' : 'py-14', className)}>
    <Dhruv pose={pose} size={compact ? 96 : 140} decorative />
    <h3 className="font-display text-xl font-bold">{title}</h3>
    {body && <p className="max-w-md text-[15px] leading-relaxed text-ink-2">{body}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const Alert: React.FC<{ tone?: 'danger' | 'leaf' | 'saffron' | 'royal'; children: React.ReactNode; className?: string }> = ({
  tone = 'danger', children, className,
}) => {
  const tones = {
    danger: 'bg-danger-50 text-danger-600',
    leaf: 'bg-leaf-50 text-leaf-900',
    saffron: 'bg-saffron-50 text-saffron-900',
    royal: 'bg-royal-50 text-royal-600',
  };
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('rounded-xl px-4 py-3 text-[15px] font-medium leading-relaxed', tones[tone], className)}>
      {children}
    </div>
  );
};

/** Dialog shell with an accessible title and Escape-to-close. */
export const Modal: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}> = ({ title, onClose, children, width = 'max-w-lg' }) => {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn('animate-pop max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-lift sm:rounded-3xl', width)}
      >
        {children}
      </div>
    </div>
  );
};
