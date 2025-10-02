// Uso:
//   EXPO_PUBLIC_GMAPS_KEY="SUA_KEY" LAT="-11.860" LNG="-55.510" RADIUS="1500" node scripts/places-smoke.js restaurant
//   (troque 'restaurant' por: bar, cafe, lodging, gym, hospital, school, supermarket, pharmacy, park, shopping_mall)
const KEY = process.env.EXPO_PUBLIC_GMAPS_KEY;
const LAT = process.env.LAT || '-11.860';
const LNG = process.env.LNG || '-55.510';
const RADIUS = process.env.RADIUS || '1500';
const TYPE = (process.argv[2] || 'restaurant').toLowerCase();

if (!KEY) {
  console.error('Defina EXPO_PUBLIC_GMAPS_KEY no ambiente.');
  process.exit(1);
}

async function hit(url) {
  const t0 = Date.now();
  const res = await fetch(url);
  const ms = Date.now() - t0;
  const json = await res.json();
  const len = Array.isArray(json.results) ? json.results.length : (json.places?.length || 0);
  console.log(`[${res.status}] ${url}\n -> ${json.status || 'OK'} | results=${len} | ${ms}ms\n`);
  return json;
}

(async () => {
  // 1) Nearby Search (type + radius)
  const u1 = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${LAT},${LNG}&radius=${RADIUS}&type=${encodeURIComponent(TYPE)}&key=${KEY}`;
  await hit(u1);
  // 2) Fallback: rankby=distance + keyword (sem radius)
  const u2 = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${LAT},${LNG}&rankby=distance&keyword=${encodeURIComponent(TYPE)}&key=${KEY}`;
  await hit(u2);
  // 3) Text Search (aceita PT-BR)
  const query = TYPE === 'restaurant' ? 'restaurante' : TYPE;
  const u3 = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${LAT},${LNG}&radius=${RADIUS}&key=${KEY}`;
  await hit(u3);
})().catch((e) => {
  console.error('Erro no smoke test:', e?.message || e);
  process.exit(2);
});
