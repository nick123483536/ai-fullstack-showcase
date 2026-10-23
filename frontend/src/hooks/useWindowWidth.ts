import { useEffect, useState } from 'react';

/** Breakpoints from the design: mobile drawer < 860, single column < 1080, auto-collapsed sidebar < 1100. */
export const MOBILE_MAX = 859;

export function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}
