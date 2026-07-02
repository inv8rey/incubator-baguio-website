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

    // --- Mobile hamburger menu ------------------------------------------
    // Built from the existing nav so no per-page markup is needed.
    const nav = main.firstElementChild as HTMLElement | null;
    if (nav && !nav.querySelector(".ib-burger")) {
      const links = nav.querySelector<HTMLElement>(
        'div[style*="font-weight:500"]'
      );
      const cta = nav.querySelector<HTMLAnchorElement>("a.ib-cta-orange");
      // If the CTA sits in a small button group (e.g. alongside a
      // "Contact Us" link), hide/clone the whole group, not just the
      // orange button, so the secondary link isn't stranded on mobile.
      const ctaGroup = cta?.parentElement;
      const hasSiblingLink =
        !!ctaGroup && ctaGroup !== nav && ctaGroup.querySelectorAll("a").length > 1;
      if (links) {
        links.classList.add("ib-navlinks");
        (hasSiblingLink ? ctaGroup : cta)?.classList.add("ib-desktop-cta");

        const burger = document.createElement("button");
        burger.className = "ib-burger";
        burger.setAttribute("aria-label", "Toggle menu");
        burger.setAttribute("aria-expanded", "false");
        burger.innerHTML = "<span></span><span></span><span></span>";

        const panel = document.createElement("div");
        panel.className = "ib-mobile-menu";

        const linksClone = links.cloneNode(true) as HTMLElement;
        linksClone.classList.remove("ib-navlinks");
        linksClone.classList.add("ib-mobile-links");
        linksClone.setAttribute(
          "style",
          "display:flex;flex-direction:column;gap:0;"
        );
        panel.appendChild(linksClone);

        if (cta) {
          const source = hasSiblingLink ? ctaGroup! : cta;
          const clone = source.cloneNode(true) as HTMLElement;
          clone.classList.remove("ib-desktop-cta");
          clone.classList.add("ib-mobile-cta");
          // AuthNav.tsx portals its own mobile-styled auth widget directly
          // into the mobile panel, so drop the cloned (inert) slot here.
          clone.querySelectorAll(".ib-auth-slot").forEach((n) => n.remove());
          clone.setAttribute(
            "style",
            hasSiblingLink
              ? "display:flex;flex-direction:column;gap:10px;margin-top:16px;"
              : ""
          );
          panel.appendChild(clone);
        }

        nav.appendChild(panel);
        nav.appendChild(burger);

        const setOpen = (open: boolean) => {
          nav.classList.toggle("ib-menu-open", open);
          burger.classList.toggle("ib-open", open);
          burger.setAttribute("aria-expanded", String(open));
          document.body.style.overflow = open ? "hidden" : "";
        };
        burger.addEventListener("click", () =>
          setOpen(!nav.classList.contains("ib-menu-open"))
        );
        panel
          .querySelectorAll("a")
          .forEach((a) => a.addEventListener("click", () => setOpen(false)));
      }
    }

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
