/**
 * Resolution units library - coordinate conversion for RU system.
 *
 * The RU system normalizes coordinates to [0, 1000] range while preserving
 * aspect ratio. The larger image dimension maps to [0, 1000].
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

const RU_MAX = 1000;

/**
 * Convert RU coordinates to pixel coordinates.
 */
export function ruToPixel(
  ru: [number, number],
  imageSize: [number, number]
): [number, number] {
  const [width, height] = imageSize;
  const scale = RU_MAX / Math.max(width, height);
  return [
    Math.round(ru[0] / scale),
    Math.round(ru[1] / scale)
  ];
}

/**
 * Convert pixel coordinates to RU coordinates.
 */
export function pixelToRu(
  pixel: [number, number],
  imageSize: [number, number]
): [number, number] {
  const [width, height] = imageSize;
  const scale = RU_MAX / Math.max(width, height);
  return [
    Math.round(pixel[0] * scale),
    Math.round(pixel[1] * scale)
  ];
}

/**
 * Convert RU coordinates to canvas display coordinates.
 */
export function ruToCanvas(
  ru: [number, number],
  imageSize: [number, number],
  displayScale: number,
  offset: [number, number] = [0, 0]
): [number, number] {
  const pixel = ruToPixel(ru, imageSize);
  return [
    pixel[0] * displayScale + offset[0],
    pixel[1] * displayScale + offset[1]
  ];
}
