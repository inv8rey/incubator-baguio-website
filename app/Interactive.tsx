"use client";

import { useEffect } from "react";

/**
 * Adds client-side interactivity to the statically-rendered pages:
 *  - Mobile hamburger menu, built from each page's existing nav markup.
 *  - Back-to-top button once the visitor scrolls past the first fold.
 *  - Reading-progress bar along the very top of the viewport.
 *  - Scroll-reveal: each top-level section fades/slides in as it enters view,
 *    with card grids inside it cascading in a stagger.
 *  - Count-up: the big numbers in the orange stat bands animate from 0.
 * The menu and back-to-top are functional and always installed; everything
 * motion-only no-ops under prefers-reduced-motion, and all content degrades
 * gracefully without JS (fully visible until this runs).
 */
export default function Interactive() {
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];

    // --- Mobile hamburger menu ------------------------------------------
    // Built from the existing nav so no per-page markup is needed. Every
    // page's nav bar uses `position:sticky;top:0`, so match on that instead
    // of assuming the nav is main's first child — some pages (e.g. the
    // homepage, which injects a JSON-LD <script> before it) don't have the
    // nav as the very first element.
    const nav = main.querySelector<HTMLElement>('div[style*="position:sticky"]');
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

    // --- Back-to-top + reading progress ---------------------------------
    let backTop: HTMLButtonElement | null = null;
    if (!document.querySelector(".ib-backtotop")) {
      backTop = document.createElement("button");
      backTop.className = "ib-backtotop";
      backTop.setAttribute("aria-label", "Back to top");
      backTop.innerHTML =
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
      backTop.addEventListener("click", () =>
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
      );
      document.body.appendChild(backTop);
      cleanups.push(() => backTop?.remove());
    }

    let progress: HTMLDivElement | null = null;
    if (!reduceMotion && !document.querySelector(".ib-scroll-progress")) {
      progress = document.createElement("div");
      progress.className = "ib-scroll-progress";
      document.body.appendChild(progress);
      cleanups.push(() => progress?.remove());
    }

    const onScroll = () => {
      const sc = window.scrollY;
      backTop?.classList.toggle("ib-show", sc > 600);
      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? Math.min(sc / max, 1) : 0})`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));
    onScroll();

    // Everything below is decorative motion.
    if (reduceMotion) return () => cleanups.forEach((fn) => fn());

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

    // Card grids inside a revealed section cascade in one-by-one. The class
    // is removed when each item's rise finishes so the animation's fill mode
    // can never override the cards' own hover transforms afterwards.
    const staggeredGrids = new Set<Element>();
    const tagStaggerItems = (section: HTMLElement) => {
      section
        .querySelectorAll<HTMLElement>('[style*="display:grid"]')
        .forEach((grid) => {
          // Skip nested grids (their parent already cascades) and anything
          // that isn't a small card set — calendars, footers, etc.
          for (const done of staggeredGrids) if (done.contains(grid) && done !== grid) return;
          const kids = Array.from(grid.children).filter(
            (k): k is HTMLElement => k instanceof HTMLElement
          );
          if (kids.length < 2 || kids.length > 12) return;
          staggeredGrids.add(grid);
          kids.forEach((kid, i) => {
            kid.classList.add("ib-sr-item");
            kid.style.setProperty("--sr-delay", `${Math.min(i, 8) * 70}ms`);
            kid.addEventListener(
              "animationend",
              () => {
                kid.classList.remove("ib-sr-item");
                kid.style.removeProperty("--sr-delay");
              },
              { once: true }
            );
          });
        });
    };

    sections.forEach((el) => {
      // Skip the sticky nav, and anything already on screen at load (avoids a
      // flash of hidden content for the hero / first fold).
      if (getComputedStyle(el).position === "sticky") return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
      el.classList.add("ib-reveal");
      tagStaggerItems(el);
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
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
