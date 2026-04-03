import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type Variant = 'primary' | 'ghost' | 'danger';

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
  }
>;

const variantClasses: Record<Variant, string> = {
  primary:
    'rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-50',
  ghost:
    'rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50',
  danger:
    'rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50',
};

export function Button({ children, variant = 'primary', className = '', ...props }: Props) {
  return (
    <button className={`${variantClasses[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
