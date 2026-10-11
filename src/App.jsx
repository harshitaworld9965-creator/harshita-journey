import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import Chrome from "./components/Chrome";
import Title from "./scenes/Title";
import Maths from "./scenes/Maths";
import Law from "./scenes/Law";
import Interfaces from "./scenes/Interfaces";
import End from "./scenes/End";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText);

export default function App() {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: 1.4,
      smoothTouch: 0.1,
    });
  });

  return (
    <>
      <Chrome />

      <div id="smooth-wrapper" ref={wrapperRef}>
        <div id="smooth-content" ref={contentRef}>
          <Title />
          <Maths />
          <Law />
          <Interfaces />
          <End />
        </div>
      </div>
    </>
  );
}
