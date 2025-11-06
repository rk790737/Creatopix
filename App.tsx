import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageGenerator } from './components/ImageGenerator';
import { DesignStudio } from './components/DesignStudio';
import { LandingPage } from './components/LandingPage';

interface UserSession {
  name: string;
  projectName: string;
}

const App: React.FC = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [activeView, setActiveView] = useState<'generator' | 'studio'>('generator');

  const handleStart = (name: string, projectName: string) => {
    setUserSession({ name, projectName });
  };
  
  if (!userSession) {
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-[#1F1F1F] text-white">
      <Header activeView={activeView} setActiveView={setActiveView} />
      <main>
        {activeView === 'generator' && <ImageGenerator projectName={userSession.projectName} />}
        {activeView === 'studio' && <DesignStudio />}
      </main>
    </div>
  );
};

export default App;