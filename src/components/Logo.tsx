
import React from 'react';

interface LogoProps {
  height?: number;
  width?: number;
  className?: string;
  showFullName?: boolean;
}

const Logo: React.FC<LogoProps> = ({ height = 60, width = 60, className = "", showFullName = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/lovable-uploads/3bc73754-9d20-4640-aa02-a92df24eeae7.png" 
        alt="Libertá - Espaço Terapêutico" 
        height={height} 
        width={width} 
        className="object-contain" 
      />
      {showFullName && (
        <span className="text-xl font-bold text-[#0EA5E9]">
          Libertá Espaço Terapêutico
        </span>
      )}
    </div>
  );
};

export default Logo;
