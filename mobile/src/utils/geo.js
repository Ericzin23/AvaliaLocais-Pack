// cálculo de distância em metros usando a fórmula de Haversine
export function distanceMeters(a, b) {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371000; // raio médio da Terra em metros
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const x = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return Math.round(R * c);
}
