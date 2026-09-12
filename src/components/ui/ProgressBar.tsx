import { cn } from '../../utils';

interface ProgressBarProps {
  value: number; // 0..100
  tone?: 'indigo' | 'emerald' | 'rose';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const TONES = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
};

const HEIGHTS = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({ value, tone = 'indigo', size = 'md', showLabel = false, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const bar = (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progress"
      className={cn('w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800', HEIGHTS[size], className)}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500', TONES[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
  if (!showLabel) return bar;
  return (
    <div className="flex w-full items-center gap-3">
      {bar}
      <span className="w-11 shrink-0 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">{clamped}%</span>
    </div>
  );
}