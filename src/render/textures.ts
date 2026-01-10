export interface TextureSet {
  wood: HTMLImageElement;
  paper: CanvasPattern;
}

/**
 * Load texture images and create repeating patterns when ready.
 * Patterns become available asynchronously as images load.
 */
export async function loadTextures(ctx: CanvasRenderingContext2D): Promise<TextureSet> {
  const wood = await loadImage("textures/wood.jpg");
  const paper = await loadPattern(ctx, "textures/paper.jpg");
  return { wood, paper };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image at ${src}`));
  });
}

function loadPattern(
  ctx: CanvasRenderingContext2D,
  src: string,
): Promise<CanvasPattern> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const pattern = ctx.createPattern(img, "repeat");
      if (!pattern) {
        reject(new Error(`Failed to create pattern from ${src}`));
        return;
      }
      resolve(pattern);
    };
    img.onerror = () => {
      reject(new Error(`Failed to load pattern image at ${src}`));
    };
  });
}
