import React, { useState } from 'react';
import { Button } from './common/Button';
import { PALETTE } from '../constants';

interface LandingPageProps {
  onStart: (name: string, projectName: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !projectName.trim()) {
      setError('Please fill out both your name and the project name.');
      return;
    }
    setError('');
    onStart(name, projectName);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md mx-auto bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8 text-center">
        <h1 className="text-4xl font-bold tracking-wider mb-4">
          Creat<span style={{ color: PALETTE.purple }}>o</span>p<span style={{ color: PALETTE.cyan }}>i</span>x
        </h1>
        <p className="text-gray-400 mb-8">Your AI-Powered Design Powerhouse</p>
        
        <div className="space-y-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#a882dd] transition"
          />
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name"
            className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#a882dd] transition"
          />
        </div>

        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}

        <div className="mt-8">
          <Button onClick={handleSubmit} className="w-full">
            Start Creating
          </Button>
        </div>
      </div>
    </div>
  );
};