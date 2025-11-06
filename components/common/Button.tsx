import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-6 py-3 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-transform transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-[#A755F7] text-white hover:bg-[#9333EA] focus:ring-[#A755F7]',
    secondary: 'bg-[#23b5d3] text-white hover:bg-[#34c6e4] focus:ring-[#23b5d3]',
    outline: 'bg-transparent border-2 border-[#a0eec0] text-[#a0eec0] hover:bg-[#a0eec0] hover:text-gray-900',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};