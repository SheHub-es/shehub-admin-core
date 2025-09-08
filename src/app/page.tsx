"use client";

import { useState } from "react";
import AnimatedLogo from "@/components/AnimatedLogo";
import LoginForm from "@/components/LoginForm";

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

  return (
    <>
      {showAnimation && (
        <AnimatedLogo
          onAnimationComplete={handleAnimationComplete}
          skipIntro={skipIntro}
        />
      )}

      {!showAnimation && <LoginForm onRestart={restartAnimation} />}
    </>
  );
}
