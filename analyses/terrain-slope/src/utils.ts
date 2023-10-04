const colors = [
  "rgba(169, 189, 5, 0.9)",
  "rgba(153, 181, 6, 0.9)",
  "rgba(136, 172, 7, 0.9)",
  "rgba(39, 123, 12, 0.9)",
  "rgba(120, 164, 8, 0.9)",
  "rgba(104, 156, 9, 0.9)",
  "rgba(88, 148, 9, 0.9)",
  "rgba(72, 140, 10, 0.9)",
  "rgba(55, 131, 11, 0.9)",
  "rgba(23, 115, 13, 0.9)",
];

export function createCanvasFromSlope(
  terrainSlope: Float32Array,
  width: number,
  height: number,
  maxSlope: number,
  minSlope: number,
  threshold: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const colorGrading = threshold / colors.length;
  for (let i = 0; i < terrainSlope.length; i++) {
    const x = Math.floor(i % width);
    const y = Math.floor(i / width);
    let color = colors[Math.floor((terrainSlope[i] - minSlope) / colorGrading)];
    if (Math.abs(terrainSlope[i]) > threshold) {
      color = "red";
    }
    ctx!.fillStyle = color;
    ctx!.fillRect(x, y, 1, 1);
  }

  return canvas;
}

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
