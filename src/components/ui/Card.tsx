interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = true }: CardProps) {
  const hoverStyles = hover ? 'hover:scale-[1.02] hover:shadow-neon-strong' : '';
  
  return (
    <div 
      className={`
        bg-slate-900/50 backdrop-blur-sm 
        border border-cyber-purple/30 
        rounded-xl shadow-xl 
        transition-all duration-300
        ${hoverStyles}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
