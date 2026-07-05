"use client";

import { useEffect } from "react";

/**
 * Branded page-load curtain: a dark overlay with the chevron mark drawing
 * itself in, faded out once the page is ready. It also fades back IN when
 * the visitor clicks an internal link, so full-page navigations read as one
 * seamless dark transition instead of a white flash.
 *
 * - Server-rendered visible so it paints before anything else (no flash of
 *   unstyled content); a <noscript> rule hides it entirely without JS.
 * - First visit in a session holds ~700ms for the full draw; subsequent
 *   pages hide almost immediately so navigation never feels slowed down.
 * - bfcache restores (back/forward) hide it instantly.
 */
export default function PageLoader() {
  useEffect(() => {
    const el = document.getElementById("ib-pageloader");
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("ib-visited") === "1";
      sessionStorage.setItem("ib-visited", "1");
    } catch {
      /* storage blocked — treat as first visit */
    }
    const MIN_SHOW = reduceMotion ? 0 : seen ? 220 : 700;
    const shownAt = performance.now();

    let hidden = false;
    const hide = () => {
      if (hidden) return;
      hidden = true;
      const wait = Math.max(0, MIN_SHOW - (performance.now() - shownAt));
      window.setTimeout(() => el.classList.add("ib-pageloader-hide"), wait);
    };

    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });
    // Failsafe: never trap the visitor behind the curtain if a slow asset
    // keeps the load event from firing.
    const failsafe = window.setTimeout(hide, 4000);

    // Back/forward restores from bfcache resume mid-page — drop the curtain
    // instantly instead of replaying the intro.
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        hidden = true;
        el.classList.add("ib-pageloader-hide");
      }
    };
    window.addEventListener("pageshow", onPageShow);

    // Exit transition: fade the curtain back in when an internal link is
    // followed, covering the white gap while the next page loads.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#") || a.target === "_blank" || a.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(a.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;
      el.classList.remove("ib-pageloader-hide");
    };
    document.addEventListener("click", onClick);

    return () => {
      window.clearTimeout(failsafe);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div id="ib-pageloader" className="ib-pageloader" aria-hidden="true">
      <noscript>
        <style>{`.ib-pageloader{display:none!important}`}</style>
      </noscript>
      <div className="ib-pageloader-inner">
        <svg width="96" height="84" viewBox="0 0 120 104" fill="none" aria-hidden>
          <polyline className="ib-pageloader-line" pathLength={100} points="12,40 60,12 108,40" stroke="#F5A623" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          <polyline className="ib-pageloader-line" pathLength={100} points="12,60 60,32 108,60" stroke="#E23A2E" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: ".14s" }} />
          <polyline className="ib-pageloader-line" pathLength={100} points="12,80 60,52 108,80" stroke="#9E2A52" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: ".28s" }} />
          <polyline className="ib-pageloader-line" pathLength={100} points="12,100 60,72 108,100" stroke="#285E7A" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: ".42s" }} />
        </svg>
        <div className="ib-pageloader-text">Incubator Baguio</div>
        <div className="ib-pageloader-bar"><span /></div>
      </div>
    </div>
  );
}
