// Reusable rendered objects (watch, chain) for mockups. Logo always placed unmodified.
const L = require('./lib');
const { C } = L;

let uid = 0;
// Watch seen from the top. r = case radius. strapLen = visible strap length each side.
function watch(cx, cy, r, { rot = 0, strapLen = 2.2, strapW = 0.78, dial = 'noir', logo = 'symbol', strapFade = null } = {}) {
  const id = `w${uid++}`;
  const sw = r * strapW; // strap width
  const L1 = r * strapLen;
  const dialR = r * 0.80, bezelR = r * 0.90;
  // sunburst wedges
  let wedges = '';
  const N = 144;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * 2 * Math.PI, a1 = ((i + 1) / N) * 2 * Math.PI;
    const light = Math.pow(Math.max(0, Math.cos(2 * (a0 - 0.8))), 3);
    const op = (0.015 + 0.10 * light) * (i % 2 ? 1 : 0.55);
    wedges += `<path d="M0,0 L${(dialR * Math.cos(a0)).toFixed(2)},${(dialR * Math.sin(a0)).toFixed(2)} A${dialR},${dialR} 0 0,1 ${(dialR * Math.cos(a1)).toFixed(2)},${(dialR * Math.sin(a1)).toFixed(2)} Z" fill="#fff" opacity="${op.toFixed(3)}"/>`;
  }
  // indices
  let idx = '';
  for (let h = 0; h < 12; h++) {
    if (h === 0) continue; // 12 o'clock left free for the symbol
    const a = (h / 12) * 2 * Math.PI - Math.PI / 2;
    const r0 = dialR * 0.80, r1 = dialR * 0.93;
    const wdt = h % 3 === 0 ? r * 0.035 : r * 0.022;
    idx += `<line x1="${(r0 * Math.cos(a)).toFixed(2)}" y1="${(r0 * Math.sin(a)).toFixed(2)}" x2="${(r1 * Math.cos(a)).toFixed(2)}" y2="${(r1 * Math.sin(a)).toFixed(2)}" stroke="url(#silver)" stroke-width="${wdt}" stroke-linecap="round"/>`;
  }
  // minute track
  let mt = '';
  for (let m = 0; m < 60; m++) {
    if (m % 5 === 0) continue;
    const a = (m / 60) * 2 * Math.PI;
    const r0 = dialR * 0.955, r1 = dialR * 0.985;
    mt += `<line x1="${(r0 * Math.cos(a)).toFixed(2)}" y1="${(r0 * Math.sin(a)).toFixed(2)}" x2="${(r1 * Math.cos(a)).toFixed(2)}" y2="${(r1 * Math.sin(a)).toFixed(2)}" stroke="#d8d8d8" stroke-opacity="0.55" stroke-width="${r * 0.006}"/>`;
  }
  // hands at 10:10 (dauphine)
  const hand = (angDeg, len, wid) => {
    const a = (angDeg - 90) * Math.PI / 180, p = a + Math.PI / 2;
    const tip = [len * Math.cos(a), len * Math.sin(a)];
    const mid = [len * 0.22 * Math.cos(a), len * 0.22 * Math.sin(a)];
    const l = [mid[0] + wid * Math.cos(p), mid[1] + wid * Math.sin(p)], rr = [mid[0] - wid * Math.cos(p), mid[1] - wid * Math.sin(p)];
    const tail = [-len * 0.12 * Math.cos(a), -len * 0.12 * Math.sin(a)];
    return `<path d="M${tail[0]},${tail[1]} L${l[0]},${l[1]} L${tip[0]},${tip[1]} L${rr[0]},${rr[1]} Z" fill="url(#silver)" stroke="#6f6f6f" stroke-width="${r * 0.004}"/>
            <path d="M${tail[0]},${tail[1]} L${l[0]},${l[1]} L${tip[0]},${tip[1]} Z" fill="#ffffff" opacity="0.35"/>`;
  };
  const strapStitch = (y0, y1) => `<line x1="${-sw / 2 + r * 0.06}" y1="${y0}" x2="${-sw / 2 + r * 0.06}" y2="${y1}" stroke="#bdb6a9" stroke-opacity="0.45" stroke-width="${r * 0.012}" stroke-dasharray="${r * 0.05} ${r * 0.035}"/>
      <line x1="${sw / 2 - r * 0.06}" y1="${y0}" x2="${sw / 2 - r * 0.06}" y2="${y1}" stroke="#bdb6a9" stroke-opacity="0.45" stroke-width="${r * 0.012}" stroke-dasharray="${r * 0.05} ${r * 0.035}"/>`;
  const fade = strapFade ? `<linearGradient id="${id}sf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="${strapFade}"/><stop offset="0.35" stop-color="#000" stop-opacity="0"/><stop offset="0.65" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${strapFade}"/></linearGradient>` : '';
  const symbolOnDial = logo === 'symbol' ? L.symbolC(0, -dialR * 0.5, dialR * 0.3, 'url(#silver)', `filter="url(#shadowS)"`) : '';
  return `<g transform="translate(${cx},${cy}) rotate(${rot})">
    <defs>
      <radialGradient id="${id}d" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#2a2a2a"/><stop offset="0.6" stop-color="#0d0d0d"/><stop offset="1" stop-color="#050505"/></radialGradient>
      <radialGradient id="${id}c" cx="0.32" cy="0.28" r="0.85"><stop offset="0" stop-color="#ffffff"/><stop offset="0.3" stop-color="#dcdcdc"/><stop offset="0.62" stop-color="#8a8a8a"/><stop offset="0.82" stop-color="#d7d7d7"/><stop offset="1" stop-color="#6d6d6d"/></radialGradient>
      <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdfdfd"/><stop offset="0.5" stop-color="#9c9c9c"/><stop offset="1" stop-color="#e9e9e9"/></linearGradient>
      <clipPath id="${id}clip"><circle r="${dialR}"/></clipPath>
      ${fade}
    </defs>
    <g filter="url(#shadowS)">
      <rect x="${-sw / 2}" y="${-L1}" width="${sw}" height="${2 * L1}" fill="url(#leather)"/>
      ${strapStitch(-L1, -r * 1.05)}${strapStitch(r * 1.05, L1)}
      ${strapFade ? `<rect x="${-sw / 2}" y="${-L1}" width="${sw}" height="${2 * L1}" fill="url(#${id}sf)"/>` : ''}
    </g>
    <g filter="url(#shadowS)">
      <rect x="${-sw / 2 - r * 0.02}" y="${-r * 1.12}" width="${r * 0.16}" height="${r * 0.5}" rx="${r * 0.05}" fill="url(#${id}b)"/>
      <rect x="${sw / 2 - r * 0.14}" y="${-r * 1.12}" width="${r * 0.16}" height="${r * 0.5}" rx="${r * 0.05}" fill="url(#${id}b)"/>
      <rect x="${-sw / 2 - r * 0.02}" y="${r * 0.62}" width="${r * 0.16}" height="${r * 0.5}" rx="${r * 0.05}" fill="url(#${id}b)"/>
      <rect x="${sw / 2 - r * 0.14}" y="${r * 0.62}" width="${r * 0.16}" height="${r * 0.5}" rx="${r * 0.05}" fill="url(#${id}b)"/>
      <rect x="${r * 0.96}" y="${-r * 0.11}" width="${r * 0.14}" height="${r * 0.22}" rx="${r * 0.03}" fill="url(#steelH)"/>
      <circle r="${r}" fill="url(#${id}c)"/>
    </g>
    <circle r="${bezelR}" fill="url(#${id}b)"/>
    <circle r="${bezelR * 0.985}" fill="none" stroke="#ffffff" stroke-opacity="0.6" stroke-width="${r * 0.008}"/>
    <circle r="${dialR}" fill="url(#${id}d)"/>
    <g clip-path="url(#${id}clip)">${wedges}</g>
    ${mt}${idx}
    ${symbolOnDial}
    ${hand(300, dialR * 0.62, r * 0.05)}
    ${hand(60, dialR * 0.86, r * 0.04)}
    <circle r="${r * 0.045}" fill="url(#silver)" stroke="#777" stroke-width="${r * 0.004}"/>
    <circle r="${dialR}" fill="none" stroke="#000" stroke-opacity="0.6" stroke-width="${r * 0.02}"/>
    <ellipse cx="${-r * 0.25}" cy="${-r * 0.35}" rx="${r * 0.55}" ry="${r * 0.3}" fill="#fff" opacity="0.05" transform="rotate(-30 ${-r * 0.25} ${-r * 0.35})"/>
  </g>`;
}

// Chain of links along a cubic bezier list [[p0,p1,p2,p3],...]
function bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
          u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
}
function chain(segs, { step = 22, size = 1 } = {}) {
  // sample densely
  const pts = [];
  for (const s of segs) for (let i = 0; i <= 400; i++) pts.push(bez(...s, i / 400));
  // arc length resample
  const out = []; let acc = 0, next = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    while (acc + d >= next) {
      const t = (next - acc) / d;
      const x = pts[i - 1][0] + t * (pts[i][0] - pts[i - 1][0]), y = pts[i - 1][1] + t * (pts[i][1] - pts[i - 1][1]);
      const ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) * 180 / Math.PI;
      out.push([x, y, ang]); next += step;
    }
    acc += d;
  }
  let g = '';
  out.forEach(([x, y, a], i) => {
    if (i % 2 === 0) {
      g += `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${a.toFixed(1)})"><ellipse rx="${16 * size}" ry="${9.5 * size}" fill="none" stroke="#5c5c5c" stroke-width="${6.2 * size}"/><ellipse rx="${16 * size}" ry="${9.5 * size}" fill="none" stroke="url(#silver)" stroke-width="${4.6 * size}"/></g>`;
    } else {
      g += `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${a.toFixed(1)})"><rect x="${-17 * size}" y="${-3.6 * size}" width="${34 * size}" height="${7.2 * size}" rx="${3.6 * size}" fill="url(#silver)" stroke="#5c5c5c" stroke-width="${1.2 * size}"/></g>`;
    }
  });
  return `<g filter="url(#shadowS)">${g}</g>`;
}

module.exports = { watch, chain };
