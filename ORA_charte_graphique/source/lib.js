// Shared helpers: logo geometry (from the traced client files), colors, fonts, renderer.
const fs = require('fs');
const path = require('path');

const ASSETS = path.resolve(__dirname, '../assets');
const OUT = path.resolve(__dirname, '../render_charte');
fs.mkdirSync(OUT, { recursive: true });

const symSvg = fs.readFileSync(path.join(ASSETS, 'symbol.svg'), 'utf8');
const wmSvg = fs.readFileSync(path.join(ASSETS, 'wordmark.svg'), 'utf8');
const SYM_D = symSvg.match(/ d="([^"]+)"/)[1];
const WM_D = wmSvg.match(/ d="([^"]+)"/)[1];

// Measured on the traced files (ink bounding boxes, fitted circle).
const SYM = { ink: { x0: 60, y0: 61, x1: 3035, y1: 2997 }, c: { x: 1547.3, y: 1527.2 }, rIn: 1172, rOut: 1462, gaps: [138.5, 314.5] };
SYM.w = SYM.ink.x1 - SYM.ink.x0; SYM.h = SYM.ink.y1 - SYM.ink.y0;
const WM = { ink: { x0: 25, y0: 23, x1: 5899, y1: 1851 } };
WM.w = WM.ink.x1 - WM.ink.x0; WM.h = WM.ink.y1 - WM.ink.y0;

// Vertical lockup rule (proposal): symbol width = 1/2 wordmark width, gap = 1/4 symbol width.
const LK = { symRatio: 0.5, gapRatio: 0.25 };

const C = {
  noir: '#000000', ivoire: '#F5F1E9', blanc: '#FFFFFF',
  gris: '#6B655B', grisClair: '#A39C90', ligne: '#D8D1C4',
};

// Symbol placed by its ink box: top-left (x,y), ink width w.
function symbol(x, y, w, fill, attrs = '') {
  const s = w / SYM.w;
  return `<g transform="translate(${x - SYM.ink.x0 * s},${y - SYM.ink.y0 * s}) scale(${s})" ${attrs}><path d="${SYM_D}" fill="${fill}" fill-rule="evenodd"/></g>`;
}
// Symbol centered on (cx,cy) by its ink box.
function symbolC(cx, cy, w, fill, attrs = '') {
  const h = w * SYM.h / SYM.w;
  return symbol(cx - w / 2, cy - h / 2, w, fill, attrs);
}
function symH(w) { return w * SYM.h / SYM.w; }
function wordmark(x, y, w, fill, attrs = '') {
  const s = w / WM.w;
  return `<g transform="translate(${x - WM.ink.x0 * s},${y - WM.ink.y0 * s}) scale(${s})" ${attrs}><path d="${WM_D}" fill="${fill}" fill-rule="evenodd"/></g>`;
}
function wmH(w) { return w * WM.h / WM.w; }
// Vertical lockup centered on cx, ink top at `top`, wordmark width W.
function lockupDims(W) {
  const sw = W * LK.symRatio, sh = symH(sw), gap = sw * LK.gapRatio, wh = wmH(W);
  return { W, sw, sh, gap, wh, H: sh + gap + wh };
}
function lockup(cx, top, W, fill, attrs = '') {
  const d = lockupDims(W);
  return `<g ${attrs}>${symbol(cx - d.sw / 2, top, d.sw, fill)}${wordmark(cx - W / 2, top + d.sh + d.gap, W, fill)}</g>`;
}
// Lockup centered on (cx,cy).
function lockupC(cx, cy, W, fill, attrs = '') {
  const d = lockupDims(W);
  return lockup(cx, cy - d.H / 2, W, fill, attrs);
}

const FONT_DIR = '/root/.fonts';
const fontCss = `
@font-face{font-family:'Cormorant Garamond';src:url('file://${FONT_DIR}/CormorantGaramond-Light.ttf');font-weight:300;font-style:normal}
@font-face{font-family:'Cormorant Garamond';src:url('file://${FONT_DIR}/CormorantGaramond-Regular.ttf');font-weight:400;font-style:normal}
@font-face{font-family:'Cormorant Garamond';src:url('file://${FONT_DIR}/CormorantGaramond-Medium.ttf');font-weight:500;font-style:normal}
@font-face{font-family:'Cormorant Garamond';src:url('file://${FONT_DIR}/CormorantGaramond-SemiBold.ttf');font-weight:600;font-style:normal}
@font-face{font-family:'Cormorant Garamond';src:url('file://${FONT_DIR}/CormorantGaramond-Italic.ttf');font-weight:400;font-style:italic}
@font-face{font-family:'Cormorant Garamond';src:url('file://${FONT_DIR}/CormorantGaramond-LightItalic.ttf');font-weight:300;font-style:italic}
@font-face{font-family:'Manrope';src:url('file://${FONT_DIR}/Manrope-Light.ttf');font-weight:300}
@font-face{font-family:'Manrope';src:url('file://${FONT_DIR}/Manrope-Regular.ttf');font-weight:400}
@font-face{font-family:'Manrope';src:url('file://${FONT_DIR}/Manrope-Medium.ttf');font-weight:500}
@font-face{font-family:'Manrope';src:url('file://${FONT_DIR}/Manrope-SemiBold.ttf');font-weight:600}
@font-face{font-family:'Manrope';src:url('file://${FONT_DIR}/Manrope-Bold.ttf');font-weight:700}
`;

function page(svgOrHtml, w, h, bg = 'transparent', extraCss = '') {
  const body = svgOrHtml.trim().startsWith('<svg') ? svgOrHtml : svgOrHtml;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}
html,body{margin:0;padding:0;background:${bg};width:${w}px;height:${h}px;overflow:hidden}
svg{display:block}${extraCss}</style></head><body>${body}</body></html>`;
}

function svgDoc(w, h, inner, defs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${COMMON_DEFS}${defs}</defs>${inner}</svg>`;
}

// Reusable SVG filters / gradients for mockups.
const COMMON_DEFS = `
<filter id="noise" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
  <feColorMatrix type="saturate" values="0"/>
</filter>
<filter id="linen" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.012 0.9" numOctaves="2" seed="3" result="a"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.9 0.012" numOctaves="2" seed="7" result="b"/>
  <feBlend in="a" in2="b" mode="multiply"/>
  <feColorMatrix type="saturate" values="0"/>
</filter>
<filter id="shadowL" x="-40%" y="-40%" width="180%" height="180%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="22"/><feOffset dx="16" dy="24" result="b1"/>
  <feComponentTransfer in="b1" result="s1"><feFuncA type="linear" slope="0.38"/></feComponentTransfer>
  <feGaussianBlur in="SourceAlpha" stdDeviation="3.5"/><feOffset dx="2" dy="4" result="b2"/>
  <feComponentTransfer in="b2" result="s2"><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
  <feMerge><feMergeNode in="s1"/><feMergeNode in="s2"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="shadowD" x="-40%" y="-40%" width="180%" height="180%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="20"/><feOffset dx="14" dy="22" result="b1"/>
  <feComponentTransfer in="b1" result="s1"><feFuncA type="linear" slope="0.75"/></feComponentTransfer>
  <feGaussianBlur in="SourceAlpha" stdDeviation="3"/><feOffset dx="2" dy="3" result="b2"/>
  <feComponentTransfer in="b2" result="s2"><feFuncA type="linear" slope="0.8"/></feComponentTransfer>
  <feMerge><feMergeNode in="s1"/><feMergeNode in="s2"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="shadowS" x="-40%" y="-40%" width="180%" height="180%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="6"/><feOffset dx="4" dy="7" result="b1"/>
  <feComponentTransfer in="b1" result="s1"><feFuncA type="linear" slope="0.45"/></feComponentTransfer>
  <feMerge><feMergeNode in="s1"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="deboss" x="-5%" y="-5%" width="110%" height="110%">
  <feOffset in="SourceAlpha" dx="2.2" dy="2.8" result="off"/>
  <feGaussianBlur in="off" stdDeviation="1.6" result="blur"/>
  <feComposite in="SourceAlpha" in2="blur" operator="out" result="inner"/>
  <feFlood flood-color="#3a3128" flood-opacity="0.55"/><feComposite in2="inner" operator="in" result="sh"/>
  <feOffset in="SourceAlpha" dx="-1.6" dy="-2" result="off2"/>
  <feGaussianBlur in="off2" stdDeviation="1.2" result="blur2"/>
  <feComposite in="SourceAlpha" in2="blur2" operator="out" result="inner2"/>
  <feFlood flood-color="#ffffff" flood-opacity="0.85"/><feComposite in2="inner2" operator="in" result="hl"/>
  <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/><feMergeNode in="hl"/></feMerge>
</filter>
<filter id="engrave" x="-5%" y="-5%" width="110%" height="110%">
  <feOffset in="SourceAlpha" dx="1.4" dy="1.8" result="off"/>
  <feGaussianBlur in="off" stdDeviation="1" result="blur"/>
  <feComposite in="SourceAlpha" in2="blur" operator="out" result="inner"/>
  <feFlood flood-color="#000" flood-opacity="0.75"/><feComposite in2="inner" operator="in" result="sh"/>
  <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/></feMerge>
</filter>
<linearGradient id="foil" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#FBF8F2"/><stop offset="0.45" stop-color="#E6DECF"/><stop offset="0.6" stop-color="#F7F2EA"/><stop offset="1" stop-color="#D9D0BF"/>
</linearGradient>
<linearGradient id="silver" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#FAFAFA"/><stop offset="0.35" stop-color="#BDBDBD"/><stop offset="0.55" stop-color="#F2F2F2"/><stop offset="0.8" stop-color="#9A9A9A"/><stop offset="1" stop-color="#E0E0E0"/>
</linearGradient>
<linearGradient id="steelH" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#8E8E8E"/><stop offset="0.2" stop-color="#E9E9E9"/><stop offset="0.5" stop-color="#B5B5B5"/><stop offset="0.75" stop-color="#F4F4F4"/><stop offset="1" stop-color="#7D7D7D"/>
</linearGradient>
<radialGradient id="steelR" cx="0.35" cy="0.3" r="0.8">
  <stop offset="0" stop-color="#FFFFFF"/><stop offset="0.35" stop-color="#D2D2D2"/><stop offset="0.7" stop-color="#8F8F8F"/><stop offset="1" stop-color="#C9C9C9"/>
</radialGradient>
<linearGradient id="leather" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#0B0B0B"/><stop offset="0.3" stop-color="#232323"/><stop offset="0.7" stop-color="#161616"/><stop offset="1" stop-color="#070707"/>
</linearGradient>
`;

function grainOverlay(w, h, opacity = 0.08, blend = 'overlay', filter = 'noise') {
  return `<rect x="0" y="0" width="${w}" height="${h}" filter="url(#${filter})" opacity="${opacity}" style="mix-blend-mode:${blend}"/>`;
}

let _browser = null;
async function browser() {
  if (!_browser) { const { chromium } = require('playwright'); _browser = await chromium.launch(); }
  return _browser;
}
async function render(name, html, w, h, { dsf = 2, type = 'png', quality = 90, omitBackground = true } = {}) {
  const b = await browser();
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf });
  const p = await ctx.newPage();
  await p.setContent(html, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(150);
  const file = path.join(OUT, `${name}.${type === 'jpeg' ? 'jpg' : 'png'}`);
  const opts = { path: file, type, clip: { x: 0, y: 0, width: w, height: h } };
  if (type === 'jpeg') opts.quality = quality; else opts.omitBackground = omitBackground;
  await p.screenshot(opts);
  await ctx.close();
  console.log('rendered', path.basename(file));
  return file;
}
async function close() { if (_browser) await _browser.close(); _browser = null; }

module.exports = { SYM, WM, LK, C, SYM_D, WM_D, symbol, symbolC, symH, wordmark, wmH, lockup, lockupC, lockupDims, page, svgDoc, grainOverlay, render, close, OUT, ASSETS, fontCss };
