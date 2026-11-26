// Logo files and analytical diagrams, built only from the traced client artwork.
const fs = require('fs');
const path = require('path');
const L = require('./lib');
const { C, SYM } = L;

function plainSvg(w, h, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
}

async function main() {
  // --- Logo PNGs (transparent) ---
  const symW = 1000, symHh = Math.round(L.symH(symW));
  for (const [n, col] of [['noir', C.noir], ['ivoire', C.ivoire]]) {
    await L.render(`logo_symbole_${n}`, L.page(plainSvg(symW + 40, symHh + 40, L.symbol(20, 20, symW, col)), symW + 40, symHh + 40), symW + 40, symHh + 40, { dsf: 1.5 });
    const d = L.lockupDims(1000);
    const W = 1040, H = Math.ceil(d.H) + 40;
    await L.render(`logo_complet_${n}`, L.page(plainSvg(W, H, L.lockup(520, 20, 1000, col)), W, H), W, H, { dsf: 1.6 });
  }
  // Vector deliverables (SVG) of the vertical lockup and symbol
  const d = L.lockupDims(1000);
  fs.writeFileSync(path.join(L.OUT, 'ORA_logo_complet_noir.svg'), plainSvg(1000, Math.ceil(d.H), L.lockup(500, 0, 1000, C.noir)));
  fs.writeFileSync(path.join(L.OUT, 'ORA_symbole_noir.svg'), plainSvg(1000, Math.ceil(L.symH(1000)), L.symbol(0, 0, 1000, C.noir)));

  // --- Decomposition diagrams (slide 4): highlight parts of the unchanged symbol ---
  const S = 900, pad = 60, w = S - 2 * pad; // symbol ink width in diagram
  const sc = w / SYM.w;
  // circle geometry in diagram coords
  const cx = pad + (SYM.c.x - SYM.ink.x0) * sc, cy = pad + (SYM.c.y - SYM.ink.y0) * sc;
  const rIn = SYM.rIn * sc, rOut = (SYM.rOut + 40) * sc;
  const H = Math.round(L.symH(w) + 2 * pad);
  const defs = `<defs>
    <clipPath id="ring"><path clip-rule="evenodd" d="M${cx - rOut},${cy} a${rOut},${rOut} 0 1,0 ${2 * rOut},0 a${rOut},${rOut} 0 1,0 ${-2 * rOut},0 Z M${cx - rIn},${cy} a${rIn},${rIn} 0 1,0 ${2 * rIn},0 a${rIn},${rIn} 0 1,0 ${-2 * rIn},0 Z"/></clipPath>
    <clipPath id="inner"><circle cx="${cx}" cy="${cy}" r="${rIn}"/></clipPath></defs>`;
  const tint = '#DDD6CA';
  const ringOnly = `<g clip-path="url(#ring)">${L.symbol(pad, pad, w, C.noir)}</g><g clip-path="url(#inner)">${L.symbol(pad, pad, w, tint)}</g>`;
  const bladeOnly = `<g clip-path="url(#ring)">${L.symbol(pad, pad, w, tint)}</g><g clip-path="url(#inner)">${L.symbol(pad, pad, w, C.noir)}</g>`;
  // openings: hairline circles centred on the measured gaps
  const rMid = ((SYM.rIn + SYM.rOut) / 2 + 60) * sc;
  const marks = SYM.gaps.map(a => {
    const t = a * Math.PI / 180, x = cx + rMid * Math.cos(t), y = cy + rMid * Math.sin(t);
    return `<circle cx="${x}" cy="${y}" r="${74}" fill="none" stroke="${C.noir}" stroke-width="2.2"/><circle cx="${x}" cy="${y}" r="5" fill="${C.noir}"/>`;
  }).join('');
  const opening = `${L.symbol(pad, pad, w, tint)}${marks}`;
  for (const [n, inner] of [['decomp_cercle', ringOnly], ['decomp_diagonale', bladeOnly], ['decomp_ouverture', opening]]) {
    await L.render(n, L.page(plainSvg(S, H, defs + inner), S, H), S, H, { dsf: 1 });
  }

  // --- Construction diagram (slide 5) ---
  {
    const W = 2040, Hh = 1470;  // matches a 6.8" x 4.9" panel
    const lw = 900; const dd = L.lockupDims(lw);
    const lcx = W / 2, top = (Hh - dd.H) / 2 + 10;
    const sx0 = lcx - dd.sw / 2, sx1 = lcx + dd.sw / 2, sy0 = top, sy1 = top + dd.sh;
    const wy0 = sy1 + dd.gap, wy1 = wy0 + dd.wh, wx0 = lcx - lw / 2, wx1 = lcx + lw / 2;
    const g = C.grisClair, sw = 2;
    const hline = (y) => `<line x1="${wx0 - 150}" y1="${y}" x2="${wx1 + 150}" y2="${y}" stroke="${C.ligne}" stroke-width="${sw}"/>`;
    const lab = (x, y, t, anchor = 'middle') => `<text x="${x}" y="${y}" font-family="Manrope" font-weight="600" font-size="30" letter-spacing="4" fill="${C.gris}" text-anchor="${anchor}">${t}</text>`;
    const dimH = (x0, x1, y, t) => `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${g}" stroke-width="${sw}"/><line x1="${x0}" y1="${y - 14}" x2="${x0}" y2="${y + 14}" stroke="${g}" stroke-width="${sw}"/><line x1="${x1}" y1="${y - 14}" x2="${x1}" y2="${y + 14}" stroke="${g}" stroke-width="${sw}"/>` + lab((x0 + x1) / 2, y - 26, t);
    const dimV = (y0, y1, x, t) => `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${g}" stroke-width="${sw}"/><line x1="${x - 14}" y1="${y0}" x2="${x + 14}" y2="${y0}" stroke="${g}" stroke-width="${sw}"/><line x1="${x - 14}" y1="${y1}" x2="${x + 14}" y2="${y1}" stroke="${g}" stroke-width="${sw}"/>` + lab(x + 30, (y0 + y1) / 2 + 11, t, 'start');
    const inner = `
      <line x1="${lcx}" y1="${sy0 - 120}" x2="${lcx}" y2="${wy1 + 120}" stroke="${C.ligne}" stroke-width="${sw}" stroke-dasharray="10 10"/>
      ${hline(sy0)}${hline(sy1)}${hline(wy0)}${hline(wy1)}
      ${L.lockup(lcx, top, lw, C.noir)}
      ${dimH(sx0, sx1, sy0 - 60, 'D')}
      ${dimH(wx0, wx1, wy1 + 80, '2 D')}
      ${dimV(sy1, wy0, wx1 + 120, 'D / 4')}
      ${lab(lcx + 22, sy0 - 132, 'AXE CENTRAL', 'start')}`;
    await L.render('construction_logo', L.page(plainSvg(W, Hh, inner), W, Hh), W, Hh, { dsf: 1 });
  }
  await L.close();
}
main().catch(e => { console.error(e); process.exit(1); });
