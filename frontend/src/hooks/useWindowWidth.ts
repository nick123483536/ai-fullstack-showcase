import { useEffect, useState } from 'react';

/** Phone layouts at 859 and below; the sidebar becomes a sheet at 1023 and below. */
export const MOBILE_MAX = 859;
export const SHELL_FOLD_MAX = 1023;

export function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}
