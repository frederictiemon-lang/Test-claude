// ORA — Présentation de l'identité visuelle (16:9, 10 slides)
const path = require('path');
const sharp = require('sharp');
const pptxgen = require('pptxgenjs');
const { applyTheme } = require('/root/.claude/skills/synced/264bb811-9d13-4dd7-8fc1-03af533e7802_e2e44a3b-7bdf-4cd0-82e8-eb2f0916b742/pptx/scripts/apply_theme.js');

const RENDER = path.resolve(__dirname, '../render');
const IMG = (f) => path.join(RENDER, f);
const OUTFILE = process.argv[2] || path.resolve(__dirname, '../out/ORA_Presentation_Identite_Visuelle.pptx');

const THEME = {
  name: 'ORA',
  headFontFace: 'Cormorant Garamond',
  bodyFontFace: 'Manrope',
  colors: {
    dk1: '000000', lt1: 'FFFFFF', dk2: '2B2926', lt2: 'F5F1E9',
    accent1: '000000', accent2: 'F5F1E9', accent3: '6B655B', accent4: 'D8D1C4', accent5: 'A39C90', accent6: '1C1B19',
    hlink: '000000', folHlink: '6B655B',
  },
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = 'ORA · Présentation de l’identité visuelle';
pres.subject = 'Identité visuelle ORA, proposition pour validation';
pres.author = 'ORA';

const C = pres.SchemeColor;
const NOIR = C.text1, BLANC = C.background1, IVOIRE = C.background2;
const GRIS = C.accent3, LIGNE = C.accent4, GRIS_CLAIR = C.accent5, NOIR_DOUX = C.accent6;
const SERIF = '+mj-lt', SANS = '+mn-lt';

const SW = 13.333, MX = 0.75, CW = SW - 2 * MX, TOP = 1.85, BOT = 6.75;

// ---------- Layouts ----------
function frameLayout(name, bg, titleColor, kickerColor, footerColor) {
  pres.defineSlideMaster({
    title: name,
    background: { color: bg },
    margin: [0.5, 0.75, 0.5, 0.75],
    objects: [
      { placeholder: { options: { name: 'kicker', type: 'body', x: MX, y: 0.5, w: 9.5, h: 0.3, fontSize: 10, bold: true, charSpacing: 3, color: kickerColor, margin: 0, valign: 'top' }, text: '' } },
      { placeholder: { options: { name: 'title', type: 'title', x: MX, y: 0.82, w: CW, h: 0.85, fontSize: 38, color: titleColor, margin: 0, valign: 'top', align: 'left' }, text: '' } },
      { text: { text: 'ORA  ·  Présentation de l’identité visuelle', options: { x: MX, y: 7.0, w: 6, h: 0.25, fontSize: 10, color: footerColor, margin: 0, isTextBox: true } } },
    ],
    slideNumber: { x: SW - MX - 0.6, y: 7.0, w: 0.6, h: 0.25, fontSize: 10, color: footerColor, align: 'right', margin: 0 },
  });
}
frameLayout('ORA_IVOIRE', IVOIRE, NOIR, GRIS, GRIS);
frameLayout('ORA_NOIR', NOIR, IVOIRE, GRIS_CLAIR, GRIS_CLAIR);
pres.defineSlideMaster({ title: 'ORA_COUVERTURE', background: { color: IVOIRE }, objects: [] });

// ---------- Helpers ----------
const dims = {};
async function loadDims(files) { for (const f of files) { const m = await sharp(IMG(f)).metadata(); dims[f] = { w: m.width, h: m.height }; } }
// Logo PNGs carry a 2% transparent margin around the ink (20 units per 1000).
function logo(slide, file, inkX, inkY, inkW, name) {
  const d = dims[file];
  const w = inkW * 1.04, h = w * d.h / d.w;
  slide.addImage({ path: IMG(file), x: inkX - inkW * 0.02, y: inkY - inkW * 0.02, w, h, altText: name, objectName: name });
  return { inkH: h - inkW * 0.04 };
}
function logoC(slide, file, cx, cy, inkW, name) {
  const d = dims[file];
  const w = inkW * 1.04, h = w * d.h / d.w, inkH = h - inkW * 0.04;
  return logo(slide, file, cx - inkW / 2, cy - inkH / 2, inkW, name);
}
function txt(slide, text, o) { slide.addText(text, { isTextBox: true, margin: 0, valign: 'top', fontFace: SANS, fontSize: 14, color: NOIR, ...o }); }
function newSlide(master, section, kicker, title) {
  const s = pres.addSlide({ masterName: master, sectionTitle: section });
  if (kicker) s.addText(kicker, { placeholder: 'kicker' });
  if (title) s.addText(title, { placeholder: 'title' });
  return s;
}
function rect(slide, x, y, w, h, fill, name, line) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: line || { type: 'none' }, objectName: name });
}

async function build() {
  await loadDims(['logo_complet_noir.png', 'logo_complet_ivoire.png', 'logo_symbole_noir.png', 'logo_symbole_ivoire.png',
    'decomp_cercle.png', 'decomp_diagonale.png', 'decomp_ouverture.png', 'digital_instagram.png']);

  // ===== 1. Couverture =====
  pres.addSection({ title: 'Introduction' });
  {
    const s = pres.addSlide({ masterName: 'ORA_COUVERTURE', sectionTitle: 'Introduction' });
    logo(s, 'logo_complet_noir.png', (SW - 3.0) / 2, 1.3, 3.0, 'Logo ORA, composition verticale');
    txt(s, 'PRÉSENTATION DE L’IDENTITÉ VISUELLE', { x: MX, y: 4.75, w: CW, h: 0.35, fontSize: 12, bold: true, charSpacing: 6, align: 'center' });
    txt(s, 'Votre présence, votre signature.', { x: MX, y: 5.2, w: CW, h: 0.5, fontFace: SERIF, italic: true, fontSize: 24, align: 'center' });
    txt(s, 'Proposition de direction artistique soumise à validation', { x: MX, y: 6.85, w: CW, h: 0.3, fontSize: 10, color: GRIS, align: 'center' });
    s.addNotes('Ouverture. Présenter ORA et l’objet de la rencontre : découvrir la nouvelle identité visuelle et recueillir les observations du client en vue de sa validation. Le logo est montré dans sa composition verticale, sur fond ivoire.');
  }

  // ===== 2. L'univers de la marque =====
  {
    const s = newSlide('ORA_IVOIRE', 'Introduction', 'L’UNIVERS DE LA MARQUE', 'L’accessoire comme expression de soi');
    txt(s, 'ORA est une boutique d’accessoires de mode pour hommes et femmes : montres, chaînes, bracelets et accessoires. Elle célèbre l’élégance et l’expression personnelle, à travers des pièces qui accompagnent chaque allure et affirment une présence.',
      { x: MX, y: TOP, w: 7.25, h: 1.3, fontSize: 15, lineSpacingMultiple: 1.2 });
    const values = [
      ['01', 'Élégance', 'Des lignes sobres et une allure maîtrisée : l’élégance se lit dans la retenue.'],
      ['02', 'Identité', 'Chaque accessoire exprime une personnalité et permet d’affirmer son style.'],
      ['03', 'Distinction', 'Le détail juste, celui qui distingue sans jamais forcer le trait.'],
    ];
    values.forEach(([n, name, d], i) => {
      const y = 3.55 + i * 1.07;
      s.addShape(pres.shapes.LINE, { x: MX, y, w: 7.25, h: 0, line: { color: LIGNE, width: 0.75 }, objectName: `Filet valeur ${i + 1}` });
      txt(s, n, { x: MX, y: y + 0.33, w: 0.55, h: 0.3, fontSize: 11, bold: true, color: GRIS });
      txt(s, name, { x: MX + 0.6, y: y + 0.16, w: 2.1, h: 0.5, fontFace: SERIF, fontSize: 28 });
      txt(s, d, { x: 3.55, y: y + 0.22, w: 4.45, h: 0.65, fontSize: 14, color: NOIR });
    });
    rect(s, 8.6, TOP, SW - MX - 8.6, BOT - TOP, NOIR, 'Encart noir');
    const cx = 8.6 + (SW - MX - 8.6) / 2;
    logoC(s, 'logo_symbole_ivoire.png', cx, 3.25, 1.25, 'Symbole ORA');
    txt(s, 'L’élégance\ndans chaque détail.', { x: 8.95, y: 4.3, w: SW - MX - 9.3, h: 1.1, fontFace: SERIF, italic: true, fontSize: 28, color: IVOIRE, align: 'center', valign: 'middle' });
    txt(s, 'SIGNATURE SECONDAIRE', { x: 8.95, y: 5.6, w: SW - MX - 9.3, h: 0.3, fontSize: 10, bold: true, charSpacing: 3, color: GRIS_CLAIR, align: 'center' });
    s.addNotes('Rappeler le territoire de ORA : une boutique d’accessoires de mode pour hommes et femmes (montres, chaînes, bracelets, accessoires). Trois valeurs guident l’identité : élégance, identité, distinction. La signature secondaire « L’élégance dans chaque détail » résume cet esprit.');
  }

  // ===== 3. Concept 03 — TEMPS =====
  pres.addSection({ title: 'Le symbole' });
  {
    const s = newSlide('ORA_NOIR', 'Le symbole', 'LE CONCEPT CRÉATIF  ·  03 — TEMPS', 'Le temps comme point de départ');
    txt(s, 'La réflexion créative part d’une notion inséparable de l’accessoire : le temps. Celui que l’on porte au poignet, celui que l’on traverse, celui qui donne leur valeur aux objets que l’on garde.',
      { x: MX, y: TOP, w: 6.6, h: 1.3, fontSize: 15, color: IVOIRE, lineSpacingMultiple: 1.2 });
    const pillars = [
      ['Intemporalité', 'Une forme pure, au-delà des tendances.'],
      ['Mouvement', 'Un trait qui donne une direction et une énergie.'],
      ['Précision', 'La rigueur d’une aiguille, la justesse d’un détail.'],
    ];
    pillars.forEach(([n, d], i) => {
      const y = 3.4 + i * 0.6;
      txt(s, n, { x: MX, y, w: 2.2, h: 0.45, fontFace: SERIF, fontSize: 24, color: IVOIRE });
      txt(s, d, { x: 3.05, y: y + 0.09, w: 4.3, h: 0.35, fontSize: 14, color: GRIS_CLAIR });
    });
    txt(s, 'L’IDÉE CENTRALE', { x: MX, y: 5.45, w: 4, h: 0.3, fontSize: 10, bold: true, charSpacing: 3, color: GRIS_CLAIR });
    txt(s, 'Créer une signature visuelle capable de représenter ORA au-delà de son nom.', { x: MX, y: 5.78, w: 6.6, h: 0.9, fontFace: SERIF, italic: true, fontSize: 24, color: IVOIRE });
    logoC(s, 'logo_symbole_ivoire.png', 10.15, 4.3, 3.6, 'Symbole ORA, concept 03 TEMPS');
    s.addNotes('Le concept 03, TEMPS, est à l’origine du symbole. Il s’appuie sur trois idées : l’intemporalité, le mouvement et la précision. L’ambition : un signe capable de représenter ORA à lui seul, même sans le nom.');
  }

  // ===== 4. Signification du symbole =====
  {
    const s = newSlide('ORA_IVOIRE', 'Le symbole', 'LA SIGNIFICATION DU SYMBOLE', 'Trois éléments, une seule signature');
    txt(s, 'Lecture créative proposée pour la marque', { x: 8.08, y: 0.5, w: 4.5, h: 0.3, fontSize: 10, italic: true, color: GRIS, align: 'right' });
    const parts = [
      ['decomp_cercle.png', '01', 'Le cercle', 'CONTINUITÉ · DURABILITÉ · INTEMPORALITÉ', 'Une forme sans début ni fin, qui évoque le cadran, la boucle d’un bracelet et le temps qui dure.'],
      ['decomp_diagonale.png', '02', 'Le mouvement diagonal', 'PRÉCISION · MOUVEMENT · DISTINCTION', 'Le trait traverse le cercle comme une aiguille : il lui donne une direction, un élan, une tension maîtrisée.'],
      ['decomp_ouverture.png', '03', 'L’ouverture du cercle', 'LIBERTÉ · ÉVOLUTION · MOUVEMENT', 'Le cercle s’ouvre là où passe le trait. La forme respire et suggère une marque libre, qui évolue et avance.'],
    ];
    const cw = (CW - 2 * 0.3) / 3;
    parts.forEach(([img, n, name, kw, d], i) => {
      const x = MX + i * (cw + 0.3);
      rect(s, x, 1.8, cw, 4.4, BLANC, `Carte ${name}`);
      const iw = 1.7, ih = iw * dims[img].h / dims[img].w;
      s.addImage({ path: IMG(img), x: x + (cw - iw) / 2, y: 2.02, w: iw, h: ih, altText: `Symbole ORA, mise en évidence : ${name.toLowerCase()}`, objectName: `Schéma ${name}` });
      txt(s, n, { x: x + 0.3, y: 2.05, w: 0.6, h: 0.3, fontSize: 11, bold: true, color: GRIS });
      txt(s, name, { x: x + 0.3, y: 3.84, w: cw - 0.45, h: 0.42, fontFace: SERIF, fontSize: 22 });
      txt(s, kw, { x: x + 0.3, y: 4.32, w: cw - 0.6, h: 0.3, fontSize: 10, bold: true, charSpacing: 0.5, color: GRIS });
      txt(s, d, { x: x + 0.3, y: 4.7, w: cw - 0.6, h: 1.35, fontSize: 14, lineSpacingMultiple: 1.1 });
    });
    txt(s, 'Réunis, ces trois éléments composent un signe simple et mémorable : un objet du quotidien qui devient une signature.', { x: MX, y: 6.38, w: CW, h: 0.35, fontSize: 14, fontFace: SERIF, italic: true });
    s.addNotes('Décomposer le symbole sans le modifier : en noir, l’élément commenté ; en teinte claire, le reste du signe. 1) Le cercle : continuité, durabilité, intemporalité. 2) Le mouvement diagonal : précision, mouvement, distinction. 3) L’ouverture du cercle : liberté, évolution, mouvement. Préciser qu’il s’agit de la signification créative proposée pour la marque.');
  }

  // ===== 5. Présentation du logo =====
  pres.addSection({ title: 'Le logo' });
  {
    const s = newSlide('ORA_IVOIRE', 'Le logo', 'PRÉSENTATION DU LOGO', 'L’équilibre du signe et du nom');
    rect(s, MX, TOP, 6.8, 4.9, BLANC, 'Panneau construction');
    s.addImage({ path: IMG('construction_logo.png'), x: MX, y: TOP, w: 6.8, h: 4.9, altText: 'Logo ORA en composition verticale avec repères de construction : symbole de largeur D, nom de largeur 2 D, espacement D/4, axe central commun', objectName: 'Construction du logo' });
    const rx = 8.0, rw = SW - MX - rx;
    const items = [
      ['LE SYMBOLE', 'Placé au-dessus du nom, il ouvre la lecture et porte le concept TEMPS.'],
      ['LE NOM ORA', 'Des capitales à empattements, aux contrastes fins et aux proportions classiques.'],
      ['LA COMPOSITION VERTICALE', 'Un axe central commun et un espace calibré entre le signe et le nom.'],
    ];
    items.forEach(([k, d], i) => {
      const y = TOP + i * 0.98;
      txt(s, k, { x: rx, y, w: rw, h: 0.3, fontSize: 10, bold: true, charSpacing: 3, color: GRIS });
      txt(s, d, { x: rx, y: y + 0.32, w: rw, h: 0.6, fontSize: 14 });
    });
    const q = [['Sobriété', 'Deux couleurs, aucun effet.'], ['Lisibilité', 'Des formes pleines et nettes.'], ['Élégance', 'Le contraste des empattements.']];
    const qw = (rw - 0.4) / 3;
    q.forEach(([n, d], i) => {
      const x = rx + i * (qw + 0.2);
      txt(s, n, { x, y: 4.95, w: qw, h: 0.45, fontFace: SERIF, italic: true, fontSize: 22 });
      txt(s, d, { x, y: 5.42, w: qw, h: 0.6, fontSize: 11, color: GRIS });
    });
    txt(s, 'Proportions de la composition verticale proposées pour validation.', { x: rx, y: 6.45, w: rw, h: 0.3, fontSize: 10, italic: true, color: GRIS });
    s.addNotes('Le logo complet associe le symbole et le nom ORA dans une composition verticale. Règle de construction proposée : le symbole mesure la moitié de la largeur du nom (D et 2 D), l’espace entre les deux vaut un quart du diamètre du symbole, et les deux éléments partagent le même axe central. Insister sur la sobriété, la lisibilité et l’élégance.');
  }

  // ===== 6. Versions du logo =====
  {
    const s = newSlide('ORA_IVOIRE', 'Le logo', 'LES VERSIONS DU LOGO', 'Deux versions, des usages complémentaires');
    const colW = (CW - 0.5) / 2, tileW = (colW - 0.2) / 2, tileH = 2.1;
    const versions = [
      { k: 'VERSION 1', t: 'Le symbole seul', d: 'La forme la plus concise de la marque, pour les formats réduits et les supports où ORA est déjà identifiée.',
        u: ['Photo de profil, favicon, icône d’application', 'Gravure sur cadran, fermoir ou boucle', 'Étiquettes, marquage à chaud, motif de packaging'],
        pos: (s, cx, cy) => logoC(s, 'logo_symbole_noir.png', cx, cy, 1.15, 'Symbole ORA noir'), neg: (s, cx, cy) => logoC(s, 'logo_symbole_ivoire.png', cx, cy, 1.15, 'Symbole ORA ivoire') },
      { k: 'VERSION 2', t: 'Le symbole accompagné du nom', d: 'La version de référence : elle présente la marque dans son intégralité, en particulier lors des premiers contacts.',
        u: ['Enseigne, vitrine et sac boutique', 'Packaging, carte de visite et papeterie', 'Couverture des réseaux sociaux, site internet'],
        pos: (s, cx, cy) => logoC(s, 'logo_complet_noir.png', cx, cy, 1.5, 'Logo ORA complet noir'), neg: (s, cx, cy) => logoC(s, 'logo_complet_ivoire.png', cx, cy, 1.5, 'Logo ORA complet ivoire') },
    ];
    versions.forEach((v, i) => {
      const x = MX + i * (colW + 0.5);
      rect(s, x, TOP, tileW, tileH, BLANC, `Fond clair version ${i + 1}`);
      rect(s, x + tileW + 0.2, TOP, tileW, tileH, NOIR, `Fond noir version ${i + 1}`);
      v.pos(s, x + tileW / 2, TOP + tileH / 2 - 0.12);
      v.neg(s, x + tileW * 1.5 + 0.2, TOP + tileH / 2 - 0.12);
      txt(s, 'Noir sur fond clair', { x, y: TOP + tileH - 0.32, w: tileW, h: 0.25, fontSize: 10, color: GRIS, align: 'center' });
      txt(s, 'Ivoire sur fond noir', { x: x + tileW + 0.2, y: TOP + tileH - 0.32, w: tileW, h: 0.25, fontSize: 10, color: GRIS_CLAIR, align: 'center' });
      txt(s, v.k, { x, y: 4.13, w: colW, h: 0.28, fontSize: 10, bold: true, charSpacing: 3, color: GRIS });
      txt(s, v.t, { x, y: 4.38, w: colW, h: 0.45, fontFace: SERIF, fontSize: 24 });
      txt(s, v.d, { x, y: 4.86, w: colW, h: 0.62, fontSize: 14 });
      txt(s, 'USAGES RECOMMANDÉS', { x, y: 5.6, w: colW, h: 0.28, fontSize: 10, bold: true, charSpacing: 3, color: GRIS });
      s.addText(v.u.map((t, k) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: k < v.u.length - 1 } })),
        { x, y: 5.88, w: colW, h: 0.95, fontFace: SANS, fontSize: 14, color: NOIR, margin: 0, valign: 'top', paraSpaceAfter: 2, isTextBox: true });
    });
    s.addNotes('Deux versions validées. Le symbole seul : formats réduits, gravures, étiquettes, réseaux sociaux. Le symbole accompagné du nom : version de référence pour l’enseigne, le packaging, la papeterie. Chaque version existe en noir sur fond clair et en ivoire sur fond noir.');
  }

  // ===== 7. Direction artistique =====
  pres.addSection({ title: 'Univers et applications' });
  {
    const s = newSlide('ORA_IVOIRE', 'Univers et applications', 'UNIVERS ET DIRECTION ARTISTIQUE', 'Une direction sobre, lumineuse et précise');
    const ax = MX, aw = 3.2, bx = ax + aw + 0.3, bw = 3.85, cx = bx + bw + 0.3, cw = SW - MX - cx;
    const h1 = 2.3, y2 = TOP + h1 + 0.3;
    // A: palette
    rect(s, ax, TOP, aw, h1, NOIR, 'Couleur noir profond');
    txt(s, 'Noir profond', { x: ax + 0.3, y: TOP + 1.3, w: aw - 0.6, h: 0.45, fontFace: SERIF, fontSize: 24, color: IVOIRE });
    txt(s, '#000000  ·  RVB 0 0 0', { x: ax + 0.3, y: TOP + 1.8, w: aw - 0.6, h: 0.28, fontSize: 11, color: GRIS_CLAIR });
    const pw = (aw - 0.3) / 2;
    rect(s, ax, y2, pw, h1, IVOIRE, 'Couleur ivoire', { color: LIGNE, width: 0.75 });
    rect(s, ax + pw + 0.3, y2, pw, h1, BLANC, 'Couleur blanc', { color: LIGNE, width: 0.75 });
    [['Ivoire', '#F5F1E9', 'RVB 245 241 233', ax], ['Blanc', '#FFFFFF', 'RVB 255 255 255', ax + pw + 0.3]].forEach(([n, hx, rgb, x]) => {
      txt(s, n, { x: x + 0.2, y: y2 + 1.2, w: pw - 0.3, h: 0.4, fontFace: SERIF, fontSize: 22 });
      txt(s, [{ text: hx, options: { breakLine: true } }, { text: rgb }], { x: x + 0.2, y: y2 + 1.65, w: pw - 0.3, h: 0.45, fontSize: 10, color: GRIS });
    });
    // B: typography + whitespace
    rect(s, bx, TOP, bw, h1, BLANC, 'Typographies');
    const hw = bw / 2;
    txt(s, 'Aa', { x: bx + 0.3, y: TOP + 0.2, w: hw - 0.3, h: 1.1, fontFace: SERIF, fontSize: 64 });
    txt(s, 'Aa', { x: bx + hw + 0.1, y: TOP + 0.3, w: hw - 0.3, h: 1.0, fontFace: SANS, fontSize: 52 });
    txt(s, [{ text: 'Cormorant Garamond', options: { bold: true, breakLine: true } }, { text: 'Titres', options: { color: GRIS } }], { x: bx + 0.3, y: TOP + 1.55, w: hw - 0.35, h: 0.5, fontSize: 10 });
    txt(s, [{ text: 'Manrope', options: { bold: true, breakLine: true } }, { text: 'Textes', options: { color: GRIS } }], { x: bx + hw + 0.1, y: TOP + 1.55, w: hw - 0.35, h: 0.5, fontSize: 10 });
    rect(s, bx, y2, bw, h1, BLANC, 'Espaces généreux');
    txt(s, 'Espaces généreux', { x: bx + 0.3, y: y2 + 1.15, w: bw - 0.6, h: 0.42, fontFace: SERIF, fontSize: 22 });
    txt(s, 'Le vide met l’objet en valeur. Des compositions aérées, jamais surchargées.', { x: bx + 0.3, y: y2 + 1.6, w: bw - 0.6, h: 0.5, fontSize: 11, color: GRIS });
    // C: photography direction
    rect(s, cx, TOP, cw, BOT - TOP, BLANC, 'Direction photographique');
    const ph = cw * 980 / 1330;
    s.addImage({ path: IMG('photo_direction.jpg'), x: cx, y: TOP, w: cw, h: ph, altText: 'Image de principe : montre posée sur un fond ivoire uni, lumière douce', objectName: 'Image de principe photo' });
    txt(s, 'Photographies d’accessoires', { x: cx + 0.3, y: TOP + ph + 0.2, w: cw - 0.6, h: 0.42, fontFace: SERIF, fontSize: 22 });
    txt(s, 'Un objet, une lumière douce, un fond uni. Des cadrages serrés qui révèlent la matière.', { x: cx + 0.3, y: TOP + ph + 0.64, w: cw - 0.6, h: 0.45, fontSize: 11, color: NOIR });
    txt(s, 'Image de principe, à remplacer par les photographies des produits de la boutique.', { x: cx + 0.3, y: TOP + ph + 1.12, w: cw - 0.6, h: 0.4, fontSize: 10, italic: true, color: GRIS });
    s.addNotes('Direction artistique : noir profond, ivoire et blanc ; titres en Cormorant Garamond, textes en Manrope ; des espaces généreux ; une photographie d’accessoires sobre (un objet, une lumière douce, un fond uni). L’image affichée est une image de principe, à remplacer par les vraies photographies des produits.');
  }

  // ===== 8. Mises en situation =====
  {
    const s = newSlide('ORA_IVOIRE', 'Univers et applications', 'MISES EN SITUATION', 'Une signature sur chaque support');
    txt(s, 'Simulations réalisées à partir du logo fourni', { x: 8.08, y: 0.5, w: 4.5, h: 0.3, fontSize: 10, italic: true, color: GRIS, align: 'right' });
    const mocks = [['mock_ecrin.jpg', 'Écrin de montre'], ['mock_sac.jpg', 'Sac boutique'], ['mock_boite.jpg', 'Boîte d’emballage'],
      ['mock_carte.jpg', 'Carte de visite'], ['mock_etiquette.jpg', 'Étiquette d’accessoire'], ['mock_gravure.jpg', 'Gravure sur le cadran d’une montre']];
    const iw = (CW - 2 * 0.3) / 3, ih = iw * 800 / 1500;
    mocks.forEach(([f, cap], i) => {
      const x = MX + (i % 3) * (iw + 0.3), y = TOP + Math.floor(i / 3) * (ih + 0.6);
      s.addImage({ path: IMG(f), x, y, w: iw, h: ih, altText: `Mise en situation du logo ORA : ${cap.toLowerCase()}`, objectName: `Maquette ${cap}` });
      txt(s, [{ text: String(i + 1).padStart(2, '0') + '   ', options: { color: GRIS, bold: true } }, { text: cap }], { x, y: y + ih + 0.08, w: iw, h: 0.28, fontSize: 11 });
    });
    s.addNotes('Mises en situation simulées à partir du logo fourni, sans déformation : écrin de montre, sac boutique, boîte d’emballage, carte de visite, étiquette d’accessoire, gravure sur le cadran. Les couleurs restent celles de la palette : noir, ivoire, blanc, et des finitions sobres (dorure à chaud ivoire, gaufrage à sec, gravure).');
  }

  // ===== 9. Présence digitale =====
  {
    const s = newSlide('ORA_IVOIRE', 'Univers et applications', 'PRÉSENCE DIGITALE', 'Une identité cohérente sur tous les écrans');
    const capH = 0.28;
    const phoneW = 2.19, phoneH = phoneW * dims['digital_instagram.png'].h / dims['digital_instagram.png'].w;
    s.addImage({ path: IMG('digital_instagram.png'), x: MX, y: TOP, w: phoneW, h: phoneH, altText: 'Exemple de profil Instagram ORA sur smartphone', objectName: 'Profil Instagram' });
    const rx = MX + phoneW + 0.4, rw = SW - MX - rx;
    const hA = (rw - 0.3) / (1640 / 608 + 1), fbW = hA * 1640 / 608;
    s.addImage({ path: IMG('digital_facebook.jpg'), x: rx, y: TOP, w: fbW, h: hA, altText: 'Exemple de couverture Facebook ORA', objectName: 'Couverture Facebook' });
    s.addImage({ path: IMG('post_lancement.png'), x: rx + fbW + 0.3, y: TOP, w: hA, h: hA, altText: 'Exemple de publication de lancement ORA', objectName: 'Publication de lancement' });
    s.addShape(pres.shapes.RECTANGLE, { x: rx + fbW + 0.3, y: TOP, w: hA, h: hA, fill: { type: 'none' }, line: { color: LIGNE, width: 0.75 }, objectName: 'Contour publication' });
    const yB = TOP + hA + capH + 0.32;
    const hB = (rw - 0.3) / (16 / 9 + 2156 / 500), bW = hB * 16 / 9, sbW = hB * 2156 / 500;
    s.addImage({ path: IMG('digital_boutique.jpg'), x: rx, y: yB, w: bW, h: hB, altText: 'Exemple de visuel de présentation de la boutique ORA', objectName: 'Visuel boutique' });
    s.addImage({ path: IMG('digital_storyboard.jpg'), x: rx + bW + 0.3, y: yB, w: sbW, h: hB, altText: 'Storyboard de l’animation d’introduction du logo en quatre étapes', objectName: 'Storyboard animation' });
    const cap = (t, x, y, w) => txt(s, t, { x, y, w, h: capH, fontSize: 11, color: NOIR });
    cap('Profil Instagram', MX, TOP + phoneH + 0.08, phoneW);
    cap('Couverture Facebook', rx, TOP + hA + 0.08, fbW);
    cap('Publication de lancement', rx + fbW + 0.3, TOP + hA + 0.08, hA);
    cap('Présentation de la boutique', rx, yB + hB + 0.08, bW);
    cap('Animation d’introduction du logo  ·  vidéo de 5 secondes fournie', rx + bW + 0.3, yB + hB + 0.08, sbW);
    s.addNotes('Déclinaisons digitales possibles : photo de profil Instagram (symbole ivoire sur fond noir), couverture Facebook, visuel de présentation de la boutique, publication de lancement et animation d’introduction du logo. L’animation (fichier vidéo de 5 secondes fourni avec la présentation) trace le cercle, fait apparaître le trait diagonal, puis le nom ORA et la signature.');
  }

  // ===== 10. Conclusion et validation =====
  pres.addSection({ title: 'Validation' });
  {
    const s = newSlide('ORA_NOIR', 'Validation', 'CONCLUSION ET VALIDATION', 'ORA, une signature qui traverse le temps');
    txt(s, '« À travers cette identité visuelle, notre ambition est de donner à ORA une signature reconnaissable, élégante et intemporelle. Une identité qui accompagne la marque dans son développement et qui s’exprime jusque dans les moindres détails. »',
      { x: MX, y: TOP + 0.05, w: 6.9, h: 2.1, fontFace: SERIF, italic: true, fontSize: 22, color: IVOIRE, lineSpacingMultiple: 1.05 });
    txt(s, 'ORA — Votre présence, votre signature.', { x: MX, y: 4.15, w: 6.9, h: 0.5, fontFace: SERIF, fontSize: 26, color: IVOIRE });
    txt(s, 'Nous vous invitons à nous faire part de vos observations. Vos retours nous permettront d’ajuster la proposition et de valider ensemble la direction retenue.',
      { x: MX, y: 5.85, w: 6.6, h: 0.9, fontSize: 14, color: GRIS_CLAIR, lineSpacingMultiple: 1.15 });
    // Validation form
    const bx = 8.35, bw = SW - MX - bx, pad = 0.35;
    s.addShape(pres.shapes.RECTANGLE, { x: bx, y: TOP, w: bw, h: BOT - TOP, fill: { color: NOIR_DOUX }, line: { color: GRIS, width: 0.75 }, objectName: 'Bloc de validation' });
    txt(s, 'Votre validation', { x: bx + pad, y: TOP + 0.28, w: bw - 2 * pad, h: 0.5, fontFace: SERIF, fontSize: 26, color: IVOIRE });
    ['Proposition validée', 'Validée avec ajustements', 'À retravailler'].forEach((t, i) => {
      const y = TOP + 1.0 + i * 0.48;
      s.addShape(pres.shapes.RECTANGLE, { x: bx + pad, y: y + 0.05, w: 0.2, h: 0.2, fill: { type: 'none' }, line: { color: IVOIRE, width: 0.75 }, objectName: `Case ${t}` });
      txt(s, t, { x: bx + pad + 0.38, y, w: bw - 2 * pad - 0.4, h: 0.32, fontSize: 14, color: IVOIRE });
    });
    txt(s, 'OBSERVATIONS', { x: bx + pad, y: TOP + 2.55, w: 2.5, h: 0.28, fontSize: 10, bold: true, charSpacing: 3, color: GRIS_CLAIR });
    [3.25, 3.7].forEach((dy, i) => s.addShape(pres.shapes.LINE, { x: bx + pad, y: TOP + dy, w: bw - 2 * pad, h: 0, line: { color: GRIS, width: 0.75 }, objectName: `Ligne observations ${i + 1}` }));
    const half = (bw - 2 * pad - 0.3) / 2;
    [['DATE', bx + pad], ['SIGNATURE', bx + pad + half + 0.3]].forEach(([t, x]) => {
      txt(s, t, { x, y: TOP + 4.0, w: half, h: 0.28, fontSize: 10, bold: true, charSpacing: 3, color: GRIS_CLAIR });
      s.addShape(pres.shapes.LINE, { x, y: TOP + 4.6, w: half, h: 0, line: { color: GRIS, width: 0.75 }, objectName: `Ligne ${t.toLowerCase()}` });
    });
    s.addNotes('Conclure sur l’ambition de l’identité : une signature reconnaissable, élégante et intemporelle. Inviter le client à formuler ses observations, puis à indiquer son choix dans le bloc de validation (validée, validée avec ajustements, à retravailler).');
  }

  await pres.writeFile({ fileName: OUTFILE });
  await applyTheme(OUTFILE, THEME);
  console.log('written', OUTFILE);
}
build().catch((e) => { console.error(e); process.exit(1); });
