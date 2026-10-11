import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./Chrome.css";

const FILM_SECONDS = 186;

const formatTime = (secs) =>
  String(Math.floor(secs / 60)).padStart(2, "0") +
  ":" +
  String(secs % 60).padStart(2, "0");

export default function Chrome() {
  const grainRef = useRef(null);
  const chapterRef = useRef(null);
  const timeRef = useRef(null);

  // Live film grain: fresh random noise every 3rd frame
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const canvas = grainRef.current;
    const ctx = canvas.getContext("2d");
    const image = ctx.createImageData(canvas.width, canvas.height);
    let frame = 0;
    let rafId;

    const draw = () => {
      if (frame++ % 3 === 0) {
        const d = image.data;
        for (let i = 0; i < d.length; i += 4) {
          const v = (Math.random() * 255) | 0;
          d[i] = d[i + 1] = d[i + 2] = v;
          d[i + 3] = 255;
        }
        ctx.putImageData(image, 0, 0);
      }
      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Timecode: scroll progress shown as film time, plus the current chapter
  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        timeRef.current.textContent = formatTime(
          Math.round(self.progress * FILM_SECONDS)
        );
      },
    });

    gsap.utils.toArray("[data-chapter]").forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => {
          if (self.isActive) {
            chapterRef.current.textContent = section.dataset.chapter;
          }
        },
      });
    });
  });

  return (
    <div aria-hidden="true">
      <div className="bar bar-top" />
      <div className="bar bar-bottom" />
      <div className="vignette" />
      <canvas ref={grainRef} className="grain" width="160" height="160" />
      <p className="timecode">
        <b ref={chapterRef}>TITLE</b> <span ref={timeRef}>00:00</span>
      </p>
    </div>
  );
}
