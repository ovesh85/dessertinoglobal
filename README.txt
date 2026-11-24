DESSERTINO – Premium animated home page (redesign concept)
==========================================================

HOW TO VIEW / UPLOAD
- Upload the whole folder (index.html + css/ + js/ + assets/) to any web host,
  keeping the folder structure. Open index.html.
- Works by double-clicking index.html too, but for best results view it from a
  web server (e.g. VS Code "Live Server", or: python -m http.server).
- Fonts load from Google Fonts (internet needed). Everything else is local.

WHAT'S INSIDE
- index.html ............ the page
- css/style.css ......... all styles (brand colours at the top in :root)
- js/main.js ............ all animations
- js/gsap.min.js, js/ScrollTrigger.min.js (GSAP 3.15), js/lenis.min.js (Lenis 1.3) – smooth scroll
- assets/img/ ........... logo, product photos, icons – all taken from dessertinoglobal.com (resized to WebP)

SECTIONS
 1. Preloader (logo + progress)          8. Menu – stacking cards (Thick Shakes, Waffles, Milkshakes & Ice Creams, Pizzas)
 2. Hero (animated headline, parallax)   9. Fan favourites – auto/drag carousel
 3. Range marquee (scroll-velocity)     10. Film – opens the YouTube video from the current home page
 4. SIGNATURE 1 – Kit Kat Break making-process film (scroll-scrubbed)
 5. SIGNATURE 2 – Ice Creams (pinned horizontal scroll, colour changes per flavour)
 6. Why Dessertino – stats bento        11. Reviews   12. Order (India/Dubai tabs)   13. Franchise CTA   14. Footer
 7. Range counters + Unique yet Tasty

VIDEO (Film section)
- Plays a local video: assets/video/dessertino-film.mp4 (+ .webm fallback). No YouTube,
  no logo, and it works even when index.html is opened straight from disk.
- The current file is a 24-second brand reel made from the site's own product photos.
- To use the original banner film instead, export it from YouTube Studio / the client's
  source file and save it as assets/video/dessertino-film.mp4 (same name). Delete the .webm
  or replace it too.

KIT KAT MAKING-PROCESS FILM (Signature No. 01)
- Pinned scroll section: scrolling plays the making of the Kit Kat Break thick shake frame by
  frame (dispenser pours the thick shake -> whipped cream crown -> sprinkles + Kit Kat fingers).
  Scroll back and it rewinds. Frames: assets/frames/kk/f001.webp ... (drawn on a <canvas>,
  so it is perfectly smooth and works offline / from file://).
- The film is a photoreal render made for this page, styled on the real Dessertino Kit Kat cup.

ICE CREAM SECTION
- One wheel/trackpad gesture moves exactly one flavour; touch swipes snap to the next flavour.

LINKS
- All navigation / CTA / social / delivery links are placeholders (#) for the demo.

NOTES
- Smoothness: Lenis smooth scroll driven by the GSAP ticker; only transform /
  opacity / clip-path are animated; pinned sections are GPU-composited.
- Respects "reduce motion" OS setting.
- Fully responsive (desktop, tablet, mobile). Touch devices use native scrolling.
