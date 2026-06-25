"use client";

import { useEffect } from "react";

/**
 * Adds client-side interactivity to the statically-rendered pages:
 *  - Scroll-reveal: each top-level section fades/slides in as it enters view.
 *  - Count-up: the big numbers in the orange stat bands animate from 0.
 * Both no-op under prefers-reduced-motion, and degrade gracefully without JS
 * (content is fully visible until this runs).
 */
export default function Interactive() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const main = document.querySelector("main");
    if (!main) return;

    const sections = Array.from(main.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement
    );

    // --- Scroll reveal ---------------------------------------------------
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ib-reveal-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    sections.forEach((el) => {
      // Skip the sticky nav, and anything already on screen at load (avoids a
      // flash of hidden content for the hero / first fold).
      if (getComputedStyle(el).position === "sticky") return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
      el.classList.add("ib-reveal");
      io.observe(el);
    });

    // --- Count-up for stat bands ----------------------------------------
    const parseStat = (text: string) => {
      const match = text.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
      if (!match) return null;
      return {
        target: parseFloat(match[1].replace(/,/g, "")),
        suffix: match[2], // e.g. "+", "M", ""
      };
    };

    const animateCount = (el: HTMLElement, target: number, suffix: string) => {
      const duration = 1100;
      const start = performance.now();
      const isInt = Number.isInteger(target);
      const step = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = (isInt ? Math.round(val) : val.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = (isInt ? target : target.toFixed(1)) + suffix;
      };
      requestAnimationFrame(step);
    };

    // Orange stat bands: a div whose background is the brand orange, holding
    // big bold numbers. Target those big number nodes.
    const statNumbers: HTMLElement[] = [];
    main.querySelectorAll<HTMLElement>("div").forEach((d) => {
      const bg = d.getAttribute("style") || "";
      if (!/background:#F26522/.test(bg)) return;
      d.querySelectorAll<HTMLElement>("div").forEach((n) => {
        const s = n.getAttribute("style") || "";
        if (/font-size:(44|38)px/.test(s) && /font-weight:700/.test(s)) {
          statNumbers.push(n);
        }
      });
    });

    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const parsed = parseStat(el.textContent || "");
          if (parsed) {
            el.textContent = "0" + parsed.suffix;
            animateCount(el, parsed.target, parsed.suffix);
          }
          countObserver.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );
    statNumbers.forEach((el) => countObserver.observe(el));

    return () => {
      io.disconnect();
      countObserver.disconnect();
    };
  }, []);

  return null;
}
