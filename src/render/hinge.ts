import type { SegmentRect } from "../device/hinge";
import type { Vec2 } from "../math/vec2";

/** Draw hinge crosshair and viewport segments, if any. */
export function drawHingeCrosshair(
  ctx: CanvasRenderingContext2D,
  hinge: Vec2,
  segments: SegmentRect[],
  hingeDir: Vec2,
  canvasW: number,
  canvasH: number,
): void {
  const r = 10;

  ctx.save();
  ctx.globalAlpha = 0.8;

  ctx.beginPath();
  ctx.arc(hinge.x, hinge.y, 16, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(hinge.x - r, hinge.y);
  ctx.lineTo(hinge.x + r, hinge.y);
  ctx.moveTo(hinge.x, hinge.y - r);
  ctx.lineTo(hinge.x, hinge.y + r);
  ctx.stroke();

  if (segments.length >= 2) {
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    for (const s of segments) {
      ctx.strokeRect(s.left, s.top, s.width, s.height);
    }
  }

  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 2;
  const a = {
    x: hinge.x - hingeDir.x * Math.max(canvasW, canvasH),
    y: hinge.y - hingeDir.y * Math.max(canvasW, canvasH),
  };
  const b = {
    x: hinge.x + hingeDir.x * Math.max(canvasW, canvasH),
    y: hinge.y + hingeDir.y * Math.max(canvasW, canvasH),
  };
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();

  ctx.restore();
}
