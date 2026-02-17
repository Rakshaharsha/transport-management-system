import React from 'react';

export function Badge({
  variant = 'neutral',
  children,
  className = '',
  dot = false,
}) {
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    neutral: 'bg-gray-800 text-gray-300 border-gray-700',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  const dotColors = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
    neutral: 'bg-gray-400',
    info: 'bg-blue-400',
  };

  return (
    <span
      className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
      ${variants[variant]}
      ${className}
    `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant]} animate-pulse`}
        />
      )}
      {children}
    </span>
  );
}
