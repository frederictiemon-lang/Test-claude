// ORA, charte graphique officielle (16:9, 15 pages). Noir #000000 et blanc #FFFFFF exclusivement.
const path = require('path');
const sharp = require('sharp');
const pptxgen = require('pptxgenjs');
const { applyTheme } = require('/root/.claude/skills/synced/264bb811-9d13-4dd7-8fc1-03af533e7802_e2e44a3b-7bdf-4cd0-82e8-eb2f0916b742/pptx/scripts/apply_theme.js');

const RENDER = path.resolve(__dirname, '../render_charte');
const IMG = (f) => path.join(RENDER, f);
const OUTFILE = process.argv[2];
const SIG = 'RELEVER VOTRE AURA.';

const THEME = {
  name: 'ORA Charte', headFontFace: 'Cormorant Garamond', bodyFontFace: 'Manrope',
  colors: { dk1: '000000', lt1: 'FFFFFF', dk2: '000000', lt2: 'FFFFFF', accent1: '000000', accent2: 'FFFFFF', accent3: '000000', accent4: 'FFFFFF', accent5: '000000', accent6: 'FFFFFF', hlink: '000000', folHlink: '000000' },
};
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = 'ORA · Charte graphique officielle';
pres.subject = 'Charte graphique officielle de ORA. RELEVER VOTRE AURA.';
pres.author = 'ORA';
const C = pres.SchemeColor;
const NOIR = C.text1, BLANC = C.background1;
const SERIF = '+mj-lt', SANS = '+mn-lt';
const SW = 13.333, MX = 0.75, CW = SW - 2 * MX, TOP = 1.85, BOT = 6.75;

function layout(name, bg, fg) {
  pres.defineSlideMaster({
    title: name, background: { color: bg }, margin: [0.5, 0.75, 0.5, 0.75],
    objects: [
      { placeholder: { options: { name: 'kicker', type: 'body', x: MX, y: 0.5, w: 9.5, h: 0.3, fontSize: 10, bold: true, charSpacing: 3, color: fg, margin: 0, valign: 'top' }, text: '' } },
      { placeholder: { options: { name: 'title', type: 'title', x: MX, y: 0.82, w: CW, h: 0.85, fontSize: 36, color: fg, margin: 0, valign: 'top', align: 'left' }, text: '' } },
      { text: { text: 'ORA  ·  Charte graphique officielle', options: { x: MX, y: 7.0, w: 5, h: 0.25, fontSize: 10, color: fg, margin: 0, isTextBox: true } } },
      { text: { text: SIG, options: { x: 7.4, y: 6.98, w: 4.5, h: 0.28, fontFace: SERIF, fontSize: 11, charSpacing: 3, color: fg, margin: 0, align: 'right', isTextBox: true } } },
    ],
    slideNumber: { x: SW - MX - 0.45, y: 7.0, w: 0.45, h: 0.25, fontSize: 10, color: fg, align: 'right', margin: 0 },
  });
}
layout('CH_BLANC', BLANC, NOIR);
layout('CH_NOIR', NOIR, BLANC);
pres.defineSlideMaster({ title: 'CH_COUVERTURE', background: { color: BLANC }, objects: [] });

const dims = {};
async function loadDims(files) { for (const f of files) { const m = await sharp(IMG(f)).metadata(); dims[f] = { w: m.width, h: m.height }; } }
function logo(s, file, inkX, inkY, inkW, name) {
  const d = dims[file], w = inkW * 1.04, h = w * d.h / d.w;
  s.addImage({ path: IMG(file), x: inkX - inkW * 0.02, y: inkY - inkW * 0.02, w, h, altText: name, objectName: name });
}
function logoC(s, file, cx, cy, inkW, name) {
  const d = dims[file], w = inkW * 1.04, h = w * d.h / d.w, inkH = h - inkW * 0.04;
  logo(s, file, cx - inkW / 2, cy - inkH / 2, inkW, name);
}
function txt(s, t, o) { s.addText(t, { isTextBox: true, margin: 0, valign: 'top', fontFace: SANS, fontSize: 14, color: NOIR, ...o }); }
function label(s, t, x, y, w, color = NOIR) { txt(s, t, { x, y, w, h: 0.26, fontSize: 10, bold: true, charSpacing: 3, color }); }
function frame(s, x, y, w, h, name, color = NOIR) { s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { type: 'none' }, line: { color, width: 0.75 }, objectName: name }); }
function box(s, x, y, w, h, fill, name) { s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { type: 'none' }, objectName: name }); }
function img(s, f, x, y, w, h, alt, framed = true, cover = false) {
  const o = { path: IMG(f), x, y, w, h, altText: alt, objectName: alt.slice(0, 60) };
  if (cover) o.sizing = { type: 'cover', w, h };
  s.addImage(o);
  if (framed) frame(s, x, y, w, h, 'Cadre ' + alt.slice(0, 40));
}
function page(master, section, kicker, title) {
  const s = pres.addSlide({ masterName: master, sectionTitle: section });
  s.addText(kicker, { placeholder: 'kicker' });
  s.addText(title, { placeholder: 'title' });
  return s;
}
const sig = (s, x, y, w, size, color, align = 'left') => txt(s, SIG, { x, y, w, h: size / 50 + 0.15, fontFace: SERIF, fontSize: size, charSpacing: Math.round(size / 4), color, align });

async function build() {
  await loadDims(['logo_noir.png', 'logo_blanc.png', 'symbole_noir.png', 'symbole_blanc.png', 'decomp_cercle.png', 'digital_instagram.png']);

  // ===== 1. Couverture =====
  pres.addSection({ title: 'La marque' });
  {
    const s = pres.addSlide({ masterName: 'CH_COUVERTURE', sectionTitle: 'La marque' });
    logo(s, 'logo_noir.png', (SW - 3.0) / 2, 1.2, 3.0, 'Logo ORA');
    txt(s, 'CHARTE GRAPHIQUE OFFICIELLE', { x: MX, y: 4.65, w: CW, h: 0.35, fontSize: 13, bold: true, charSpacing: 7, align: 'center' });
    sig(s, MX, 5.15, CW, 22, NOIR, 'center');
    txt(s, 'Édition de novembre 2026', { x: MX, y: 6.85, w: CW, h: 0.3, fontSize: 10, align: 'center' });
    s.addNotes('Couverture de la charte graphique officielle de ORA : logo officiel au centre, sur fond blanc, et signature RELEVER VOTRE AURA.');
  }

  // ===== 2. Présentation de la marque =====
  {
    const s = page('CH_BLANC', 'La marque', '02  ·  PRÉSENTATION DE LA MARQUE', 'L’accessoire, expression de la personnalité');
    [['ACTIVITÉ', 'Boutique d’accessoires de mode pour hommes et femmes.'],
     ['PRODUITS', 'Montres pour hommes et femmes, chaînes, bracelets et accessoires de mode.'],
     ['POSITIONNEMENT', 'Élégance, raffinement, modernité, distinction et expression personnelle.']].forEach(([l, t], i) => {
      label(s, l, MX, TOP + i * 0.95, 6.5); txt(s, t, { x: MX, y: TOP + 0.28 + i * 0.95, w: 6.5, h: 0.55 });
    });
    box(s, 7.55, TOP, SW - MX - 7.55, 2.3, NOIR, 'Encart philosophie');
    label(s, 'PHILOSOPHIE DE MARQUE', 7.9, TOP + 0.3, 4.4, BLANC);
    txt(s, 'Les accessoires ne sont pas de simples objets décoratifs. Ils participent à l’expression de la personnalité, renforcent le style et contribuent à révéler ce qui rend chaque individu unique.',
      { x: 7.9, y: TOP + 0.65, w: SW - MX - 8.25, h: 1.5, fontFace: SERIF, italic: true, fontSize: 18, color: BLANC });
    s.addShape(pres.shapes.LINE, { x: MX, y: 4.62, w: CW, h: 0, line: { color: NOIR, width: 0.75 }, objectName: 'Filet valeurs' });
    const vw = (CW - 3 * 0.3) / 4;
    [['01', 'Élégance', 'Des lignes sobres, une allure maîtrisée, un raffinement sans ostentation.'],
     ['02', 'Identité', 'Chaque accessoire exprime une personnalité et affirme un style propre.'],
     ['03', 'Distinction', 'Le détail juste, celui qui distingue sans jamais forcer le trait.'],
     ['04', 'Rayonnement personnel', 'Révéler ce qui rend chacun unique et lui donner de l’éclat.']].forEach(([n, t, d], i) => {
      const x = MX + i * (vw + 0.3);
      txt(s, n, { x, y: 4.8, w: 0.6, h: 0.26, fontSize: 11, bold: true });
      txt(s, t, { x, y: 5.02, w: vw, h: 0.8, fontFace: SERIF, fontSize: 24, valign: 'bottom' });
      txt(s, d, { x, y: 5.92, w: vw, h: 0.78, fontSize: 12 });
    });
    s.addNotes('Présenter ORA : une boutique d’accessoires de mode pour hommes et femmes (montres, chaînes, bracelets, accessoires), son positionnement et sa philosophie. Quatre valeurs fondamentales : élégance, identité, distinction, rayonnement personnel.');
  }

  // ===== 3. Plateforme de marque =====
  {
    const s = page('CH_NOIR', 'La marque', '03  ·  PLATEFORME DE MARQUE', 'ORA, l’aura, la signature');
    txt(s, 'aura', { x: MX, y: 1.95, w: 4.7, h: 1.4, fontFace: SERIF, italic: true, fontSize: 96, color: BLANC, align: 'center' });
    txt(s, 'SE PRONONCE  « O · RA »', { x: MX, y: 3.45, w: 4.7, h: 0.3, fontSize: 11, bold: true, charSpacing: 4, color: BLANC, align: 'center' });
    txt(s, 'En français, le mot aura et le nom ORA se prononcent de la même façon.', { x: MX + 0.35, y: 3.95, w: 4.0, h: 0.7, fontSize: 12, color: BLANC, align: 'center' });
    const rx = 6.1, rw = SW - MX - rx;
    [['LE NOM', 'ORA porte en lui l’idée d’aura. Le nom annonce une marque qui révèle plutôt qu’elle n’impose.'],
     ['L’AURA', 'Le rayonnement qui émane d’une personne : sa confiance en soi, sa personnalité, sa manière d’être au monde.'],
     ['LA SIGNATURE', 'Relever, c’est rehausser, mettre en valeur. L’accessoire ORA ne transforme pas la personne : il fait ressortir ce qu’elle est.']].forEach(([l, t], i) => {
      const y = TOP + i * 1.08;
      label(s, l, rx, y, rw, BLANC); txt(s, t, { x: rx, y: y + 0.3, w: rw, h: 0.7, fontSize: 14, color: BLANC });
    });
    s.addShape(pres.shapes.LINE, { x: MX, y: 5.2, w: CW, h: 0, line: { color: BLANC, width: 0.75 }, objectName: 'Filet signature' });
    sig(s, MX, 5.55, CW, 36, BLANC, 'center');
    s.addNotes('Relation entre le nom et la signature : en français, « aura » se prononce comme ORA. L’aura est le rayonnement personnel, la confiance en soi, la personnalité. La signature officielle RELEVER VOTRE AURA. remplace toutes les signatures précédentes.');
  }

  // ===== 4. Concept créatif =====
  pres.addSection({ title: 'Le logo' });
  {
    const s = page('CH_BLANC', 'Le logo', '04  ·  CONCEPT CRÉATIF  ·  03 — TEMPS', 'Le temps comme point de départ');
    txt(s, 'La réflexion créative part d’une notion inséparable de l’accessoire : le temps. Celui que l’on porte au poignet, celui que l’on traverse, celui qui donne leur valeur aux objets que l’on garde.',
      { x: MX, y: TOP, w: 3.95, h: 2.1, fontSize: 14, lineSpacingMultiple: 1.15 });
    label(s, 'L’IDÉE CENTRALE', MX, 4.15, 3.9);
    txt(s, 'Une signature visuelle capable de représenter ORA au-delà de son nom.', { x: MX, y: 4.45, w: 3.95, h: 1.0, fontFace: SERIF, italic: true, fontSize: 20 });
    txt(s, 'Ces interprétations constituent la philosophie graphique retenue pour ORA.', { x: MX, y: 6.2, w: 3.95, h: 0.5, fontSize: 11, italic: true });
    const px = 5.15, pw = (SW - MX - px - 0.6) / 3;
    [['decomp_cercle.png', 'Le cercle', 'CONTINUITÉ · DURABILITÉ · INTEMPORALITÉ', 'Une forme sans début ni fin, en écho à l’univers de l’horlogerie.'],
     ['decomp_diagonale.png', 'Le mouvement diagonal', 'PRÉCISION · MOUVEMENT · DISTINCTION', 'Le trait traverse le cercle comme une aiguille et lui donne une direction.'],
     ['decomp_ouverture.png', 'L’ouverture du cercle', 'LIBERTÉ · ÉVOLUTION · MOUVEMENT', 'Le cercle s’ouvre au passage du trait : la forme respire et avance.']].forEach(([f, n, k, d], i) => {
      const x = px + i * (pw + 0.3), iw = 1.75, ih = iw * dims['decomp_cercle.png'].h / dims['decomp_cercle.png'].w;
      s.addImage({ path: IMG(f), x: x + (pw - iw) / 2, y: TOP + 0.02, w: iw, h: ih, altText: `Symbole ORA, élément mis en évidence : ${n.toLowerCase()}`, objectName: `Schéma ${n}` });
      txt(s, String(i + 1).padStart(2, '0'), { x, y: TOP, w: 0.5, h: 0.26, fontSize: 11, bold: true });
      txt(s, n, { x, y: 3.7, w: pw, h: 0.7, fontFace: SERIF, fontSize: 20, valign: 'bottom' });
      txt(s, k, { x, y: 4.5, w: pw, h: 0.42, fontSize: 9.5, bold: true, charSpacing: 0.5 });
      txt(s, d, { x, y: 5.0, w: pw, h: 1.1, fontSize: 12 });
    });
    s.addNotes('Concept 03 — TEMPS. Le symbole est décomposé sans être modifié : en noir, l’élément commenté ; en contour, le reste du signe. Le cercle : continuité, durabilité, intemporalité, écho à l’horlogerie. Le mouvement diagonal : précision, mouvement, distinction. L’ouverture du cercle : liberté, évolution, mouvement.');
  }

  // ===== 5. Construction du logo =====
  {
    const s = page('CH_BLANC', 'Le logo', '05  ·  CONSTRUCTION DU LOGO', 'Le symbole et le nom, une seule composition');
    frame(s, MX, TOP, 3.0, 4.9, 'Cadre symbole seul');
    logoC(s, 'symbole_noir.png', MX + 1.5, TOP + 2.25, 1.9, 'Symbole ORA seul');
    label(s, 'LE SYMBOLE SEUL', MX + 0.25, TOP + 4.45, 2.6);
    frame(s, 4.0, TOP, 5.6, 4.9, 'Cadre logo complet');
    s.addImage({ path: IMG('construction.png'), x: 4.0 + (5.6 - 5.2) / 2, y: TOP + 0.05, w: 5.2, h: 5.2 * 1470 / 1680, altText: 'Logo ORA complet avec repères : symbole de largeur D, nom de largeur 2 D, espacement D/4, axe central', objectName: 'Construction du logo' });
    label(s, 'LE LOGO COMPLET', 4.25, TOP + 4.45, 3);
    const rx = 9.9, rw = SW - MX - rx;
    [['LE SYMBOLE', 'Signe autonome, il porte le concept 03 — TEMPS et identifie ORA sans le nom.'],
     ['LE NOM', 'Capitales à empattements : le nom installe la marque et sa lecture.'],
     ['COMPLÉMENTARITÉ', 'Le symbole attire le regard, le nom l’ancre. Réunis sur un axe central, ils forment la version de référence.']].forEach(([l, t], i) => {
      const y = TOP + i * 1.3; label(s, l, rx, y, rw); txt(s, t, { x: rx, y: y + 0.3, w: rw, h: 0.95, fontSize: 12 });
    });
    txt(s, 'Rapports fixes : symbole D, nom 2 D, espacement D/4.', { x: rx, y: 5.95, w: rw, h: 0.6, fontSize: 11, italic: true });
    s.addNotes('Le symbole seul et le logo complet sont complémentaires. Construction de la composition verticale : symbole de largeur D, nom de largeur 2 D, espacement D/4, axe central commun. Ces rapports ne varient jamais.');
  }

  // ===== 6. Versions officielles =====
  {
    const s = page('CH_BLANC', 'Le logo', '06  ·  VERSIONS OFFICIELLES', 'Quatre versions, deux couleurs');
    const tw = (CW - 3 * 0.3) / 4, th = 3.5;
    [['Logo noir sur fond blanc', 'Version de référence.', BLANC, 'logo_noir.png', 1.75],
     ['Logo blanc sur fond noir', 'Fonds noirs, packaging, digital.', NOIR, 'logo_blanc.png', 1.75],
     ['Symbole noir sur fond blanc', 'Petits formats, gravure, icônes.', BLANC, 'symbole_noir.png', 1.35],
     ['Symbole blanc sur fond noir', 'Réseaux sociaux, marquage.', NOIR, 'symbole_blanc.png', 1.35]].forEach(([t, u, bg, f, w], i) => {
      const x = MX + i * (tw + 0.3);
      if (bg === BLANC) frame(s, x, TOP, tw, th, 'Fond ' + t); else box(s, x, TOP, tw, th, NOIR, 'Fond ' + t);
      logoC(s, f, x + tw / 2, TOP + th / 2, w, t);
      txt(s, t, { x, y: TOP + th + 0.15, w: tw, h: 0.3, fontSize: 12, bold: true });
      txt(s, u, { x, y: TOP + th + 0.45, w: tw, h: 0.3, fontSize: 12 });
    });
    txt(s, 'Le logo s’utilise uniquement en aplat noir ou blanc, à partir des fichiers officiels. Son dessin n’est jamais modifié.', { x: MX, y: 6.3, w: CW, h: 0.35, fontSize: 13 });
    s.addNotes('Les quatre versions officielles : logo noir sur fond blanc, logo blanc sur fond noir, symbole noir sur fond blanc, symbole blanc sur fond noir. Fichiers fournis en SVG et PNG dans le dossier des déclinaisons monochromes.');
  }

  // ===== 7. Palette =====
  pres.addSection({ title: 'Les fondamentaux' });
  {
    const s = page('CH_BLANC', 'Les fondamentaux', '07  ·  PALETTE CHROMATIQUE', 'Le noir et le blanc, exclusivement');
    const w = (CW - 0.3) / 2, h = 3.3;
    box(s, MX, TOP, w, h, NOIR, 'Noir pur'); frame(s, MX + w + 0.3, TOP, w, h, 'Blanc pur');
    [[MX, 'Noir pur', ['HEX  #000000', 'RVB  0 · 0 · 0', 'CMJN  0 · 0 · 0 · 100'], BLANC], [MX + w + 0.3, 'Blanc pur', ['HEX  #FFFFFF', 'RVB  255 · 255 · 255', 'CMJN  0 · 0 · 0 · 0'], NOIR]].forEach(([x, n, spec, col]) => {
      txt(s, n, { x: x + 0.4, y: TOP + 1.3, w: w - 0.8, h: 0.6, fontFace: SERIF, fontSize: 32, color: col });
      txt(s, spec.map((t, k) => ({ text: t, options: { breakLine: k < spec.length - 1 } })), { x: x + 0.4, y: TOP + 2.05, w: w - 0.8, h: 0.95, fontSize: 13, color: col, lineSpacingMultiple: 1.15 });
    });
    const cw3 = (CW - 0.6) / 3;
    [['RÈGLES', 'Aucune troisième couleur. Aucun gris, beige, ivoire ou doré. Aucun dégradé. Des contrastes forts et des espaces blancs généreux.'],
     ['IMPRESSION', 'Le blanc correspond au support non imprimé, ou à un marquage blanc sur support noir. Pour les grands aplats noirs, la recette du noir se valide avec l’imprimeur.'],
     ['PHOTOGRAPHIE', 'Les photographies sont en noir et blanc. Leurs nuances viennent de la lumière sur les matières, jamais d’un aplat de couleur.']].forEach(([l, t], i) => {
      const x = MX + i * (cw3 + 0.3); label(s, l, x, 5.4, cw3); txt(s, t, { x, y: 5.7, w: cw3, h: 1.0, fontSize: 11 });
    });
    s.addNotes('Deux couleurs officielles. Noir pur : HEX #000000, RVB 0 0 0, CMJN 0 0 0 100. Blanc pur : HEX #FFFFFF, RVB 255 255 255, CMJN 0 0 0 0. Les valeurs CMJN sont la conversion directe ; la recette d’impression des grands aplats noirs est à valider avec l’imprimeur.');
  }

  // ===== 8. Typographie =====
  {
    const s = page('CH_BLANC', 'Les fondamentaux', '08  ·  TYPOGRAPHIE', 'Trois niveaux typographiques');
    const cw3 = (CW - 0.6) / 3, sh = 1.9;
    const cols = [
      { l: 'LE LOGO', n: 'Lettrage du nom ORA', t: 'Capitales à empattements, à fort contraste entre pleins et déliés. La police d’origine n’a pas été identifiée à partir des fichiers fournis : le nom s’utilise uniquement depuis les fichiers officiels du logo, jamais recomposé au clavier.' },
      { l: 'TITRES', n: 'Cormorant Garamond', t: 'Serif élégante pour les titres, les citations et la signature. Graisses Light à Bold, avec italiques. Licence SIL Open Font License 1.1.' },
      { l: 'TEXTES', n: 'Manrope', t: 'Sans-serif moderne pour les textes courants, les légendes et les informations pratiques. Graisses Light à Bold. Licence SIL Open Font License 1.1.' },
    ];
    cols.forEach((c, i) => {
      const x = MX + i * (cw3 + 0.3);
      frame(s, x, TOP, cw3, sh, 'Spécimen ' + c.l);
      label(s, c.l, x + 0.2, TOP + 0.18, 2);
      txt(s, c.n, { x, y: TOP + sh + 0.2, w: cw3, h: 0.45, fontFace: SERIF, fontSize: 22 });
      txt(s, c.t, { x, y: TOP + sh + 0.7, w: cw3, h: 1.5, fontSize: 11 });
    });
    logoC(s, 'logo_noir.png', MX + cw3 / 2, TOP + sh / 2 + 0.12, 1.25, 'Logo ORA, lettrage du nom');
    const x2 = MX + cw3 + 0.3, x3 = MX + 2 * (cw3 + 0.3);
    txt(s, 'Aa', { x: x2 + 0.2, y: TOP + 0.4, w: 1.4, h: 1.2, fontFace: SERIF, fontSize: 66 });
    txt(s, [{ text: 'ABCDEFGHIJKLM', options: { breakLine: true } }, { text: 'abcdefghijklm' }], { x: x2 + 1.6, y: TOP + 0.75, w: cw3 - 1.75, h: 0.7, fontFace: SERIF, fontSize: 14 });
    txt(s, 'Aa', { x: x3 + 0.2, y: TOP + 0.5, w: 1.4, h: 1.0, fontFace: SANS, fontSize: 52 });
    txt(s, [{ text: 'ABCDEFGHIJKLM', options: { breakLine: true } }, { text: 'abcdefghijklm' }], { x: x3 + 1.6, y: TOP + 0.75, w: cw3 - 1.75, h: 0.7, fontFace: SANS, fontSize: 11 });
    label(s, 'COMPOSITION DE LA SIGNATURE', MX, 6.05, 4);
    sig(s, MX, 6.32, 5.6, 18, NOIR);
    txt(s, 'Cormorant Garamond en capitales, interlettrage large, point final conservé.', { x: 6.6, y: 6.32, w: SW - MX - 6.6, h: 0.4, fontSize: 11 });
    s.addNotes('Trois niveaux : le lettrage du logo (police d’origine non identifiée à partir des fichiers fournis, donc jamais recomposée), Cormorant Garamond pour les titres et la signature, Manrope pour les textes. Les deux familles sont sous licence SIL Open Font License 1.1 et sont fournies avec la charte.');
  }

  // ===== 9. Règles d'utilisation =====
  {
    const s = page('CH_BLANC', 'Les fondamentaux', '09  ·  RÈGLES D’UTILISATION', 'Proportions, protection et lisibilité');
    const iw = 6.3, ih = iw * 1100 / 2100;
    s.addImage({ path: IMG('zone_protection.png'), x: MX, y: TOP, w: iw, h: ih, altText: 'Zones de protection : 2 X autour du logo complet, X autour du symbole seul, avec X égal à D/4', objectName: 'Zone de protection' });
    frame(s, MX, TOP, iw, ih, 'Cadre zone de protection');
    label(s, 'TEST DE RÉDUCTION À L’ÉCRAN  ·  RENDU PIXEL RÉEL', MX, 5.27, iw);
    const stripH = iw * 437 / 2760;
    s.addImage({ path: IMG('reduction_strip.png'), x: MX, y: 5.5, w: iw, h: stripH, altText: 'Symbole à 16, 24 et 32 px, logo complet à 64, 100 et 140 px de large', objectName: 'Test de réduction' });
    ['16 px', '24 px', '32 px', '64 px', '100 px', '140 px'].forEach((t, k) => txt(s, t, { x: MX + k * iw / 6, y: 5.5 + stripH + 0.04, w: iw / 6, h: 0.22, fontSize: 10, align: 'center' }));
    const rx = 7.45, rw = SW - MX - rx;
    [['PROPORTIONS', 'Symbole D, nom 2 D, espacement D/4. Le logo s’agrandit ou se réduit toujours de façon homothétique.'],
     ['ZONE DE PROTECTION', 'X = D/4. Logo complet : 2 X de chaque côté. Symbole seul : X. Aucun texte ni élément n’y pénètre.'],
     ['TAILLES MINIMALES', 'Logo complet : 20 mm de large en impression, 100 px à l’écran. Symbole seul : 8 mm, 32 px. Gravure : à valider avec l’atelier selon la technique.'],
     ['LISIBILITÉ', 'Noir sur blanc ou blanc sur noir uniquement. Sur une photographie, une zone unie, très claire ou très sombre.']].forEach(([l, t], i) => {
      const y = TOP + i * 1.22; label(s, l, rx, y, rw); txt(s, t, { x: rx, y: y + 0.3, w: rw, h: 0.85, fontSize: 12 });
    });
    s.addNotes('Règles : proportions fixes (D, 2 D, D/4) ; zone de protection X = D/4, soit 2 X autour du logo complet et X autour du symbole ; tailles minimales recommandées : logo 20 mm ou 100 px de large, symbole 8 mm ou 32 px. Le test de réduction montre le rendu réel à l’écran : à 16 px les détails du symbole disparaissent, d’où le minimum de 32 px.');
  }

  // ===== 10. Utilisations interdites =====
  {
    const s = page('CH_BLANC', 'Les fondamentaux', '10  ·  UTILISATIONS INTERDITES', 'Ce qu’il ne faut jamais faire');
    txt(s, 'Toute couleur autre que le noir et le blanc est également exclue.', { x: 7.6, y: 0.5, w: SW - MX - 7.6, h: 0.3, fontSize: 10, italic: true, align: 'right' });
    const tw = (CW - 3 * 0.25) / 4, th = tw / 1.5;
    [['interdit_deformer', 'Déformer ou étirer le logo'], ['interdit_proportions', 'Modifier le rapport entre symbole et nom'], ['interdit_pivoter', 'Pivoter ou incliner le logo'], ['interdit_effet', 'Ajouter un effet : ombre, contour, relief'],
     ['interdit_typographie', 'Recomposer le nom avec une autre police'], ['interdit_ajout', 'Ajouter une lettre ou un élément au symbole'], ['interdit_composition', 'Réorganiser les éléments du logo'], ['interdit_fond', 'Placer le logo sur un fond chargé']].forEach(([f, t], i) => {
      const x = MX + (i % 4) * (tw + 0.25), y = TOP + Math.floor(i / 4) * (th + 0.65);
      img(s, f + '.png', x, y, tw, th, 'Interdit : ' + t);
      txt(s, t, { x, y: y + th + 0.1, w: tw, h: 0.45, fontSize: 11 });
    });
    s.addNotes('Huit usages interdits : déformer, modifier les proportions, pivoter, ajouter un effet, recomposer le nom dans une autre police, ajouter un élément au symbole, réorganiser les éléments, placer le logo sur un fond chargé. Aucune couleur hors noir et blanc.');
  }

  // ===== 11. Direction photographique =====
  pres.addSection({ title: 'Les applications' });
  {
    const s = page('CH_NOIR', 'Les applications', '11  ·  DIRECTION PHOTOGRAPHIQUE', 'Un objet, une lumière, le noir et le blanc');
    const lw = 3.35;
    [['NOIR ET BLANC', 'Toutes les images sont en noir et blanc, sans virage coloré.'],
     ['UN SUJET', 'Un seul objet par image : montre, chaîne, bracelet ou accessoire.'],
     ['LA LUMIÈRE', 'Une lumière directionnelle qui sculpte le métal et les matières.'],
     ['LE FOND', 'Blanc pur ou noir profond, sans décor.'],
     ['LE CADRAGE', 'Cadrages serrés et espace négatif généreux.']].forEach(([l, t], i) => {
      const y = TOP + i * 0.82; label(s, l, MX, y, lw, BLANC); txt(s, t, { x: MX, y: y + 0.28, w: lw, h: 0.5, fontSize: 12, color: BLANC });
    });
    txt(s, 'Images de principe en image de synthèse, à remplacer par les photographies des produits ORA.', { x: MX, y: 6.15, w: lw, h: 0.55, fontSize: 10, italic: true, color: BLANC });
    const gx = 4.45, bigW = 4.0, rx = gx + bigW + 0.3, rw = SW - MX - rx, topH = 2.4, botH = BOT - TOP - topH - 0.2, smW = (rw - 0.2) / 2;
    img(s, 'photo_montre.jpg', gx, TOP, bigW, BOT - TOP, 'Image de principe : montre sur fond blanc', false, true);
    img(s, 'photo_chaine.jpg', rx, TOP, rw, topH, 'Image de principe : chaîne sur fond noir', false, true);
    img(s, 'photo_bracelet.jpg', rx, TOP + topH + 0.2, smW, botH, 'Image de principe : bracelet jonc sur fond blanc', false, true);
    img(s, 'photo_detail.jpg', rx + smW + 0.2, TOP + topH + 0.2, smW, botH, 'Image de principe : détail de cadran sur fond noir', false, true);
    s.addNotes('Direction photographique : noir et blanc, un seul sujet, lumière directionnelle, fond blanc pur ou noir profond, cadrages serrés. Les images présentées sont des images de principe réalisées en image de synthèse ; elles seront remplacées par les photographies des produits.');
  }

  // ===== 12. Applications produits =====
  {
    const s = page('CH_BLANC', 'Les applications', '12  ·  APPLICATIONS SUR LES PRODUITS', 'La signature gravée dans la matière');
    txt(s, 'Simulations réalisées à partir du logo officiel', { x: 7.6, y: 0.5, w: SW - MX - 7.6, h: 0.3, fontSize: 10, italic: true, align: 'right' });
    const w3 = (CW - 0.6) / 3, h3 = w3 * 800 / 1500, w2 = (CW - 0.3) / 2, h2 = w2 * 750 / 2160;
    [['app_gravure_montre.jpg', 'Gravure sur montre  ·  fond de boîte'], ['app_gravure_bracelet.jpg', 'Gravure sur bracelet  ·  plaque'], ['app_fermoir.jpg', 'Fermoir de chaîne  ·  médaille gravée']].forEach(([f, t], i) => {
      const x = MX + i * (w3 + 0.3); img(s, f, x, TOP, w3, h3, 'Mise en situation : ' + t); txt(s, t, { x, y: TOP + h3 + 0.08, w: w3, h: 0.28, fontSize: 11 });
    });
    const y2 = TOP + h3 + 0.55;
    [['app_etiquettes.jpg', 'Étiquettes  ·  noir et blanc'], ['app_ecrin.jpg', 'Écrin de montre']].forEach(([f, t], i) => {
      const x = MX + i * (w2 + 0.3); img(s, f, x, y2, w2, h2, 'Mise en situation : ' + t); txt(s, t, { x, y: y2 + h2 + 0.08, w: w2, h: 0.28, fontSize: 11 });
    });
    s.addNotes('Applications sur les produits : gravure du symbole sur le fond de boîte d’une montre et sur la plaque d’un bracelet, médaille gravée au fermoir d’une chaîne, étiquettes noires et blanches, écrin de montre. Le symbole seul convient aux gravures ; la faisabilité dépend de la technique de l’atelier.');
  }

  // ===== 13. Packaging =====
  {
    const s = page('CH_BLANC', 'Les applications', '13  ·  PACKAGING', 'Un rituel en noir et blanc');
    txt(s, 'Simulations réalisées à partir du logo officiel', { x: 7.6, y: 0.5, w: SW - MX - 7.6, h: 0.3, fontSize: 10, italic: true, align: 'right' });
    const w3 = (CW - 0.6) / 3, h3 = w3 * 800 / 1500, w2 = (CW - 0.3) / 2, h2 = w2 * 750 / 2160;
    [['pack_sacs.jpg', 'Sacs boutique'], ['pack_boites.jpg', 'Boîtes']].forEach(([f, t], i) => {
      const x = MX + i * (w2 + 0.3); img(s, f, x, TOP, w2, h2, 'Packaging : ' + t); txt(s, t, { x, y: TOP + h2 + 0.08, w: w2, h: 0.28, fontSize: 11 });
    });
    const y2 = TOP + h2 + 0.55;
    [['pack_ecrin_bijou.jpg', 'Écrin à bijoux'], ['pack_papier_soie.jpg', 'Papier de soie et sceau'], ['pack_carte_merci.jpg', 'Carte de remerciement']].forEach(([f, t], i) => {
      const x = MX + i * (w3 + 0.3); img(s, f, x, y2, w3, h3, 'Packaging : ' + t); txt(s, t, { x, y: y2 + h3 + 0.08, w: w3, h: 0.28, fontSize: 11 });
    });
    s.addNotes('Packaging exclusivement noir et blanc : sacs boutique, boîtes, écrin à bijoux, papier de soie imprimé du symbole avec sceau, carte de remerciement portant la signature RELEVER VOTRE AURA.');
  }

  // ===== 14. Identité digitale =====
  {
    const s = page('CH_BLANC', 'Les applications', '14  ·  IDENTITÉ DIGITALE ET COMMUNICATION', 'Une voix, une signature');
    const phW = 2.2, phH = phW * dims['digital_instagram.png'].h / dims['digital_instagram.png'].w;
    img(s, 'digital_instagram.png', MX, TOP, phW, phH, 'Profil Instagram ORA', false);
    txt(s, 'Profil Instagram', { x: MX, y: TOP + phH + 0.08, w: phW, h: 0.28, fontSize: 11 });
    const bx = 3.3, bw = 5.3, fbH = bw * 624 / 1640;
    img(s, 'digital_facebook.png', bx, TOP, bw, fbH, 'Couverture Facebook ORA');
    txt(s, 'Couverture Facebook', { x: bx, y: TOP + fbH + 0.08, w: bw, h: 0.28, fontSize: 11 });
    const rh = (bw - 0.4) / (0.5625 + 2), ry = TOP + fbH + 0.5;
    const items = [['story_noire.png', 'Story', 0.5625 * rh], ['post_signature.png', 'Publication', rh], ['post_accroche.png', 'Publication', rh]];
    let x = bx;
    items.forEach(([f, t, w]) => { img(s, f, x, ry, w, rh, t + ' Instagram ORA'); txt(s, t, { x, y: ry + rh + 0.08, w, h: 0.28, fontSize: 11 }); x += w + 0.2; });
    const cx = 8.9, cw = SW - MX - cx, prH = cw * 900 / 1600;
    img(s, 'digital_promo.png', cx, TOP, cw, prH, 'Visuel promotionnel ORA');
    txt(s, 'Visuel promotionnel', { x: cx, y: TOP + prH + 0.08, w: cw, h: 0.28, fontSize: 11 });
    label(s, 'ACCROCHES', cx, TOP + prH + 0.55, cw);
    const q = ['« Chaque détail révèle votre style. Chaque choix affirme votre personnalité. ORA — RELEVER VOTRE AURA. »',
      '« Un accessoire ne complète pas une tenue. Il révèle une personnalité. »', '« Le temps passe. Votre style demeure. »', '« Portez ce qui vous ressemble. »'];
    txt(s, q.map((t, k) => ({ text: t, options: { breakLine: k < q.length - 1 } })), { x: cx, y: TOP + prH + 0.85, w: cw, h: BOT - (TOP + prH + 0.85), fontFace: SERIF, italic: true, fontSize: 13, paraSpaceAfter: 6 });
    s.addNotes('Identité digitale : photo de profil (symbole blanc sur fond noir), couverture Facebook, publications et stories Instagram, visuels promotionnels. La signature RELEVER VOTRE AURA. figure sur chaque support. Des stories, publications et une animation du logo de 5 secondes sont fournies en fichiers séparés.');
  }

  // ===== 15. Conclusion =====
  pres.addSection({ title: 'Conclusion' });
  {
    const s = page('CH_NOIR', 'Conclusion', '15  ·  CONCLUSION', 'Une marque élégante, reconnaissable et durable');
    logoC(s, 'logo_blanc.png', MX + 2.35, 4.25, 2.7, 'Logo ORA blanc');
    const rx = 6.1, rw = SW - MX - rx;
    txt(s, 'ORA — RELEVER VOTRE AURA.', { x: rx, y: TOP + 0.05, w: rw, h: 0.6, fontFace: SERIF, fontSize: 30, color: BLANC });
    txt(s, 'Cette charte rassemble les règles qui garantissent la cohérence de ORA, du logo aux supports les plus discrets. Appliquée avec constance, elle fait de chaque contact avec la marque une expression de son exigence.',
      { x: rx, y: 2.8, w: rw, h: 1.2, fontSize: 14, color: BLANC, lineSpacingMultiple: 1.15 });
    [['L’élégance', 'dans le style'], ['La distinction', 'dans les détails'], ['Le rayonnement', 'dans la personnalité']].forEach(([a, b], i) => {
      txt(s, [{ text: a + ' ' }, { text: b, options: { italic: true } }], { x: rx, y: 4.45 + i * 0.62, w: rw, h: 0.5, fontFace: SERIF, fontSize: 24, color: BLANC });
    });
    s.addNotes('Conclusion : le logo final et la signature officielle ORA — RELEVER VOTRE AURA. L’ambition : une marque élégante, reconnaissable et durable, qui exprime l’élégance dans le style, la distinction dans les détails et le rayonnement dans la personnalité.');
  }

  await pres.writeFile({ fileName: OUTFILE });
  await applyTheme(OUTFILE, THEME);
  console.log('written', OUTFILE);
}
build().catch((e) => { console.error(e); process.exit(1); });
