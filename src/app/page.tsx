'use client';

import { useState } from 'react';
import AnimatedLogo from '@/components/AnimatedLogo';
import LoginForm from '@/components/LoginForm';

export default function Home() {
  const [showAnimation, setShowAnimation] = useState(true);
  const [skipIntro, setSkipIntro] = useState(false);

  const handleAnimationComplete = () => {
    console.log('🎬 Animación completada!'); // ← Añadir este log
    setShowAnimation(false);
  };

  const restartAnimation = () => {
    console.log('🔄 Reiniciando animación'); // ← Añadir este log
    setShowAnimation(true);
    setSkipIntro(false);
  };

  console.log('🔍 Estado actual:', { showAnimation, skipIntro }); // ← Añadir este log

  return (
    <>
      {showAnimation && (
        <AnimatedLogo 
          onAnimationComplete={handleAnimationComplete}
          skipIntro={skipIntro}
        />
      )}
      
      {!showAnimation && (
        <LoginForm onRestart={restartAnimation} />
      )}
    </>
  );
}