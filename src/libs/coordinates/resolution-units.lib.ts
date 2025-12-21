/**
 * Resolution units library - coordinate conversion for RU system.
 *
 * Mirrors cudag/core/coords.py - uses independent axis scaling where
 * both X and Y map to [0, 1000] independently, matching Qwen3-VL's
 * coordinate system.
 *
 * For a 1920x1080 image:
 * - X range: [0, 1000] (pixel_x / 1920 * 1000)
 * - Y range: [0, 1000] (pixel_y / 1080 * 1000)
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

const RU_MAX = 1000;

/**
 * Convert RU (Resolution Units) coordinates back to pixels.
 *
 * Reverses the independent axis scaling used in pixelToRu().
 *
 * @param normalized - (x, y) coordinates in RU [0, 1000]
 * @param imageSize - (width, height) of the image
 * @returns (x, y) pixel coordinates
 *
 * @example
 * For 1920x1080 image, RU point (500, 500):
 * - x_pixel = 500 / 1000 * 1920 = 960
 * - y_pixel = 500 / 1000 * 1080 = 540
 */
export function ruToPixel(
  normalized: [number, number],
  imageSize: [number, number]
): [number, number] {
  const [width, height] = imageSize;
  if (width <= 0 || height <= 0) {
    throw new Error(`Invalid image size: [${width}, ${height}]`);
  }

  // Reverse independent scaling per axis (mirrors cudag/core/coords.py)
  const xPixel = Math.round(normalized[0] / RU_MAX * width);
  const yPixel = Math.round(normalized[1] / RU_MAX * height);
  return [xPixel, yPixel];
}

/**
 * Convert pixel coordinates to RU (Resolution Units) with independent scaling.
 *
 * Both X and Y axes map independently to [0, 1000], matching Qwen3-VL's
 * coordinate system where coordinates are normalized to a 1000x1000 grid
 * regardless of the original image dimensions.
 *
 * @param pixel - (x, y) pixel coordinates
 * @param imageSize - (width, height) of the image
 * @returns (x, y) normalized coordinates in [0, 1000] range for both axes
 *
 * @example
 * For 1920x1080 image, point (960, 540):
 * - x_norm = 960 / 1920 * 1000 = 500
 * - y_norm = 540 / 1080 * 1000 = 500
 */
export function pixelToRu(
  pixel: [number, number],
  imageSize: [number, number]
): [number, number] {
  const [width, height] = imageSize;
  if (width <= 0 || height <= 0) {
    throw new Error(`Invalid image size: [${width}, ${height}]`);
  }

  // Independent scaling per axis (mirrors cudag/core/coords.py)
  const xNorm = Math.round(pixel[0] / width * RU_MAX);
  const yNorm = Math.round(pixel[1] / height * RU_MAX);
  return [xNorm, yNorm];
}

/**
 * Convert RU coordinates to canvas display coordinates.
 *
 * @param ru - (x, y) coordinates in RU [0, 1000]
 * @param imageSize - (width, height) of the image
 * @param displayScale - scale factor for canvas display
 * @param offset - (x, y) offset for centering image on canvas
 * @returns (x, y) canvas coordinates
 */
export function ruToCanvas(
  ru: [number, number],
  imageSize: [number, number],
  displayScale: number,
  offset: [number, number] = [0, 0]
): [number, number] {
  const [pixelX, pixelY] = ruToPixel(ru, imageSize);
  return [
    pixelX * displayScale + offset[0],
    pixelY * displayScale + offset[1]
  ];
}
