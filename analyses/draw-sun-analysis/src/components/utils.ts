const BITS_PER_BYTE = 8;
const N_SAMPLES_PER_HOUR = 10;
const N_BYTES_PER_POINT = 30;

function getTimeIndex(hour: number, minute: number) {
  return hour * N_SAMPLES_PER_HOUR + Math.floor(minute / 6);
}

function isKthBitSet(n: number, k: number) {
  return (n & (1 << k)) > 0;
}

export function createSunlitPointsMask(
  groundGridMask: Uint8Array,
  groundGrid: Uint8Array | Float32Array,
  hour: number,
  minute: number,
): Float32Array {
  const timeIndex = getTimeIndex(hour, minute);
  const byteIndex = Math.floor(timeIndex / BITS_PER_BYTE);
  const bitPosition = BITS_PER_BYTE - (timeIndex % BITS_PER_BYTE) - 1;

  const sunlitPointsMask = new Float32Array(groundGridMask.length).fill(NaN);
  for (let i = 0; i < sunlitPointsMask.length; i++) {
    if (groundGridMask[i]) {
      const scoresForPoint = groundGrid.slice(i * N_BYTES_PER_POINT, (i + 1) * N_BYTES_PER_POINT);
      if (isKthBitSet(scoresForPoint[byteIndex], bitPosition)) {
        sunlitPointsMask[i] = 1;
      } else {
        sunlitPointsMask[i] = 0;
      }
    }
  }
  return sunlitPointsMask;
}
