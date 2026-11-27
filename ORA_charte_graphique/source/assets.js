// Charte ORA : logos monochromes, schémas, règles, interdits, planches. Noir #000000 et blanc #FFFFFF uniquement.
const fs = require('fs');
const path = require('path');
const L = require('./lib');
const { SYM } = L;
const N = '#000000', B = '#FFFFFF';
const OUT = L.OUT;
const DEL = path.resolve(__dirname, '../livrables_charte');
fs.mkdirSync(DEL, { recursive: true });

const svg = (w, h, inner, bg) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''}${inner}</svg>`;
const font = (size, weight = 600, ls = 0) => `font-family="Manrope" font-weight="${weight}" font-size="${size}" letter-spacing="${ls}"`;

// symbol path as outline (for analytical diagrams)
function symbolOutline(x, y, w, stroke = N, sw = 2.5) {
  const s = w / SYM.w;
  return `<g transform="translate(${x - SYM.ink.x0 * s},${y - SYM.ink.y0 * s}) scale(${s})"><path d="${L.SYM_D}" fill="${B}" stroke="${stroke}" stroke-width="${sw}" vector-effect="non-scaling-stroke" fill-rule="evenodd"/></g>`;
}

async function logos() {
  // Transparent PNGs used in the deck (2 % margin around ink)
  const symW = 1000, symHh = Math.round(L.symH(symW));
  const d = L.lockupDims(1000);
  for (const [n, col] of [['noir', N], ['blanc', B]]) {
    await L.render(`symbole_${n}`, L.page(svg(symW + 40, symHh + 40, L.symbol(20, 20, symW, col)), symW + 40, symHh + 40), symW + 40, symHh + 40, { dsf: 1.5 });
    await L.render(`logo_${n}`, L.page(svg(1040, Math.ceil(d.H) + 40, L.lockup(520, 20, 1000, col)), 1040, Math.ceil(d.H) + 40), 1040, Math.ceil(d.H) + 40, { dsf: 1.6 });
  }
  // Deliverables: SVG + high-res PNG (transparent) of the four official versions
  const dir = path.join(DEL, '02_declinaisons_monochromes'); fs.mkdirSync(dir, { recursive: true });
  const H = Math.ceil(d.H), SH = Math.ceil(L.symH(1000));
  for (const [n, col] of [['noir', N], ['blanc', B]]) {
    fs.writeFileSync(path.join(dir, `ORA_logo_${n}.svg`), svg(1000, H, L.lockup(500, 0, 1000, col)));
    fs.writeFileSync(path.join(dir, `ORA_symbole_${n}.svg`), svg(1000, SH, L.symbol(0, 0, 1000, col)));
    // 3000 px wide transparent PNG with 5 % margin
    const pw = 1100, ph = H + 100, sph = SH + 100;
    const f1 = await L.render(`hd_logo_${n}`, L.page(svg(pw, ph, L.lockup(550, 50, 1000, col)), pw, ph), pw, ph, { dsf: 3000 / pw });
    fs.copyFileSync(f1, path.join(dir, `ORA_logo_${n}.png`));
    const f2 = await L.render(`hd_symbole_${n}`, L.page(svg(pw, sph, L.symbol(50, 50, 1000, col)), pw, sph), pw, sph, { dsf: 3000 / pw });
    fs.copyFileSync(f2, path.join(dir, `ORA_symbole_${n}.png`));
  }
}

async function diagrams() {
  // Decomposition (page 4): element in solid black, rest in outline.
  const S = 900, pad = 60, w = S - 2 * pad, sc = w / SYM.w;
  const cx = pad + (SYM.c.x - SYM.ink.x0) * sc, cy = pad + (SYM.c.y - SYM.ink.y0) * sc;
  const rIn = SYM.rIn * sc, rOut = (SYM.rOut + 40) * sc;
  const H = Math.round(L.symH(w) + 2 * pad);
  const defs = `<defs><clipPath id="ring"><path clip-rule="evenodd" d="M${cx - rOut},${cy} a${rOut},${rOut} 0 1,0 ${2 * rOut},0 a${rOut},${rOut} 0 1,0 ${-2 * rOut},0 Z M${cx - rIn},${cy} a${rIn},${rIn} 0 1,0 ${2 * rIn},0 a${rIn},${rIn} 0 1,0 ${-2 * rIn},0 Z"/></clipPath>
    <clipPath id="inner"><circle cx="${cx}" cy="${cy}" r="${rIn}"/></clipPath></defs>`;
  const outline = symbolOutline(pad, pad, w);
  const solid = L.symbol(pad, pad, w, N);
  const ring = `${outline}<g clip-path="url(#ring)">${solid}</g>`;
  const blade = `${outline}<g clip-path="url(#inner)">${solid}</g>`;
  const rMid = ((SYM.rIn + SYM.rOut) / 2 + 60) * sc;
  const marks = SYM.gaps.map(a => {
    const t = a * Math.PI / 180, x = cx + rMid * Math.cos(t), y = cy + rMid * Math.sin(t);
    return `<circle cx="${x}" cy="${y}" r="78" fill="none" stroke="${N}" stroke-width="5"/>`;
  }).join('');
  const opening = `${outline}${marks}`;
  for (const [n, inner] of [['decomp_cercle', ring], ['decomp_diagonale', blade], ['decomp_ouverture', opening]]) {
    await L.render(n, L.page(svg(S, H, defs + inner, B), S, H), S, H, { dsf: 1 });
  }

  // Construction (page 5 + planche): lockup with D, 2 D, D/4
  const construction = (W, Hh, lw, sw = 3, fs = 34) => {
    const dd = L.lockupDims(lw); const lcx = W / 2, top = (Hh - dd.H) / 2 + fs * 0.4;
    const sx0 = lcx - dd.sw / 2, sx1 = lcx + dd.sw / 2, sy0 = top, sy1 = top + dd.sh;
    const wy0 = sy1 + dd.gap, wy1 = wy0 + dd.wh, wx0 = lcx - lw / 2, wx1 = lcx + lw / 2;
    const hline = (y) => `<line x1="${wx0 - lw * 0.16}" y1="${y}" x2="${wx1 + lw * 0.16}" y2="${y}" stroke="${N}" stroke-width="${sw * 0.6}" stroke-dasharray="${sw * 2} ${sw * 3}"/>`;
    const lab = (x, y, t, a = 'middle') => `<text x="${x}" y="${y}" ${font(fs, 600, fs * 0.12)} fill="${N}" text-anchor="${a}">${t}</text>`;
    const tick = fs * 0.45;
    const dimH = (x0, x1, y, t) => `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${N}" stroke-width="${sw}"/><line x1="${x0}" y1="${y - tick}" x2="${x0}" y2="${y + tick}" stroke="${N}" stroke-width="${sw}"/><line x1="${x1}" y1="${y - tick}" x2="${x1}" y2="${y + tick}" stroke="${N}" stroke-width="${sw}"/>` + lab((x0 + x1) / 2, y - fs * 0.75, t);
    const dimV = (y0, y1, x, t) => `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${N}" stroke-width="${sw}"/><line x1="${x - tick}" y1="${y0}" x2="${x + tick}" y2="${y0}" stroke="${N}" stroke-width="${sw}"/><line x1="${x - tick}" y1="${y1}" x2="${x + tick}" y2="${y1}" stroke="${N}" stroke-width="${sw}"/>` + lab(x + fs * 0.9, (y0 + y1) / 2 + fs * 0.35, t, 'start');
    return `<line x1="${lcx}" y1="${sy0 - fs * 3.4}" x2="${lcx}" y2="${wy1 + fs * 3.4}" stroke="${N}" stroke-width="${sw * 0.6}" stroke-dasharray="${sw * 2} ${sw * 3}"/>
      ${hline(sy0)}${hline(sy1)}${hline(wy0)}${hline(wy1)}
      ${L.lockup(lcx, top, lw, N)}
      ${dimH(sx0, sx1, sy0 - fs * 1.7, 'D')}
      ${dimH(wx0, wx1, wy1 + fs * 2.3, '2 D')}
      ${dimV(sy1, wy0, wx1 + lw * 0.13, 'D / 4')}
      ${lab(lcx + fs * 0.6, sy0 - fs * 3.6, 'AXE CENTRAL', 'start')}`;
  };
  await L.render('construction', L.page(svg(1680, 1470, construction(1680, 1470, 760), B), 1680, 1470), 1680, 1470, { dsf: 1 });

  // Clear space (page 9): X = D/4. Lockup: 2X all around. Symbol alone: X all around.
  const clear = (W, Hh, lw) => {
    const dd = L.lockupDims(lw), X = dd.sw / 4;
    const lx = W * 0.34, top = (Hh - dd.H) / 2;
    const box = (x0, y0, x1, y1, m) => `<rect x="${x0 - m}" y="${y0 - m}" width="${x1 - x0 + 2 * m}" height="${y1 - y0 + 2 * m}" fill="none" stroke="${N}" stroke-width="2" stroke-dasharray="7 7"/>
      <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="none" stroke="${N}" stroke-width="1"/>`;
    const xsq = (x, y, s) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="none" stroke="${N}" stroke-width="2"/><text x="${x + s / 2}" y="${y + s / 2 + 9}" text-anchor="middle" ${font(26, 700)} fill="${N}">X</text>`;
    const lx0 = lx - lw / 2, lx1 = lx + lw / 2, ly0 = top, ly1 = top + dd.H;
    // symbol alone
    const sw = dd.sw, sx = W * 0.8, sh = L.symH(sw), sy0 = (Hh - sh) / 2;
    return `${box(lx0, ly0, lx1, ly1, 2 * X)}${L.lockup(lx, top, lw, N)}
      ${xsq(lx0 - 2 * X, ly0 - 2 * X, X)}${xsq(lx0 - X, ly0 - X, X)}
      ${box(sx - sw / 2, sy0, sx + sw / 2, sy0 + sh, X)}${L.symbol(sx - sw / 2, sy0, sw, N)}${xsq(sx - sw / 2 - X, sy0 - X, X)}`;
  };
  await L.render('zone_protection', L.page(svg(2100, 1100, clear(2100, 1100, 620), B), 2100, 1100), 2100, 1100, { dsf: 1 });

  // Reduction test (page 9): real pixel sizes, enlarged x3 (nearest neighbour) to show what a screen displays.
  const sizes = [[16, 'symbol'], [24, 'symbol'], [32, 'symbol'], [64, 'lockup'], [100, 'lockup'], [140, 'lockup']];
  for (const [px, kind] of sizes) {
    const pad2 = 4;
    const w = px + 2 * pad2, h = kind === 'symbol' ? Math.ceil(L.symH(px)) + 2 * pad2 : Math.ceil(L.lockupDims(px).H) + 2 * pad2;
    const inner = kind === 'symbol' ? L.symbol(pad2, pad2, px, N) : L.lockup(w / 2, pad2, px, N);
    await L.render(`reduc_${kind}_${px}`, L.page(svg(w, h, inner, B), w, h), w, h, { dsf: 1 });
  }
}

async function misuses() {
  const W = 900, H = 600, lw = 300, cx = W / 2, cy = H / 2 + 10;
  const d = L.lockupDims(lw);
  const badge = `<g transform="translate(${W - 70},70)"><circle r="42" fill="${B}"/><circle r="34" fill="${N}"/><line x1="-13" y1="-13" x2="13" y2="13" stroke="${B}" stroke-width="5" stroke-linecap="round"/><line x1="13" y1="-13" x2="-13" y2="13" stroke="${B}" stroke-width="5" stroke-linecap="round"/></g>`;
  const s = (inner) => svg(W, H, inner + badge, B);
  const lockOutline = (cx0, top, lw0) => {
    const dd = L.lockupDims(lw0); const ss = dd.sw / SYM.w, sw2 = lw0 / L.WM.w;
    return `<g transform="translate(${cx0 - dd.sw / 2 - SYM.ink.x0 * ss},${top - SYM.ink.y0 * ss}) scale(${ss})"><path d="${L.SYM_D}" fill="none" stroke="${N}" stroke-width="3" vector-effect="non-scaling-stroke"/></g>
      <g transform="translate(${cx0 - lw0 / 2 - L.WM.ink.x0 * sw2},${top + dd.sh + dd.gap - L.WM.ink.y0 * sw2}) scale(${sw2})"><path d="${L.WM_D}" fill="none" stroke="${N}" stroke-width="3" vector-effect="non-scaling-stroke"/></g>`;
  };
  let stripes = '';
  for (let i = -20; i < 40; i++) stripes += `<line x1="${i * 34}" y1="0" x2="${i * 34 + 600}" y2="${H}" stroke="${N}" stroke-width="9"/>`;
  const tiles = {
    interdit_deformer: `<g transform="translate(${cx},${cy}) scale(1.6,0.8) translate(${-cx},${-cy})">${L.lockupC(cx, cy, lw, N)}</g>`,
    interdit_proportions: `${L.symbol(cx - lw * 0.55, cy - 220, lw * 1.1, N)}${L.wordmark(cx - lw * 0.38, cy - 220 + L.symH(lw * 1.1) + 20, lw * 0.76, N)}`,
    interdit_pivoter: `<g transform="rotate(-18 ${cx} ${cy})">${L.lockupC(cx, cy, lw, N)}</g>`,
    interdit_effet: `<g transform="translate(14,14)">${L.lockupC(cx, cy, lw, N)}</g>${lockOutline(cx, cy - d.H / 2, lw)}`,
    interdit_typographie: `${L.symbol(cx - d.sw / 2, cy - d.H / 2, d.sw, N)}<text x="${cx}" y="${cy - d.H / 2 + d.sh + d.gap + d.wh}" text-anchor="middle" ${font(d.wh * 1.32, 800, 6)} fill="${N}">ORA</text>`,
    interdit_ajout: `${L.lockupC(cx, cy, lw, N)}<text x="${cx}" y="${cy - d.H / 2 + d.sh * 0.5 + 26}" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="78" fill="${N}">A</text>`,
    interdit_composition: `${L.symbolC(cx - 230, cy, 150, N)}${L.wordmark(cx - 120, cy - L.wmH(360) / 2, 360, N)}`,
    interdit_fond: `<g opacity="1">${stripes}</g>${L.lockupC(cx, cy, lw, N)}`,
  };
  for (const [n, inner] of Object.entries(tiles)) await L.render(n, L.page(s(inner), W, H), W, H, { dsf: 1 });
}

async function planches() {
  const dir = path.join(DEL, '01_planches_logo'); fs.mkdirSync(dir, { recursive: true });
  const W = 3508, H = 2480; // A4 paysage, 300 dpi
  const cap = (t, col) => `<text x="160" y="${H - 150}" ${font(38, 600, 8)} fill="${col}">ORA  ·  CHARTE GRAPHIQUE OFFICIELLE</text><text x="${W - 160}" y="${H - 150}" text-anchor="end" ${font(38, 600, 8)} fill="${col}">${t}</text>`;
  const boards = [
    ['Planche_01_Logo_noir_sur_blanc', B, L.lockupC(W / 2, H / 2 - 60, 1400, N), 'LOGO  ·  NOIR SUR BLANC', N],
    ['Planche_02_Logo_blanc_sur_noir', N, L.lockupC(W / 2, H / 2 - 60, 1400, B), 'LOGO  ·  BLANC SUR NOIR', B],
    ['Planche_03_Symbole_noir_sur_blanc', B, L.symbolC(W / 2, H / 2 - 60, 1100, N), 'SYMBOLE  ·  NOIR SUR BLANC', N],
    ['Planche_04_Symbole_blanc_sur_noir', N, L.symbolC(W / 2, H / 2 - 60, 1100, B), 'SYMBOLE  ·  BLANC SUR NOIR', B],
  ];
  for (const [n, bg, inner, t, col] of boards) {
    const f = await L.render(n, L.page(svg(W, H, inner + cap(t, col), bg), W, H), W, H, { dsf: 1 });
    fs.copyFileSync(f, path.join(dir, n + '.png'));
  }
  // construction & clear space boards built from the page diagrams
  const cons = fs.readFileSync(path.join(OUT, 'construction.png')).toString('base64');
  const zp = fs.readFileSync(path.join(OUT, 'zone_protection.png')).toString('base64');
  for (const [n, img, iw, ih, t] of [['Planche_05_Construction', cons, 1680, 1470, 'CONSTRUCTION DE LA COMPOSITION VERTICALE'], ['Planche_06_Zone_de_protection', zp, 2100, 1100, 'ZONE DE PROTECTION  ·  X = D / 4']]) {
    const sc = Math.min((W - 600) / iw, (H - 700) / ih); const w = iw * sc, h = ih * sc;
    const inner = `<image href="data:image/png;base64,${img}" x="${(W - w) / 2}" y="${(H - h) / 2 - 80}" width="${w}" height="${h}"/>`;
    const f = await L.render(n, L.page(svg(W, H, inner + cap(t, N), B), W, H), W, H, { dsf: 1 });
    fs.copyFileSync(f, path.join(dir, n + '.png'));
  }
}

async function main() {
  const only = process.argv[2];
  if (!only || only === 'logos') await logos();
  if (!only || only === 'diagrams') await diagrams();
  if (!only || only === 'misuses') await misuses();
  if (!only || only === 'planches') await planches();
  await L.close();
}
main().catch(e => { console.error(e); process.exit(1); });
