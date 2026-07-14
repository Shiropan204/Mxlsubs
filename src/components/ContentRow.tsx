import React, { ReactNode } from 'react';

interface ContentRowProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ContentRow({ title, icon, children, className = '' }: ContentRowProps) {
  return (
    <section className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 px-4">
        {icon}
        <h2 className="text-base md:text-xl font-heading font-bold">{title}</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-hide">
        {children}
        <div className="w-1 flex-shrink-0" aria-hidden="true"></div>
      </div>
    </section>
  );
}
