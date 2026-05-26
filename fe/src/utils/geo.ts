export function wrapLng(lng: number, centerLng: number): number {
  while (lng - centerLng > 180) lng -= 360;
  while (lng - centerLng < -180) lng += 360;
  return lng;
}

export function computeHeading(
  prevLat: number,
  prevLng: number,
  currLat: number,
  currLng: number
): number | null {
  const dLat = currLat - prevLat;
  const dLng = currLng - prevLng;
  if (Math.abs(dLat) < 0.0001 && Math.abs(dLng) < 0.0001) return null;
  return (Math.atan2(dLng, dLat) * 180) / Math.PI;
}
