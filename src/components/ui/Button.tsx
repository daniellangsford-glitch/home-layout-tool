import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantClasses: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600',
  secondary: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent',
  danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-600',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

export function Button({ variant = 'secondary', size = 'md', className = '', children, ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
