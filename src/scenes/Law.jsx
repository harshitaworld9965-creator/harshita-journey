import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import "./Law.css";

const BOOK_COLORS = ["#2a1c12", "#3a2616", "#1f1a14", "#4a2e18", "#2c2420", "#5a3a1c", "#241812"];

// Made once when the file loads, so the shelf never reshuffles on re-render
const BOOKS = Array.from({ length: 90 }, (_, i) => ({
  w: 6 + Math.random() * 24,
  h: Math.random() * 40,
  c: BOOK_COLORS[i % BOOK_COLORS.length],
}));

const MOTES = Array.from({ length: 40 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  scale: 0.4 + Math.random(),
}));

const YEARS = [
  { year: "2020", text: "Reading statutes taught me a different kind of line: built clause by clause, where every word carries weight." },
  { year: "2022", text: "Nothing is decorative. If a clause doesn't hold, it goes." },
  { year: "2025", text: "The law degree in my hand. The thing I actually learned: how to cut." },
];

export default function Law() {
  const sceneRef = useRef(null);

  useGSAP(
    (context, contextSafe) => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const rand = gsap.utils.random;
      let cancelled = false;

      // Dust drifts forever, independent of scroll
      if (!reduce) {
        gsap.utils.toArray(".law-mote").forEach((m) => {
          gsap.to(m, {
            x: "+=" + rand(-60, 60),
            y: "+=" + rand(-80, 40),
            opacity: rand(0.2, 0.7),
            duration: rand(5, 10),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: rand(0, 4),
          });
        });
      }

      document.fonts.ready.then(
        contextSafe(() => {
          if (cancelled) return;

          const lines = gsap.utils
            .toArray("[data-split]", sceneRef.current)
            .flatMap((el) => SplitText.create(el, { type: "lines", mask: "lines" }).lines);

          if (reduce) return;

          const panels = gsap.utils.toArray(".law-panel");
          const steps = panels.length - 1;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sceneRef.current,
              start: "top top",
              end: "+=" + panels.length * 100 + "%",
              pin: true,
              scrub: 1,
            },
          });

          tl.from(lines, { yPercent: 110, stagger: 0.05, duration: 0.6, ease: "power3.out" }, 0)
            .to(".law-track", { xPercent: -100 * steps, ease: "none", duration: steps }, 0.6)
            .to(".law-shelf", { xPercent: -35, ease: "none", duration: steps }, 0.6)
            .fromTo(".law-sweep", { xPercent: -40 }, { xPercent: 260, ease: "none", duration: steps }, 0.6);

          panels.slice(1).forEach((panel, i) => {
            const at = 0.6 + i;
            tl.from(panel.querySelector(".law-year"), { yPercent: 30, opacity: 0, duration: 0.5, ease: "power2.out" }, at + 0.35)
              .from(panel.querySelector(".law-cap"), { opacity: 0, y: 20, duration: 0.4 }, at + 0.6);
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
    <section ref={sceneRef} className="scene law" data-chapter="ROOM TWO">
      <div className="law-shelf" aria-hidden="true">
        {BOOKS.map((b, i) => (
          <div
            key={i}
            className="law-book"
            style={{ "--w": b.w, "--h": b.h, "--c": b.c }}
          />
        ))}
      </div>

      <div className="law-sweep motion-only" aria-hidden="true" />

      <div className="law-dust" aria-hidden="true">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="law-mote"
            style={{ left: m.left + "%", top: m.top + "%", scale: m.scale }}
          />
        ))}
      </div>

      <div className="law-track">
        <div className="law-panel">
          <p className="small">Room two</p>
          <h2 className="display law-heading" data-split>
            AN ARGUMENT<br />IS ALSO A PATH
          </h2>
          <p className="prose" data-split>
            Six years with the law. The civil services exam, then an LL.B. from
            Maharshi Dayanand University, Rohtak. Scroll on: the years are long, and
            the room is longer.
          </p>
        </div>

        {YEARS.map((y) => (
          <div key={y.year} className="law-panel">
            <p className="display law-year">{y.year}</p>
            <p className="law-cap">{y.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
