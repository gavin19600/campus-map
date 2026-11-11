// Fetches OpenStreetMap buildings and roads around every school once and stores them in data/,
// so the 3D campus page can open at once instead of asking the public map servers on every first visit.
// Run by .github/workflows/bake.yml. Usage: node tools/bake.mjs [max schools per run]
import fs from 'node:fs';

const R = 750; // metres around the school point; must match R in walk.html
const KEEP = ['building','name','name:ko','height','building:levels','building:material','building:colour','roof:colour','highway','lanes','amenity','leisure','landuse','natural','location','layer','area','parking'];
const EPS = ['https://overpass-api.de/api/interpreter','https://overpass.private.coffee/api/interpreter','https://maps.mail.ru/osm/tools/overpass/api/interpreter'];
const sleep = ms => new Promise(r => setTimeout(r, ms));

const query = (lat, lon) => `[out:json][timeout:90];(` +
  `way["building"](around:${R},${lat},${lon});` +
  `way["highway"](around:${R},${lat},${lon});` +
  `way["leisure"~"^(pitch|park|garden|track|stadium)$"](around:${R},${lat},${lon});` +
  `way["landuse"~"^(grass|forest|recreation_ground|meadow|village_green)$"](around:${R},${lat},${lon});` +
  `way["natural"~"^(water|wood)$"](around:${R},${lat},${lon});` +
  `way["amenity"~"^(university|college|parking)$"](around:${R},${lat},${lon});` +
  `relation["amenity"~"^(university|college)$"](around:${R},${lat},${lon});` +
  `);out geom;`;

// same trimming the page does before it caches a result
function slim(j) {
  const rd = g => ({ lat: +g.lat.toFixed(6), lon: +g.lon.toFixed(6) });
  return { elements: (j.elements || []).map(e => {
    const t = {};
    if (e.tags) for (const k of KEEP) if (e.tags[k] !== undefined) t[k] = e.tags[k];
    const o = { type: e.type, id: e.id, tags: t };
    if (e.geometry) o.geometry = e.geometry.map(rd);
    if (e.members) o.members = e.members.filter(m => m.geometry).map(m => ({ role: m.role, geometry: m.geometry.map(rd) }));
    return o;
  }) };
}

async function fetchOne(lat, lon, first) {
  // each worker starts with its own server so two can run side by side without doubling the load on one
  const eps = EPS.slice(first % EPS.length).concat(EPS.slice(0, first % EPS.length));
  let last;
  for (let round = 0; round < 3; round++) {
    for (const ep of eps) {
      try {
        const r = await fetch(ep, { method: 'POST', body: 'data=' + encodeURIComponent(query(lat, lon)),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'campus-map-bake (github.com/gavin19600/campus-map)' },
          signal: AbortSignal.timeout(120000) });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json();
        if (!j || !Array.isArray(j.elements)) throw new Error('bad data');
        if (j.remark && /timed out|runtime error/i.test(j.remark)) throw new Error(j.remark);
        return j;
      } catch (e) { last = e; await sleep(4000); }
    }
    await sleep(20000);
  }
  throw last;
}

const schools = JSON.parse(fs.readFileSync('tools/schools.json', 'utf8'));
const max = +process.argv[2] || 25;
fs.mkdirSync('data', { recursive: true });
let done = 0, failed = 0;
const fileOf = ([, lat, lon]) => `data/${lat.toFixed(4)}_${lon.toFixed(4)}.json`;
const todo = schools.filter(s => !fs.existsSync(fileOf(s))).slice(0, max);
async function worker(i) {
  for (;;) {
    const s = todo.shift();
    if (!s) return;
    try {
      const j = slim(await fetchOne(s[1], s[2], i));
      fs.writeFileSync(fileOf(s), JSON.stringify(j));
      done++;
      console.log(`ok   ${s[0]}  ${j.elements.length} elements`);
    } catch (e) { failed++; console.log(`FAIL ${s[0]}  ${e.message}`); }
    await sleep(3000);
  }
}
await Promise.all([worker(0), worker(1)]);
const left = schools.filter(([, lat, lon]) => !fs.existsSync(`data/${lat.toFixed(4)}_${lon.toFixed(4)}.json`)).length;
console.log(`this run: ${done} saved, ${failed} failed, ${left} still missing`);
fs.writeFileSync(process.env.GITHUB_OUTPUT || '/dev/null', `left=${left}\nsaved=${done}\n`, { flag: 'a' });
