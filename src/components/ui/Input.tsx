import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1.5 sm:mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 sm:px-4 py-2 sm:py-2.5
            bg-slate-800/50 
            border border-cyber-purple/30 
            rounded-lg 
            text-sm sm:text-base text-white 
            placeholder:text-gray-400
            focus:outline-none 
            focus:border-cyber-purple 
            focus:ring-2 
            focus:ring-cyber-purple/50
            transition-colors
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs sm:text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
