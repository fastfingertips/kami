import { EPS } from "./scalars";

/** Simple 3D vector with x/y/z components. */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Construct a Vec3 with defaults to zero. */
export const v3 = (x = 0, y = 0, z = 0): Vec3 => ({ x, y, z });

/** Add two 3D vectors component-wise. */
export const add3 = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});

/** Subtract two 3D vectors component-wise. */
export const sub3 = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.x - b.x,
  y: a.y - b.y,
  z: a.z - b.z,
});

/** Scale a 3D vector by a scalar. */
export const mul3 = (a: Vec3, s: number): Vec3 => ({
  x: a.x * s,
  y: a.y * s,
  z: a.z * s,
});

/** Dot product of two 3D vectors. */
export const dot3 = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;

/** Cross product of two 3D vectors (right-hand rule). */
export const cross3 = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});

/** Euclidean length of a 3D vector. */
export const len3 = (a: Vec3): number => Math.hypot(a.x, a.y, a.z);

/**
 * Normalize a 3D vector; returns the +X axis when near zero
 * to avoid blowing up downstream math.
 */
export const norm3 = (a: Vec3): Vec3 => {
  const l = len3(a);
  return l < EPS ? { x: 1, y: 0, z: 0 } : { x: a.x / l, y: a.y / l, z: a.z / l };
};

/**
 * Rodrigues rotation of vector v around a unit axis through the origin.
 * Used to spin normals and points when folding the paper in 3D.
 */
export function rotateAroundAxis(v: Vec3, axisUnit: Vec3, angle: number): Vec3 {
  const k = axisUnit;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const term1 = mul3(v, cos);
  const term2 = mul3(cross3(k, v), sin);
  const term3 = mul3(k, dot3(k, v) * (1 - cos));
  return add3(add3(term1, term2), term3);
}

/**
 * Rotate a point p around an infinite line defined by linePoint + t*lineDirUnit.
 * Keeps the line fixed while sweeping p around by the given angle.
 */
export function rotatePointAroundLine(
  p: Vec3,
  linePoint: Vec3,
  lineDirUnit: Vec3,
  angle: number,
): Vec3 {
  const v = sub3(p, linePoint);
  const vr = rotateAroundAxis(v, lineDirUnit, angle);
  return add3(linePoint, vr);
}
