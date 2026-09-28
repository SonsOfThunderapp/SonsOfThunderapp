/**
 * TURN THE CARD — not the man.
 * Run this on the isolated PNG (alpha), never on a flat JPEG.
 * spanRight > spanLeft * 1.12 → man-left (gesture points into the card).
 * NEVER scaleX(-1). NEVER flip the bitmap.
 */
export function facingFromImageData(imageData) {
  const { data, width: w, height: h } = imageData;
  const A = (x, y) => data[(y * w + x) * 4 + 3];
  let x0 = w, y0 = h, x1 = 0, y1 = 0, seen = false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (A(x, y) > 20) {
        seen = true;
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
    }
  }
  if (!seen) return { layout: 'man-right', mode: 'window', reason: 'no-alpha', mirrored: false };

  const headBottom = y0 + Math.max(1, Math.floor((y1 - y0 + 1) * 0.38));
  let sum = 0, sumX = 0;
  for (let y = y0; y < headBottom; y++) {
    for (let x = x0; x <= x1; x++) {
      const a = A(x, y);
      if (a > 20) { sum += a; sumX += a * x; }
    }
  }
  const faceX = sum ? sumX / sum : (x0 + x1) / 2;
  let left = x1, right = x0;
  for (let x = 0; x < w; x++) {
    for (let y = y0; y <= y1; y++) {
      if (A(x, y) > 20) {
        if (x < left) left = x;
        if (x > right) right = x;
        break;
      }
    }
  }
  const spanLeft = Math.max(0, faceX - left);
  const spanRight = Math.max(0, right - faceX);
  let layout = 'man-right';
  let reason = 'tie';
  if (spanRight > spanLeft * 1.12) { layout = 'man-left'; reason = 'gesture-right'; }
  else if (spanLeft > spanRight * 1.12) { layout = 'man-right'; reason = 'gesture-left'; }
  return { layout, mode: 'diecut', reason, mirrored: false };
}
