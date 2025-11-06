import React from 'react';
import { PALETTE } from '../constants';

interface HeaderProps {
  activeView: 'generator' | 'studio';
  setActiveView: (view: 'generator' | 'studio') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  const navButtonClasses = (view: 'generator' | 'studio') => 
    `px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
      activeView === view
        ? 'bg-blue-500 text-white shadow-lg'
        : 'bg-transparent text-gray-300 hover:bg-gray-700/50'
    }`;

  return (
    <header className="py-4 px-8 bg-gray-900/50 backdrop-blur-md border-b border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wider">
          Creat<span style={{ color: PALETTE.purple }}>o</span>p<span style={{ color: PALETTE.cyan }}>i</span>x
        </h1>
        <nav className="flex items-center space-x-2 bg-gray-800/60 border border-gray-700 p-1 rounded-lg">
          <button onClick={() => setActiveView('generator')} className={navButtonClasses('generator')}>
            AI Image Generation
          </button>
          <button onClick={() => setActiveView('studio')} className={navButtonClasses('studio')}>
            Visual Design Studio
          </button>
        </nav>
      </div>
    </header>
  );
};