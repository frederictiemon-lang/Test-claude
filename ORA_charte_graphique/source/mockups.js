// Charte ORA : mises en situation (produits, packaging) et images de principe photo. Rendu final converti en niveaux de gris stricts.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const L = require('./lib');
const O = require('./objects');
const N = '#000000', B = '#FFFFFF';

const studio = (w, h, dark = false) => dark === 'pure' ? `<rect width="${w}" height="${h}" fill="#000"/>` : dark
  ? `<rect width="${w}" height="${h}" fill="#000"/><radialGradient id="spot" cx="0.5" cy="0.42" r="0.7"><stop offset="0" stop-color="#1c1c1c"/><stop offset="1" stop-color="#000"/></radialGradient><rect width="${w}" height="${h}" fill="url(#spot)"/>`
  : `<rect width="${w}" height="${h}" fill="#fff"/>`;
const doc = (w, h, inner, defs = '') => L.svgDoc(w, h, inner, defs);

// ---------- objects ----------
function caseback(cx, cy, r) {
  let rings = '';
  for (let k = 0; k < 60; k++) rings += `<circle r="${(r * 0.84 * (k + 1) / 60).toFixed(1)}" fill="none" stroke="${k % 2 ? '#fff' : '#000'}" stroke-opacity="${k % 2 ? 0.10 : 0.05}" stroke-width="${(r * 0.84 / 60).toFixed(2)}"/>`;
  let notches = '';
  for (let k = 0; k < 6; k++) notches += `<rect x="${-r * 0.04}" y="${-r * 0.86}" width="${r * 0.08}" height="${r * 0.06}" rx="${r * 0.015}" fill="#4a4a4a" transform="rotate(${k * 60 + 30})"/>`;
  const sw = r * 0.78;
  return `<g transform="translate(${cx},${cy})">
    <g filter="url(#shadowS)"><rect x="${-sw / 2}" y="${-r * 2.6}" width="${sw}" height="${r * 5.2}" fill="url(#leather)"/></g>
    <g filter="url(#shadowS)">
      ${[-1, 1].map(sy => [-1, 1].map(sx => `<rect x="${sx < 0 ? -sw / 2 - r * 0.02 : sw / 2 - r * 0.14}" y="${sy < 0 ? -r * 1.12 : r * 0.62}" width="${r * 0.16}" height="${r * 0.5}" rx="${r * 0.05}" fill="url(#silver)"/>`).join('')).join('')}
      <circle r="${r}" fill="url(#steelR)"/></g>
    <circle r="${r * 0.9}" fill="#cfcfcf"/>
    <circle r="${r * 0.88}" fill="url(#steelR)"/>
    <circle r="${r * 0.84}" fill="#d6d6d6"/>${rings}${notches}
    ${L.symbolC(0, 0, r * 0.62, '#8c8c8c', 'filter="url(#engrave)"')}
    ${L.symbolC(-1.2, -1.2, r * 0.62, 'none', 'stroke="#fff" stroke-opacity="0.35"')}
  </g>`;
}
function plate(cx, cy, w, h, rot, sym = 0.62) {
  return `<g transform="translate(${cx},${cy}) rotate(${rot})">
    <g filter="url(#shadowS)"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="url(#steelH)"/></g>
    <rect x="${-w / 2 + 6}" y="${-h / 2 + 6}" width="${w - 12}" height="${h - 12}" rx="${h / 2 - 6}" fill="url(#silver)" opacity="0.6"/>
    ${L.symbolC(0, 0, h * sym, '#7d7d7d', 'filter="url(#engrave)"')}
  </g>`;
}
function medal(cx, cy, r) {
  return `<g transform="translate(${cx},${cy})"><g filter="url(#shadowS)"><circle r="${r}" fill="url(#steelR)"/></g>
    <circle r="${r * 0.9}" fill="url(#silver)" opacity="0.7"/>
    <circle cy="${-r * 0.8}" r="${r * 0.08}" fill="#fff" stroke="#555" stroke-width="2"/>
    ${L.symbolC(0, r * 0.05, r * 1.0, '#7a7a7a', 'filter="url(#engrave)"')}</g>`;
}
function ring(cx, cy, rx, ry, sw = 7, rot = 0) {
  return `<g transform="translate(${cx},${cy}) rotate(${rot})" filter="url(#shadowS)"><ellipse rx="${rx}" ry="${ry}" fill="none" stroke="#555" stroke-width="${sw + 2}"/><ellipse rx="${rx}" ry="${ry}" fill="none" stroke="url(#silver)" stroke-width="${sw}"/></g>`;
}
function tag(cx, cy, w, h, rot, fill, logo) {
  const c = w * 0.16;
  return `<g transform="rotate(${rot} ${cx} ${cy})">
    <g filter="url(#shadowL)"><path d="M${cx - w / 2 + c},${cy - h / 2} L${cx + w / 2 - c},${cy - h / 2} L${cx + w / 2},${cy - h / 2 + c} L${cx + w / 2},${cy + h / 2} L${cx - w / 2},${cy + h / 2} L${cx - w / 2},${cy - h / 2 + c} Z" fill="${fill}"/></g>
    ${fill === B ? `<path d="M${cx - w / 2 + c},${cy - h / 2} L${cx + w / 2 - c},${cy - h / 2} L${cx + w / 2},${cy - h / 2 + c} L${cx + w / 2},${cy + h / 2} L${cx - w / 2},${cy + h / 2} L${cx - w / 2},${cy - h / 2 + c} Z" fill="none" stroke="#000" stroke-opacity="0.08" stroke-width="2"/>` : ''}
    <circle cx="${cx}" cy="${cy - h / 2 + w * 0.17}" r="${w * 0.06}" fill="url(#steelR)"/><circle cx="${cx}" cy="${cy - h / 2 + w * 0.17}" r="${w * 0.035}" fill="#fff"/>
    ${logo}</g>`;
}
function holePos(cx, cy, w, h, rot) {
  const a = rot * Math.PI / 180, dx = 0, dy = -h / 2 + w * 0.17;
  return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
}
function bag(x, y, w, h, d, dark, logoW) {
  const front = dark ? 'url(#bagB)' : 'url(#bagW)', side = dark ? 'url(#bagBs)' : 'url(#bagWs)';
  const cord = dark ? '#f4f4f4' : '#111', cordBack = dark ? '#bdbdbd' : '#3a3a3a';
  const top = y, bot = y + h, band = 32;
  return `
    <ellipse cx="${x + w / 2 + 24}" cy="${bot + 2}" rx="${w * 0.6}" ry="14" fill="#000" opacity="0.30" filter="url(#blur14)"/>
    <path d="M${x + w * 0.3 + 18},${top + 6} C${x + w * 0.3 + 18},${top - h * 0.36} ${x + w * 0.7 + 18},${top - h * 0.36} ${x + w * 0.7 + 18},${top + 6}" fill="none" stroke="${cordBack}" stroke-width="8" stroke-linecap="round"/>
    <g filter="url(#shadowS)">
      <polygon points="${x + w},${top} ${x + w + d},${top + 12} ${x + w + d},${bot - 8} ${x + w},${bot}" fill="${side}"/>
      <rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${front}"/></g>
    <line x1="${x + w + d / 2}" y1="${top + 7}" x2="${x + w + d / 2}" y2="${bot - 5}" stroke="#000" stroke-opacity="0.15" stroke-width="2"/>
    <line x1="${x}" y1="${top + band}" x2="${x + w}" y2="${top + band}" stroke="${dark ? '#fff' : '#000'}" stroke-opacity="0.08" stroke-width="2"/>
    <circle cx="${x + w * 0.3}" cy="${top + band / 2 + 4}" r="6" fill="${dark ? '#fff' : '#000'}" opacity="0.25"/><circle cx="${x + w * 0.7}" cy="${top + band / 2 + 4}" r="6" fill="${dark ? '#fff' : '#000'}" opacity="0.25"/>
    <path d="M${x + w * 0.3},${top + band / 2 + 4} C${x + w * 0.3},${top - h * 0.4} ${x + w * 0.7},${top - h * 0.4} ${x + w * 0.7},${top + band / 2 + 4}" fill="none" stroke="#000" stroke-opacity="0.2" stroke-width="10" stroke-linecap="round" transform="translate(2,3)"/>
    <path d="M${x + w * 0.3},${top + band / 2 + 4} C${x + w * 0.3},${top - h * 0.4} ${x + w * 0.7},${top - h * 0.4} ${x + w * 0.7},${top + band / 2 + 4}" fill="none" stroke="${cord}" stroke-width="9" stroke-linecap="round"/>
    ${L.lockupC(x + w / 2, top + h * 0.54, logoW, dark ? B : N)}`;
}
const BAG_DEFS = `
  <linearGradient id="bagB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a1a1a"/><stop offset="0.6" stop-color="#101010"/><stop offset="1" stop-color="#080808"/></linearGradient>
  <linearGradient id="bagBs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#030303"/><stop offset="0.5" stop-color="#0c0c0c"/><stop offset="1" stop-color="#020202"/></linearGradient>
  <linearGradient id="bagW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="0.7" stop-color="#f7f7f7"/><stop offset="1" stop-color="#ececec"/></linearGradient>
  <linearGradient id="bagWs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9d9d9"/><stop offset="0.5" stop-color="#e6e6e6"/><stop offset="1" stop-color="#d2d2d2"/></linearGradient>
  <filter id="blur14" x="-50%" y="-300%" width="200%" height="700%"><feGaussianBlur stdDeviation="14"/></filter>
  <linearGradient id="boxB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c1c1c"/><stop offset="1" stop-color="#070707"/></linearGradient>
  <linearGradient id="boxW" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f0f0f0"/></linearGradient>
  <radialGradient id="satinB" cx="0.45" cy="0.4" r="0.8"><stop offset="0" stop-color="#262626"/><stop offset="1" stop-color="#0b0b0b"/></radialGradient>
  <linearGradient id="pillowW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#f4f4f4"/><stop offset="1" stop-color="#dcdcdc"/></linearGradient>
  <filter id="inset" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation="7"/><feOffset dx="0" dy="6" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out" result="i"/><feFlood flood-color="#000" flood-opacity="0.35"/><feComposite in2="i" operator="in" result="s"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s"/></feMerge></filter>`;

// ---------- scenes ----------
const scenes = {
  // Page 12
  app_gravure_montre: [1500, 800, () => doc(1500, 800, studio(1500, 800) + caseback(750, 400, 255))],
  app_gravure_bracelet: [1500, 800, () => doc(1500, 800, studio(1500, 800, true) +
    O.chain([[[-40, 520], [200, 470], [380, 430], [520, 418]]], { step: 21 }) +
    O.chain([[[980, 402], [1120, 390], [1300, 360], [1560, 300]]], { step: 21 }) +
    ring(530, 417, 16, 12, 6) + ring(970, 402, 16, 12, 6) + plate(750, 410, 430, 128, -3.5, 0.66))],
  app_fermoir: [1500, 800, () => doc(1500, 800, studio(1500, 800) +
    O.chain([[[-30, 140], [260, 160], [470, 260], [640, 330]]], { step: 21 }) +
    ring(655, 337, 20, 14, 6, 25) +
    `<g filter="url(#shadowS)"><circle cx="700" cy="372" r="40" fill="none" stroke="#555" stroke-width="13"/><circle cx="700" cy="372" r="40" fill="none" stroke="url(#silver)" stroke-width="10"/><rect x="726" y="356" width="22" height="12" rx="4" fill="url(#silver)" transform="rotate(30 737 362)"/></g>` +
    ring(755, 420, 22, 15, 6, 50) + medal(840, 520, 120) +
    O.chain([[[1500, 660], [1280, 650], [1140, 560], [1060, 470]]], { step: 21 }) + ring(1050, 458, 22, 15, 7, 60))],
  app_etiquettes: [2160, 750, () => {
    const t1 = [800, 420, 300, 450, -10], t2 = [1360, 430, 300, 450, 8];
    const [h1x, h1y] = holePos(...t1), [h2x, h2y] = holePos(...t2);
    return doc(2160, 750, studio(2160, 750) +
      `<path d="M${h1x},${h1y} C${h1x + 40},${h1y - 160} ${h1x + 260},${-40} ${h1x + 360},${-20}" fill="none" stroke="#111" stroke-width="3" filter="url(#shadowS)"/>` +
      `<path d="M${h2x},${h2y} C${h2x - 30},${h2y - 150} ${h2x - 160},${-30} ${h2x - 300},${-20}" fill="none" stroke="#111" stroke-width="3" filter="url(#shadowS)"/>` +
      tag(...t1, N, L.lockupC(t1[0], t1[1] + 50, 160, B)) + tag(...t2, B, L.symbolC(t2[0], t2[1] + 40, 150, N)));
  }],
  app_ecrin: [2160, 750, () => {
    const s = 560, y = 95, lidX = 520, baseX = 1080, ins = 30;
    return doc(2160, 750, studio(2160, 750) +
      `<g filter="url(#shadowL)"><rect x="${lidX}" y="${y}" width="${s}" height="${s}" rx="22" fill="url(#boxB)"/><rect x="${baseX}" y="${y}" width="${s}" height="${s}" rx="22" fill="url(#boxB)"/></g>
       <rect x="${lidX + ins}" y="${y + ins}" width="${s - 2 * ins}" height="${s - 2 * ins}" rx="10" fill="url(#satinB)" filter="url(#inset)"/>
       ${L.lockupC(lidX + s / 2, y + s / 2, 210, B)}
       <rect x="${baseX + ins}" y="${y + ins}" width="${s - 2 * ins}" height="${s - 2 * ins}" rx="10" fill="#f6f6f6" filter="url(#inset)"/>
       <line x1="${baseX}" y1="${y + 6}" x2="${baseX}" y2="${y + s - 6}" stroke="#000" stroke-width="3"/>
       <rect x="${baseX + 75}" y="${y + 185}" width="${s - 150}" height="200" rx="100" fill="#cfcfcf" opacity="0.7" filter="url(#shadowS)"/>
       <rect x="${baseX + 75}" y="${y + 180}" width="${s - 150}" height="200" rx="100" fill="url(#pillowW)"/>
       ${O.watch(baseX + s / 2, y + 280, 96, { strapLen: 1.09, strapFade: 0.7 })}`, BAG_DEFS);
  }],
  // Page 13
  pack_sacs: [2160, 750, () => doc(2160, 750, studio(2160, 750) + `<rect y="640" width="2160" height="110" fill="#fafafa"/>` +
    bag(560, 300, 330, 360, 38, false, 130) + bag(960, 180, 430, 480, 50, true, 175) + bag(1480, 400, 240, 260, 28, true, 95), BAG_DEFS)],
  pack_boites: [2160, 750, () => doc(2160, 750, studio(2160, 750) +
    `<g transform="rotate(-6 640 380)"><g filter="url(#shadowL)"><rect x="420" y="160" width="440" height="440" rx="5" fill="url(#boxW)"/></g><rect x="423" y="163" width="434" height="434" rx="4" fill="none" stroke="#000" stroke-opacity="0.06" stroke-width="2"/>${L.symbolC(640, 380, 170, N)}</g>
     <g transform="rotate(7 1110 400)"><g filter="url(#shadowL)"><rect x="930" y="220" width="360" height="360" rx="5" fill="url(#boxB)"/></g>${L.lockupC(1110, 400, 150, B)}</g>
     <g transform="rotate(-3 1600 360)"><g filter="url(#shadowL)"><rect x="1420" y="170" width="360" height="380" rx="5" fill="url(#boxW)"/></g><rect x="1423" y="173" width="354" height="374" rx="4" fill="none" stroke="#000" stroke-opacity="0.06" stroke-width="2"/>${L.lockupC(1600, 360, 140, N)}</g>`, BAG_DEFS)],
  pack_ecrin_bijou: [1500, 800, () => {
    // round box: lid (black, white symbol) beside open base (white insert with chain)
    const pts = []; const R = 150, cx = 1000, cy = 410;
    for (let k = 0; k < 4; k++) { const a0 = k * Math.PI / 2 - 0.3, a1 = a0 + Math.PI / 2; const kk = 4 / 3 * Math.tan(Math.PI / 8);
      const p = (a, r) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
      const r0 = R * (1 - 0.03 * k), r1 = R * (1 - 0.03 * (k + 1));
      pts.push([p(a0, r0), [p(a0, r0)[0] - kk * r0 * Math.sin(a0), p(a0, r0)[1] + kk * r0 * Math.cos(a0)], [p(a1, r1)[0] + kk * r1 * Math.sin(a1), p(a1, r1)[1] - kk * r1 * Math.cos(a1)], p(a1, r1)]); }
    return doc(1500, 800, studio(1500, 800) +
      `<g filter="url(#shadowL)"><circle cx="470" cy="400" r="245" fill="url(#boxB)"/></g><circle cx="470" cy="400" r="232" fill="none" stroke="#fff" stroke-opacity="0.08" stroke-width="3"/>${L.symbolC(470, 400, 210, B)}
       <g filter="url(#shadowL)"><circle cx="1000" cy="410" r="245" fill="url(#boxB)"/></g>
       <circle cx="1000" cy="410" r="214" fill="#f4f4f4" filter="url(#inset)"/>` + O.chain(pts, { step: 20, size: 0.9 }), BAG_DEFS);
  }],
  pack_papier_soie: [1500, 800, () => {
    let pat = '';
    for (let r = 0; r < 14; r++) for (let c = 0; c < 22; c++) pat += L.symbolC(c * 78 + (r % 2) * 39, r * 72, 30, N);
    return doc(1500, 800, studio(1500, 800) + `<defs><clipPath id="sheetL"><polygon points="270,120 760,420 270,700"/></clipPath><clipPath id="sheetR"><polygon points="1230,100 740,420 1230,700"/></clipPath>
      <linearGradient id="foldL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.10"/><stop offset="0.7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.12"/></linearGradient>
      <linearGradient id="foldR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.06"/><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.16"/></linearGradient></defs>
      <g filter="url(#shadowL)"><rect x="250" y="90" width="1000" height="630" rx="6" fill="url(#boxB)"/></g>
      <rect x="270" y="110" width="960" height="590" fill="#fff"/>
      <g filter="url(#shadowS)"><polygon points="270,120 760,420 270,700" fill="#fff"/></g><g clip-path="url(#sheetL)" opacity="0.85">${pat}</g><polygon points="270,120 760,420 270,700" fill="url(#foldL)"/>
      <g filter="url(#shadowS)"><polygon points="1230,100 740,420 1230,700" fill="#fff"/></g><g clip-path="url(#sheetR)" opacity="0.85">${pat}</g><polygon points="1230,100 740,420 1230,700" fill="url(#foldR)"/>
      <g filter="url(#shadowS)"><circle cx="750" cy="418" r="62" fill="#000"/></g>${L.symbolC(750, 418, 70, B)}`, BAG_DEFS);
  }],
  pack_carte_merci: [1500, 800, () => doc(1500, 800, studio(1500, 800, true) +
    `<g transform="rotate(6 900 450)"><g filter="url(#shadowD)"><rect x="620" y="250" width="560" height="380" fill="#fff"/></g>
       <polygon points="620,250 900,450 1180,250" fill="#f2f2f2" stroke="#000" stroke-opacity="0.08"/>${L.symbolC(900, 420, 46, N)}</g>
     <g transform="rotate(-5 640 400)"><g filter="url(#shadowD)"><rect x="390" y="225" width="500" height="350" fill="#fff"/></g>
       ${L.symbolC(640, 290, 44, N)}
       <text x="640" y="400" text-anchor="middle" font-family="Cormorant Garamond" font-size="64" fill="#000">Merci</text>
       <text x="640" y="445" text-anchor="middle" font-family="Manrope" font-size="17" fill="#000">Merci de votre confiance.</text>
       <text x="640" y="525" text-anchor="middle" font-family="Cormorant Garamond" font-weight="500" font-size="19" letter-spacing="4" fill="#000">RELEVER VOTRE AURA.</text></g>`)],
  // Page 11 photos
  photo_montre: [800, 980, () => doc(800, 980, studio(800, 980) + O.watch(420, 500, 190, { rot: -18, strapLen: 3.6 }))],
  photo_chaine: [1180, 690, () => doc(1180, 690, studio(1180, 690, 'pure') +
    O.chain([[[-60, 600], [200, 220], [460, 760], [640, 380]], [[640, 380], [800, 60], [1000, 520], [1260, 120]]], { step: 44, size: 2.1 }))],
  photo_bracelet: [546, 690, () => doc(546, 690, studio(546, 690) +
    `<defs><linearGradient id="bang" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdfdfd"/><stop offset="0.3" stop-color="#9a9a9a"/><stop offset="0.5" stop-color="#f5f5f5"/><stop offset="0.75" stop-color="#6e6e6e"/><stop offset="1" stop-color="#d9d9d9"/></linearGradient></defs>
     <g filter="url(#shadowL)"><ellipse cx="273" cy="360" rx="190" ry="150" fill="none" stroke="url(#bang)" stroke-width="34"/></g>
     <ellipse cx="273" cy="360" rx="190" ry="150" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="3" transform="translate(-6,-8)"/>`)],
  photo_detail: [546, 690, () => doc(546, 690, studio(546, 690, 'pure') + O.watch(330, 420, 420, { strapLen: 2 }))],
};

async function main() {
  const only = process.argv[2];
  for (const [n, [w, h, f]] of Object.entries(scenes)) {
    if (only && !n.includes(only)) continue;
    const file = await L.render(n, L.page(f(), w, h), w, h, { dsf: 1.3, type: 'png' });
    // strict greyscale conversion (R = G = B), then JPEG
    execFileSync('python3', ['-c', `from PIL import Image; im=Image.open(${JSON.stringify(file)}).convert('L'); im.save(${JSON.stringify(file.replace('.png', '.jpg'))}, quality=90)`]);
    fs.unlinkSync(file);
  }
  await L.close();
}
main().catch(e => { console.error(e); process.exit(1); });
