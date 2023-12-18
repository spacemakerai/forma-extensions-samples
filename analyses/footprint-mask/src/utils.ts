const colors = ["rgba(169, 189, 5, 0.9)", "rgba(23, 115, 13, 0.9)"];

export function createCanvasFromSlope(
  mask: Float32Array,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  for (let i = 0; i < mask.length; i++) {
    const x = Math.floor(i % width);
    const y = Math.floor(i / width);
    let color = colors[mask[i] > 0 ? 1 : 0];
    ctx!.fillStyle = color;
    ctx!.fillRect(x, y, 1, 1);
  }

  return canvas;
}
