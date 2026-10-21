// Shared motion utilities. All motion is subtle and disabled for visitors who prefer reduced motion.
import { useEffect, useRef, useState } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.(REDUCED).matches;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia?.(REDUCED);
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// Siblings that reveal together (e.g. a row of cards) enter one after another; capped so long lists don't lag.
const STAGGER_MS = 70;
const MAX_STAGGER = 5;

function staggerIndex(el) {
  const parent = el.parentElement;
  if (!parent) return 0;
  const siblings = [...parent.children].filter((c) => c.hasAttribute('data-reveal'));
  return Math.min(siblings.indexOf(el), MAX_STAGGER);
}

/**
 * One observer for the whole app: every element with [data-reveal] fades in once when it scrolls into view,
 * including elements rendered later (after API data loads). Variants via the attribute value:
 * data-reveal (fade up), data-reveal="fade", "scale", "left", "right". See index.css.
 */
export function RevealManager() {
  useEffect(() => {
    const reveal = (el) => el.classList.add('is-visible');
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      const showAll = () => document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(reveal);
      showAll();
      const mo = new MutationObserver(showAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    );

    const watched = new WeakSet();
    const scan = () => {
      for (const el of document.querySelectorAll('[data-reveal]:not(.is-visible)')) {
        if (watched.has(el)) continue;
        watched.add(el);
        if (!el.style.getPropertyValue('--reveal-delay')) {
          el.style.setProperty('--reveal-delay', `${staggerIndex(el) * STAGGER_MS}ms`);
        }
        io.observe(el);
      }
    };
    scan();
    let frame = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
      io.disconnect();
    };
  }, []);
  return null;
}

// Animates a number from 0 to `value` once (ease-out). Renders the final value immediately with reduced motion.
export function CountUp({ value, duration = 900 }) {
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? value : 0));
  const from = useRef(0);
  useEffect(() => {
    if (typeof value !== 'number' || prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const initial = from.current;
    let frame;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(initial + (value - initial) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return display;
}
