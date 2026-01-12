interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = "px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  
  const variants = {
    primary: "bg-cyber-purple text-white shadow-neon hover:shadow-neon-strong hover:scale-105 active:scale-100",
    secondary: "bg-transparent border border-cyber-purple/30 text-cyber-purple hover:bg-cyber-purple/10 active:bg-cyber-purple/20",
    danger: "bg-red-600 text-white shadow-neon-pink hover:shadow-neon-strong hover:scale-105 active:scale-100",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
