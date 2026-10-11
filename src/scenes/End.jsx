import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import "./End.css";

export default function End() {
  const sceneRef = useRef(null);

  useGSAP(
    (context, contextSafe) => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let cancelled = false;

      document.fonts.ready.then(
        contextSafe(() => {
          if (cancelled) return;

          const chars = SplitText.create(".end-heading", { type: "chars" }).chars;
          if (reduce) return;

          gsap.from(chars, {
            opacity: 0,
            yPercent: 60,
            filter: "blur(8px)",
            stagger: 0.04,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: sceneRef.current, start: "top 70%" },
          });

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
    <section ref={sceneRef} className="scene end" data-chapter="END">
      <div className="copy end-copy">
        <h2 className="display end-heading">STILL DRAWING</h2>
        <p className="prose">
          See the work at{" "}
<a href="https://harshita-works.vercel.app/">harshita-works.vercel.app</a>{" "}
          or the code on{" "}
          <a href="https://github.com/harshitaworld9965-creator">GitHub</a>.
        </p>
      </div>
    </section>
  );
}
