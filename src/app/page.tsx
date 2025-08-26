'use client';

import { useState } from 'react';
import AnimatedLogo from '@/components/AnimatedLogo';

export default function Home() {
  const [showAnimation, setShowAnimation] = useState(true);
  const [skipIntro, setSkipIntro] = useState(false);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  const restartAnimation = () => {
    setShowAnimation(true);
    setSkipIntro(false);
  };

  const testSkipAnimation = () => {
    setShowAnimation(true);
    setSkipIntro(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {showAnimation && (
        <AnimatedLogo 
          onAnimationComplete={handleAnimationComplete}
          skipIntro={skipIntro}
        />
      )}
      
      {!showAnimation && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-8">
            <h1 className="text-4xl font-bold text-purple-600">
              Animación Completada
            </h1>
            <p className="text-lg text-gray-600">
              Aquí iría el formulario de login
            </p>
            
            {/* Test buttons */}
            <div className="flex gap-4 justify-center">
              <button 
                onClick={restartAnimation}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Ver animación completa
              </button>
              <button 
                onClick={testSkipAnimation}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Probar skip intro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
