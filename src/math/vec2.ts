import { EPS } from "./scalars";

/** Simple 2D vector with x/y components. */
export interface Vec2 {
  x: number;
  y: number;
}

/** Add two 2D vectors component-wise. */
export const add2 = (a: Vec2, b: Vec2): Vec2 => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

/** Subtract two 2D vectors component-wise. */
export const sub2 = (a: Vec2, b: Vec2): Vec2 => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

/** Scale a 2D vector by a scalar. */
export const mul2 = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s });

/** Dot product of two 2D vectors. */
export const dot2 = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;

/** Euclidean length of a 2D vector. */
export const len2 = (a: Vec2): number => Math.hypot(a.x, a.y);

/**
 * Normalize a 2D vector; falls back to the +X unit if nearly zero.
 * Keeps downstream math stable when user input produces tiny magnitudes.
 */
export const norm2 = (a: Vec2): Vec2 => {
  const l = len2(a);
  return l < EPS ? { x: 1, y: 0 } : { x: a.x / l, y: a.y / l };
};

/** 90-degree counterclockwise perpendicular vector. */
export const perp2 = (a: Vec2): Vec2 => ({ x: -a.y, y: a.x });

/** Rotate a point/vector by angle (radians) around the origin. */
export const rotate2 = (p: Vec2, ang: number): Vec2 => {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
};
