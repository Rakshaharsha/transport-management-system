import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label &&
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        }
        <div className="relative">
          {icon &&
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              {icon}
            </div>
          }
          <input
            ref={ref}
            className={`
              block w-full rounded-md bg-gray-900 border border-gray-800 
              text-gray-100 placeholder-gray-500
              focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none
              transition-all duration-200
              disabled:opacity-50 disabled:bg-gray-900
              ${icon ? 'pl-10' : 'pl-3'} 
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              py-2 text-sm
              ${className}
            `}
            {...props} />

        </div>
        {error &&
        <div className="mt-1 flex items-center text-red-400 text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error}
          </div>
        }
      </div>);

  }
);
Input.displayName = 'Input';