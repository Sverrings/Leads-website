'use client';

import { useEffect } from 'react';

/**
 * Small behaviours for the whole page, in one listener each:
 * - marks <html data-scrolled> so the header gains its glass once you scroll
 * - reveals `.reveal` elements as they enter the viewport
 * - moves the light inside `.card` elements with the pointer
 */
export function ScrollState() {
  useEffect(() => {
    const root = document.documentElement;
    const onScroll = () => {
      root.dataset.scrolled = String(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = 'true';
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );
    const watch = () =>
      document.querySelectorAll('.reveal:not([data-visible])').forEach((el) => observer.observe(el));
    watch();
    // Pages swap without a reload; pick up reveals on new pages too.
    const mutations = new MutationObserver(watch);
    mutations.observe(document.body, { childList: true, subtree: true });

    const onPointer = (event: PointerEvent) => {
      const card = (event.target as HTMLElement | null)?.closest<HTMLElement>('.card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
