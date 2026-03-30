import { useEffect, useState } from 'react';

interface LogoProps {
  className?: string;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', animated = true, size = 'md' }: LogoProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sizeClasses = {
    sm: 'h-8 w-24',
    md: 'h-12 w-36',
    lg: 'h-16 w-48',
    xl: 'h-20 w-60',
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${className} relative transition-all duration-1000 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="relative w-full h-full">
        {/* Enhanced professional glow effect */}
        {animated && (
          <>
            <div 
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/15 via-amber-500/20 to-yellow-600/15 rounded-lg blur-xl"
            />
            <div 
              className="absolute inset-0 bg-gradient-radial from-yellow-300/10 via-transparent to-transparent rounded-lg blur-2xl"
            />
          </>
        )}
        
        {/* Logo container with hover effect */}
        <div 
          className={`relative w-full h-full transition-transform duration-300 ${
            animated ? 'hover:scale-105' : ''
          }`}
        >
          <img 
            src="/logo_AB.svg" 
            alt="Anisa Berliku Law Firm Logo" 
            className="w-full h-full object-contain relative z-10"
            style={{
              filter: animated ? 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.3)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.15)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
              transition: 'filter 0.3s ease-in-out',
            }}
          />
          
          {/* Multiple shine effects for professional look */}
          {animated && (
            <>
              {/* Main shine sweep */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full animate-shine-main z-20 pointer-events-none"
                style={{
                  animation: 'shineMain 6s infinite',
                }}
              />
              {/* Secondary subtle shine */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/15 to-transparent transform -skew-x-8 -translate-x-full animate-shine-secondary z-20 pointer-events-none"
                style={{
                  animation: 'shineSecondary 8s infinite 2s',
                }}
              />
              {/* Radial shine overlay */}
              <div 
                className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent animate-pulse-slow z-20 pointer-events-none"
                style={{
                  animation: 'pulseSlow 4s ease-in-out infinite',
                }}
              />
            </>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes shineMain {
          0% {
            transform: translateX(-150%) skewX(-12deg);
            opacity: 0;
          }
          45% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.5;
          }
          55% {
            opacity: 0.4;
          }
          100% {
            transform: translateX(250%) skewX(-12deg);
            opacity: 0;
          }
        }
        @keyframes shineSecondary {
          0% {
            transform: translateX(-150%) skewX(-8deg);
            opacity: 0;
          }
          40% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
          60% {
            opacity: 0.2;
          }
          100% {
            transform: translateX(250%) skewX(-8deg);
            opacity: 0;
          }
        }
        @keyframes pulseSlow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}

