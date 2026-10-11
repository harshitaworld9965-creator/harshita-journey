import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import "./Maths.css";

const GRID = 30; // the surface is a 30 × 30 mesh

export default function Maths() {
  const sceneRef = useRef(null);
  const canvasRef = useRef(null);
  const state = useRef({ active: false, scroll: 0, rot: 0, t: 0 });

  // --- Canvas: a rippling chalk wireframe, z = sin(x) · cos(y) ---
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const s = state.current;
    let rafId;

    const drawFrame = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const a = s.rot + s.scroll * 1.6; // spin: slow drift + scroll
      const b = 1.05; // fixed camera tilt
      const cosA = Math.cos(a), sinA = Math.sin(a);
      const cosB = Math.cos(b), sinB = Math.sin(b);
      const size = Math.min(W, H) * 0.48;
      const cx = W * 0.5, cy = H * 0.52;

      const pts = [];
      for (let i = 0; i <= GRID; i++) {
        const row = [];
        for (let j = 0; j <= GRID; j++) {
          const x = (i / GRID) * 2 - 1;
          const y = (j / GRID) * 2 - 1;
          const z = 0.32 * Math.sin(3.2 * x + s.t) * Math.cos(2.6 * y - s.t * 0.7);
          const xr = x * cosA - y * sinA;
          const yr = x * sinA + y * cosA;
          const yt = yr * cosB - z * sinB;
          const zt = yr * sinB + z * cosB;
          const persp = 2.4 / (2.4 + zt);
          row.push([cx + xr * persp * size, cy + yt * persp * size]);
        }
        pts.push(row);
      }

      ctx.lineWidth = dpr;
      for (let i = 0; i <= GRID; i++) {
        ctx.beginPath();
        pts[i].forEach(([px, py], j) => (j ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.strokeStyle = `rgba(233,226,211,${0.18 + 0.25 * (i / GRID)})`;
        ctx.stroke();

        ctx.beginPath();
        for (let j = 0; j <= GRID; j++) {
          const [px, py] = pts[j][i];
          if (j) ctx.lineTo(px, py);
          else ctx.moveTo(px, py);
        }
        ctx.strokeStyle = `rgba(233,226,211,${0.12 + 0.2 * (i / GRID)})`;
        ctx.stroke();
      }
    };

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      if (reduce) drawFrame();
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      rafId = requestAnimationFrame(loop);
      if (!s.active) return;
      s.t += 0.008;
      s.rot += 0.0025;
      drawFrame();
    };
    if (!reduce) loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // --- Scroll choreography ---
  useGSAP(
    (context, contextSafe) => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let cancelled = false;

      document.fonts.ready.then(
        contextSafe(() => {
          if (cancelled) return;

          const lines = gsap.utils
            .toArray("[data-split]", sceneRef.current)
            .flatMap((el) => SplitText.create(el, { type: "lines", mask: "lines" }).lines);

          if (reduce) return;

          // Canvas runs only while the room is on screen:
          // 100% scrolling in + 180% pinned + 100% scrolling out = 380%
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
                onUpdate: (self) => (state.current.scroll = self.progress),
              },
            })
            .from(".maths-year", { xPercent: 40, opacity: 0, ease: "none" }, 0)
            .from(lines, { yPercent: 110, stagger: 0.04, duration: 0.5, ease: "power3.out" }, 0.05)
            .to({}, { duration: 0.5 });

          ScrollTrigger.refresh();
        })
      );

      return () => {
        cancelled = true;
      };
    },
    { scope: sceneRef }
  );

  return (
    <section ref={sceneRef} className="scene maths" data-chapter="ROOM ONE">
      <canvas ref={canvasRef} aria-hidden="true" />
      <p className="display maths-year" aria-hidden="true">2019</p>

      <div className="copy">
        <p className="small">Room one</p>
        <h2 className="display maths-heading" data-split>
          A PROOF<br />IS A PATH
        </h2>
        <p className="prose" data-split>
          Delhi Technological University. A B.Tech in Mathematics and Computing. Four
          years of learning that every line must follow from the one before it, and
          that a single wrong step <em>breaks the whole thing</em>.
        </p>
        <p className="prose" data-split>
          I was learning how to debug. I just didn&apos;t know it yet.
        </p>
      </div>
    </section>
  );
}
