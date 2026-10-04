import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

// Hosted macOS image updates can change low-level text rasterization. Use a
// small color tolerance, exclude detected antialiasing, and cap total drift.
export const visualDifferenceThreshold = 0.1;
export const maximumVisualDifferenceRatio = 0.0007;

export function compareScreenshotPixels(expected, actual, width, height) {
  const differentPixels = pixelmatch(expected, actual, null, width, height, {
    threshold: visualDifferenceThreshold,
    includeAA: false,
  });

  const allowedDifferentPixels = Math.floor(width * height * maximumVisualDifferenceRatio);
  if (differentPixels <= allowedDifferentPixels) {
    return { differentPixels, allowedDifferentPixels, diff: null };
  }

  const diff = new PNG({ width, height });
  pixelmatch(expected, actual, diff.data, width, height, {
    threshold: 0,
    includeAA: true,
  });

  return { differentPixels, allowedDifferentPixels, diff };
}
