export function computeMSE(renderedPixels, targetPixels) {
  const numPixels = renderedPixels.length / 4;
  let sum = 0;
  for (let i = 0; i < renderedPixels.length; i += 4) {
    const dr = renderedPixels[i] - targetPixels[i];
    const dg = renderedPixels[i + 1] - targetPixels[i + 1];
    const db = renderedPixels[i + 2] - targetPixels[i + 2];
    sum += dr * dr + dg * dg + db * db;
  }
  return sum / numPixels;
}
