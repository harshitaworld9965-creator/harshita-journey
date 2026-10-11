import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import "./Title.css";

export default function Title() {
  const sceneRef = useRef(null);

  useGSAP(
    (context, contextSafe) => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let cancelled = false;

      document.fonts.ready.then(
        contextSafe(() => {
          if (cancelled) return;

          const chars = gsap.utils
            .toArray(".title-word", sceneRef.current)
            .flatMap((word) => SplitText.create(word, { type: "chars" }).chars);

          if (reduce) return;

          // --- Opening shot (plays once on load) ---
          const barTop = document.querySelector(".bar-top");
          const barBottom = document.querySelector(".bar-bottom");

          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .from(barTop, { scaleY: 6, transformOrigin: "top", duration: 1.4 }, 0)
            .from(barBottom, { scaleY: 6, transformOrigin: "bottom", duration: 1.4 }, 0)
            .from(chars, { opacity: 0, filter: "blur(14px)", duration: 1.6, stagger: 0.06 }, 0.4)
            .from(".title-word", { letterSpacing: "0.5em", duration: 2.2, ease: "power2.inOut" }, 0.4)
            .to(".title-beam", { opacity: 1, duration: 1.8 }, 0.8)
            .from(".title-kicker, .title-sub", { opacity: 0, y: 14, duration: 1, stagger: 0.15 }, 1.4);

          // --- Fly-through (follows the scroll) ---
          gsap
            .timeline({
              scrollTrigger: {
                trigger: sceneRef.current,
                start: "top top",
                end: "+=120%",
                pin: true,
                scrub: 1,
              },
            })
            .to(".title-copy", { scale: 2.2, opacity: 0, filter: "blur(10px)", ease: "power2.in" }, 0)
            .to(".title-beam", { opacity: 0 }, 0);

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
    <section ref={sceneRef} className="scene title" data-chapter="TITLE">
      <div className="title-beam motion-only" aria-hidden="true" />

      <div className="copy title-copy">
        <p className="small title-kicker">Harshita, a story in three rooms</p>
        <h1 className="display title-heading">
          <span className="title-word">THREE</span>
          <span className="title-word">ROOMS</span>
        </h1>
        <p className="title-sub">
          A degree in mathematics. Six years in the law. And then, a screen.
        </p>
      </div>
    </section>
  );
}
