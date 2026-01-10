/** Read the current screen orientation angle in degrees. */
export function getScreenAngleDeg(): number {
  const scr = window.screen as Screen & { orientation?: { angle?: number } };
  if (typeof scr?.orientation?.angle === "number") return scr.orientation.angle;
  const legacy = (window as Window & { orientation?: number }).orientation;
  return typeof legacy === "number" ? legacy : 0;
}

/** Resolve landscape/portrait using Visual Viewport, media query, and angle. */
export function resolveScreenLandscape(w: number, h: number): boolean {
  const vv = window.visualViewport;
  if (vv && vv.width > 0 && vv.height > 0) {
    return vv.width >= vv.height;
  }
  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(orientation: landscape)").matches;
  }
  const ang = getScreenAngleDeg();
  if (Math.abs(ang) % 180 === 90) return true;
  if (Math.abs(ang) % 180 === 0) return false;
  return w >= h;
}
