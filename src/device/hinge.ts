import type { Vec2 } from "../math/vec2";
import { getScreenAngleDeg } from "./screen";

export interface SegmentRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  x: number;
  y: number;
}

export type SegmentSource =
  | "viewportSegments"
  | "visualViewportFunction"
  | "visualViewportProperty"
  | "windowSegments";

export interface HingeInfo {
  hinge: Vec2;
  segments: { source: SegmentSource; segments: SegmentRect[] };
  hingeDir: Vec2;
}

interface WindowWithSegments extends Window {
  viewport?: { segments?: SegmentRect[] };
  getWindowSegments?: () => SegmentRect[] | null | undefined;
}

/** Resolve the hinge position and direction from viewport segments or fallback. */
export function computeHingePoint(canvasCssW: number, canvasCssH: number): HingeInfo {
  const wAny = window as WindowWithSegments;

  try {
    const viewportSegmentsRaw = wAny.viewport?.segments;
    if (viewportSegmentsRaw !== undefined) {
      if (!Array.isArray(viewportSegmentsRaw)) {
        throw new Error("Viewport segments present but not an array");
      }
      const viewportSegments = readSegments(viewportSegmentsRaw);
      if (viewportSegments.length > 0) {
        return buildHingeInfo(
          "viewportSegments",
          viewportSegments,
          canvasCssW,
          canvasCssH,
        );
      }
    }

    const visualViewport = window.visualViewport as
      | (VisualViewport & {
          segments?: SegmentRect[] | (() => SegmentRect[] | null | undefined);
        })
      | undefined;
    if (visualViewport) {
      if (typeof visualViewport.segments === "function") {
        const fromFunc = visualViewport.segments();
        if (!Array.isArray(fromFunc)) {
          throw new Error("visualViewport.segments() did not return an array");
        }
        const funcSegments = readSegments(fromFunc);
        return buildHingeInfo(
          "visualViewportFunction",
          funcSegments,
          canvasCssW,
          canvasCssH,
        );
      }

      if (
        Array.isArray(visualViewport.segments) &&
        visualViewport.segments.length > 0
      ) {
        const valueSegments = readSegments(visualViewport.segments);
        if (valueSegments.length > 0) {
          return buildHingeInfo(
            "visualViewportProperty",
            valueSegments,
            canvasCssW,
            canvasCssH,
          );
        }
      }
    }

    if (typeof wAny.getWindowSegments === "function") {
      const raw = wAny.getWindowSegments();
      if (!Array.isArray(raw)) {
        throw new Error("getWindowSegments() did not return an array");
      }
      const windowSegments = readSegments(raw);
      if (windowSegments.length > 0) {
        return buildHingeInfo("windowSegments", windowSegments, canvasCssW, canvasCssH);
      }
    }
  } catch (err) {
    // Fall through to fallback when segment APIs are missing or invalid.
    console.warn(err);
  }

  const fallback = {
    center: { x: canvasCssW / 2, y: canvasCssH / 2 },
    width: canvasCssW,
    height: canvasCssH,
  };
  return {
    hinge: fallback.center,
    segments: { source: "viewportSegments", segments: [] },
    hingeDir: fallbackHingeDir(getScreenAngleDeg(), fallback.width, fallback.height),
  };
}

function buildHingeInfo(
  source: SegmentSource,
  segments: SegmentRect[],
  canvasCssW: number,
  canvasCssH: number,
): HingeInfo {
  const { hinge, dir } = hingeFromSegments(segments, canvasCssW, canvasCssH);
  return {
    hinge,
    segments: { source, segments },
    hingeDir: dir,
  };
}

function readSegments(source: SegmentRect[]): SegmentRect[] {
  if (!Array.isArray(source)) {
    throw new Error("Missing viewport segments");
  }
  if (source.length === 0) {
    throw new Error("Viewport segments present but empty");
  }
  return source;
}

/**
 * Derive a hinge anchor and direction vector from provided screen segments.
 * Falls back to the canvas center and orientation-derived direction
 * when fewer than two segments are present.
 */
function hingeFromSegments(
  segs: SegmentRect[],
  w: number,
  h: number,
): { hinge: Vec2; dir: Vec2 } {
  const ratioDir = fallbackHingeDir(getScreenAngleDeg(), w, h);
  if (segs.length < 2) {
    return { hinge: { x: w / 2, y: h / 2 }, dir: ratioDir };
  }

  const byLeft = [...segs].sort((a, b) => a.left - b.left);
  const byTop = [...segs].sort((a, b) => a.top - b.top);

  const aL = byLeft[0];
  const bL = byLeft[byLeft.length - 1];
  const gapX = bL.left - aL.right;

  const aT = byTop[0];
  const bT = byTop[byTop.length - 1];
  const gapY = bT.top - aT.bottom;

  if (gapX > 0 && gapX >= gapY) {
    const hingeX = aL.right + gapX * 0.5;
    return { hinge: { x: hingeX, y: h / 2 }, dir: { x: 0, y: 1 } };
  }
  if (gapY > 0 && gapY > gapX) {
    const hingeY = aT.bottom + gapY * 0.5;
    return { hinge: { x: w / 2, y: hingeY }, dir: { x: 1, y: 0 } };
  }

  return { hinge: { x: w / 2, y: h / 2 }, dir: ratioDir };
}

function hingeDirForAngle(angleDeg: number): Vec2 {
  const ang = ((Math.round(angleDeg) % 360) + 360) % 360;
  if (ang === 90 || ang === 270) return { x: 1, y: 0 };
  return { x: 0, y: 1 };
}

function fallbackHingeDir(
  angleDeg: number,
  canvasCssW: number,
  canvasCssH: number,
): Vec2 {
  if (canvasCssH >= canvasCssW) return { x: 1, y: 0 };
  return hingeDirForAngle(angleDeg);
}
