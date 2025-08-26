"use client";

import { gsap } from "gsap";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface AnimatedLogoProps {
  onAnimationComplete: () => void;
  skipIntro?: boolean;
}

export default function AnimatedLogo({
  onAnimationComplete,
  skipIntro = false,
}: AnimatedLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textWrapperRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const skipBtnRef = useRef<HTMLButtonElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const skipDelayRef = useRef<gsap.core.Tween | null>(null);
  const mmRef = useRef<gsap.MatchMedia | null>(null);

  const [shouldSkip, setShouldSkip] = useState(false);

  // Reduce motion / skip
  useEffect(() => {
    const reduced =
      typeof window !== "undefined"
        ? (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
          false)
        : false;
    setShouldSkip(skipIntro || reduced);
  }, [skipIntro]);

  const softSkip = useCallback(() => {
    const tl = tlRef.current;
    if (tl) {
      tl.timeScale(4);
      tl.play(tl.duration());
    } else onAnimationComplete();
  }, [onAnimationComplete]);

  const hardSkip = () => {
    tlRef.current?.kill();
    skipDelayRef.current?.kill();
    mmRef.current?.revert?.();
    onAnimationComplete();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") softSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [softSkip]);

  useLayoutEffect(() => {
    if (shouldSkip) {
      onAnimationComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(containerRef);
      mmRef.current = gsap.matchMedia();
      gsap.defaults({ ease: "power2.out" });

      skipDelayRef.current = gsap.delayedCall(0.5, () => {
        if (skipBtnRef.current) {
          gsap.fromTo(
            skipBtnRef.current,
            { autoAlpha: 0, y: -10, scale: 0.95 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.4,
              ease: "back.out(1.2)",
            }
          );
        }
      });

      mmRef.current.add(
        { isMobile: "(max-width: 767px)", isDesktop: "(min-width: 768px)" },
        (mctx) => {
          const isMobile = !!mctx.conditions?.isMobile;

          const DUR = {
            logoIn: isMobile ? 0.8 : 1.0,
            logoBreath: 1.0,
            settle: 0.25,
            textsIn: isMobile ? 0.5 : 0.7,
            gap: 0.1,
            lines: 0.4,
            glow: 0.8,
            pause: isMobile ? 0.1 : 0.2,
            explode: isMobile ? 1.1 : 1.3,
            fade: 0.25,
          };

          const finalScaleLogo = isMobile ? 11 : 15;
          const finalScaleText = isMobile ? 8 : 11;

          const disperseVectors = [
            { x: -260, y: -200 },
            { x: 280, y: -80 },
            { x: -100, y: 250 },
          ];

          gsap.set(containerRef.current, { autoAlpha: 1 });
          const textLines = Array.from(
            (textWrapperRef.current?.querySelectorAll(".typewriter-text") ??
              []) as NodeListOf<HTMLElement>
          );

          gsap.set(
            [
              logoRef.current,
              textWrapperRef.current,
              ...textLines,
              linesRef.current,
              glowRef.current,
            ],
            {
              willChange: "transform, opacity",
              transformOrigin: "50% 50%",
              force3D: true,
            }
          );

          // Estados iniciales 
          gsap.set(textLines, {
            autoAlpha: 0,
            y: 25,
            scale: 0.96,
            rotationX: 5, // Leve perspectiva 3D
          });
          gsap.set(linesRef.current, { autoAlpha: 0 });
          gsap.set(glowRef.current, { autoAlpha: 0, scale: 0.8 });

          const tl = gsap.timeline({ paused: true });
          tlRef.current = tl;
          tl.eventCallback("onComplete", onAnimationComplete);

          // 1) ENTRADA LOGO
          tl.fromTo(
            logoRef.current,
            {
              autoAlpha: 0,
              scale: 0,
              y: -30,
            },
            {
              autoAlpha: 1,
              scale: 1.08,
              y: 0,
              duration: DUR.logoIn,
              ease: "elastic.out(1, 0.5)",
              force3D: true,
            },
            0
          )

            // Resplandor sutil del logo
            .to(
              glowRef.current,
              {
                autoAlpha: 0.3,
                scale: 1.1,
                duration: DUR.glow,
                ease: "power2.out",
              },
              DUR.logoIn * 0.4
            )

            // Asentamiento suave con respiración
            .to(
              logoRef.current,
              {
                scale: 1.02,
                duration: DUR.settle,
                ease: "power2.out",
              },
              DUR.logoIn
            )

            // Respiración muy sutil del logo
            .to(
              logoRef.current,
              {
                scale: 1.04,
                duration: DUR.logoBreath,
                ease: "sine.inOut",
                repeat: 2,
                yoyo: true,
              },
              DUR.logoIn + DUR.settle
            );

          // 2) ENTRADA TEXTOS
          tl.to(
            textLines,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              rotationX: 0,
              duration: DUR.textsIn,
              stagger: {
                amount: DUR.gap * textLines.length,
                ease: "power2.out",
              },
              ease: "back.out(1.3)",
            },
            DUR.logoIn + 0.2
          );

          // 3) Líneas decorativas más orgánicas
          tl.to(
            q(".network-line"),
            {
              autoAlpha: 1,
              scaleX: 1,
              duration: DUR.lines,
              stagger: {
                amount: 0.3,
                from: "center",
              },
              transformOrigin: "center center",
              ease: "power3.out",
            },
            ">-0.4"
          );

          // 4) PAUSA contemplativa
          tl.to({}, { duration: DUR.pause }, ">+0.2");

          // 5) SALIDA elegante y fluida
          tl.addLabel("explode");

          // Logo: crecimiento y desvanecimiento suave
          tl.to(
            logoRef.current,
            {
              scale: finalScaleLogo,
              autoAlpha: 0,
              duration: DUR.explode,
              ease: "power2.in",
              force3D: true,
            },
            "explode"
          );

          // Resplandor se desvanece
          tl.to(
            glowRef.current,
            {
              scale: finalScaleLogo * 1.2,
              autoAlpha: 0,
              duration: DUR.explode * 0.9,
              ease: "power2.in",
            },
            "explode"
          );

          // Textos: dispersión orgánica
          tl.to(
            textLines,
            {
              scale: finalScaleText,
              x: (i) => {
                const vector =
                  disperseVectors[i] ??
                  disperseVectors[disperseVectors.length - 1];
                return vector.x + (Math.random() - 0.5) * 150;
              },
              y: (i) => {
                const vector =
                  disperseVectors[i] ??
                  disperseVectors[disperseVectors.length - 1];
                return vector.y + (Math.random() - 0.5) * 150;
              },
              autoAlpha: 0,
              duration: DUR.explode,
              ease: "power2.in",
              force3D: true,
              stagger: {
                amount: 0.15,
                from: "start",
              },
            },
            "explode+0.05"
          );

          // Líneas se desvanecen suavemente
          tl.to(
            q(".network-line"),
            {
              autoAlpha: 0,
              scaleX: 0.3,
              duration: DUR.explode * 0.7,
              ease: "power2.in",
              stagger: 0.05,
            },
            "explode+0.1"
          );

          // 6) Fade final del contenedor
          tl.to(
            containerRef.current,
            {
              autoAlpha: 0,
              duration: DUR.fade,
              ease: "power2.inOut",
            },
            ">-0.1"
          );

          tl.play(0);
        }
      );
    }, containerRef);

    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
      skipDelayRef.current?.kill();
      skipDelayRef.current = null;
      mmRef.current?.revert?.();
      ctx.revert();
    };
  }, [shouldSkip, onAnimationComplete]);

  if (shouldSkip) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center overflow-visible"
      role="dialog"
      aria-modal="true"
      aria-label="Introducción animada"
      style={{ visibility: "hidden" }}
    >
      {/* Skip Button mejorado */}
      <button
        onClick={(e) => (e.shiftKey ? hardSkip() : softSkip())}
        ref={skipBtnRef}
        className="absolute top-8 right-8 bg-white/25 backdrop-blur-md border border-white/40 px-5 py-2.5 rounded-lg text-purple-700 hover:bg-white/35 hover:scale-105 transition-all duration-300 text-sm font-medium z-10 opacity-0 shadow-md"
        aria-label="Saltar introducción"
        style={{ visibility: "hidden" }}
      >
        <span className="flex items-center gap-2">
          Saltar intro
          <span className="text-xs opacity-60">ESC</span>
        </span>
      </button>

      {/* Resplandor sutil del logo */}
      <div ref={glowRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-radial from-purple-200/40 via-pink-100/20 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Líneas decorativas refinadas */}
      <div ref={linesRef} className="absolute inset-0 pointer-events-none">
        <div className="network-line absolute top-1/4 left-0 w-36 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent rotate-12 scale-x-0" />
        <div className="network-line absolute top-1/2 right-0 w-28 h-px bg-gradient-to-r from-transparent via-pink-400/60 to-transparent -rotate-12 scale-x-0" />
        <div className="network-line absolute bottom-1/3 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent rotate-45 scale-x-0" />
        <div className="network-line absolute top-1/3 right-1/4 w-24 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent -rotate-45 scale-x-0" />
      </div>

      {/* Contenido principal */}
      <div className="text-center space-y-10">
        <div
          ref={logoRef}
          className="flex justify-center will-change-transform"
        >
          <Image
            src="/images/logo-shehub.png"
            alt="SheHub"
            width={220}
            height={66}
            priority
            className="drop-shadow-xl filter brightness-105"
          />
        </div>

        <div ref={textWrapperRef} className="space-y-5 will-change-transform">
          <p className="typewriter-text text-purple-600 font-secondary text-xl md:text-2xl font-medium tracking-wide">
            Construyendo comunidad
          </p>
          <p className="typewriter-text text-pink-600 font-secondary text-xl md:text-2xl font-medium tracking-wide">
            Empoderando mujeres
          </p>
          <p className="typewriter-text text-orange-600 font-secondary text-xl md:text-2xl font-medium tracking-wide">
            Creando futuro
          </p>
        </div>
      </div>

      {/* Partículas minimalistas y elegantes solo desktop */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <div className="absolute w-2.5 h-2.5 bg-purple-300/50 rounded-full top-1/4 left-1/3 animate-pulse backdrop-blur-sm" />
        <div
          className="absolute w-2 h-2 bg-pink-400/50 rounded-full top-2/3 right-1/4 animate-pulse backdrop-blur-sm"
          style={{ animationDelay: "1500ms" }}
        />
        <div
          className="absolute w-2 h-2 bg-orange-300/50 rounded-full bottom-1/4 left-1/4 animate-pulse backdrop-blur-sm"
          style={{ animationDelay: "750ms" }}
        />
      </div>
    </div>
  );
}
