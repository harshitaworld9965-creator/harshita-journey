import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import "./Interfaces.css";

const PARTICLES = 260;
const CORAL = "#ff6a4d"; // match --coral
const SKY = "#6fd3ff"; // match --sky

export default function Interfaces() {
  const sceneRef = useRef(null);
  const canvasRef = useRef(null);
  const cardsRef = useRef(null);
  const state = useRef({ active: false, t: 0 });

  // --- Canvas: a neon flow field ---
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const s = state.current;
    let parts = [];
    let rafId;

    const seed = () => {
      parts = Array.from({ length: PARTICLES }, (_, i) => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        c: i % 3 === 0 ? SKY : CORAL,
      }));
    };

    const step = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.fillStyle = "rgba(9, 8, 18, 0.08)";
      ctx.fillRect(0, 0, W, H);
      s.t += 0.004;
      ctx.lineWidth = 1.2 * dpr;
      ctx.globalAlpha = 0.55;

      for (const p of parts) {
        const ang =
          Math.sin(p.x * 0.0035 + s.t) * 1.6 + Math.cos(p.y * 0.0035 - s.t * 1.3) * 1.6;
        const nx = p.x + Math.cos(ang) * 1.6 * dpr;
        const ny = p.y + Math.sin(ang) * 1.6 * dpr;
        ctx.strokeStyle = p.c;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        p.x = nx;
        p.y = ny;
        if (nx < 0 || nx > W || ny < 0 || ny > H || Math.random() < 0.004) {
          p.x = Math.random() * W;
          p.y = Math.random() * H;
        }
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      seed();
      if (reduce) for (let k = 0; k < 120; k++) step(); // one still frame of trails
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      rafId = requestAnimationFrame(loop);
      if (s.active) step();
    };
    if (!reduce) loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // --- Scroll choreography + pointer tilt ---
  useGSAP(
    (context, contextSafe) => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      let cancelled = false;

      const tiltX = gsap.quickTo(cardsRef.current, "rotationY", { duration: 1.2, ease: "power3.out" });
      const tiltY = gsap.quickTo(cardsRef.current, "rotationX", { duration: 1.2, ease: "power3.out" });
      const onMove = (e) => {
        tiltX((e.clientX / window.innerWidth - 0.5) * 16);
        tiltY(-(e.clientY / window.innerHeight - 0.5) * 12);
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      document.fonts.ready.then(
        contextSafe(() => {
          if (cancelled) return;

          const lines = gsap.utils
            .toArray("[data-split]", sceneRef.current)
            .flatMap((el) => SplitText.create(el, { type: "lines", mask: "lines" }).lines);

          ScrollTrigger.create({
            trigger: sceneRef.current,
            start: "top bottom",
            end: "+=380%",
            onToggle: (self) => (state.current.active = self.isActive),
          });

          gsap
            .timeline({
              scrollTrigger: {
                trigger: sceneRef.current,
                start: "top top",
                end: "+=180%",
                pin: true,
                scrub: 1,
              },
            })
            .from(".ui-card", { z: -900, opacity: 0, rotationY: -30, stagger: 0.12, duration: 1, ease: "power2.out" }, 0)
            .from(".ui-year", { xPercent: -40, opacity: 0, ease: "none" }, 0)
            .from(lines, { yPercent: 110, stagger: 0.04, duration: 0.5, ease: "power3.out" }, 0.2)
            .to({}, { duration: 0.5 });

          ScrollTrigger.refresh();
        })
      );

      return () => {
        cancelled = true;
        window.removeEventListener("pointermove", onMove);
      };
    },
    { scope: sceneRef }
  );

  return (
    <section ref={sceneRef} className="scene interfaces" data-chapter="ROOM THREE">
      <canvas ref={canvasRef} aria-hidden="true" />
      <p className="display ui-year" aria-hidden="true">2026</p>

      <div ref={cardsRef} className="ui-cards" aria-hidden="true">
        {["a", "b", "c"].map((pos) => (
          <div key={pos} className={`ui-card ui-card-${pos}`}>
            <i />
            <i />
            <i />
            <i />
          </div>
        ))}
      </div>

      <div className="copy">
        <p className="small">Room three</p>
        <h2 className="display ui-heading" data-split>
          AN INTERFACE<br />IS BOTH
        </h2>
        <p className="prose" data-split>
          Frontend developer at OpenRipples since July. React, CSS, GSAP. A proof that
          has to hold under every input, and an argument that has to persuade in half
          a second.
        </p>
        <p className="prose" data-split>
          The line is still being drawn. It just moves now.
        </p>
      </div>
    </section>
  );
}
