"use client";

import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

// Registrar el plugin de texto
gsap.registerPlugin(TextPlugin);

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
  const communityLinesRef = useRef<HTMLDivElement>(null);

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const skipDelayRef = useRef<gsap.core.Tween | null>(null);
  const mmRef = useRef<gsap.MatchMedia | null>(null);

  const [shouldSkip, setShouldSkip] = useState(false);

  // Textos para typewriter
  const texts = [
    "Construyendo comunidad",
    "Empoderando mujeres", 
    "Creando futuro"
  ];

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
    console.log('🚀 Soft skip ejecutado');
    const tl = tlRef.current;
    if (tl) {
      // Acelerar la timeline pero asegurar que complete
      tl.timeScale(8);
      tl.eventCallback("onComplete", onAnimationComplete);
      if (tl.progress() < 1) {
        tl.play();
      } else {
        onAnimationComplete();
      }
    } else {
      console.log('📞 No hay timeline, llamando callback directamente');
      onAnimationComplete();
    }
  }, [onAnimationComplete]);

  const hardSkip = useCallback(() => {
    console.log('⚡ Hard skip ejecutado');
    tlRef.current?.kill();
    skipDelayRef.current?.kill();
    mmRef.current?.revert?.();
    console.log('📞 Llamando onAnimationComplete desde hardSkip');
    onAnimationComplete();
  }, [onAnimationComplete]);

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
            typewriter: 1.4,
            gap: 0.1,
            lines: 0.4,
            communityLines: 0.6,
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
              communityLinesRef.current,
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
            rotationX: 5,
          });
          
          // Configuración inicial para typewriter - textos vacíos
          textLines.forEach((line, i) => {
            line.textContent = "";
            line.setAttribute('data-text', texts[i]);
          });
          
          gsap.set(linesRef.current, { autoAlpha: 0 });
          gsap.set(glowRef.current, { autoAlpha: 0, scale: 0.8 });
          gsap.set(communityLinesRef.current, { autoAlpha: 0 });

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

          // 2) ENTRADA TEXTOS CON TYPEWRITER
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

          // Efecto typewriter para cada texto
          textLines.forEach((line, i) => {
            const text = texts[i];
            tl.to(line, {
              text: {
                value: text,
                delimiter: ""
              },
              duration: DUR.typewriter,
              ease: "none",
            }, DUR.logoIn + 0.6 + (i * 0.5));
          });

          // 3) Líneas decorativas originales
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

          // 4) LÍNEAS DE COMUNIDAD
          tl.to(
            communityLinesRef.current,
            {
              autoAlpha: 1,
              duration: 0.3,
              ease: "power2.out",
            },
            ">-0.2"
          )
          
          // Líneas de conexión aparecen una por una
          .to(
            q(".community-line"),
            {
              scaleX: 1,
              autoAlpha: 1,
              duration: DUR.communityLines,
              stagger: {
                amount: 0.4,
                from: "center",
                ease: "power2.out"
              },
              transformOrigin: "center center",
              ease: "power2.out",
            },
            ">-0.1"
          );

          // 5) PAUSA contemplativa
          tl.to({}, { duration: DUR.pause }, ">+0.2");

          // 6) SALIDA elegante y fluida - TEXTOS Y LÍNEAS JUNTOS
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

          // Textos: EXPANSIÓN POR TODA LA PANTALLA - más fluido y posicionado
          tl.to(
            textLines,
            {
              scale: finalScaleText * 1.5, // Más grande para cubrir más pantalla
              x: (i) => {
                // Vectores específicos para cada posición
                const positionVectors = [
                  { x: -window.innerWidth * 0.3, y: -window.innerHeight * 0.4 }, // "Construyendo comunidad" - arriba izquierda
                  { x: window.innerWidth * 0.4, y: 0 }, // "Empoderando mujeres" - centro derecha
                  { x: -window.innerWidth * 0.2, y: window.innerHeight * 0.4 }, // "Creando futuro" - abajo izquierda
                ];
                const vector = positionVectors[i] ?? positionVectors[0];
                return vector.x;
              },
              y: (i) => {
                const positionVectors = [
                  { x: -window.innerWidth * 0.3, y: -window.innerHeight * 0.4 }, // "Construyendo comunidad" - arriba
                  { x: window.innerWidth * 0.4, y: 0 }, // "Empoderando mujeres" - centro
                  { x: -window.innerWidth * 0.2, y: window.innerHeight * 0.4 }, // "Creando futuro" - abajo
                ];
                const vector = positionVectors[i] ?? positionVectors[0];
                return vector.y;
              },
              autoAlpha: 0,
              duration: DUR.explode * 1.2, // Un poco más lento para mayor fluidez
              ease: "power1.out", // Aún más suave
              force3D: true,
              stagger: {
                amount: 0.08, // Muy poco stagger para que salgan casi juntos
                from: "start",
              },
            },
            "explode+0.05"
          );

          // LÍNEAS SALEN AL MISMO TIEMPO QUE LOS TEXTOS
          tl.to(
            [q(".network-line"), q(".community-line")],
            {
              autoAlpha: 0,
              scaleX: 3, // Crecen en lugar de reducirse
              scaleY: 2, // También crecen verticalmente
              rotation: (i) => (i % 2 === 0 ? 180 : -180), // Rotan mientras se expanden
              duration: DUR.explode * 1.1, // Misma duración que los textos
              ease: "power2.out", // Misma suavidad que los textos
              stagger: 0.03, // Stagger muy pequeño
            },
            "explode+0.05" // Mismo timing que los textos
          );

          // Contenedores de líneas también se expanden
          tl.to(
            [linesRef.current, communityLinesRef.current],
            {
              autoAlpha: 0,
              scale: 4, // Se expanden
              duration: DUR.explode * 1.1,
              ease: "power2.out",
            },
            "explode+0.05"
          );

          // 7) Fade final del contenedor
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
      {/* Skip Button */}
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

      {/* Líneas decorativas originales */}
      <div ref={linesRef} className="absolute inset-0 pointer-events-none">
        <div className="network-line absolute top-1/4 left-0 w-36 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent rotate-12 scale-x-0" />
        <div className="network-line absolute top-1/2 right-0 w-28 h-px bg-gradient-to-r from-transparent via-pink-400/60 to-transparent -rotate-12 scale-x-0" />
        <div className="network-line absolute bottom-1/3 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent rotate-45 scale-x-0" />
        <div className="network-line absolute top-1/3 right-1/4 w-24 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent -rotate-45 scale-x-0" />
      </div>

      {/* LÍNEAS DE COMUNIDAD */}
      <div ref={communityLinesRef} className="absolute inset-0 pointer-events-none">
        {/* Líneas que conectan hacia el centro desde diferentes puntos */}
        <div className="community-line absolute top-1/3 left-1/6 w-32 h-0.5 bg-gradient-to-r from-purple-400/70 via-purple-500/90 to-purple-300/60 rotate-[25deg] scale-x-0 rounded-full" />
        <div className="community-line absolute top-2/3 left-1/5 w-36 h-0.5 bg-gradient-to-r from-pink-400/70 via-pink-500/90 to-pink-300/60 rotate-[-35deg] scale-x-0 rounded-full" />
        <div className="community-line absolute top-1/2 left-1/12 w-40 h-0.5 bg-gradient-to-r from-orange-400/70 via-orange-500/90 to-orange-300/60 rotate-[15deg] scale-x-0 rounded-full" />
        
        <div className="community-line absolute top-1/4 right-1/6 w-34 h-0.5 bg-gradient-to-l from-purple-400/70 via-purple-500/90 to-purple-300/60 rotate-[-20deg] scale-x-0 rounded-full" />
        <div className="community-line absolute top-3/5 right-1/5 w-38 h-0.5 bg-gradient-to-l from-pink-400/70 via-pink-500/90 to-pink-300/60 rotate-[40deg] scale-x-0 rounded-full" />
        <div className="community-line absolute top-1/2 right-1/12 w-36 h-0.5 bg-gradient-to-l from-orange-400/70 via-orange-500/90 to-orange-300/60 rotate-[-10deg] scale-x-0 rounded-full" />
        
        {/* Líneas horizontales que sugieren conexión entre personas */}
        <div className="community-line absolute bottom-1/4 left-1/3 w-28 h-0.5 bg-gradient-to-r from-purple-300/60 via-purple-400/80 to-purple-300/60 scale-x-0 rounded-full" />
        <div className="community-line absolute top-1/5 right-1/3 w-24 h-0.5 bg-gradient-to-r from-pink-300/60 via-pink-400/80 to-pink-300/60 scale-x-0 rounded-full" />
        
        {/* Líneas adicionales para más sensación de red */}
        <div className="community-line absolute bottom-1/3 right-1/4 w-22 h-0.5 bg-gradient-to-r from-orange-300/60 via-orange-400/80 to-orange-300/60 rotate-[60deg] scale-x-0 rounded-full" />
        <div className="community-line absolute top-2/5 left-1/8 w-26 h-0.5 bg-gradient-to-r from-purple-300/60 via-purple-400/80 to-purple-300/60 rotate-[-50deg] scale-x-0 rounded-full" />
        
        {/* Puntos de conexión que representan personas */}
        <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-purple-500/80 rounded-full opacity-0 animate-pulse shadow-sm" style={{animationDelay: '1.8s'}} />
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-pink-500/80 rounded-full opacity-0 animate-pulse shadow-sm" style={{animationDelay: '2.1s'}} />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-orange-500/80 rounded-full opacity-0 animate-pulse shadow-sm" style={{animationDelay: '2.4s'}} />
        <div className="absolute top-1/4 right-1/3 w-1.5 h-1.5 bg-purple-600/80 rounded-full opacity-0 animate-pulse shadow-sm" style={{animationDelay: '2.7s'}} />
        <div className="absolute bottom-1/4 left-2/5 w-1.5 h-1.5 bg-pink-600/80 rounded-full opacity-0 animate-pulse shadow-sm" style={{animationDelay: '3s'}} />
        <div className="absolute top-1/5 left-2/3 w-1.5 h-1.5 bg-orange-600/80 rounded-full opacity-0 animate-pulse shadow-sm" style={{animationDelay: '3.3s'}} />
      </div>

      {/* Contenido principal - MOVIDO MÁS ARRIBA */}
      <div className="text-center space-y-10 -mt-20">
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
          {/* TEXTOS CON EFECTO 3D SUTIL Y TYPEWRITER */}
          <p className="typewriter-text text-purple-600 font-secondary text-xl md:text-2xl font-medium tracking-wide" 
             style={{ 
               textShadow: '1px 1px 2px rgba(120, 88, 255, 0.1), 0px 2px 4px rgba(120, 88, 255, 0.05)',
               filter: 'drop-shadow(0px 1px 1px rgba(120, 88, 255, 0.1))'
             }}>
          </p>
          <p className="typewriter-text text-pink-600 font-secondary text-xl md:text-2xl font-medium tracking-wide"
             style={{ 
               textShadow: '1px 1px 2px rgba(248, 60, 133, 0.1), 0px 2px 4px rgba(248, 60, 133, 0.05)',
               filter: 'drop-shadow(0px 1px 1px rgba(248, 60, 133, 0.1))'
             }}>
          </p>
          <p className="typewriter-text text-orange-600 font-secondary text-xl md:text-2xl font-medium tracking-wide"
             style={{ 
               textShadow: '1px 1px 2px rgba(247, 103, 2, 0.1), 0px 2px 4px rgba(247, 103, 2, 0.05)',
               filter: 'drop-shadow(0px 1px 1px rgba(247, 103, 2, 0.1))'
             }}>
          </p>
        </div>
      </div>

      {/* Partículas minimalistas */}
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