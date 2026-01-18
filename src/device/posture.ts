import type { SegmentRect, SegmentSource } from "./hinge";
import { getTauriPostureType } from "./tauri";
import { Device, Platform, resolveRuntimeInfo } from "./runtime";

const runtime = resolveRuntimeInfo();

export enum PostureSupport {
  Available = "available",
  Unavailable = "unavailable",
}

export enum FoldState {
  Folded = "folded",
  Unfolded = "unfolded",
}

export interface HelpCopy {
  fold: string;
  gesture: string;
}

export function helpCopyForSupport(support: PostureSupport): HelpCopy {
  // Combined help text for all platforms to avoid confusion
  return {
    fold: `
      <div class="help-row compact">
        <span class="badge">Actions</span> 
        <span class="val">Fold: Space/Btn <span class="sep">&bull;</span> Undo: Ctrl+Z</span>
      </div>
    `,
    gesture: `
      <div class="help-row compact">
        <span class="badge">Gestures</span> 
        <span class="val">Move: Drag <span class="sep">&bull;</span> Rotate: Wheel/2F</span>
      </div>
    `,
  };
}

/** Resolve the current device posture string. */
export function readDevicePostureType(): string {
  const navAny = navigator as Navigator & {
    devicePosture?: { type?: string };
  };
  if (typeof navAny.devicePosture?.type === "string") return navAny.devicePosture.type;
  if (runtime.platform === Platform.Tauri) {
    return getTauriPostureType();
  }
  return "unknown";
}

/** Detect whether the Device Posture API is present. */
export function resolvePostureSupport(): PostureSupport {
  const navAny = navigator as Navigator & { devicePosture?: { type?: string } };
  return "devicePosture" in navAny || runtime.platform === Platform.Tauri
    ? PostureSupport.Available
    : PostureSupport.Unavailable;
}

/** Determine whether the device should be treated as folded. */
export function resolveFoldState(
  postureType: string,
  segments: { source: SegmentSource; segments: SegmentRect[] },
): FoldState {
  const t = postureType.toLowerCase();
  if (t === "continuous" || t === "flat" || t === "unknown") {
    return FoldState.Unfolded;
  }
  if (t === "folded" || t === "half-opened" || t === "flipped") {
    return FoldState.Folded;
  }
  if (segments.segments.length >= 2) {
    return FoldState.Folded;
  }
  return FoldState.Unfolded;
}
