# Three Rooms

A cinematic scroll story: Mathematics → Law → Interfaces.
React + Vite + CSS + GSAP (ScrollTrigger, ScrollSmoother, SplitText).

## Run it

    npm install
    npm run dev

Then open the localhost link Vite prints.

## Build for Vercel

    npm run build

Vercel detects Vite automatically: push to GitHub, import the repo, deploy.

## Structure

    src/
      App.jsx               ScrollSmoother + scene order
      index.css             tokens, type roles, .scene base
      components/Chrome     letterbox bars, vignette, film grain, timecode
      scenes/Title          opening shot + fly-through
      scenes/Maths          canvas wireframe surface
      scenes/Law            pinned horizontal room, shelf, dust
      scenes/Interfaces     flow field + 3D glass cards
      scenes/End            closing title
