
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const baseClasses = 'bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg p-6 transition-all duration-300';
  const interactiveClasses = onClick ? 'cursor-pointer hover:border-[#a882dd] hover:shadow-2xl hover:-translate-y-1' : '';

  return (
    <div className={`${baseClasses} ${interactiveClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};
