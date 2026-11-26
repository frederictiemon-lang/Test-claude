// Mockups (slide 8) and photo-direction still life (slide 7).
const L = require('./lib');
const O = require('./objects');
const { C } = L;
const W = 1500, H = 800;

function bgRadial(id, c0, c1, cx = 0.5, cy = 0.45) {
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="0.8"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></radialGradient>`;
}

// 1. Watch box (écrin) open, top view
function ecrin() {
  const defs = bgRadial('bg', '#EEE8DE', '#D6CEC0') + `
    <radialGradient id="satin" cx="0.45" cy="0.4" r="0.8"><stop offset="0" stop-color="#2A2826"/><stop offset="1" stop-color="#0E0D0C"/></radialGradient>
    <linearGradient id="box" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1E1E1E"/><stop offset="1" stop-color="#080808"/></linearGradient>
    <linearGradient id="suede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3EEE5"/><stop offset="1" stop-color="#E3DBCD"/></linearGradient>
    <linearGradient id="pillow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF8F2"/><stop offset="0.55" stop-color="#EFE9DF"/><stop offset="1" stop-color="#D8CFC0"/></linearGradient>
    <filter id="inset" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation="7"/><feOffset dx="0" dy="6" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out" result="i"/><feFlood flood-color="#000" flood-opacity="0.45"/><feComposite in2="i" operator="in" result="s"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s"/></feMerge></filter>`;
  const lidX = 230, baseX = 750, y = 135, s = 520, ins = 28;
  const inner = `
    <rect width="${W}" height="${H}" fill="url(#bg)"/>${L.grainOverlay(W, H, 0.1)}
    <g filter="url(#shadowL)">
      <rect x="${lidX}" y="${y}" width="${s}" height="${s}" rx="22" fill="url(#box)"/>
      <rect x="${baseX}" y="${y}" width="${s}" height="${s}" rx="22" fill="url(#box)"/>
    </g>
    <rect x="${lidX + ins}" y="${y + ins}" width="${s - 2 * ins}" height="${s - 2 * ins}" rx="10" fill="url(#satin)" filter="url(#inset)"/>
    ${L.lockupC(lidX + s / 2, y + s / 2, 200, 'url(#foil)', 'filter="url(#shadowS)"')}
    <rect x="${baseX + ins}" y="${y + ins}" width="${s - 2 * ins}" height="${s - 2 * ins}" rx="10" fill="url(#suede)" filter="url(#inset)"/>
    <rect x="${baseX + ins}" y="${y + ins}" width="${s - 2 * ins}" height="${s - 2 * ins}" rx="10" filter="url(#noise)" opacity="0.07" style="mix-blend-mode:multiply"/>
    <line x1="${baseX}" y1="${y + 6}" x2="${baseX}" y2="${y + s - 6}" stroke="#000" stroke-width="3" opacity="0.8"/>
    <rect x="${baseX + 70}" y="${y + 160}" width="${s - 140}" height="200" rx="100" fill="#cfc6b6" opacity="0.6" filter="url(#shadowS)"/>
    <rect x="${baseX + 70}" y="${y + 155}" width="${s - 140}" height="200" rx="100" fill="url(#pillow)"/>
    ${O.watch(baseX + s / 2, y + 255, 92, { strapLen: 1.09, strapFade: 0.7 })}`;
  return L.svgDoc(W, H, inner, defs);
}

// 2. Shopping bags (front view)
function sac() {
  const defs = `
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4EFE7"/><stop offset="1" stop-color="#E7E0D4"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9D1C3"/><stop offset="1" stop-color="#CFC6B6"/></linearGradient>
    <linearGradient id="bagB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1F1F1F"/><stop offset="0.6" stop-color="#141414"/><stop offset="1" stop-color="#0C0C0C"/></linearGradient>
    <linearGradient id="bagBs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#050505"/><stop offset="0.5" stop-color="#0E0E0E"/><stop offset="1" stop-color="#030303"/></linearGradient>
    <linearGradient id="bagI" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FBF8F3"/><stop offset="0.7" stop-color="#F2ECE2"/><stop offset="1" stop-color="#E8E1D5"/></linearGradient>
    <linearGradient id="bagIs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D7CEBF"/><stop offset="0.5" stop-color="#E2DACD"/><stop offset="1" stop-color="#CFC5B5"/></linearGradient>
    <filter id="floorSh" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="14"/></filter>`;
  function bag(x, y, w, h, g, d, fill, side, band, cord, cordBack, logoFill, logoW) {
    const top = y, bot = y + h;
    return `
      <ellipse cx="${x + w / 2 + 30}" cy="${bot + 4}" rx="${w * 0.62}" ry="16" fill="#000" opacity="0.28" filter="url(#floorSh)"/>
      <path d="M${x + w * 0.3 + 18},${top + 6} C${x + w * 0.3 + 18},${top - h * 0.36} ${x + w * 0.7 + 18},${top - h * 0.36} ${x + w * 0.7 + 18},${top + 6}" fill="none" stroke="${cordBack}" stroke-width="8" stroke-linecap="round"/>
      <g filter="url(#shadowS)">
        <polygon points="${x + w},${top} ${x + w + d},${top + g} ${x + w + d},${bot - 8} ${x + w},${bot}" fill="url(#${side})"/>
        <line x1="${x + w + d / 2}" y1="${top + g / 2}" x2="${x + w + d / 2}" y2="${bot - 4}" stroke="#000" stroke-opacity="0.18" stroke-width="2"/>
        <rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#${fill})"/>
      </g>
      <rect x="${x}" y="${top}" width="${w}" height="${band}" fill="${band ? '#000' : 'none'}" opacity="0.06"/>
      <line x1="${x}" y1="${top + band}" x2="${x + w}" y2="${top + band}" stroke="#000" stroke-opacity="0.12" stroke-width="1.5"/>
      <rect x="${x}" y="${top}" width="${w}" height="${h}" filter="url(#noise)" opacity="0.05" style="mix-blend-mode:overlay"/>
      <circle cx="${x + w * 0.3}" cy="${top + band / 2 + 4}" r="6" fill="#000" opacity="0.35"/><circle cx="${x + w * 0.7}" cy="${top + band / 2 + 4}" r="6" fill="#000" opacity="0.35"/>
      <path d="M${x + w * 0.3},${top + band / 2 + 4} C${x + w * 0.3},${top - h * 0.4} ${x + w * 0.7},${top - h * 0.4} ${x + w * 0.7},${top + band / 2 + 4}" fill="none" stroke="#000" stroke-opacity="0.25" stroke-width="10" stroke-linecap="round" transform="translate(2,3)"/>
      <path d="M${x + w * 0.3},${top + band / 2 + 4} C${x + w * 0.3},${top - h * 0.4} ${x + w * 0.7},${top - h * 0.4} ${x + w * 0.7},${top + band / 2 + 4}" fill="none" stroke="${cord}" stroke-width="9" stroke-linecap="round"/>
      <path d="M${x + w * 0.3},${top + band / 2 + 4} C${x + w * 0.3},${top - h * 0.4} ${x + w * 0.7},${top - h * 0.4} ${x + w * 0.7},${top + band / 2 + 4}" fill="none" stroke="#fff" stroke-opacity="0.18" stroke-width="3" stroke-linecap="round" transform="translate(-2,-2)"/>
      ${L.lockupC(x + w / 2, top + h * 0.53, logoW, logoFill)}`;
  }
  const inner = `
    <rect width="${W}" height="${H}" fill="url(#wall)"/>
    <rect y="628" width="${W}" height="${H - 628}" fill="url(#floor)"/>
    <rect y="622" width="${W}" height="10" fill="#000" opacity="0.04"/>
    ${L.grainOverlay(W, H, 0.09)}
    ${bag(300, 318, 340, 380, 12, 40, 'bagI', 'bagIs', 30, '#151515', '#2a2a2a', C.noir, 140)}
    ${bag(740, 200, 440, 500, 14, 52, 'bagB', 'bagBs', 34, '#EDE6DA', '#BDB3A3', 'url(#foil)', 180)}`;
  return L.svgDoc(W, H, inner, defs);
}

// 3. Packaging boxes, top view on dark stone
function boite() {
  const defs = bgRadial('bg', '#3A3733', '#1E1C1A') + `
    <linearGradient id="ivBox" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F8F4ED"/><stop offset="1" stop-color="#E7E0D3"/></linearGradient>
    <linearGradient id="bkBox" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1D1D1D"/><stop offset="1" stop-color="#090909"/></linearGradient>`;
  const inner = `
    <rect width="${W}" height="${H}" fill="url(#bg)"/>${L.grainOverlay(W, H, 0.16)}
    <g transform="rotate(-7 560 410)">
      <g filter="url(#shadowD)"><rect x="320" y="170" width="480" height="480" rx="5" fill="url(#ivBox)"/></g>
      <rect x="320" y="170" width="480" height="480" rx="5" filter="url(#noise)" opacity="0.06" style="mix-blend-mode:multiply"/>
      <rect x="323" y="173" width="474" height="474" rx="4" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="2"/>
      ${L.symbolC(560, 410, 190, '#EAE3D6', 'filter="url(#deboss)"')}
    </g>
    <g transform="rotate(9 1065 455)">
      <g filter="url(#shadowD)"><rect x="880" y="270" width="370" height="370" rx="5" fill="url(#bkBox)"/></g>
      <rect x="882" y="272" width="366" height="366" rx="4" fill="none" stroke="#fff" stroke-opacity="0.08" stroke-width="2"/>
      ${L.lockupC(1065, 455, 150, 'url(#foil)')}
    </g>`;
  return L.svgDoc(W, H, inner, defs);
}

// 4. Business cards, top view on dark felt
function carte() {
  const defs = bgRadial('bg', '#34322F', '#1A1918') + `
    <linearGradient id="cardI" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FAF7F1"/><stop offset="1" stop-color="#ECE6DB"/></linearGradient>
    <linearGradient id="cardB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1C1C1C"/><stop offset="1" stop-color="#070707"/></linearGradient>`;
  const cw = 500, ch = 324;
  const ivoryCard = (cx, cy, rot) => `<g transform="rotate(${rot} ${cx} ${cy})">
      <g filter="url(#shadowD)"><rect x="${cx - cw / 2}" y="${cy - ch / 2}" width="${cw}" height="${ch}" rx="6" fill="url(#cardI)"/></g>
      <rect x="${cx - cw / 2}" y="${cy - ch / 2}" width="${cw}" height="${ch}" rx="6" filter="url(#noise)" opacity="0.06" style="mix-blend-mode:multiply"/>
      ${L.symbol(cx - cw / 2 + 40, cy - ch / 2 + 38, 46, C.noir)}
      <text x="${cx - cw / 2 + 40}" y="${cy + 20}" font-family="Cormorant Garamond" font-size="38" fill="#111">Prénom Nom</text>
      <text x="${cx - cw / 2 + 42}" y="${cy + 52}" font-family="Manrope" font-weight="600" font-size="12" letter-spacing="3.5" fill="#6B655B">FONCTION</text>
      <text x="${cx - cw / 2 + 42}" y="${cy + ch / 2 - 62}" font-family="Manrope" font-size="13" fill="#4a463f">Téléphone</text>
      <text x="${cx - cw / 2 + 42}" y="${cy + ch / 2 - 42}" font-family="Manrope" font-size="13" fill="#4a463f">Adresse e-mail</text>
      <text x="${cx + cw / 2 - 40}" y="${cy + ch / 2 - 42}" text-anchor="end" font-family="Manrope" font-size="13" fill="#4a463f">Adresse de la boutique</text>
    </g>`;
  const blackCard = (cx, cy, rot) => `<g transform="rotate(${rot} ${cx} ${cy})">
      <g filter="url(#shadowD)"><rect x="${cx - cw / 2}" y="${cy - ch / 2}" width="${cw}" height="${ch}" rx="6" fill="url(#cardB)"/></g>
      <rect x="${cx - cw / 2 + 2}" y="${cy - ch / 2 + 2}" width="${cw - 4}" height="${ch - 4}" rx="5" fill="none" stroke="#fff" stroke-opacity="0.07" stroke-width="2"/>
      ${L.lockupC(cx, cy, 150, 'url(#foil)')}
    </g>`;
  const inner = `
    <rect width="${W}" height="${H}" fill="url(#bg)"/>${L.grainOverlay(W, H, 0.18)}
    ${blackCard(1000, 470, 6)}
    ${ivoryCard(560, 360, -7)}`;
  return L.svgDoc(W, H, inner, defs);
}

// 5. Hang tag with chain, top view on ivory linen
function etiquette() {
  const defs = bgRadial('bg', '#F1ECE3', '#DCD4C6', 0.4, 0.4) + `
    <linearGradient id="tagB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1E1E1E"/><stop offset="1" stop-color="#080808"/></linearGradient>`;
  const tw = 250, th = 380, cx = 560, cy = 430, ch = 40;
  const tag = `<g transform="rotate(-13 ${cx} ${cy})">
      <g filter="url(#shadowL)"><path d="M${cx - tw / 2 + ch},${cy - th / 2} L${cx + tw / 2 - ch},${cy - th / 2} L${cx + tw / 2},${cy - th / 2 + ch} L${cx + tw / 2},${cy + th / 2} L${cx - tw / 2},${cy + th / 2} L${cx - tw / 2},${cy - th / 2 + ch} Z" fill="url(#tagB)"/></g>
      <circle cx="${cx}" cy="${cy - th / 2 + 42}" r="15" fill="url(#steelR)"/><circle cx="${cx}" cy="${cy - th / 2 + 42}" r="9" fill="#E4DDD0"/>
      ${L.lockupC(cx, cy + 40, 130, C.ivoire)}
    </g>`;
  // tie point (rotated hole position)
  const a = -13 * Math.PI / 180, hx0 = 0, hy0 = -th / 2 + 42;
  const hx = cx + hx0 * Math.cos(a) - hy0 * Math.sin(a), hy = cy + hx0 * Math.sin(a) + hy0 * Math.cos(a);
  const cord = `<path d="M${hx},${hy} C${hx + 60},${hy - 120} ${hx + 230},${hy - 90} ${985},${205}" fill="none" stroke="#111" stroke-width="3.2" stroke-linecap="round" filter="url(#shadowS)"/>`;
  const ch1 = O.chain([
    [[985, 205], [1180, 120], [1400, 260], [1330, 450]],
    [[1330, 450], [1270, 620], [1000, 700], [880, 610]],
    [[880, 610], [800, 550], [860, 420], [930, 380]],
  ], { step: 21, size: 1 });
  const inner = `<rect width="${W}" height="${H}" fill="url(#bg)"/>${L.grainOverlay(W, H, 0.22, 'multiply', 'linen')}${L.grainOverlay(W, H, 0.07)}
    ${ch1}${cord}${tag}`;
  return L.svgDoc(W, H, inner, defs);
}

// 6. Watch dial engraving, close-up on dark slate
function gravure() {
  const defs = bgRadial('bg', '#3B3936', '#191817', 0.45, 0.45);
  const inner = `<rect width="${W}" height="${H}" fill="url(#bg)"/>${L.grainOverlay(W, H, 0.16)}
    ${O.watch(750, 400, 300, { strapLen: 2.0, rot: 0 })}`;
  return L.svgDoc(W, H, inner, defs);
}

// Photo direction still life (slide 7), 1330 x 980
function stillLife(w = 1330, h = 980) {
  const defs = bgRadial('bg', '#F4F0E8', '#DDD5C8', 0.35, 0.3) + `
    <linearGradient id="lightfall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.12"/></linearGradient>`;
  const inner = `<rect width="${w}" height="${h}" fill="url(#bg)"/>${L.grainOverlay(w, h, 0.2, 'multiply', 'linen')}${L.grainOverlay(w, h, 0.06)}
    ${O.watch(860, 470, 215, { rot: -24, strapLen: 3.4 })}
    <rect width="${w}" height="${h}" fill="url(#lightfall)"/>`;
  return L.svgDoc(w, h, inner, defs);
}

async function main() {
  const only = process.argv[2];
  const scenes = { mock_ecrin: ecrin, mock_sac: sac, mock_boite: boite, mock_carte: carte, mock_etiquette: etiquette, mock_gravure: gravure };
  for (const [n, f] of Object.entries(scenes)) {
    if (only && !n.includes(only)) continue;
    await L.render(n, L.page(f(), W, H), W, H, { dsf: 1.3, type: 'jpeg', quality: 90 });
  }
  if (!only || 'still'.includes(only)) await L.render('photo_direction', L.page(stillLife(), 1330, 980), 1330, 980, { dsf: 1, type: 'jpeg', quality: 90 });
  await L.close();
}
if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { stillLife, gravure };
