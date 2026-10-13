'use client';

import { useEffect, useState } from 'react';

/**
 * A clock that ticks every `intervalMs` (default one minute) and again when
 * the tab comes back into view, so "due in 5 minutes" stays true. The web
 * version of the app's useNow.
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);

  return now;
}
