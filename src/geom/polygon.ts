import { lerp, EPS } from "../math/scalars";
import type { Vec2 } from "../math/vec2";
import { signedDistanceToLine } from "./line2";
import type { Line2 } from "./line2";

/**
 * Clip polygon to the half-plane defined by line.
 * keepSide = +1 keeps points where signedDistance >= 0
 * keepSide = -1 keeps points where signedDistance <= 0
 */
export function clipPolyHalfPlane(poly: Vec2[], line: Line2, keepSide: 1 | -1): Vec2[] {
  if (poly.length < 3) return [];

  const out: Vec2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];

    const da = signedDistanceToLine(a, line) * keepSide;
    const db = signedDistanceToLine(b, line) * keepSide;

    const aIn = da >= -EPS;
    const bIn = db >= -EPS;

    if (aIn && bIn) {
      out.push(b);
    } else if (aIn && !bIn) {
      const t = da / (da - db);
      out.push({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
    } else if (!aIn && bIn) {
      const t = da / (da - db);
      out.push({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
      out.push(b);
    }
  }

  return cleanupPoly(out);
}

/**
 * Clean polygon artifacts from clipping:
 * - collapse nearly coincident points
 * - drop near-collinear vertices to avoid spikes
 * - drop polygons that are too small to be valid.
 */
export function cleanupPoly(poly: Vec2[]): Vec2[] {
  if (poly.length < 3) return [];

  const out: Vec2[] = [];
  for (const p of poly) {
    const prev = out[out.length - 1];
    if (!prev || Math.hypot(p.x - prev.x, p.y - prev.y) > 0.25) out.push(p);
  }
  if (out.length >= 2) {
    const a = out[0];
    const b = out[out.length - 1];
    if (Math.hypot(a.x - b.x, a.y - b.y) < 0.25) out.pop();
  }
  if (out.length < 3) return [];

  const out2: Vec2[] = [];
  for (let i = 0; i < out.length; i++) {
    const p0 = out[(i - 1 + out.length) % out.length];
    const p1 = out[i];
    const p2 = out[(i + 1) % out.length];
    const v1 = { x: p1.x - p0.x, y: p1.y - p0.y };
    const v2 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const cross = v1.x * v2.y - v1.y * v2.x;
    if (Math.abs(cross) > 0.05) out2.push(p1);
  }
  if (out2.length < 3) return [];

  return out2;
}

/** Absolute area of a polygon (shoelace formula). Returns 0 for degenerate polys. */
export function polyArea(poly: Vec2[]): number {
  if (poly.length < 3) return 0;
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) * 0.5;
}

/** Point-in-polygon test using even-odd rule. */
export function pointInPoly(pt: Vec2, poly: Vec2[]): boolean {
  if (poly.length < 3) return false;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    const intersect =
      a.y > pt.y !== b.y > pt.y &&
      pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y + EPS) + a.x;
    if (intersect) inside = !inside;
  }
  return inside;
}
