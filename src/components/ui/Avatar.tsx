import { cn, hueFrom, initials } from '../../utils';

const HUE: Record<string, string> = {
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  teal: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
};

interface AvatarProps {
  name: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  title?: string;
}

const SIZES: Record<'xs' | 'sm' | 'md', string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
};

export function Avatar({ name, color, size = 'md', className, title }: AvatarProps) {
  const hue = color ?? hueFrom(name);
  return (
    <span
      title={title ?? name}
      aria-hidden
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold',
        HUE[hue] ?? HUE.indigo,
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

/** Stack of overlapping avatars for project teams. */
export function AvatarStack({ members, max = 4 }: { members: Array<{ id: string; name: string; color?: string }>; max?: number }) {
  const shown = members.slice(0, max);
  const rest = members.length - shown.length;
  return (
    <div className="flex items-center -space-x-2" aria-label={`${members.length} team members`}>
      {shown.map((m) => (
        <Avatar key={m.id} name={m.name} color={m.color} size="sm" className="ring-2 ring-white dark:ring-slate-900" />
      ))}
      {rest > 0 && (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-700 ring-2 ring-white dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-900">
          +{rest}
        </span>
      )}
    </div>
  );
}