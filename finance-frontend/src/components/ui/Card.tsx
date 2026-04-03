import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  className?: string;
}>;

export function Card({ title, subtitle, className = '', children }: Props) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`.trim()}>
      {title && <h2 className="font-display text-2xl text-slate-900">{title}</h2>}
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      <div className={title || subtitle ? 'mt-4' : ''}>{children}</div>
    </section>
  );
}
