// Génère le PowerPoint « Stratégie de développement et de transformation 2027 » (17 diapositives).
// Usage : NODE_PATH=./node_modules node build_deck.js [sortie.pptx]
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const Lu = require('react-icons/lu');

const SKILL = '/root/.claude/skills/synced/264bb811-9d13-4dd7-8fc1-03af533e7802_e2e44a3b-7bdf-4cd0-82e8-eb2f0916b742/pptx';
const { applyTheme } = require(path.join(SKILL, 'scripts/apply_theme.js'));
const OUT = process.argv[2] || path.join(__dirname, '..', 'Strategie_2027_Groupe_KCS_RLCS_LUKE.pptx');
const ASSETS = path.join(__dirname, '..', 'src', 'assets');

// ------------------------------------------------------------------ Thème
const THEME = {
  name: 'Groupe KCS RLCS LUKE 2027',
  headFontFace: 'Calibri',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '11183A', lt1: 'FFFFFF', dk2: '0B1A3B', lt2: 'F4F6FB',
    accent1: '2161FF', accent2: 'FF6138', accent3: '0A5A9C', accent4: 'C2A46E',
    accent5: '34A4AD', accent6: '5D6679', hlink: '2161FF', folHlink: '0B1A3B',
  },
};
// Teintes complémentaires (hex)
const H = {
  BL: 'E8EEFF', OL: 'FFEDE7', LINE: 'E2E6F0', NAVY2: '16295A', BMID: '1747C2', LUOR: 'F37950',
  TEALL: 'E4F4F5', RLL: 'E6EEF6', GOLDL: 'F6F0E4', PALE: 'C9D3EE', SHADOW: '9AA3B8', OK: '1B7F4B',
  BLUE: '2161FF', ORANGE: 'FF6138', NAVY: '0B1A3B', INK: '11183A', MUT: '5D6679', RLB: '0A5A9C', GOLD: 'C2A46E', TEAL: '34A4AD', PANEL: 'F4F6FB', WHITE: 'FFFFFF',
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'Groupe KCS - RLCS - LUKE';
pres.company = 'Groupe KCS - RLCS - LUKE';
pres.title = 'Stratégie de développement et de transformation 2027';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const K = {
  blue: C.accent1, orange: C.accent2, rlBlue: C.accent3, gold: C.accent4, teal: C.accent5, mut: C.accent6,
  ink: C.text1, navy: C.text2, white: C.background1, panel: C.background2,
};

// --------------------------------------------------------------- Outils
const fr = (t) => String(t).replace(/ ([:;?!»])/g, ' $1').replace(/« /g, '« ');
const frRuns = (r) => (Array.isArray(r) ? r.map((x) => (typeof x === 'string' ? fr(x) : { ...x, text: fr(x.text) })) : fr(r));
function T(s, text, o) { s.addText(frRuns(text), Object.assign({ isTextBox: true, margin: 0, valign: 'top' }, o)); }
const shadow = () => ({ type: 'outer', color: H.SHADOW, opacity: 0.22, blur: 6, offset: 2, angle: 90 });
function card(s, x, y, w, h, fill = K.white, o = {}) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: o.r ?? 0.08, fill: { color: fill, transparency: o.transparency },
    line: o.noLine ? { type: 'none' } : { color: o.lineColor || H.LINE, width: o.lineWidth || 0.75, dashType: o.dash },
    shadow: o.noShadow ? undefined : shadow(), objectName: o.name });
}
function rect(s, x, y, w, h, fill, o = {}) {
  s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color: fill, transparency: o.transparency }, line: o.line || { type: 'none' }, objectName: o.name });
}
function line(s, x1, y1, x2, y2, color, o = {}) {
  s.addShape(pres.ShapeType.line, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.0001, h: Math.abs(y2 - y1) || 0.0001,
    flipH: x2 < x1 && y2 > y1, flipV: false,
    line: { color, width: o.width || 1.25, dashType: o.dash || 'solid', endArrowType: o.arrow, beginArrowType: o.beginArrow } });
}
function circle(s, x, y, d, fill, o = {}) {
  s.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill, transparency: o.transparency }, line: o.line || { type: 'none' }, objectName: o.name });
}
function num(s, n, x, y, d, fill, color = K.white, size = 14) {
  circle(s, x, y, d, fill);
  T(s, String(n), { x, y, w: d, h: d, align: 'center', valign: 'middle', bold: true, fontSize: size, color });
}
const TAGS = {
  constat: ['CONSTAT', H.BL, K.blue],
  analyse: ['LECTURE PROPOSÉE', 'E3E7F0', K.navy],
  orientation: ['ORIENTATION PROPOSÉE', H.OL, 'C8401C'],
  valider: ['À VALIDER', H.OL, 'C8401C'],
  proposition: ['PROPOSITION À VALIDER', H.OL, 'C8401C'],
};
function tag(s, kind, x, y, o = {}) {
  const [label, bg, fg] = TAGS[kind];
  const w = o.w || (0.075 * label.length + 0.32);
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h: 0.27, rectRadius: 0.13, fill: { color: o.bg || bg }, line: { type: 'none' } });
  T(s, label, { x, y, w, h: 0.27, align: 'center', valign: 'middle', fontSize: 9.5, bold: true, color: o.fg || fg, charSpacing: 1 });
  return w;
}
function source(s, text, o = {}) {
  T(s, `Sources : ${text}`, { x: 0.6, y: o.y ?? 6.68, w: 12.1, h: 0.25, fontSize: 9.5, italic: true, color: o.color || K.mut });
}

// Icônes (Lucide via react-icons) rendues en PNG
const iconCache = {};
async function iconData(name, hex) {
  const key = `${name}_${hex}`;
  if (!iconCache[key]) {
    const Comp = Lu[name];
    if (!Comp) throw new Error(`icône inconnue ${name}`);
    const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: `#${hex}`, size: 256, strokeWidth: 1.8 }));
    const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
    iconCache[key] = 'image/png;base64,' + buf.toString('base64');
  }
  return iconCache[key];
}
const ICONS_NEEDED = [];
function icon(s, name, x, y, size, hex, bg) {
  if (bg) circle(s, x, y, size, bg);
  const pad = bg ? size * 0.22 : 0;
  if (!iconCache[`${name}_${hex}`]) throw new Error(`icône non préparée ${name} ${hex}`);
  s.addImage({ data: iconCache[`${name}_${hex}`], x: x + pad, y: y + pad, w: size - 2 * pad, h: size - 2 * pad, altText: name.replace(/^Lu/, '') });
}

// Logos (proportions conservées)
function pngSize(f) { const b = fs.readFileSync(f); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; }
const LOGOS = {
  kcs: { file: path.join(ASSETS, 'logo_kcs.png'), alt: 'Logo KCS, Kyria Consultancy Services' },
  rlcs: { file: path.join(ASSETS, 'logo_rlcs.png'), alt: 'Logo RLCS, RiskLogics Consulting Services' },
  luke: { file: path.join(ASSETS, 'logo_luke.png'), alt: 'Logo LUKE, LukeHealth TECH' },
};
function logo(s, key, cx, cy, maxW, maxH) {
  const { file, alt } = LOGOS[key];
  const { w, h } = pngSize(file);
  let lw = maxW, lh = maxW * h / w;
  if (lh > maxH) { lh = maxH; lw = maxH * w / h; }
  s.addImage({ path: file, x: cx - lw / 2, y: cy - lh / 2, w: lw, h: lh, altText: alt });
}

// ---------------------------------------------------------------- Gabarits
function chips(color2 = K.orange) {
  return [
    { rect: { x: 0.6, y: 0.47, w: 0.12, h: 0.3, fill: { color: K.blue } } },
    { rect: { x: 0.76, y: 0.47, w: 0.12, h: 0.3, fill: { color: color2 } } },
  ];
}
pres.defineSlideMaster({
  title: 'Couverture',
  background: { color: H.NAVY },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.8, y: 1.95, w: 7.3, h: 2.2, fontSize: 40, bold: true, color: K.white, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: 0.8, y: 4.55, w: 7.3, h: 0.5, fontSize: 20, color: H.PALE, charSpacing: 3, align: 'left', margin: 0 }, text: '' } },
  ],
});
pres.defineSlideMaster({
  title: 'Contenu',
  background: { color: H.WHITE },
  margin: [0.5, 0.6, 0.6, 0.6],
  objects: [
    ...chips(),
    { placeholder: { options: { name: 'kicker', type: 'body', x: 1.02, y: 0.44, w: 9.5, h: 0.36, fontSize: 11, bold: true, color: K.blue, charSpacing: 2, margin: 0, valign: 'middle', align: 'left' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.86, w: 12.13, h: 0.9, fontSize: 28, bold: true, color: K.ink, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    { text: { text: 'Stratégie 2027 · Groupe KCS – RLCS – LUKE', options: { x: 0.6, y: 7.03, w: 6, h: 0.28, fontSize: 9, color: K.mut, margin: 0 } } },
    { text: { text: 'Document de travail – Confidentiel', options: { x: 6.2, y: 7.03, w: 5.85, h: 0.28, fontSize: 9, color: K.mut, align: 'right', margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.03, w: 0.53, h: 0.28, fontSize: 9, bold: true, color: H.BLUE, align: 'right', margin: 0 },
});
pres.defineSlideMaster({
  title: 'Sombre',
  background: { color: H.NAVY },
  objects: [
    ...chips(),
    { placeholder: { options: { name: 'kicker', type: 'body', x: 1.02, y: 0.44, w: 9.5, h: 0.36, fontSize: 11, bold: true, color: 'FFB39E', charSpacing: 2, margin: 0, valign: 'middle', align: 'left' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.86, w: 12.13, h: 0.9, fontSize: 28, bold: true, color: K.white, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    { text: { text: 'Stratégie 2027 · Groupe KCS – RLCS – LUKE', options: { x: 0.6, y: 7.03, w: 6, h: 0.28, fontSize: 9, color: H.PALE, margin: 0 } } },
    { text: { text: 'Document de travail – Confidentiel', options: { x: 6.2, y: 7.03, w: 5.85, h: 0.28, fontSize: 9, color: H.PALE, align: 'right', margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.03, w: 0.53, h: 0.28, fontSize: 9, bold: true, color: 'FFB39E', align: 'right', margin: 0 },
});

function content(section, kicker, title, master = 'Contenu') {
  const s = pres.addSlide({ masterName: master, sectionTitle: section });
  s.addText(fr(kicker), { placeholder: 'kicker' });
  s.addText(fr(title), { placeholder: 'title' });
  return s;
}

// =====================================================================
//                               DIAPOSITIVES
// =====================================================================
const SEC = {
  intro: 'Ambition, diagnostic et enjeux',
  a1: 'Axe 1 · Gouvernance et organisation',
  a2: 'Axe 2 · Capital humain et productivité',
  a3: 'Axe 3 · Intelligence artificielle et innovation',
  mo: 'Mise en œuvre, pilotage et décisions',
};

function slide01() {
  pres.addSection({ title: SEC.intro });
  const s = pres.addSlide({ masterName: 'Couverture', sectionTitle: SEC.intro });
  // Formes de fond discrètes
  circle(s, 9.2, -1.6, 5.6, H.NAVY2, { transparency: 30 });
  circle(s, 11.4, 4.6, 3.6, H.NAVY2, { transparency: 45 });
  rect(s, 0.8, 0.95, 0.12, 0.3, K.blue);
  rect(s, 0.96, 0.95, 0.12, 0.3, K.orange);
  T(s, 'ORIENTATIONS STRATÉGIQUES 2027', { x: 1.25, y: 0.95, w: 6, h: 0.3, fontSize: 12, bold: true, color: 'FFB39E', charSpacing: 3, valign: 'middle' });
  s.addText([
    { text: 'STRATÉGIE DE DÉVELOPPEMENT ET DE TRANSFORMATION ', options: {} },
    { text: '2027', options: { color: H.BLUE } },
  ], { placeholder: 'title' });
  rect(s, 0.8, 4.3, 0.9, 0.07, K.orange);
  s.addText('GROUPE KCS – RLCS – LUKE', { placeholder: 'body' });
  // Carte des logos
  card(s, 8.75, 1.35, 3.85, 4.3, K.white, { noLine: true, r: 0.1 });
  logo(s, 'kcs', 10.675, 2.15, 2.6, 0.82);
  line(s, 9.35, 2.88, 12.0, 2.88, H.LINE, { width: 0.75 });
  logo(s, 'rlcs', 10.675, 3.5, 2.9, 0.8);
  line(s, 9.35, 4.12, 12.0, 4.12, H.LINE, { width: 0.75 });
  logo(s, 'luke', 10.675, 4.82, 2.9, 0.75);
  // Mentions
  s.addShape(pres.ShapeType.roundRect, { x: 0.8, y: 6.25, w: 3.65, h: 0.45, rectRadius: 0.22, fill: { color: H.NAVY }, line: { color: K.orange, width: 1.25 } });
  T(s, 'Document de travail – Confidentiel', { x: 0.8, y: 6.25, w: 3.65, h: 0.45, align: 'center', valign: 'middle', fontSize: 13, bold: true, color: 'FFB39E' });
  T(s, 'Proposition soumise à l\'appréciation et à la validation de la Direction Générale · Novembre 2026', { x: 4.75, y: 6.25, w: 7.85, h: 0.45, valign: 'middle', fontSize: 12, color: H.PALE, align: 'right' });
  s.addNotes('Support exécutif de présentation des orientations stratégiques 2027 du Groupe, destiné au gérant et aux associés. Document de travail soumis à validation.');
}

function slide02() {
  const s = content(SEC.intro, 'AMBITION STRATÉGIQUE 2027', '2027 : un Groupe mieux structuré, plus performant, coordonné et innovant');
  // Trois cercles qui se recouvrent
  const d = 2.55;
  const c = [[5.72, 3.42, K.blue], [7.61, 3.42, K.orange], [6.665, 5.05, K.navy]];
  c.forEach(([cx, cy, col]) => circle(s, cx - d / 2, cy - d / 2, d, col, { transparency: 18 }));
  T(s, [{ text: '1', options: { bold: true, fontSize: 20, breakLine: true } }, { text: 'Gouvernance et coordination', options: { fontSize: 13, bold: true } }], { x: 4.6, y: 2.75, w: 1.55, h: 1.1, color: K.white, align: 'center' });
  T(s, [{ text: '2', options: { bold: true, fontSize: 20, breakLine: true } }, { text: 'Capital humain et productivité', options: { fontSize: 13, bold: true } }], { x: 7.2, y: 2.75, w: 1.6, h: 1.1, color: K.white, align: 'center' });
  T(s, [{ text: '3', options: { bold: true, fontSize: 20, breakLine: true } }, { text: 'Intelligence artificielle', options: { fontSize: 13, bold: true } }], { x: 5.9, y: 5.45, w: 1.55, h: 0.95, color: K.white, align: 'center' });
  circle(s, 6.215, 3.62, 0.9, K.white, { line: { color: H.LINE, width: 0.75 } });
  T(s, '2027', { x: 6.215, y: 3.62, w: 0.9, h: 0.9, align: 'center', valign: 'middle', bold: true, fontSize: 16, color: K.navy });
  // Descriptions
  const desc = (n, col, title, text, x, y) => {
    num(s, n, x, y, 0.46, col, K.white, 14);
    T(s, title, { x: x + 0.62, y: y - 0.02, w: 3.1, h: 0.55, fontSize: 16, bold: true, color: col });
    T(s, text, { x: x + 0.62, y: y + 0.56, w: 3.1, h: 0.95, fontSize: 14, color: K.ink });
  };
  desc(1, K.blue, 'Renforcer la gouvernance et la coordination', 'Formaliser les règles communes, coordonner les trois PMO, consolider le pilotage.', 0.6, 2.1);
  desc(2, K.orange, 'Optimiser le capital humain et la productivité', 'Clarifier les rôles, cartographier les compétences, mieux mobiliser les équipes.', 9.0, 2.1);
  desc(3, K.navy, 'Accélérer l\'intégration de l\'IA', 'Consolider les usages existants et en faire un levier de productivité et d\'offres.', 9.0, 4.65);
  card(s, 0.6, 4.65, 3.95, 1.75, H.PANEL, { noShadow: true, noLine: true });
  T(s, 'Faire évoluer KCS, RLCS et LUKE vers un Groupe mieux structuré, plus performant, plus coordonné et davantage orienté vers l\'innovation.', { x: 0.82, y: 4.8, w: 3.55, h: 1.5, fontSize: 14, italic: true, color: K.navy, valign: 'middle' });
  s.addNotes('Trois ambitions qui se recouvrent : elles se renforcent mutuellement. L\'ambition est une évolution progressive, qui s\'appuie sur le fonctionnement actuel.');
}

function slide03() {
  const s = content(SEC.intro, 'PRÉSENTATION DU GROUPE', 'Trois expertises complémentaires, adossées à un socle commun');
  const ents = [
    { key: 'kcs', x: 0.6, col: K.blue, hex: H.BLUE, tint: H.BL, name: 'KCS · Kyria Consultancy Services', dom: 'Conseil en transformation digitale, marchés financiers et industries',
      items: [['LuCpu', 'Transformation digitale'], ['LuChartCandlestick', 'Marchés financiers'], ['LuFactory', 'Industries']] },
    { key: 'rlcs', x: 4.74, col: K.rlBlue, hex: H.RLB, tint: H.RLL, name: 'RLCS · RiskLogics Consulting Services', dom: 'Conseil, data, risk management, actuariat, cloud et cybersécurité',
      items: [['LuDatabase', 'Data et risk management'], ['LuCalculator', 'Actuariat'], ['LuShieldCheck', 'Cloud et cybersécurité']] },
    { key: 'luke', x: 8.88, col: K.teal, hex: H.TEAL, tint: H.TEALL, name: 'LUKE · LukeHealth TECH', dom: 'Conseil et solutions numériques dans le secteur de la santé',
      items: [['LuStethoscope', 'Conseil e-santé'], ['LuHeartPulse', 'Solutions numériques de santé'], ['LuHandshake', 'Mutualité']] },
  ];
  ents.forEach((e) => {
    card(s, e.x, 1.95, 3.85, 3.4, K.white);
    logo(s, e.key, e.x + 1.925, 2.42, 2.4, 0.55);
    rect(s, e.x + 0.3, 2.86, 3.25, 0.012, H.LINE);
    T(s, e.name, { x: e.x + 0.3, y: 2.98, w: 3.3, h: 0.3, fontSize: 13, bold: true, color: e.col });
    T(s, e.dom, { x: e.x + 0.3, y: 3.3, w: 3.3, h: 0.55, fontSize: 12, color: K.mut });
    e.items.forEach(([ic, lab], i) => {
      icon(s, ic, e.x + 0.3, 3.95 + i * 0.44, 0.34, e.hex, e.tint);
      T(s, lab, { x: e.x + 0.78, y: 3.95 + i * 0.44, w: 2.9, h: 0.34, fontSize: 13, color: K.ink, valign: 'middle' });
    });
  });
  // Complémentarités
  card(s, 0.6, 5.55, 12.13, 1.05, H.NAVY, { noLine: true });
  T(s, [{ text: 'COMPLÉMENTARITÉS', options: { bold: true, color: 'FFB39E', fontSize: 11, charSpacing: 2, breakLine: true } }, { text: 'Des expertises sectorielles et transverses qui se combinent', options: { color: K.white, fontSize: 13 } }], { x: 0.85, y: 5.67, w: 3.3, h: 0.8, valign: 'middle' });
  const conv = [['Santé et mutualité', 'KCS + LUKE', [H.BLUE, H.TEAL]], ['Risques et conformité', 'KCS + RLCS', [H.BLUE, H.RLB]], ['Cloud et cybersécurité', 'KCS + RLCS', [H.BLUE, H.RLB]]];
  conv.forEach(([t, who, cols], i) => {
    const x = 4.35 + i * 2.75;
    card(s, x, 5.72, 2.6, 0.72, H.NAVY2, { noLine: true, noShadow: true });
    circle(s, x + 0.15, 5.88, 0.16, cols[0]); circle(s, x + 0.25, 5.88, 0.16, cols[1], { line: { color: H.NAVY2, width: 1 } });
    T(s, t, { x: x + 0.52, y: 5.8, w: 2.0, h: 0.3, fontSize: 13, bold: true, color: K.white });
    T(s, who, { x: x + 0.52, y: 6.1, w: 2.0, h: 0.26, fontSize: 11, color: H.PALE });
  });
  source(s, 'organigrammes 2026 ; document stratégique 2027 (convergences : solutions santé et mutualité de KCS en alliance avec LukeHealth, suite TREND)', { y: 6.7 });
  s.addNotes('KCS et LUKE sont positionnées sur des secteurs ; RLCS porte des expertises transverses ; KCS apporte la capacité d\'ingénierie logicielle et d\'IA la plus développée. Les trois convergences sont des pistes à organiser ou à instruire.');
}

function slide04() {
  const s = content(SEC.intro, 'DIAGNOSTIC DE L\'ORGANISATION ACTUELLE', 'Un Groupe déjà intégré dans les faits, dont les règles restent à formaliser');
  tag(s, 'constat', 10.83, 0.47, { w: 1.9 });
  // Gérant + fonctions support
  card(s, 4.92, 1.95, 3.5, 0.72, K.navy, { noLine: true });
  T(s, [{ text: 'Gérant commun', options: { bold: true, fontSize: 15, breakLine: true } }, { text: 'gestion des trois sociétés', options: { fontSize: 12, color: H.PALE } }], { x: 4.92, y: 1.97, w: 3.5, h: 0.68, color: K.white, align: 'center', valign: 'middle' });
  card(s, 0.6, 1.95, 3.7, 0.72, H.BL, { noShadow: true, lineColor: H.BLUE });
  icon(s, 'LuLayers', 0.75, 2.11, 0.4, H.BLUE);
  T(s, [{ text: 'Fonctions support centralisées', options: { bold: true, fontSize: 13, breakLine: true } }, { text: 'mêmes titulaires pour les trois sociétés', options: { fontSize: 11, color: K.mut } }], { x: 1.25, y: 1.99, w: 3.0, h: 0.66, color: K.ink, valign: 'middle' });
  line(s, 4.3, 2.31, 4.92, 2.31, H.BLUE, { width: 1.25 });
  // Bus vers les sociétés
  const cols = [[0.6, 'KCS', K.blue, H.BLUE], [4.74, 'RLCS', K.rlBlue, H.RLB], [8.88, 'LUKE', K.teal, H.TEAL]];
  line(s, 6.67, 2.67, 6.67, 2.92, '9AA3B8');
  line(s, 2.525, 2.92, 10.805, 2.92, '9AA3B8');
  cols.forEach(([x]) => line(s, x + 1.925, 2.92, x + 1.925, 3.1, '9AA3B8'));
  const rows = [['LuClipboardList', 'PMO propre, rattaché au gérant'], ['LuCoins', 'Comptabilité et chiffre d\'affaires propres'], ['LuTarget', 'Clientèle et prospection propres']];
  cols.forEach(([x, name, col, hex]) => {
    card(s, x, 3.1, 3.85, 1.95, K.white);
    s.addShape(pres.ShapeType.roundRect, { x: x + 0.2, y: 3.22, w: 3.45, h: 0.36, rectRadius: 0.08, fill: { color: col }, line: { type: 'none' } });
    T(s, name, { x: x + 0.2, y: 3.22, w: 3.45, h: 0.36, align: 'center', valign: 'middle', bold: true, fontSize: 14, color: K.white, charSpacing: 2 });
    rows.forEach(([ic, lab], i) => {
      icon(s, ic, x + 0.28, 3.72 + i * 0.43, 0.3, hex);
      T(s, lab, { x: x + 0.7, y: 3.7 + i * 0.43, w: 3.05, h: 0.34, fontSize: 13, color: K.ink, valign: 'middle' });
    });
  });
  // Mobilisation transversale
  s.addShape(pres.ShapeType.leftRightArrow, { x: 0.6, y: 5.22, w: 12.13, h: 0.62, fill: { color: H.OL }, line: { type: 'none' } });
  T(s, [{ text: 'Ressources mobilisées transversalement : ', options: { bold: true } }, { text: 'six fonctions de RLCS et de LUKE tenues par des « Consultants KCS » ; charges salariales portées par la société employeuse' }], { x: 1.3, y: 5.22, w: 10.73, h: 0.62, align: 'center', valign: 'middle', fontSize: 13, color: K.ink });
  // Collaboration commerciale
  card(s, 0.6, 5.98, 12.13, 0.55, K.white, { noShadow: true, lineColor: H.ORANGE, dash: 'dash' });
  icon(s, 'LuHandshake', 0.8, 6.07, 0.36, H.ORANGE);
  T(s, [{ text: 'Collaboration commerciale inter-sociétés : ', options: { bold: true } }, { text: 'chaque société prospecte individuellement ; la coopération reste encore peu structurée' }], { x: 1.3, y: 5.98, w: 11.2, h: 0.55, valign: 'middle', fontSize: 13, color: K.ink });
  source(s, 'organigrammes 2026 ; document stratégique 2027', { y: 6.62 });
  s.addNotes('Huit caractéristiques : gérant commun, PMO distincts, fonctions support centralisées, comptabilité et chiffre d\'affaires propres, prospection propre, mobilisation transversale des ressources, charges salariales portées par l\'employeur, collaboration commerciale peu structurée. Les organigrammes 2026 montrent que les fonctions support et BPM ont les mêmes titulaires pour les trois sociétés.');
}

function slide05() {
  const s = content(SEC.intro, 'PRINCIPAUX ENJEUX STRATÉGIQUES', 'Sept enjeux qui convergent vers trois axes de transformation');
  const P = '●', S2 = '○';
  const rows = [
    ['Formaliser et clarifier la gouvernance', P, '', ''],
    ['Améliorer la coordination entre les sociétés', P, S2, ''],
    ['Optimiser la mobilisation des ressources', S2, P, ''],
    ['Renforcer la responsabilisation opérationnelle', P, P, ''],
    ['Structurer progressivement la collaboration commerciale', P, '', ''],
    ['Développer les usages professionnels de l\'IA', '', S2, P],
    ['Renforcer la productivité et la qualité des prestations', '', P, P],
  ];
  const colHex = [H.BLUE, H.ORANGE, H.NAVY];
  const head = [
    { text: 'Enjeu', options: { bold: true, color: H.WHITE, fill: { color: H.NAVY }, fontSize: 13, valign: 'middle' } },
    ...['Axe 1 · Gouvernance', 'Axe 2 · Capital humain', 'Axe 3 · IA'].map((t, i) => ({ text: t, options: { bold: true, color: H.WHITE, fill: { color: colHex[i] }, fontSize: 12, align: 'center', valign: 'middle' } })),
  ];
  const body = rows.map((r, ri) => [
    { text: fr(r[0]), options: { fontSize: 14, color: H.INK, fill: { color: ri % 2 ? 'F7F8FC' : H.WHITE }, valign: 'middle' } },
    ...[1, 2, 3].map((k) => ({ text: r[k], options: { fontSize: r[k] === P ? 24 : 20, color: colHex[k - 1], bold: true, align: 'center', valign: 'middle', fill: { color: ri % 2 ? 'F7F8FC' : H.WHITE } } })),
  ]);
  s.addTable([head, ...body], { x: 0.6, y: 1.95, w: 8.35, colW: [4.55, 1.3, 1.3, 1.2], rowH: [0.45, ...rows.map(() => 0.54)], border: { type: 'solid', color: H.LINE, pt: 0.75 }, margin: [0.04, 0.12, 0.04, 0.12] });
  T(s, '● réponse principale     ○ contribution', { x: 0.6, y: 6.33, w: 8.35, h: 0.28, fontSize: 11, color: K.mut });
  // Lecture
  card(s, 9.25, 1.95, 3.48, 4.65, H.PANEL, { noShadow: true, noLine: true });
  tag(s, 'analyse', 9.5, 2.15);
  const lec = [['LuLandmark', H.BLUE, 'L\'Axe 1 structure', 'règles, coordination, responsabilités'], ['LuUsers', H.ORANGE, 'L\'Axe 2 mobilise', 'compétences, ressources, productivité'], ['LuSparkles', H.NAVY, 'L\'Axe 3 accélère', 'usages de l\'IA, qualité, productivité']];
  lec.forEach(([ic, hex, t, d], i) => {
    icon(s, ic, 9.5, 2.65 + i * 1.05, 0.5, H.WHITE, hex);
    T(s, t, { x: 10.15, y: 2.63 + i * 1.05, w: 2.45, h: 0.3, fontSize: 14, bold: true, color: K.ink });
    T(s, d, { x: 10.15, y: 2.95 + i * 1.05, w: 2.45, h: 0.5, fontSize: 12, color: K.mut });
  });
  T(s, 'Chaque enjeu trouve sa réponse dans au moins un axe ; plusieurs en mobilisent deux.', { x: 9.5, y: 5.8, w: 3.05, h: 0.7, fontSize: 12, italic: true, color: K.navy });
  s.addNotes('Matrice de correspondance entre les enjeux et les axes. Il s\'agit d\'une lecture proposée, qui montre la cohérence entre le diagnostic et les orientations.');
}

function slide06() {
  const s = content(SEC.intro, 'SYNTHÈSE DES TROIS AXES STRATÉGIQUES', 'Trois axes complémentaires pour structurer, mobiliser et accélérer');
  s.addShape(pres.ShapeType.triangle, { x: 0.95, y: 1.9, w: 11.43, h: 1.0, fill: { color: K.navy }, line: { type: 'none' } });
  T(s, 'AMBITION 2027 · Un Groupe mieux coordonné, plus performant et plus innovant', { x: 3.4, y: 2.48, w: 6.53, h: 0.36, align: 'center', valign: 'middle', fontSize: 13, bold: true, color: K.white });
  const pil = [
    ['1', K.blue, H.BLUE, 'LuLandmark', 'Réorganisation et gouvernance du Groupe', 'Structurer le fonctionnement collectif et renforcer le pilotage des trois sociétés.'],
    ['2', K.orange, H.ORANGE, 'LuUsers', 'Renforcement du capital humain et optimisation des ressources', 'Améliorer l\'organisation, la mobilisation et la productivité des équipes.'],
    ['3', K.navy, H.NAVY, 'LuBrainCircuit', 'Transformation par l\'intelligence artificielle', 'Consolider les usages existants, développer les compétences et accélérer l\'intégration de l\'IA dans les métiers et les solutions.'],
  ];
  pil.forEach(([n, col, hex, ic, t, d], i) => {
    const x = 1.15 + i * 3.75;
    card(s, x, 3.05, 3.3, 3.0, K.white);
    s.addShape(pres.ShapeType.roundRect, { x, y: 3.05, w: 3.3, h: 1.3, rectRadius: 0.08, fill: { color: col }, line: { type: 'none' } });
    icon(s, ic, x + 0.22, 3.25, 0.55, H.WHITE);
    T(s, `AXE ${n}`, { x: x + 0.95, y: 3.2, w: 2.2, h: 0.3, fontSize: 11, bold: true, color: K.white, charSpacing: 2 });
    T(s, t, { x: x + 0.95, y: 3.5, w: 2.2, h: 0.8, fontSize: 13, bold: true, color: K.white });
    T(s, d, { x: x + 0.25, y: 4.55, w: 2.8, h: 1.4, fontSize: 14, color: K.ink });
  });
  card(s, 0.95, 6.15, 11.43, 0.45, H.PANEL, { noShadow: true, noLine: true });
  T(s, [{ text: 'Socle : ', options: { bold: true, color: K.blue } }, { text: 'gérant commun · fonctions support et BPM mutualisées · trois PMO · consultants mobilisables · usages IA engagés' }], { x: 1.1, y: 6.15, w: 11.13, h: 0.45, align: 'center', valign: 'middle', fontSize: 13, color: K.ink });
  s.addNotes('Les trois piliers reposent sur un socle existant. L\'objectif n\'est pas de bouleverser l\'organisation mais de la structurer.');
}

// ------------------------------------------------------------------ AXE 1
function slide07() {
  pres.addSection({ title: SEC.a1 });
  const s = content(SEC.a1, 'PARTIE I · AXE 1 · GOUVERNANCE ET ORGANISATION', 'Vers une gouvernance Groupe plus structurée et plus performante');
  card(s, 0.6, 1.95, 5.55, 4.6, H.PANEL, { noShadow: true, noLine: true });
  tag(s, 'constat', 0.85, 2.15);
  T(s, 'Fonctionnement actuel', { x: 0.85, y: 2.55, w: 5, h: 0.4, fontSize: 18, bold: true, color: K.ink });
  const cst = [['LuUserCheck', 'Un gérant commun aux trois sociétés'], ['LuClipboardList', 'Trois PMO distincts, rattachés au gérant'], ['LuLayers', 'Des fonctions support centralisées'], ['LuArrowRightLeft', 'Des collaborateurs mobilisés entre les sociétés'], ['LuCoins', 'Une gestion financière distincte par société']];
  cst.forEach(([ic, t], i) => {
    icon(s, ic, 0.85, 3.12 + i * 0.66, 0.46, H.BLUE, H.WHITE);
    T(s, t, { x: 1.5, y: 3.12 + i * 0.66, w: 4.5, h: 0.46, fontSize: 15, color: K.ink, valign: 'middle' });
  });
  s.addShape(pres.ShapeType.rightArrow, { x: 6.3, y: 3.75, w: 0.6, h: 0.9, fill: { color: K.orange }, line: { type: 'none' } });
  card(s, 7.05, 1.95, 5.68, 4.6, K.blue, { noLine: true });
  tag(s, 'orientation', 7.3, 2.15, { bg: H.WHITE });
  T(s, 'Orientation cible', { x: 7.3, y: 2.55, w: 5.2, h: 0.4, fontSize: 18, bold: true, color: K.white });
  const ori = ['Formaliser une gouvernance commune', 'Clarifier les responsabilités et les circuits de décision', 'Renforcer la coordination des trois PMO', 'Améliorer le pilotage consolidé du Groupe'];
  ori.forEach((t, i) => {
    icon(s, 'LuCircleCheck', 7.3, 3.17 + i * 0.7, 0.42, H.WHITE);
    T(s, t, { x: 7.9, y: 3.12 + i * 0.7, w: 4.6, h: 0.52, fontSize: 15, bold: true, color: K.white, valign: 'middle' });
  });
  T(s, 'Sans changer ce qui fonctionne : comptabilité, chiffre d\'affaires et PMO de chaque société sont maintenus.', { x: 7.3, y: 5.9, w: 5.2, h: 0.55, fontSize: 12, italic: true, color: H.PALE });
  source(s, 'organigrammes 2026 ; document stratégique 2027');
  s.addNotes('L\'enjeu est de passer d\'une intégration de fait à des règles connues de tous, sans toucher aux mécanismes qui fonctionnent.');
}

function slide08() {
  const s = content(SEC.a1, 'AXE 1 · MODÈLE DE GOUVERNANCE CIBLE', 'Un modèle cible qui clarifie les rôles sans créer de nouvelles directions');
  tag(s, 'proposition', 10.38, 0.47, { w: 2.35 });
  // Libellés de niveaux
  const lvl = (t, y, h) => { card(s, 0.6, y, 1.0, h, H.PANEL, { noShadow: true, noLine: true }); T(s, t, { x: 0.6, y, w: 1.0, h, align: 'center', valign: 'middle', fontSize: 10, bold: true, color: K.mut, charSpacing: 1 }); };
  lvl('NIVEAU 1', 1.92, 1.05); lvl('NIVEAU 2', 3.35, 1.1); lvl('NIVEAU 3', 4.95, 1.15);
  // Niveau 1
  card(s, 5.04, 1.92, 4.4, 1.05, K.navy, { noLine: true });
  T(s, 'GÉRANT COMMUN', { x: 5.04, y: 1.98, w: 4.4, h: 0.3, align: 'center', fontSize: 14, bold: true, color: K.white, charSpacing: 2 });
  T(s, 'Supervision globale · Arbitrages stratégiques · Coordination des trois sociétés · Pilotage de la performance consolidée', { x: 5.25, y: 2.3, w: 3.98, h: 0.62, align: 'center', fontSize: 11, color: H.PALE });
  // Liaisons
  line(s, 7.24, 2.97, 7.24, 4.95, H.NAVY, { width: 1.75 });
  line(s, 2.605, 3.17, 11.875, 3.17, '6F8FFF', { width: 1, dash: 'dash' });
  // Niveau 2 : fonctions transversales (représentation fonctionnelle)
  const fx = (i) => 1.75 + i * 1.854;
  const fns = [['LuUsers', 'Ressources humaines', 'HR/Accounting'], ['LuCoins', 'Finance et comptabilité', 'HR/Accounting'], ['LuFileText', 'Administration', 'HR/Accounting (gestion, juridique)'], ['LuMegaphone', 'Marketing et communication', 'BD de LUKE (marketing) ; à structurer'], ['LuCompass', 'Développement et stratégie', 'Advisory & BD ; BPM'], ['LuCpu', 'Innovation et technologie', 'Architecture & innovation, AI Engineering']];
  fns.forEach(([ic, t, a], i) => {
    const x = fx(i);
    line(s, x + 0.855, 3.17, x + 0.855, 3.35, '6F8FFF', { width: 1, dash: 'dash' });
    card(s, x, 3.35, 1.71, 1.1, H.BL, { noShadow: true, lineColor: '6F8FFF', dash: 'dash' });
    icon(s, ic, x + 0.12, 3.45, 0.3, H.BLUE);
    T(s, t, { x: x + 0.47, y: 3.43, w: 1.18, h: 0.42, fontSize: 11, bold: true, color: K.ink, valign: 'middle' });
    T(s, `Appui actuel : ${a}`, { x: x + 0.12, y: 3.88, w: 1.5, h: 0.52, fontSize: 9.5, color: K.mut });
  });
  // Niveau 3
  line(s, 3.4, 4.75, 11.08, 4.75, H.NAVY, { width: 1.75 });
  const ents = [['kcs', 'KCS', K.blue, H.BL], ['rlcs', 'RLCS', K.rlBlue, H.RLL], ['luke', 'LUKE', K.teal, H.TEALL]];
  ents.forEach(([k, n, col, tint], i) => {
    const x = 1.75 + i * 3.84;
    line(s, x + 1.65, 4.75, x + 1.65, 4.95, H.NAVY, { width: 1.75 });
    card(s, x, 4.95, 3.3, 1.15, K.white);
    T(s, n, { x: x + 0.2, y: 5.03, w: 1.4, h: 0.35, fontSize: 16, bold: true, color: col, charSpacing: 2 });
    s.addShape(pres.ShapeType.roundRect, { x: x + 1.6, y: 5.05, w: 1.5, h: 0.32, rectRadius: 0.16, fill: { color: col }, line: { type: 'none' } });
    T(s, `PMO ${n}`, { x: x + 1.6, y: 5.05, w: 1.5, h: 0.32, align: 'center', valign: 'middle', fontSize: 11, bold: true, color: K.white });
    T(s, 'Clientèle, comptabilité et chiffre d\'affaires propres', { x: x + 0.2, y: 5.48, w: 2.95, h: 0.5, fontSize: 11, color: K.mut });
  });
  // Coordination des PMO
  line(s, 5.06, 5.21, 5.39, 5.21, H.ORANGE, { width: 1.5, dash: 'dash' });
  line(s, 8.9, 5.21, 9.23, 5.21, H.ORANGE, { width: 1.5, dash: 'dash' });
  // Légende et note
  const lg = (x, col, dash, t, w) => { line(s, x, 6.33, x + 0.45, 6.33, col, { width: 1.75, dash }); T(s, t, { x: x + 0.55, y: 6.2, w, h: 0.26, fontSize: 10, color: K.mut, valign: 'middle' }); };
  lg(1.75, H.NAVY, 'solid', 'Rattachement : les PMO rendent compte au gérant', 3.6);
  lg(6.0, H.ORANGE, 'dash', 'Coordination Groupe des trois PMO', 2.5);
  lg(9.1, '6F8FFF', 'dash', 'Appui des fonctions transversales', 2.6);
  T(s, 'Représentation fonctionnelle de l\'organisation cible : les fonctions transversales ne sont pas des directions déjà créées. Les trois PMO restent distincts.', { x: 1.75, y: 6.5, w: 10.98, h: 0.3, fontSize: 10, italic: true, color: K.mut });
  s.addNotes('Niveau 1 : gérant commun. Niveau 2 : fonctions transversales, représentées de manière fonctionnelle ; l\'appui actuel indiqué provient des organigrammes 2026. Niveau 3 : les trois sociétés, chacune avec son PMO, qui rend compte au gérant. La coordination des PMO est proposée.');
}

function slide09() {
  const s = content(SEC.a1, 'AXE 1 · CHANTIERS PRIORITAIRES', 'Cinq chantiers pour formaliser la gouvernance du Groupe');
  const ch = [
    ['LuLandmark', 'Formalisation de la gouvernance commune', 'Charte Groupe : rôles, instances, règles de décision et de délégation', 'Des règles connues et partagées'],
    ['LuNetwork', 'Coordination renforcée des PMO', 'Revue de coordination régulière, plan de charge consolidé', 'Une vision partagée des projets et des ressources'],
    ['LuLayers', 'Structuration des fonctions transversales', 'Périmètre, catalogue de services, circuit de demande unique', 'Un appui lisible pour les trois sociétés'],
    ['LuGauge', 'Suivi analytique des ressources', 'Temps par projet et par société, sans refacturation en 2027', 'La mobilisation réelle des ressources rendue visible'],
    ['LuHandshake', 'Synergies commerciales progressives', 'Pipeline partagé, règles d\'apport d\'affaires entre sociétés', 'Des opportunités croisées identifiées et suivies'],
  ];
  ch.forEach(([ic, t, d, r], i) => {
    const x = 0.6 + i * 2.458;
    card(s, x, 1.95, 2.3, 4.45, K.white);
    T(s, `0${i + 1}`, { x: x + 0.2, y: 2.08, w: 0.9, h: 0.55, fontSize: 28, bold: true, color: i % 2 ? K.orange : K.blue });
    icon(s, ic, x + 1.55, 2.12, 0.52, i % 2 ? H.ORANGE : H.BLUE, i % 2 ? H.OL : H.BL);
    T(s, t, { x: x + 0.2, y: 2.8, w: 1.95, h: 0.8, fontSize: 14, bold: true, color: K.ink });
    T(s, d, { x: x + 0.2, y: 3.68, w: 1.95, h: 1.15, fontSize: 12, color: K.mut });
    rect(s, x + 0.2, 4.92, 1.9, 0.012, H.LINE);
    T(s, 'RÉSULTAT ATTENDU', { x: x + 0.2, y: 5.02, w: 1.95, h: 0.24, fontSize: 9.5, bold: true, color: i % 2 ? 'C8401C' : K.blue, charSpacing: 1 });
    T(s, r, { x: x + 0.2, y: 5.3, w: 1.95, h: 0.95, fontSize: 13, bold: true, color: K.navy });
  });
  T(s, 'Proposition : pilotes, échéances précises et moyens à définir lors de la validation.', { x: 0.6, y: 6.5, w: 12.13, h: 0.28, fontSize: 11, italic: true, color: K.mut });
  s.addNotes('Les cinq chantiers prolongent les travaux engagés en 2026, notamment le nouvel organigramme et les fiches de fonction. Le suivi analytique sert à comprendre, pas à refacturer.');
}

// ------------------------------------------------------------------ AXE 2
function slide10() {
  pres.addSection({ title: SEC.a2 });
  const s = content(SEC.a2, 'PARTIE II · AXE 2 · CAPITAL HUMAIN ET PRODUCTIVITÉ', 'Faire du capital humain un levier de performance collective');
  const stats = [['55', 'noms distincts sur les trois organigrammes 2026', K.blue], ['41', 'dans le pôle Tech & Delivery de KCS', K.navy], ['6', 'fonctions de RLCS et de LUKE tenues par des « Consultants KCS »', K.orange]];
  stats.forEach(([n, l, col], i) => {
    const x = 0.6 + i * 4.11;
    card(s, x, 1.95, 3.91, 1.3, H.PANEL, { noShadow: true, noLine: true });
    T(s, n, { x: x + 0.25, y: 2.02, w: 1.3, h: 1.15, fontSize: 48, bold: true, color: col, valign: 'middle' });
    T(s, l, { x: x + 1.55, y: 2.1, w: 2.2, h: 1.0, fontSize: 13, color: K.ink, valign: 'middle' });
  });
  card(s, 0.6, 3.5, 6.0, 3.05, K.white);
  tag(s, 'constat', 0.85, 3.68);
  const cst = ['Des collaborateurs qui interviennent pour plusieurs sociétés', 'Des compétences mobilisées selon les besoins des projets', 'Des charges salariales supportées par la société employeuse', 'Des rôles et responsabilités à clarifier : fiches de fonction en cours depuis 2026'];
  cst.forEach((t, i) => {
    circle(s, 0.88, 4.2 + i * 0.57, 0.14, K.blue);
    T(s, t, { x: 1.15, y: 4.06 + i * 0.57, w: 5.3, h: 0.44, fontSize: 14, color: K.ink, valign: 'middle' });
  });
  card(s, 6.85, 3.5, 5.88, 3.05, K.navy, { noLine: true });
  tag(s, 'orientation', 7.1, 3.68, { bg: H.WHITE });
  T(s, 'Améliorer la gestion transversale des compétences et des ressources, sans remettre en cause les pratiques opérationnelles qui fonctionnent déjà.', { x: 7.1, y: 4.08, w: 5.4, h: 1.05, fontSize: 15, bold: true, color: K.white });
  const pr = [['LuBuilding2', 'Partir de l\'existant : fiches de fonction, classifications RH'], ['LuSlidersHorizontal', 'Des outils simples, un rythme léger'], ['LuEye', 'Comprendre avant de contrôler']];
  pr.forEach(([ic, t], i) => {
    icon(s, ic, 7.1, 5.25 + i * 0.4, 0.28, 'FFB39E');
    T(s, t, { x: 7.5, y: 5.22 + i * 0.4, w: 5.0, h: 0.34, fontSize: 13, color: H.PALE, valign: 'middle' });
  });
  source(s, 'organigrammes 2026 (décompte des noms affichés, à confirmer par HR/Accounting) ; plan d\'action 2026 ; document stratégique 2027');
  s.addNotes('Les chiffres proviennent du décompte des noms affichés sur les trois organigrammes 2026 ; ils ne remplacent pas les effectifs officiels. Les postes « Consultant KCS » ne sont pas nominatifs.');
}

function slide11() {
  const s = content(SEC.a2, 'AXE 2 · PRIORITÉS D\'AMÉLIORATION', 'Quatre priorités pour mieux voir, affecter et coordonner les ressources');
  const pri = [
    ['LuUserCheck', 'Clarification des rôles et responsabilités', 'Fiches de fonction finalisées, matrice des responsabilités'],
    ['LuNetwork', 'Cartographie des compétences', 'Adossée aux classifications RH déjà établies'],
    ['LuCalendarCheck', 'Suivi simple des charges par projet', 'Saisie hebdomadaire par projet et par société'],
    ['LuMessagesSquare', 'Coordination entre collaborateurs et PMO', 'Points de charge réguliers, signalement des surcharges'],
  ];
  pri.forEach(([ic, t, d], i) => {
    const x = 0.6 + (i % 2) * 3.98, y = 1.95 + Math.floor(i / 2) * 1.98;
    card(s, x, y, 3.78, 1.8, K.white);
    num(s, i + 1, x + 0.22, y + 0.22, 0.42, K.orange, K.white, 14);
    icon(s, ic, x + 3.05, y + 0.2, 0.48, H.ORANGE, H.OL);
    T(s, t, { x: x + 0.22, y: y + 0.72, w: 3.35, h: 0.55, fontSize: 14, bold: true, color: K.ink, valign: 'bottom' });
    T(s, d, { x: x + 0.22, y: y + 1.32, w: 3.35, h: 0.42, fontSize: 12, color: K.mut });
  });
  s.addShape(pres.ShapeType.chevron, { x: 8.6, y: 3.42, w: 0.5, h: 0.9, fill: { color: K.blue }, line: { type: 'none' } });
  card(s, 9.3, 1.95, 3.43, 3.78, H.BL, { noShadow: true, noLine: true });
  T(s, 'RÉSULTATS ATTENDUS', { x: 9.55, y: 2.12, w: 3.0, h: 0.3, fontSize: 11, bold: true, color: K.blue, charSpacing: 2 });
  const res = ['Meilleure visibilité sur les ressources', 'Moins de difficultés de coordination', 'Productivité améliorée', 'Meilleure allocation des compétences'];
  res.forEach((t, i) => {
    icon(s, 'LuCircleCheck', 9.55, 2.62 + i * 0.75, 0.36, H.BLUE);
    T(s, t, { x: 10.02, y: 2.58 + i * 0.75, w: 2.6, h: 0.5, fontSize: 14, bold: true, color: K.ink, valign: 'middle' });
  });
  card(s, 0.6, 5.95, 12.13, 0.62, H.OL, { noShadow: true, noLine: true });
  icon(s, 'LuInfo', 0.8, 6.08, 0.36, H.ORANGE);
  T(s, [{ text: 'Mise en œuvre progressive : ', options: { bold: true } }, { text: 'aucune refacturation obligatoire immédiate entre sociétés ; le suivi sert d\'abord à comprendre la mobilisation réelle des ressources.' }], { x: 1.3, y: 5.95, w: 11.25, h: 0.62, valign: 'middle', fontSize: 13, color: K.ink });
  s.addNotes('Un seul dispositif de saisie des temps sert trois usages : plan de charge, suivi analytique entre sociétés et mesure des gains liés à l\'IA.');
}

// ------------------------------------------------------------------ AXE 3
function slide12() {
  pres.addSection({ title: SEC.a3 });
  const s = content(SEC.a3, 'PARTIE III · AXE 3 · INTELLIGENCE ARTIFICIELLE ET INNOVATION', 'Accélérer l\'intégration de l\'IA dans les métiers et les solutions du Groupe');
  card(s, 0.6, 1.95, 5.3, 4.6, K.navy, { noLine: true });
  T(s, 'LE GROUPE NE PART PAS DE ZÉRO', { x: 0.85, y: 2.12, w: 4.8, h: 0.3, fontSize: 11, bold: true, color: 'FFB39E', charSpacing: 2 });
  const f = [['LuGraduationCap', 'Les équipes disposent déjà de bases en IA'], ['LuCode', 'Les développeurs utilisent régulièrement ces outils'], ['LuRocket', 'Des solutions intégrant l\'IA sont en cours de développement et d\'intégration'], ['LuCpu', 'KCS dispose d\'une fonction AI Engineering et d\'une fonction Architecture & innovation'], ['LuSparkles', 'L\'offre Microsoft de KCS intègre déjà Copilot']];
  f.forEach(([ic, t], i) => {
    icon(s, ic, 0.85, 2.6 + i * 0.75, 0.4, H.WHITE, H.NAVY2);
    T(s, t, { x: 1.42, y: 2.56 + i * 0.75, w: 4.3, h: 0.5, fontSize: 13, color: K.white, valign: 'middle' });
  });
  // Trajectoire de maturité
  T(s, 'Trajectoire proposée', { x: 6.25, y: 1.95, w: 6.4, h: 0.35, fontSize: 16, bold: true, color: K.ink });
  const st = [['Usages existants', 'Initiatives et pratiques individuelles ou par équipe', H.BL, K.blue, 1.15], ['Démarche structurée', 'Référents, charte d\'usage, cas d\'usage prioritaires', '9DB6FF', K.navy, 1.85], ['Création de valeur', 'Gains de productivité mesurés, offres enrichies', H.BLUE, K.white, 2.55]];
  st.forEach(([t, d, fill, col, h], i) => {
    const x = 6.25 + i * 2.18, y = 5.0 - h;
    s.addShape(pres.ShapeType.roundRect, { x, y, w: 2.05, h, rectRadius: 0.06, fill: { color: fill }, line: { type: 'none' } });
    T(s, t, { x: x + 0.12, y: y + 0.1, w: 1.82, h: 0.5, fontSize: 13, bold: true, color: col });
    T(s, d, { x: x + 0.12, y: y + 0.6, w: 1.82, h: h - 0.65, fontSize: 11, color: col });
  });
  rect(s, 6.25, 5.02, 6.45, 0.03, K.navy);
  s.addShape(pres.ShapeType.downArrow, { x: 7.08, y: 3.0, w: 0.38, h: 0.75, fill: { color: K.orange }, line: { type: 'none' } });
  T(s, 'Point de départ', { x: 6.25, y: 2.65, w: 2.05, h: 0.3, fontSize: 11, bold: true, color: 'C8401C', align: 'center' });
  card(s, 6.25, 5.3, 6.48, 1.25, H.OL, { noShadow: true, noLine: true });
  tag(s, 'orientation', 6.45, 5.43);
  T(s, 'Passer d\'usages existants à une démarche structurée, maîtrisée et orientée vers la création de valeur.', { x: 6.45, y: 5.78, w: 6.1, h: 0.7, fontSize: 14, bold: true, color: K.navy });
  source(s, 'organigrammes 2026 ; stratégie de communication KCS (offre Microsoft) ; document stratégique 2027');
  s.addNotes('Le Groupe n\'est pas débutant en IA : il s\'agit de consolider et de structurer ce qui existe, puis d\'accélérer.');
}

function slide13() {
  const s = content(SEC.a3, 'AXE 3 · QUATRE LEVIERS STRATÉGIQUES', 'Quatre leviers pour faire de l\'IA un avantage de productivité et d\'offre');
  const lv = [
    ['LuGraduationCap', 'Compétences', K.blue, H.BLUE, ['Renforcement des compétences IA', 'Formation et accompagnement', 'Référents internes']],
    ['LuWorkflow', 'Processus métiers', K.orange, H.ORANGE, ['Génération de rapports', 'Analyse intelligente de documents', 'Sécurisation et conformité']],
    ['LuLightbulb', 'Solutions et innovation', K.navy, H.NAVY, ['Enrichissement des solutions KCS', 'Capacités RiskTech de RLCS', 'Innovation dans les solutions e-santé de LUKE']],
    ['LuShieldCheck', 'Productivité et maîtrise', K.rlBlue, H.RLB, ['Sécurité des données', 'Qualité des résultats', 'Automatisation des tâches', 'Mesure des gains de productivité']],
  ];
  lv.forEach(([ic, t, col, hex, items], i) => {
    const x = 0.6 + i * 3.08;
    card(s, x, 1.95, 2.9, 4.55, K.white);
    s.addShape(pres.ShapeType.roundRect, { x, y: 1.95, w: 2.9, h: 1.35, rectRadius: 0.08, fill: { color: col }, line: { type: 'none' } });
    icon(s, ic, x + 0.22, 2.12, 0.6, H.WHITE);
    T(s, `0${i + 1}`, { x: x + 1.9, y: 2.1, w: 0.8, h: 0.5, fontSize: 24, bold: true, color: K.white, align: 'right' });
    T(s, t.toUpperCase(), { x: x + 0.22, y: 2.82, w: 2.5, h: 0.4, fontSize: 14, bold: true, color: K.white, charSpacing: 1 });
    items.forEach((it, k) => {
      circle(s, x + 0.27, 3.62 + k * 0.66, 0.12, col);
      T(s, it, { x: x + 0.52, y: 3.48 + k * 0.66, w: 2.25, h: 0.55, fontSize: 13, color: K.ink, valign: 'middle' });
    });
  });
  T(s, 'Les quatre leviers sont menés ensemble : sans compétences ni encadrement, les solutions ne produisent pas de gains durables.', { x: 0.6, y: 6.55, w: 12.13, h: 0.3, fontSize: 12, italic: true, color: K.mut });
  s.addNotes('Leviers 1 et 4 : socle de compétences et de maîtrise. Leviers 2 et 3 : usages dans les processus et dans les offres des trois sociétés.');
}

function slide14() {
  const s = content(SEC.a3, 'AXE 3 · PRIORITÉS DE MISE EN ŒUVRE', 'Une montée en puissance progressive, sur trois domaines prioritaires');
  const steps = ['Consolider les initiatives déjà engagées', 'Identifier les cas d\'usage prioritaires', 'Renforcer les compétences', 'Structurer des projets pilotes par société', 'Évaluer les résultats et les gains', 'Étendre les solutions efficaces'];
  const fills = ['9DB6FF', '7A9CFF', '5584FF', H.BLUE, H.BMID, H.ORANGE];
  steps.forEach((t, i) => {
    const x = 0.6 + i * 2.0;
    s.addShape(i === 0 ? pres.ShapeType.homePlate : pres.ShapeType.chevron, { x, y: 1.95, w: 2.1, h: 0.6, fill: { color: fills[i] }, line: { type: 'none' } });
    T(s, `${i + 1}`, { x: x + 0.35, y: 1.95, w: 1.4, h: 0.6, align: 'center', valign: 'middle', bold: true, fontSize: 18, color: i < 3 ? H.NAVY : H.WHITE });
    T(s, t, { x: x + 0.1, y: 2.65, w: 1.85, h: 0.6, fontSize: 12, bold: true, color: K.ink, align: 'center' });
  });
  T(s, 'TROIS DOMAINES D\'APPLICATION PRIORITAIRES', { x: 0.6, y: 3.38, w: 8, h: 0.3, fontSize: 11, bold: true, color: K.blue, charSpacing: 2 });
  const dom = [
    ['LuFileText', 'Génération de rapports', 'Rapports de mission, de suivi et reporting consolidé', 'relecture humaine avant toute diffusion'],
    ['LuFileSearch', 'Analyse documentaire', 'Cahiers des charges, textes réglementaires, contrats', 'confidentialité des données clients'],
    ['LuShieldCheck', 'Sécurisation et conformité', 'Appui aux contrôles et à la détection d\'anomalies', 'responsabilité finale humaine, traçabilité'],
  ];
  dom.forEach(([ic, t, d, v], i) => {
    const x = 0.6 + i * 4.11;
    card(s, x, 3.75, 3.91, 2.78, K.white);
    icon(s, ic, x + 0.25, 3.93, 0.6, H.BLUE, H.BL);
    T(s, t, { x: x + 1.0, y: 3.97, w: 2.75, h: 0.55, fontSize: 16, bold: true, color: K.ink, valign: 'middle' });
    T(s, d, { x: x + 0.25, y: 4.7, w: 3.45, h: 0.75, fontSize: 14, color: K.ink });
    card(s, x + 0.25, 5.58, 3.41, 0.72, H.OL, { noShadow: true, noLine: true });
    T(s, [{ text: 'Vigilance : ', options: { bold: true, color: 'C8401C' } }, { text: v }], { x: x + 0.4, y: 5.58, w: 3.15, h: 0.72, fontSize: 12, color: K.ink, valign: 'middle' });
  });
  T(s, 'Gains à mesurer sur les projets pilotes : aucun gain chiffré n\'est avancé à ce stade.', { x: 0.6, y: 6.58, w: 12.13, h: 0.28, fontSize: 11, italic: true, color: K.mut });
  s.addNotes('Démarche en six étapes, de la consolidation de l\'existant à l\'extension des solutions qui ont fait leurs preuves. Les domaines prioritaires concernent les trois sociétés.');
}

// --------------------------------------------------------- MISE EN ŒUVRE
function slide15() {
  pres.addSection({ title: SEC.mo });
  const s = content(SEC.mo, 'PARTIE IV · FEUILLE DE ROUTE STRATÉGIQUE 2027', 'Une feuille de route en quatre temps, du cadrage à l\'évaluation');
  tag(s, 'valider', 11.53, 0.47, { w: 1.2 });
  const q = [
    ['T1 2027', 'CADRAGE', ['Formalisation des orientations', 'Clarification des responsabilités', 'Identification des priorités RH et IA'], 'BCCCFF', H.NAVY],
    ['T2 2027', 'STRUCTURATION', ['Mécanismes de coordination', 'Premiers outils de suivi', 'Renforcement des compétences'], '7A9CFF', H.WHITE],
    ['T3 2027', 'DÉPLOIEMENT', ['Pilotage opérationnel amélioré', 'Consolidation des usages IA', 'Synergies entre sociétés'], H.BLUE, H.WHITE],
    ['T4 2027', 'ÉVALUATION', ['Bilan des actions', 'Évaluation des résultats', 'Ajustements et orientations 2028'], H.ORANGE, H.WHITE],
  ];
  rect(s, 0.9, 2.47, 11.53, 0.05, H.LINE);
  q.forEach(([lab, ph, items, fill, txt], i) => {
    const x = 0.6 + i * 3.08;
    circle(s, x + 1.25, 2.2, 0.6, fill, { line: { color: H.WHITE, width: 3 } });
    T(s, String(i + 1), { x: x + 1.25, y: 2.2, w: 0.6, h: 0.6, align: 'center', valign: 'middle', bold: true, fontSize: 16, color: txt });
    T(s, lab, { x, y: 2.9, w: 2.9, h: 0.3, align: 'center', fontSize: 13, bold: true, color: K.mut });
    card(s, x, 3.3, 2.9, 3.05, K.white);
    s.addShape(pres.ShapeType.roundRect, { x, y: 3.3, w: 2.9, h: 0.6, rectRadius: 0.08, fill: { color: fill }, line: { type: 'none' } });
    T(s, ph, { x, y: 3.3, w: 2.9, h: 0.6, align: 'center', valign: 'middle', fontSize: 15, bold: true, color: txt, charSpacing: 2 });
    items.forEach((it, k) => {
      circle(s, x + 0.25, 4.22 + k * 0.7, 0.12, i === 3 ? K.orange : K.blue);
      T(s, it, { x: x + 0.48, y: 4.08 + k * 0.7, w: 2.3, h: 0.55, fontSize: 14, color: K.ink, valign: 'middle' });
    });
  });
  T(s, 'Ces échéances constituent une proposition de planification, à valider par la Direction Générale.', { x: 0.6, y: 6.5, w: 12.13, h: 0.3, fontSize: 12, italic: true, color: K.mut });
  s.addNotes('Le premier trimestre pose le cadre, les deux suivants structurent et déploient, le quatrième évalue et prépare 2028.');
}

function slide16() {
  const s = content(SEC.mo, 'DISPOSITIF DE PILOTAGE ET INDICATEURS', 'Un tableau de bord Groupe sur cinq dimensions, piloté par le gérant');
  const rows = [
    ['LuLandmark', 'Gouvernance', 'Niveau de formalisation des responsabilités', 'Trimestrielle'],
    ['LuNetwork', 'Organisation', 'Suivi des affectations et coordination des PMO', 'Mensuelle'],
    ['LuUsers', 'Ressources humaines', 'Utilisation des compétences et charge de travail', 'Mensuelle'],
    ['LuHandshake', 'Commercial', 'Opportunités transversales et développement des clients', 'Mensuelle'],
    ['LuBrainCircuit', 'Innovation et IA', 'Usages déployés, projets pilotes et gains de productivité', 'Trimestrielle'],
  ];
  const head = ['Dimension', 'Indicateurs proposés', 'Fréquence proposée', 'Cible 2027'].map((t) => ({ text: t, options: { bold: true, color: H.WHITE, fill: { color: H.BLUE }, fontSize: 12, valign: 'middle' } }));
  const body = rows.map((r, i) => [
    { text: r[1], options: { bold: true, fontSize: 14, color: H.INK, valign: 'middle', margin: [0.04, 0.1, 0.04, 0.55], fill: { color: i % 2 ? 'F7F8FC' : H.WHITE } } },
    { text: fr(r[2]), options: { fontSize: 13, color: H.INK, valign: 'middle', fill: { color: i % 2 ? 'F7F8FC' : H.WHITE } } },
    { text: r[3], options: { fontSize: 13, color: H.INK, valign: 'middle', fill: { color: i % 2 ? 'F7F8FC' : H.WHITE } } },
    { text: fr('À définir'), options: { fontSize: 13, italic: true, color: H.MUT, valign: 'middle', fill: { color: i % 2 ? 'F7F8FC' : H.WHITE } } },
  ]);
  s.addTable([head, ...body], { x: 0.6, y: 1.95, w: 8.6, colW: [2.35, 3.35, 1.35, 1.55], rowH: [0.42, 0.72, 0.72, 0.72, 0.72, 0.72], border: { type: 'solid', color: H.LINE, pt: 0.75 }, margin: [0.04, 0.1, 0.04, 0.1] });
  rows.forEach(([ic], i) => icon(s, ic, 0.7, 2.37 + 0.42 + i * 0.72 - 0.42 + 0.21, 0.3, H.BLUE));
  // Rythme de pilotage
  card(s, 9.5, 1.95, 3.23, 4.67, H.PANEL, { noShadow: true, noLine: true });
  T(s, 'RYTHME DE PILOTAGE PROPOSÉ', { x: 9.7, y: 2.1, w: 2.9, h: 0.3, fontSize: 10.5, bold: true, color: K.blue, charSpacing: 1 });
  const rv = [['Revue des PMO', 'toutes les deux semaines', H.BL, K.navy], ['Comité de Direction Groupe', 'mensuel', '9DB6FF', K.navy], ['Revue stratégique avec les associés', 'trimestrielle', H.BLUE, K.white]];
  rv.forEach(([t, f, fill, col], i) => {
    const y = 2.55 + i * 1.12;
    s.addShape(pres.ShapeType.roundRect, { x: 9.7, y, w: 2.83, h: 0.82, rectRadius: 0.06, fill: { color: fill }, line: { type: 'none' } });
    T(s, [{ text: t, options: { bold: true, fontSize: 13, breakLine: true } }, { text: f, options: { fontSize: 12 } }], { x: 9.85, y, w: 2.6, h: 0.82, color: col, valign: 'middle' });
    if (i < 2) s.addShape(pres.ShapeType.downArrow, { x: 10.98, y: y + 0.85, w: 0.26, h: 0.25, fill: { color: K.mut }, line: { type: 'none' } });
  });
  T(s, 'Animé par le gérant', { x: 9.7, y: 6.05, w: 2.83, h: 0.3, fontSize: 12, bold: true, color: K.navy, align: 'center' });
  card(s, 0.6, 6.12, 8.6, 0.5, H.OL, { noShadow: true, noLine: true });
  T(s, [{ text: 'Aucune cible chiffrée à ce stade : ', options: { bold: true } }, { text: 'les objectifs seront fixés après établissement des situations de référence.' }], { x: 0.8, y: 6.12, w: 8.3, h: 0.5, valign: 'middle', fontSize: 13, color: K.ink });
  s.addNotes('Cinq dimensions, un nombre limité d\'indicateurs. Les fréquences sont des propositions. Les cibles seront arrêtées après une première période de mesure.');
}

function slide17() {
  const s = content(SEC.mo, 'CONCLUSION ET DÉCISIONS ATTENDUES', '2027 : une nouvelle étape dans la structuration et la performance du Groupe', 'Sombre');
  const amb = [['LuLandmark', 'Une gouvernance mieux structurée', H.BLUE], ['LuUsers', 'Un capital humain mieux organisé et plus performant', H.ORANGE], ['LuBrainCircuit', 'Un Groupe plus innovant grâce à l\'intelligence artificielle', '5B86FF']];
  amb.forEach(([ic, t, hex], i) => {
    const y = 2.1 + i * 1.12;
    card(s, 0.6, y, 5.6, 0.92, H.NAVY2, { noLine: true, noShadow: true });
    icon(s, ic, 0.8, y + 0.17, 0.58, H.WHITE, hex);
    T(s, t, { x: 1.6, y, w: 4.45, h: 0.92, fontSize: 16, bold: true, color: K.white, valign: 'middle' });
  });
  card(s, 6.5, 2.05, 6.23, 3.35, K.white, { noLine: true });
  T(s, 'DÉCISIONS ATTENDUES DE LA DIRECTION GÉNÉRALE', { x: 6.75, y: 2.18, w: 5.8, h: 0.3, fontSize: 11, bold: true, color: K.blue, charSpacing: 1 });
  const dec = ['Validation des trois axes stratégiques', 'Validation des orientations organisationnelles', 'Arbitrage des priorités de mise en œuvre', 'Validation du dispositif de pilotage', 'Définition des prochaines étapes opérationnelles'];
  dec.forEach((t, i) => {
    num(s, i + 1, 6.75, 2.6 + i * 0.54, 0.38, i % 2 ? K.orange : K.blue, K.white, 12);
    T(s, t, { x: 7.27, y: 2.57 + i * 0.54, w: 5.3, h: 0.44, fontSize: 15, color: K.ink, valign: 'middle' });
  });
  card(s, 3.17, 5.65, 7.0, 1.05, K.white, { noLine: true });
  logo(s, 'kcs', 4.4, 6.175, 1.75, 0.62);
  logo(s, 'rlcs', 6.67, 6.175, 2.0, 0.55);
  logo(s, 'luke', 8.9, 6.175, 1.9, 0.5);
  s.addNotes('Conclusion : trois ambitions, cinq décisions attendues. La présentation est une proposition structurée, soumise à l\'appréciation et à la validation de la Direction Générale.');
}

// ---------------------------------------------------------------- Rendu
(async () => {
  const src = fs.readFileSync(__filename, 'utf8');
  const names = [...new Set(src.match(/'Lu[A-Z][A-Za-z0-9]+'/g).map((x) => x.slice(1, -1)))];
  const palette = [H.BLUE, H.ORANGE, H.NAVY, H.WHITE, H.RLB, H.TEAL, 'FFB39E'];
  for (const n of names) for (const c of palette) await iconData(n, c);
  [slide01, slide02, slide03, slide04, slide05, slide06, slide07, slide08, slide09, slide10, slide11, slide12, slide13, slide14, slide15, slide16, slide17].forEach((f) => f());
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('écrit', OUT);
})().catch((e) => { console.error(e); process.exit(1); });
