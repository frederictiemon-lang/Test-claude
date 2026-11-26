// Génère le document Word « Stratégie de développement et de transformation 2027 ».
// Usage : node build.js <sortie.docx>   (lit toc_pages.json s'il existe)
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, AlignmentType, HeadingLevel, ImageRun, Header, Footer, PageNumber, TabStopType,
  PageOrientation, Bookmark, InternalHyperlink, VerticalAlign, LevelFormat, PageBreak,
  HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TableLayoutType, Tab,
} = require('docx');

const OUTFILE = process.argv[2] || path.join(__dirname, 'out.docx');
const FIG = path.join(__dirname, 'figures');
const ASSETS = path.join(__dirname, 'assets');
const TOC_PAGES = fs.existsSync(path.join(__dirname, 'toc_pages.json'))
  ? JSON.parse(fs.readFileSync(path.join(__dirname, 'toc_pages.json'))) : {};

// ------------------------------------------------------------------ Charte
const FONT = 'Calibri';
const BLUE = '2161FF', ORANGE = 'FF6138', NAVY = '0B1A3B', INK = '1A2238', MUT = '5D6679',
  PANEL = 'F4F6FB', LINE = 'D9DEEA', BL = 'E8EEFF', OL = 'FFEDE7', RL = '0E3A6B', LU = '157A86',
  BMID = 'DCE4FF', WHITE = 'FFFFFF';

// Mise en page (DXA)
const P = { w: 11906, h: 16838, ml: 1247, mr: 1247, mt: 1418, mb: 1300 };
const CW = P.w - P.ml - P.mr; // 9412
const L = { ml: 1134, mr: 1134, mt: 1247, mb: 1134 };
const CWL = P.h - L.ml - L.mr; // 14570

// ------------------------------------------------------------- Utilitaires
const fr = (t) => t
  .replace(/ ([:;?!»])/g, ' $1')
  .replace(/« /g, '« ');

// Texte avec **gras** en ligne
function runs(text, o = {}) {
  const parts = String(text).split('**');
  const out = [];
  parts.forEach((s, i) => {
    if (!s.length) return;
    out.push(new TextRun({ text: fr(s), font: FONT, size: o.size, color: o.color, italics: o.italics,
      bold: o.bold || (i % 2 === 1), characterSpacing: o.spacing }));
  });
  if (!out.length) out.push(new TextRun({ text: '', font: FONT, size: o.size }));
  return out;
}

function para(text, o = {}) {
  return new Paragraph({
    alignment: o.align || AlignmentType.LEFT,
    spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line ?? 276 },
    keepNext: o.keepNext, keepLines: o.keepLines,
    indent: o.indent,
    numbering: o.numbering,
    children: Array.isArray(text) ? text : runs(text, o),
  });
}

const bullet = (text, o = {}) => para(text, { ...o, after: o.after ?? 60, numbering: { reference: o.ref || 'bul', level: o.level || 0 } });
const bullets = (items, o = {}) => items.map((t, i) => bullet(t, { ...o, after: i === items.length - 1 ? (o.lastAfter ?? 140) : (o.after ?? 60) }));
let numInstance = 0;
const numbered = (items, o = {}) => { numInstance += 1; const inst = numInstance; return items.map((t, i) => para(t, { ...o, after: i === items.length - 1 ? 140 : 70, numbering: { reference: 'num', level: 0, instance: inst } })); };

function tag(label, kind) {
  const m = { constat: [BLUE, BL], analyse: [NAVY, 'E3E7F0'], proposition: ['C8401C', OL], definir: [MUT, 'EEF0F4'] }[kind];
  return new TextRun({ text: ` ${label} `, font: FONT, bold: true, size: 15, color: m[0], characterSpacing: 10, shading: { type: ShadingType.CLEAR, color: 'auto', fill: m[1] } });
}

// ---------------------------------------------------------------- Titres
const headings = [];
let hCount = 0;
function heading(level, text, o = {}) {
  hCount += 1;
  const id = `_Toc_h${hCount}`;
  if (level <= 2) headings.push({ id, level, text });
  const children = [new Bookmark({ id, children: runs(text, o.runOpts || {}) })];
  if (o.tags) o.tags.forEach((t) => { children.push(new TextRun({ text: '  ', font: FONT })); children.push(tag(t[0], t[1])); });
  return new Paragraph({
    heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
    pageBreakBefore: o.pageBreak,
    shading: o.shading,
    border: o.border,
    children,
  });
}
const h1 = (text, o = {}) => heading(1, text, { pageBreak: o.pageBreak !== false, ...o });
const h2 = (text, o = {}) => heading(2, text, o);
const h3 = (text, tags) => heading(3, text, { tags });

function partBanner(text, intro) {
  const bd = { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 10 };
  return [
    heading(1, text, {
      pageBreak: true,
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: BLUE },
      border: { top: bd, left: bd, bottom: bd, right: bd },
      runOpts: { color: WHITE },
    }),
    para(intro, { italics: true, color: MUT, before: 200, after: 240 }),
  ];
}

// ---------------------------------------------------------------- Images
function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
let figNo = 0;
function figure(name, caption, source, o = {}) {
  const file = path.join(FIG, `${name}.png`);
  const { w, h } = pngSize(file);
  const maxW = (o.landscape ? CWL : CW) / 1440 * 96;
  const maxH = (o.maxHcm || 15) / 2.54 * 96;
  let dw = maxW * (o.scale || 1);
  let dh = dw * h / w;
  if (dh > maxH) { dh = maxH; dw = dh * w / h; }
  figNo += 1;
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, keepNext: true,
      children: [new ImageRun({ type: 'png', data: fs.readFileSync(file), transformation: { width: Math.round(dw), height: Math.round(dh) } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 220 },
      children: [new TextRun({ text: fr(`Figure ${figNo}. `), font: FONT, bold: true, size: 17, color: NAVY }),
        new TextRun({ text: fr(caption), font: FONT, size: 17, color: MUT, italics: true }),
        ...(source ? [new TextRun({ text: fr(`  Source : ${source}`), font: FONT, size: 16, color: MUT })] : [])] }),
  ];
}

// ---------------------------------------------------------------- Tableaux
const thin = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const tableBorders = { top: thin, left: thin, bottom: thin, right: thin, insideHorizontal: thin, insideVertical: thin };
const noBorders = { top: none, left: none, bottom: none, right: none, insideHorizontal: none, insideVertical: none };

function cellParas(content, o) {
  const keep = !!o.keepNext;
  const arr = Array.isArray(content) ? content : [content];
  return arr.map((c, i) => {
    if (c instanceof Paragraph) return c;
    const s = String(c);
    const isB = s.startsWith('- ');
    return new Paragraph({
      alignment: o.align || AlignmentType.LEFT,
      spacing: { before: 0, after: i === arr.length - 1 ? 0 : 50, line: 252 },
      numbering: isB ? { reference: 'bulcell', level: 0 } : undefined,
      keepNext: keep,
      children: runs(isB ? s.slice(2) : s, { size: o.size, color: o.color, bold: o.bold, italics: o.italics }),
    });
  });
}

function cell(content, o = {}) {
  return new TableCell({
    width: { size: o.w, type: WidthType.DXA },
    columnSpan: o.colSpan, rowSpan: o.rowSpan,
    verticalAlign: o.vAlign || VerticalAlign.TOP,
    shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined,
    margins: { top: o.mt ?? 70, left: o.ml ?? 100, bottom: o.mb ?? 70, right: o.mr ?? 100 },
    borders: o.borders,
    children: cellParas(content, o),
  });
}

// headers: tableau de libellés ; rows : tableau de lignes (chaînes, tableaux ou objets {c, ...opts})
function table(headers, rows, widths, o = {}) {
  const size = o.size || 19;
  const total = widths.reduce((a, b) => a + b, 0);
  const trs = [];
  if (headers) {
    trs.push(new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((h, i) => cell(h, {
      w: widths[i], fill: o.headFill || BLUE, color: WHITE, bold: true, size: size - 1, vAlign: VerticalAlign.CENTER, keepNext: o.keepTogether,
    })) }));
  }
  rows.forEach((r, ri) => {
    const zebra = o.zebra === false ? undefined : (ri % 2 === 1 ? 'F7F8FC' : undefined);
    let ci = 0;
    const cells = [];
    r.forEach((c) => {
      if (c === null) return; // cellule fusionnée verticalement (déjà couverte)
      const spec = (c && typeof c === 'object' && !Array.isArray(c) && !(c instanceof Paragraph)) ? c : { c };
      const span = spec.colSpan || 1;
      const w = widths.slice(ci, ci + span).reduce((a, b) => a + b, 0);
      const first = ci === 0 && o.firstCol;
      cells.push(cell(spec.c, {
        w, size: spec.size || size, fill: spec.fill || (first ? o.firstColFill : undefined) || zebra,
        bold: spec.bold ?? (first ? true : undefined), color: spec.color || (first ? o.firstColColor : undefined),
        align: spec.align, colSpan: spec.colSpan, rowSpan: spec.rowSpan, vAlign: spec.vAlign, italics: spec.italics,
        keepNext: o.keepTogether && ri < rows.length - 1,
      }));
      ci += span;
    });
    trs.push(new TableRow({ cantSplit: o.cantSplit !== false, children: cells }));
  });
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED,
    borders: o.borders || tableBorders, rows: trs,
  });
}

function callout(label, content, kind = 'blue', o = {}) {
  const fills = { blue: [BL, BLUE], orange: [OL, 'C8401C'], gray: [PANEL, NAVY], navy: [NAVY, 'FFB39E'] };
  const [fill, lc] = fills[kind];
  const txt = kind === 'navy' ? WHITE : INK;
  const children = [];
  if (label) children.push(new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: fr(label.toUpperCase()), font: FONT, bold: true, size: 16, color: lc, characterSpacing: 20 })] }));
  (Array.isArray(content) ? content : [content]).forEach((c, i, a) => {
    if (c instanceof Paragraph) { children.push(c); return; }
    const s = String(c);
    const isB = s.startsWith('- ');
    children.push(new Paragraph({ spacing: { before: 0, after: i === a.length - 1 ? 0 : 60, line: 264 },
      numbering: isB ? { reference: 'bulcell', level: 0 } : undefined,
      children: runs(isB ? s.slice(2) : s, { size: o.size || 20, color: txt, italics: o.italics }) }));
  });
  return [new Table({
    width: { size: o.width || CW, type: WidthType.DXA }, columnWidths: [o.width || CW], layout: TableLayoutType.FIXED, borders: noBorders,
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({ width: { size: o.width || CW, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, color: 'auto', fill },
      margins: { top: 150, left: 220, bottom: 150, right: 220 }, borders: { top: none, left: none, bottom: none, right: none }, children })] })],
  }), spacer(o.after ?? 160)];
}

const spacer = (after = 120) => new Paragraph({ spacing: { before: 0, after, line: 240 }, children: [] });
const note = (t, o = {}) => para(t, { size: 16, italics: true, color: MUT, before: 60, after: o.after ?? 200 });

// Grille de cartes (titre + texte)
function cards(items, cols, o = {}) {
  const w = Math.floor((o.width || CW) / cols);
  const widths = Array(cols).fill(w);
  const rows = [];
  for (let i = 0; i < items.length; i += cols) {
    const slice = items.slice(i, i + cols);
    while (slice.length < cols) slice.push(null);
    rows.push(new TableRow({ cantSplit: true, children: slice.map((it, j) => new TableCell({
      width: { size: w, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: it ? (it.fill || PANEL) : WHITE },
      margins: { top: 140, left: 180, bottom: 140, right: 180 },
      borders: { top: { style: BorderStyle.SINGLE, size: 18, color: WHITE }, left: { style: BorderStyle.SINGLE, size: 18, color: WHITE }, bottom: { style: BorderStyle.SINGLE, size: 18, color: WHITE }, right: { style: BorderStyle.SINGLE, size: 18, color: WHITE } },
      children: it ? [
        new Paragraph({ spacing: { before: 0, after: 60 }, children: [
          ...(it.num ? [new TextRun({ text: `${it.num}  `, font: FONT, bold: true, size: 26, color: it.numColor || ORANGE })] : []),
          new TextRun({ text: fr(it.t), font: FONT, bold: true, size: o.tSize || 21, color: it.tColor || BLUE })] }),
        ...[].concat(it.d).map((d, k, a) => new Paragraph({ spacing: { before: 0, after: k === a.length - 1 ? 0 : 40, line: 260 }, children: runs(d, { size: o.dSize || 19, color: it.dColor || INK }) })),
      ] : [new Paragraph({ children: [] })],
    })) }));
  }
  return [new Table({ width: { size: w * cols, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED, borders: noBorders, rows }), spacer(160)];
}

// ---------------------------------------------------------- En-têtes/pieds
function header(cw) {
  return new Header({ children: [new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: cw }],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 6 } },
    spacing: { after: 0 },
    children: [
      new TextRun({ text: 'Stratégie de développement et de transformation 2027', font: FONT, size: 16, color: MUT }),
      new TextRun({ children: [new Tab()], font: FONT }),
      new TextRun({ text: 'Document de travail – Confidentiel', font: FONT, size: 16, bold: true, color: ORANGE }),
    ] })] });
}
function footer(cw) {
  return new Footer({ children: [new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: cw }],
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 6 } },
    children: [
      new TextRun({ text: 'Groupe KCS – RLCS – LUKE', font: FONT, size: 16, color: MUT }),
      new TextRun({ children: [new Tab()], font: FONT }),
      new TextRun({ children: ['Page ', PageNumber.CURRENT], font: FONT, size: 17, bold: true, color: BLUE }),
    ] })] });
}

// ======================================================================
//                               CONTENU
// ======================================================================

// ------------------------------------------------------------ Page de garde
function coverSection() {
  const bg = new ImageRun({
    type: 'png', data: fs.readFileSync(path.join(FIG, 'cover_bg.png')),
    transformation: { width: 794, height: 1123 },
    floating: {
      horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 },
      verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 },
      behindDocument: true, allowOverlap: true, lockAnchor: true,
    },
  });
  const ccw = P.w - 1474 - P.mr;
  const logo = (f, w) => { const s = pngSize(path.join(ASSETS, f)); return new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: fs.readFileSync(path.join(ASSETS, f)), transformation: { width: w, height: Math.round(w * s.h / s.w) } })] }); };
  const lw = Math.floor(ccw / 3);
  const logos = new Table({ width: { size: lw * 3, type: WidthType.DXA }, columnWidths: [lw, lw, lw], layout: TableLayoutType.FIXED, borders: noBorders,
    rows: [new TableRow({ children: [logo('logo_kcs.png', 150), logo('logo_rlcs.png', 168), logo('logo_luke.png', 172)].map((p) => new TableCell({ width: { size: lw, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, borders: { top: none, left: none, bottom: none, right: none }, children: [p] })) })] });
  const bar = new Paragraph({ spacing: { before: 200, after: 260 }, children: [new ImageRun({ type: 'png', data: fs.readFileSync(path.join(ASSETS, 'bar_orange.png')), transformation: { width: 90, height: 5 } })] });
  const meta = (k, v) => new TableRow({ children: [
    cell(k, { w: 2200, size: 18, bold: true, color: BLUE, mt: 90, mb: 90, borders: { top: none, left: none, right: none, bottom: thin } }),
    cell(v, { w: ccw - 2200, size: 19, color: INK, mt: 90, mb: 90, borders: { top: none, left: none, right: none, bottom: thin } }),
  ] });
  const metaT = new Table({ width: { size: ccw, type: WidthType.DXA }, columnWidths: [2200, ccw - 2200], layout: TableLayoutType.FIXED, borders: noBorders,
    rows: [meta('Destinataires', 'Direction Générale et associés du Groupe'), meta('Objet', 'Support de réflexion, d\'arbitrage et de validation des orientations stratégiques 2027'), meta('Statut', 'Version de travail soumise à validation'), meta('Date', 'Novembre 2026')] });
  const conf = new Table({ width: { size: 4300, type: WidthType.DXA }, columnWidths: [4300], layout: TableLayoutType.FIXED,
    borders: { top: { style: BorderStyle.SINGLE, size: 10, color: ORANGE }, left: { style: BorderStyle.SINGLE, size: 10, color: ORANGE }, bottom: { style: BorderStyle.SINGLE, size: 10, color: ORANGE }, right: { style: BorderStyle.SINGLE, size: 10, color: ORANGE }, insideHorizontal: none, insideVertical: none },
    rows: [new TableRow({ children: [new TableCell({ width: { size: 4300, type: WidthType.DXA }, margins: { top: 90, left: 160, bottom: 90, right: 160 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Document de travail – Confidentiel', font: FONT, bold: true, size: 20, color: ORANGE, characterSpacing: 10 })] })] })] })] });
  return {
    properties: { page: { size: { width: P.w, height: P.h }, margin: { top: 1100, left: 1474, bottom: 1700, right: P.mr, header: 600, footer: 600 } } },
    children: [
      new Paragraph({ spacing: { after: 0 }, children: [bg] }),
      spacer(300),
      logos,
      spacer(1500),
      new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: 'ORIENTATIONS STRATÉGIQUES 2027', font: FONT, bold: true, size: 20, color: BLUE, characterSpacing: 40 })] }),
      new Paragraph({ spacing: { after: 0, line: 252 }, children: [
        new TextRun({ text: 'STRATÉGIE DE DÉVELOPPEMENT', font: FONT, bold: true, size: 56, color: NAVY }),
        new TextRun({ text: 'ET DE TRANSFORMATION ', font: FONT, bold: true, size: 56, color: NAVY, break: 1 }),
        new TextRun({ text: '2027', font: FONT, bold: true, size: 56, color: BLUE }),
      ] }),
      bar,
      new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: 'Orientations stratégiques du Groupe KCS – RLCS – LUKE', font: FONT, size: 30, color: INK })] }),
      spacer(1500),
      metaT,
      spacer(500),
      conf,
    ],
  };
}

// ---------------------------------------------------------------- Sommaire
function tocBlock() {
  const out = [new Paragraph({ spacing: { before: 0, after: 300 }, children: [new TextRun({ text: 'Sommaire', font: FONT, bold: true, size: 44, color: BLUE })] })];
  // Les entrées sont fixées a posteriori : headings est rempli lors de la construction du corps.
  return out;
}
function tocEntries(list) {
  return list.map((h, i) => {
    const pg = String(TOC_PAGES[h.id] ?? '0');
    const kids = [];
    if (i === 0) kids.push(new TextRun({ text: '§TOCSTART§', font: FONT }));
    kids.push(new InternalHyperlink({ anchor: h.id, children: [
      new TextRun({ text: fr(h.text), font: FONT, size: h.level === 1 ? 21 : 20, bold: h.level === 1, color: h.level === 1 ? NAVY : INK }),
      new TextRun({ children: [new Tab()], font: FONT, size: 20 }),
      new TextRun({ text: pg, font: FONT, size: 20, bold: h.level === 1, color: h.level === 1 ? BLUE : INK }),
    ] }));
    if (i === list.length - 1) kids.push(new TextRun({ text: '§TOCEND§', font: FONT }));
    return new Paragraph({ style: h.level === 1 ? 'TOC1' : 'TOC2', children: kids });
  });
}

// --------------------------------------------------- Objet, sources, lecture
function objetSection() {
  return [
    h1('Objet du document, sources et convention de lecture', { pageBreak: true }),
    para('Ce document présente les orientations stratégiques proposées pour 2027 au Groupe formé par KCS, RLCS et LUKE. Il s\'adresse à la Direction Générale et aux associés. Il a vocation à nourrir la réflexion, à préparer les arbitrages et à servir de base à la validation des orientations.'),
    ...callout('Statut du document', 'Document de travail. Les orientations, instances, fonctions, actions et indicateurs présentés sont des **propositions**. Aucune ne constitue une décision acquise. Les cibles chiffrées, les budgets, les échéances précises et les responsables nominatifs restent à définir lors de la validation.', 'orange'),
    h3('Sources exploitées'),
    table(['Réf.', 'Source', 'Utilisation dans le document'], [
      ['S1', 'Note de cadrage communiquée par la Direction pour l\'élaboration du présent document (novembre 2026)', 'Organisation actuelle, orientations des trois axes, exigences de forme et de fond'],
      ['S2', '« Organigrammes du Groupe KCS – RLCS – LUKE 2026 » (présentation de cinq diapositives)', 'Domaines d\'intervention, fonctions, rattachements et ressources de chaque société'],
      ['S3', 'Plan d\'action stratégique 2026, version de travail V0.21 (classeur)', 'Chantiers engagés en 2026 et continuité avec 2027'],
      ['S4', 'Plan de développement stratégique KCS 2026-2027 : marketing, commercial, communication', 'Offres, marchés et données commerciales de KCS ; principes de pilotage'],
      ['S5', 'Stratégie de communication KCS, version 1.0 du 20/08/2026', 'Présentation de KCS, offres, alliance entre les trois sociétés'],
    ], [700, 4700, 4012], { firstCol: true, firstColColor: BLUE }),
    note('Les données chiffrées citées proviennent exclusivement de ces sources. Aucune donnée commerciale ou financière n\'a été communiquée pour RLCS et LUKE.'),
    h3('Convention de lecture'),
    table(['Marqueur', 'Signification'], [
      [[new Paragraph({ children: [tag('CONSTAT', 'constat')] })], 'Fait issu des sources S1 à S5, décrivant la situation actuelle. La source est indiquée entre parenthèses.'],
      [[new Paragraph({ children: [tag('ANALYSE', 'analyse')] })], 'Lecture proposée dans ce document à partir des constats ; elle reste à discuter.'],
      [[new Paragraph({ children: [tag('PROPOSITION', 'proposition')] })], 'Orientation, instance, fonction ou action soumise à la validation de la Direction Générale et des associés.'],
      [[new Paragraph({ children: [tag('À DÉFINIR', 'definir')] })], 'Élément non disponible à ce stade (cible chiffrée, budget, titulaire, échéance précise), à arrêter lors de la validation.'],
    ], [2000, 7412], { zebra: false }),
  ];
}

// ---------------------------------------------------------------- Synthèse
function syntheseSection() {
  return [
    h1('Synthèse pour la Direction Générale'),
    para('Le Groupe dispose déjà des fondations d\'une organisation intégrée. L\'enjeu de 2027 n\'est pas de réorganiser en profondeur, mais de **formaliser, mesurer et accélérer** ce qui fonctionne.', { after: 160 }),
    h3('Le point de départ', [['CONSTAT', 'constat']]),
    ...bullets([
      '**Trois sociétés juridiquement distinctes aux métiers complémentaires** : transformation digitale, marchés financiers et industries pour KCS ; data, gestion des risques, actuariat, cloud et cybersécurité pour RLCS ; conseil et solutions numériques de santé pour LUKE (S1, S2).',
      '**Un socle déjà commun** : un gérant commun, des fonctions HR/Accounting et BPM tenues par les mêmes personnes pour les trois sociétés, un PMO par société (S1, S2).',
      '**Des ressources déjà partagées** : six fonctions de RLCS et de LUKE sont indiquées comme tenues par des « Consultants KCS », alors que les charges salariales restent portées par la société employeuse (S1, S2).',
      '**Des sociétés autonomes** : comptabilité, chiffre d\'affaires, clientèle et prospection propres ; une collaboration commerciale encore peu structurée (S1).',
      '**Une dynamique engagée** : nouvel organigramme et classifications RH achevés en 2026 (S3) ; IA intégrée aux activités, avec une fonction AI Engineering chez KCS (S1, S2).',
    ]),
    h3('Ce que cela implique', [['ANALYSE', 'analyse']]),
    ...bullets([
      'Le Groupe fonctionne déjà comme un ensemble intégré sur le plan opérationnel, sans que les règles de cette intégration soient formalisées.',
      'KCS joue de fait un rôle de réservoir de compétences Tech & Delivery pour le Groupe. Sans suivi analytique, la contribution réelle de chaque société aux projets des autres n\'est pas lisible.',
      'La convergence des trois PMO vers le gérant concentre les arbitrages entre sociétés à un seul niveau.',
      'La complémentarité des expertises constitue un potentiel commercial encore peu exploité collectivement.',
    ]),
    h3('La réponse proposée : trois axes, une logique d\'ensemble', [['PROPOSITION', 'proposition']]),
    ...figure('logique', 'Logique d\'ensemble des trois axes stratégiques (proposition).', null, { maxHcm: 8.5 }),
    para('Les trois axes se renforcent mutuellement. La gouvernance fixe les règles de mobilisation et d\'arbitrage ; le capital humain porte les compétences et les usages ; l\'IA libère du temps et enrichit les offres. Un même socle de données, le suivi des temps par projet et par société, alimente les trois axes.'),
    h3('Principes directeurs', [['PROPOSITION', 'proposition']]),
    ...bullets([
      '**Progressivité** : structurer par étapes, sans bouleverser les mécanismes qui fonctionnent.',
      '**Préservation des acquis** : gérant commun, trois PMO, comptabilités et chiffres d\'affaires propres sont maintenus.',
      '**Mesurer avant de décider** : aucune refacturation imposée en 2027 ; les données collectées éclaireront une décision en fin d\'année.',
      '**Continuité** : prolonger les chantiers engagés en 2026 plutôt que d\'en ouvrir de nouveaux.',
      '**Simplicité** : privilégier les outils existants, en premier lieu l\'outil de gestion des opérations prévu au plan 2026 (S3).',
    ]),
    h3('Décisions attendues de la Direction Générale et des associés'),
    table(['N°', 'Décision soumise à arbitrage', 'Référence'], [
      ['1', 'Valider la vision 2027, les principes directeurs et les trois axes stratégiques', 'Partie I, §7 ; Partie II'],
      ['2', 'Valider les instances de gouvernance proposées : revue stratégique, Comité de Direction Groupe, revue de coordination des PMO, revue commerciale inter-sociétés', 'Axe 1'],
      ['3', 'Décider de la création d\'une fonction de coordination Groupe des PMO et en désigner le titulaire', 'Axe 1'],
      ['4', 'Confier à BPM la consolidation du reporting et le suivi analytique des ressources', 'Axe 1'],
      ['5', 'Valider un suivi analytique sans refacturation en 2027, avec une décision au quatrième trimestre sur un éventuel mécanisme de répartition', 'Axes 1 et 2'],
      ['6', 'Valider la désignation de référents IA et l\'adoption d\'une charte d\'usage de l\'IA', 'Axe 3'],
      ['7', 'Arrêter les cibles chiffrées, les budgets et les responsables nominatifs du plan d\'action', 'Partie III'],
    ], [600, 7012, 1800], { firstCol: true, firstColColor: ORANGE }),
  ];
}

// ---------------------------------------------------------------- Partie I
function partie1() {
  const D = '●', H = '◐';
  const mx = (t, k, r, l) => [t, { c: k, align: AlignmentType.CENTER, color: BLUE, bold: true }, { c: r, align: AlignmentType.CENTER, color: RL, bold: true }, { c: l, align: AlignmentType.CENTER, color: LU, bold: true }];
  return [
    ...partBanner('Partie I. Cadre stratégique et diagnostic', 'Cette partie établit la situation de départ du Groupe à partir des sources disponibles, en distinguant les constats de leur lecture.'),

    h2('1. Présentation générale du Groupe'),
    para('Le Groupe réunit trois sociétés juridiquement distinctes, KCS, RLCS et LUKE, gérées par un gérant commun (S1). Les documents de KCS présentent cet ensemble comme un « écosystème de groupe » et une « alliance stratégique » (S4, S5).'),
    para('Les trois organigrammes 2026 reposent sur une même architecture : une direction (Direction Générale et associés), une fonction HR/Accounting chargée du support et de la gestion (comptabilité, gestion, RH, juridique), une fonction BPM (Business Performance Management & Partnership), une fonction Advisory & Business Development et un pôle Tech & Delivery (S2).'),
    para('Chaque société conserve sa comptabilité, son chiffre d\'affaires, sa clientèle et sa prospection. Les fonctions support sont pilotées de manière centralisée et les collaborateurs peuvent intervenir sur les projets des trois sociétés (S1).'),
    ...figure('groupe', 'Trois sociétés, un socle commun.', 'S1, S2, S3, S4, S5.', { maxHcm: 11 }),
    ...callout('Repères chiffrés disponibles', [
      '- **KCS** : 59 clients distincts, 13 pays couverts, chiffre d\'affaires 2025 de 374 456 001 FCFA (S4) ; bureaux en Côte d\'Ivoire, au Sénégal, au Togo et au Cameroun (S5). S5 mentionne pour sa part « 15+ pays ».',
      '- **Groupe** : 55 noms distincts figurent sur les trois organigrammes 2026, dont 41 dans le pôle Tech & Delivery de KCS (S2, décompte des noms affichés).',
      '- **RLCS et LUKE** : aucune donnée commerciale ou financière communiquée.',
    ], 'gray'),

    h2('2. Les trois sociétés et leurs domaines d\'intervention'),
    table(['Société', 'Domaines d\'intervention', 'Offres et capacités identifiées', 'Organisation (S2)'], [
      [{ c: ['KCS', 'Kyria Consultancy Services'], color: BLUE }, 'Conseil en transformation digitale, marchés financiers et industries (S1, S2)', 'Suites ATLANTIS (SGI, SGO, AM), TREND (risques, conformité, LBC/FT), AXIAGUARD (titrisation, risques) ; offres Microsoft Dynamics 365 ; solutions santé et mutualité en alliance avec LukeHealth (S4, S5)', 'Pôle Tech & Delivery le plus étoffé du Groupe : PMO, Business Analyst, Software Engineering, Software Development, AI Engineering'],
      [{ c: ['RLCS', 'RiskLogics Consulting Services'], color: RL }, 'Conseil, data, gestion des risques, actuariat, cloud et cybersécurité (S1, S2)', 'Capacités RiskTech (S1) ; actuariat, risk management, performance, ALM (S2) ; segments Risk Management et cybersécurité au plan 2026 (S3)', 'PMO et Actuarial & Risk Management propres ; Business Analyst, Software Development, Cloud et cybersécurité tenus par des Consultants KCS'],
      [{ c: ['LUKE', 'LukeHealth TECH'], color: LU }, 'Conseil et solutions numériques dans le secteur de la santé ; « Conseil e-Santé » (S1, S2)', 'Solutions e-santé (S1) ; segments mutualité, e-santé et e-déchets au plan 2026 (S3)', 'Business Development et Advisory propres ; PMO, Business Analyst et Software Development tenus par des Consultants KCS'],
    ], [1650, 2350, 3000, 2412], { firstCol: true, size: 18 }),
    spacer(160),
    h3('Matrice des expertises'),
    table(['Expertise', 'KCS', 'RLCS', 'LUKE'], [
      mx('Conseil', D, D, D),
      mx('Transformation digitale', D, '', ''),
      mx('Marchés financiers', D, '', ''),
      mx('Industries', D, '', ''),
      mx('Data', '', D, ''),
      mx('Gestion des risques et conformité', H, D, ''),
      mx('Actuariat', '', D, ''),
      mx('Cloud et cybersécurité', '', D, ''),
      mx('Santé et mutualité', H, '', D),
      mx('Ingénierie logicielle et IA', D, '', ''),
    ], [4012, 1800, 1800, 1800], { size: 18 }),
    note('● domaine d\'intervention ou fonction identifiés dans S1 ou S2.   ◐ présence au travers de solutions logicielles : TREND et AXIAGUARD pour les risques, écosystème santé et mutualité pour la santé (S4, S5).'),
    h3('Lecture des complémentarités', [['ANALYSE', 'analyse']]),
    para('KCS et LUKE sont positionnées sur des secteurs (finance, industries, santé). RLCS porte des expertises techniques mobilisables dans chacun d\'eux (data, risques, actuariat, cloud, cybersécurité). KCS apporte en outre la capacité d\'ingénierie logicielle et d\'IA la plus développée du Groupe. Plusieurs convergences existent déjà ou peuvent être instruites :'),
    ...bullets([
      '**Santé et mutualité** : KCS propose des solutions santé et mutualité en alliance avec LukeHealth (S5), et LUKE cible la mutualité et l\'e-santé (S3). La convergence existe ; elle reste à organiser.',
      '**Risques et conformité** : KCS commercialise la suite TREND (S4, S5) ; RLCS porte l\'actuariat et le risk management (S2). Piste à instruire : des offres associant solution logicielle et expertise.',
      '**Marchés financiers** : la base de 59 clients de KCS, établie sur les marchés financiers régionaux (S4), constitue un accès potentiel pour les expertises de RLCS. Piste à instruire.',
      '**Cloud et cybersécurité** : les offres Microsoft de KCS (Dynamics 365, Azure) (S5) et l\'expertise cloud et cybersécurité de RLCS (S2) sont complémentaires. Piste à instruire.',
    ]),
    h3('Pourquoi une meilleure intégration est un enjeu', [['ANALYSE', 'analyse']]),
    ...cards([
      { t: 'Organisationnelle', d: 'Les ressources sont déjà partagées (S2). Il s\'agit de rendre ce partage lisible, arbitré et soutenable.' },
      { t: 'Commerciale', d: 'Les expertises se complètent. Il s\'agit d\'en faire des opportunités et des offres communes, sans remettre en cause l\'autonomie commerciale de chaque société.' },
      { t: 'Technologique', d: 'Les compétences IA sont concentrées chez KCS (S2). Il s\'agit d\'en faire bénéficier les solutions des trois sociétés et d\'éviter des développements isolés.' },
    ], 3),

    h2('3. Analyse de l\'organisation actuelle'),
    ...figure('org_actuelle', 'Synthèse des organigrammes 2026.', 'S2 ; gérant commun : S1.', { maxHcm: 13 }),
    h3('Ce que montrent les organigrammes', [['CONSTAT', 'constat']]),
    ...bullets([
      '**Un modèle commun aux trois sociétés** : mêmes grandes fonctions et même logique de rattachement (S2).',
      '**Des fonctions transverses déjà mutualisées** : HR/Accounting et BPM sont tenues par les mêmes quatre personnes pour les trois sociétés (S2).',
      '**Une concentration des ressources de production chez KCS** : 41 noms distincts dans son pôle Tech & Delivery, contre 7 chez RLCS (PMO et actuariat) et aucun nom chez LUKE (S2).',
      '**Des fonctions tenues par des consultants KCS** : Business Analyst, Software Development, Cloud et cybersécurité chez RLCS ; PMO, Business Analyst et Software Development chez LUKE (S2).',
      '**Un pont commercial entre KCS et RLCS** : un même responsable figure dans la fonction Advisory & Business Development des deux sociétés ; LUKE dispose de sa propre fonction Business Development, qui inclut le marketing (S2).',
      '**Une capacité IA identifiée** : fonctions AI Engineering et Architecture & innovation chez KCS (S2).',
    ]),
    h3('Mécanismes actuels et effets'),
    table(['Mécanisme actuel (constat)', 'Atout (analyse)', 'Point de vigilance (analyse)'], [
      ['Gérant commun aux trois sociétés (S1)', 'Unité de direction, cohérence et rapidité des arbitrages', 'Concentration de la coordination entre sociétés à un seul niveau'],
      ['Un PMO par société, rattaché au gérant (S1) ; celui de LUKE tenu par un consultant KCS (S2)', 'Proximité avec les projets et les clients de chaque société', 'Aucun mécanisme formalisé de coordination entre PMO mentionné dans les sources'],
      ['Collaborateurs intervenant sur les projets des trois sociétés (S1, S2)', 'Flexibilité, partage des compétences', 'Règles d\'affectation et d\'arbitrage à formaliser'],
      ['Fonctions support et BPM centralisées, mêmes titulaires (S1, S2)', 'Cohérence des pratiques, économie de moyens', 'Charge accrue sur quatre personnes si le reporting et l\'analytique s\'étoffent'],
      ['Comptabilité et chiffre d\'affaires propres (S1)', 'Lisibilité juridique, responsabilisation', 'Vision consolidée à construire'],
      ['Charges salariales portées par la société employeuse (S1)', 'Simplicité de gestion', 'Coût des consultants KCS mobilisés pour RLCS ou LUKE non visible dans les comptes de ces sociétés'],
      ['Clientèle et prospection propres ; collaboration commerciale peu structurée (S1)', 'Spécialisation, ancrage commercial', 'Opportunités croisées peu identifiées et peu suivies'],
      ['IA intégrée aux activités (S1) ; AI Engineering chez KCS (S2)', 'Base d\'expérience et de compétences', 'Usages à structurer, encadrer et mesurer à l\'échelle du Groupe'],
    ], [3300, 2800, 3312], { size: 18 }),
    spacer(160),
    h3('Les chantiers engagés en 2026', [['CONSTAT', 'constat']]),
    para('Le plan d\'action stratégique 2026 (S3) a ouvert plusieurs chantiers organisationnels. Trois statuts seulement y sont renseignés ; les autres actions n\'ont pas de statut dans la version transmise. La stratégie 2027 propose de **prolonger ces chantiers plutôt que d\'en ouvrir de nouveaux**.'),
    table(['Chantier 2026 (S3)', 'Statut indiqué', 'Prolongement proposé en 2027'], [
      ['Nouvel organigramme par business unit', { c: 'Terminé', color: '1B7F4B', bold: true }, 'Base de l\'organigramme fonctionnel cible (Axe 1)'],
      ['Fiches de fonction : missions, compétences, catégorisation', { c: 'En cours', color: 'B26A00', bold: true }, 'Finaliser ; compléter par les rôles Groupe et la matrice des responsabilités (Axe 2)'],
      ['Classifications RH et compétences rattachées', { c: 'Terminé', color: '1B7F4B', bold: true }, 'Socle de la cartographie des compétences (Axe 2)'],
      ['Plan d\'évolution RH, critères et procédure d\'évaluation, plan de montée en compétences', { c: 'Non renseigné', color: MUT }, 'Plan de développement des compétences, IA comprise (Axes 2 et 3)'],
      ['Taux de facturation journalier par classe RH', { c: 'Non renseigné', color: MUT }, 'Valorisation indicative des temps mobilisés entre sociétés, sans refacturation (Axe 1)'],
      ['Recrutement et immersion des nouveaux arrivants', { c: 'Non renseigné', color: MUT }, 'Intégration au pilotage des compétences (Axe 2)'],
      ['Outil de gestion des opérations : modules RH et gestion de projets', { c: 'Non renseigné', color: MUT }, 'Support privilégié du suivi des temps et des charges, selon son avancement (Axes 1 et 2)'],
      ['Pilotage de la performance : schéma directeur, contrats d\'objectifs, KPI, outil de pilotage', { c: 'Non renseigné', color: MUT }, 'Tableau de bord stratégique Groupe (Partie III)'],
      ['Catalogues de services et produits, segmentation par société', { c: 'Non renseigné', color: MUT }, 'Offres conjointes et offres intégrant l\'IA (Axes 1 et 3)'],
      ['Cellule d\'innovation, veille technologique et réglementaire', { c: 'Non renseigné', color: MUT }, 'Structuration de l\'IA (Axe 3)'],
      ['Visibilité, événements, prospection, relation client', { c: 'Non renseigné', color: MUT }, 'Synergies commerciales (Axe 1)'],
    ], [4100, 1400, 3912], { size: 18 }),
    spacer(120),

    h2('4. Diagnostic des forces organisationnelles'),
    para('Le diagnostic fait ressortir six forces sur lesquelles la stratégie 2027 peut s\'appuyer.', { after: 100 }),
    ...cards([
      { num: '01', t: 'Une direction unifiée', d: 'Le gérant commun assure la cohérence des orientations entre les trois sociétés (S1).' },
      { num: '02', t: 'Une architecture commune', d: 'Les trois organigrammes suivent le même modèle, ce qui facilite une gouvernance harmonisée (S2).' },
      { num: '03', t: 'Des fonctions déjà mutualisées', d: 'HR/Accounting et BPM servent les trois sociétés avec les mêmes titulaires (S2).' },
      { num: '04', t: 'Une capacité de production partagée', d: 'Le pôle Tech & Delivery de KCS répond à des besoins de RLCS et de LUKE (S2).' },
      { num: '05', t: 'Des sociétés responsabilisées', d: 'Comptabilité, chiffre d\'affaires et clientèle propres maintiennent une responsabilité claire (S1).' },
      { num: '06', t: 'Des bases solides pour innover', d: 'Expertises complémentaires, AI Engineering chez KCS, chantiers 2026 avancés (S2, S3).' },
    ], 2),
    para('**Ces forces sont à préserver** : la stratégie 2027 s\'appuie sur elles au lieu de les remplacer.'),

    h2('5. Axes d\'amélioration'),
    table(['Axe d\'amélioration', 'Origine (constat)', 'Conséquence possible (analyse)', 'Réponse'], [
      ['Formaliser la gouvernance commune', 'Gérant commun ; trois PMO rattachés (S1)', 'Arbitrages concentrés ; règles de décision et délégations à expliciter', 'Axe 1'],
      ['Coordonner les trois PMO', 'Trois PMO distincts (S1)', 'Vision partielle du plan de charge Groupe ; risque de conflits d\'affectation', 'Axes 1 et 2'],
      ['Rendre visible la mobilisation des ressources', 'Consultants KCS sur des fonctions de RLCS et LUKE (S2) ; charges portées par l\'employeur (S1)', 'Rentabilité réelle des projets et contribution de chaque société difficiles à apprécier', 'Axes 1 et 2'],
      ['Consolider le reporting', 'Comptabilités distinctes (S1) ; donnée et pilotage à renforcer chez KCS (S4)', 'Vision Groupe de la performance à construire', 'Axe 1'],
      ['Structurer la collaboration commerciale', 'Prospection propre ; collaboration peu structurée (S1)', 'Opportunités croisées non identifiées ou non suivies', 'Axe 1'],
      ['Clarifier rôles et responsabilités', 'Fiches de fonction en cours (S3) ; personnes présentes dans plusieurs fonctions ou sociétés (S2)', 'Zones de recouvrement ; surcharge des personnes clés', 'Axe 2'],
      ['Structurer les usages de l\'IA', 'IA intégrée aux activités (S1) ; compétences concentrées chez KCS (S2)', 'Risque d\'usages hétérogènes, gains non mesurés, enjeux de confidentialité', 'Axe 3'],
    ], [2350, 2900, 3012, 1150], { firstCol: true, size: 18 }),
    spacer(120),

    h2('6. Enjeux stratégiques pour 2027'),
    table(null, [
      [{ c: '1', color: ORANGE, bold: true, size: 26, align: AlignmentType.CENTER }, ['**Passer d\'une intégration de fait à une gouvernance formalisée.** Le Groupe partage déjà sa direction, ses fonctions support et ses ressources ; il s\'agit d\'en fixer les règles.']],
      [{ c: '2', color: ORANGE, bold: true, size: 26, align: AlignmentType.CENTER }, ['**Comprendre la mobilisation réelle des ressources** avant toute évolution des mécanismes financiers entre sociétés.']],
      [{ c: '3', color: ORANGE, bold: true, size: 26, align: AlignmentType.CENTER }, ['**Convertir la complémentarité en développement commercial**, en préservant l\'autonomie commerciale de chaque société.']],
      [{ c: '4', color: ORANGE, bold: true, size: 26, align: AlignmentType.CENTER }, ['**Doter la Direction d\'une vision consolidée fiable** de la performance, des ressources et des chantiers.']],
      [{ c: '5', color: ORANGE, bold: true, size: 26, align: AlignmentType.CENTER }, ['**Faire de l\'IA un levier mesurable** de productivité et de différenciation, à partir des capacités existantes.']],
      [{ c: '6', color: ORANGE, bold: true, size: 26, align: AlignmentType.CENTER }, ['**Préserver la capacité des personnes clés** : les fonctions mutualisées et les consultants les plus sollicités ne doivent pas devenir des goulots d\'étranglement.']],
    ], [800, 8612], { zebra: false, size: 20, keepTogether: true, borders: { top: thin, left: none, bottom: thin, right: none, insideHorizontal: thin, insideVertical: none } }),
    spacer(160),
    ...callout('Un contexte à confirmer', 'La stratégie de communication de KCS mentionne un contexte d\'« ouverture du capital (2027) » (S5). Si cette perspective est confirmée, la formalisation de la gouvernance et la qualité du reporting consolidé deviennent des enjeux d\'autant plus importants.', 'gray'),

    h2('7. Ambition et vision stratégique du Groupe'),
    ...callout('Vision proposée', [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: fr('« Trois expertises complémentaires, un Groupe coordonné »'), font: FONT, size: 30, bold: true, color: WHITE })] })], 'navy'),
    para('**Ambition 2027** : faire évoluer KCS, RLCS et LUKE vers un Groupe mieux coordonné, plus productif, plus innovant, capable de valoriser pleinement les complémentarités de ses trois sociétés (S1).'),
    para('2027 est conçue comme une **année de structuration et de montée en puissance** : poser les règles communes, mesurer, puis décider sur des bases objectivées. Le modèle visé est **intégré dans le pilotage, autonome dans les métiers et transversal dans les ressources**.'),
    ...figure('maison', 'Architecture de la stratégie 2027 (proposition).', null, { maxHcm: 10 }),
  ];
}

// ---------------------------------------------------------------- Partie II
function orientation(text, color) {
  return callout('Orientation stratégique', text, color === 'orange' ? 'orange' : 'blue', { size: 21, italics: true });
}
function partie2() {
  const out = [
    ...partBanner('Partie II. Les trois axes stratégiques 2027', 'Chaque axe part de la situation actuelle, précise les orientations proposées et les illustre. Le plan d\'action détaillé figure en Partie III.'),
    ...figure('axes', 'Les trois axes stratégiques et leurs dimensions.', null, { maxHcm: 10 }),
  ];

  // ---------------- AXE 1
  out.push(
    h2('Axe 1. Réorganisation et gouvernance du Groupe', { pageBreak: true }),
    ...orientation('Structurer un modèle de gouvernance Groupe intégré, reposant sur un gérant commun, une organisation transversale des ressources et une responsabilisation claire des trois sociétés, afin de renforcer les synergies, l\'efficacité opérationnelle et la performance collective.'),
    h3('Situation actuelle et orientations proposées'),
    table(['Dimension', 'Situation actuelle (constat)', 'Orientation proposée'], [
      ['Gouvernance commune', 'Gérant commun ; Direction Générale et associés (S1, S2)', 'Charte de gouvernance Groupe : rôles, instances, règles de décision, délégations'],
      ['Responsabilités et circuits de décision', 'Arbitrages convergeant vers le gérant (S1)', 'Trois niveaux de décision et règles d\'escalade explicites'],
      ['PMO des sociétés', 'Un PMO par société, rattaché au gérant (S1)', 'Maintien des trois PMO et de leur rattachement ; missions communes précisées'],
      ['Coordination des PMO', 'Aucun mécanisme formalisé mentionné dans les sources', 'Revue de coordination des PMO et fonction de coordination Groupe'],
      ['Fonctions support', 'HR/Accounting centralisée, mêmes titulaires (S1, S2)', 'Catalogue de services partagés et circuit de demande unique'],
      ['Ressources humaines', 'Consultants mobilisés entre sociétés (S2)', 'Compétences et affectations gérées au niveau Groupe (Axe 2)'],
      ['Gestion analytique', 'Charges portées par la société employeuse (S1)', 'Suivi des temps par projet et par société, sans refacturation en 2027'],
      ['Comptabilité et chiffre d\'affaires', 'Propres à chaque société (S1)', 'Préservés à l\'identique, complétés par une lecture analytique'],
      ['Reporting consolidé', 'Axe d\'amélioration identifié par la Direction (S1)', 'Format commun par société, consolidation par BPM, tableau de bord Groupe'],
      ['Synergies commerciales', 'Collaboration encore peu structurée (S1)', 'Pipeline partagé, règles d\'apport d\'affaires, revue commerciale inter-sociétés'],
    ], [2500, 3300, 3612], { firstCol: true, size: 18 }),
    spacer(120),
    h3('Modèle organisationnel cible', [['PROPOSITION', 'proposition']]),
    ...figure('org_cible', 'Organigramme fonctionnel cible. Les éléments en pointillés orange sont des propositions à valider ; leurs titulaires restent à désigner.', null, { maxHcm: 14 }),
    para('Le modèle cible **ne crée pas de nouvelle direction**. Il formalise ce qui existe (gérant commun, fonctions mutualisées, PMO, pool de consultants) et ajoute trois éléments de coordination : un Comité de Direction Groupe, une coordination des PMO et un réseau de référents IA.'),
    para('Il propose d\'élargir la mission de **BPM**, dont l\'intitulé (Business Performance Management) correspond au pilotage de la performance, au reporting consolidé et au suivi analytique. Le périmètre actuel de BPM n\'est pas détaillé dans les sources : cette proposition est à confirmer avec ses titulaires.'),
    h3('Gouvernance et circuits de décision', [['PROPOSITION', 'proposition']]),
    ...figure('gouvernance', 'Schéma de gouvernance proposé : instances et périodicités indicatives.', null, { maxHcm: 11 }),
    table(['Niveau de décision', 'Décisions relevant de ce niveau', 'Escalade'], [
      ['PMO de la société', 'Planification et suivi des projets de la société ; affectation de ses propres ressources', 'Vers la coordination des PMO en cas de conflit de ressources'],
      ['Coordination Groupe des PMO', 'Mobilisations entre sociétés ; arbitrages de charge ; priorités opérationnelles partagées', 'Vers le gérant en l\'absence d\'accord'],
      ['Gérant commun', 'Arbitrages non résolus ; priorités Groupe ; engagements significatifs (seuils à définir)', 'Vers les associés pour les décisions qui leur sont réservées'],
      ['Associés', 'Orientations stratégiques ; décisions réservées, à préciser dans la charte', 'Sans objet'],
    ], [2400, 4312, 2700], { firstCol: true, size: 18 }),
    spacer(120),
    para('La **charte de gouvernance Groupe** proposée rassemble, dans un document court :', { keepNext: true }),
    ...bullets([
      'les rôles du gérant, des associés, des PMO et des fonctions mutualisées ;',
      'la composition et le rythme des instances ;',
      'les règles de décision, d\'escalade et de délégation ;',
      'les règles de mobilisation des ressources et d\'apport d\'affaires entre sociétés.',
    ]),
    h3('Coordination des PMO'),
    ...bullets([
      'Maintenir les trois PMO, au plus près des projets et des clients de chaque société.',
      'Instaurer une revue de coordination toutes les deux semaines (proposition) : plan de charge consolidé, mobilisations entre sociétés, conflits de ressources.',
      'Confier la coordination à une fonction Groupe, à désigner parmi les PMO existants ou à créer (décision à prendre).',
      'Harmoniser les procédures de gestion de projet par type de mission, chantier déjà prévu au plan 2026 (S3).',
    ]),
    h3('Fonctions support mutualisées et gestion transversale des ressources'),
    ...bullets([
      'Formaliser le catalogue de services de HR/Accounting (comptabilité, gestion, RH, juridique) pour les trois sociétés, avec un point d\'entrée unique.',
      'Préciser les niveaux de service attendus, d\'abord de façon qualitative.',
      'Gérer au niveau Groupe la cartographie des compétences et les règles de mobilisation (Axe 2).',
      'Alléger la charge des quatre titulaires des fonctions mutualisées par l\'outillage et l\'automatisation (Axe 3).',
    ]),
    h3('Gestion analytique et préservation des comptabilités', [['PROPOSITION', 'proposition']]),
    ...figure('analytique', 'Un suivi analytique en trois temps, sans refacturation en 2027.', null, { maxHcm: 7 }),
    para('Le suivi analytique a un objectif de **compréhension, pas de facturation**. Il répond à trois questions : quelles ressources chaque société mobilise-t-elle chez les autres ? quel est le coût complet des projets ? quelle est la contribution réelle de chaque société à la performance du Groupe ? La valorisation indicative des temps peut s\'appuyer sur le taux de facturation journalier par classe RH, chantier du plan 2026 (S3).'),
    h3('Reporting consolidé'),
    ...bullets([
      'Un format commun mensuel par société : activité, commercial, ressources, financier.',
      'Une consolidation confiée à BPM (proposition), selon un calendrier compatible avec le Comité de Direction Groupe.',
      'Un appui sur l\'outil de pilotage prévu au plan 2026 (S3), selon son état d\'avancement.',
      'Une distinction entre indicateurs mesurés et indicateurs dont la référence reste à établir, principe déjà retenu par la stratégie de KCS (S4).',
    ]),
    h3('Synergies commerciales', [['PROPOSITION', 'proposition']]),
    ...figure('synergies', 'Une montée en maturité progressive de la collaboration commerciale.', null, { maxHcm: 7.5 }),
    ...bullets([
      'Partager un pipeline des opportunités entre les fonctions Advisory & Business Development des trois sociétés.',
      'Définir des règles d\'apport d\'affaires : la société contractante enregistre le chiffre d\'affaires ; la reconnaissance de l\'apporteur reste à définir.',
      'Organiser la revue commerciale inter-sociétés comme un volet des revues commerciales prévues par la stratégie KCS 2026-2027 (S4), élargi aux responsables de RLCS et de LUKE, plutôt que comme un circuit parallèle.',
      'Prioriser les convergences identifiées : santé et mutualité (KCS, LUKE), risques et conformité (KCS, RLCS), cloud et cybersécurité (KCS, RLCS).',
      'Disposer d\'une présentation commune des offres du Groupe.',
    ]),
  );

  // ---------------- AXE 2
  out.push(
    h2('Axe 2. Renforcement du capital humain et optimisation des ressources', { pageBreak: true }),
    ...orientation('Améliorer l\'organisation, la mobilisation et la productivité des ressources humaines du Groupe, en développant une gestion transversale des compétences et des responsabilités, sans rigidifier les pratiques existantes.', 'orange'),
    h3('Une démarche pragmatique'),
    ...cards([
      { t: 'Partir de l\'existant', d: 'Fiches de fonction, classifications RH et compétences déjà établies en 2026 (S3).', tColor: ORANGE },
      { t: 'Des outils simples', d: 'L\'outil de gestion des opérations s\'il est disponible ; à défaut, un tableur partagé.', tColor: ORANGE },
      { t: 'Un rythme léger', d: 'Saisie hebdomadaire des temps ; points de charge réguliers avec les PMO.', tColor: ORANGE },
      { t: 'Comprendre avant de contrôler', d: 'Les données servent d\'abord à mieux affecter et à protéger les équipes de la surcharge.', tColor: ORANGE },
    ], 2),
    h3('Clarification des rôles et responsabilités'),
    table(['Rôle', 'Statut', 'Missions principales proposées'], [
      ['Gérant commun', 'Existant (S1)', 'Orientations, arbitrages Groupe, animation du Comité de Direction, relation avec les associés'],
      ['Associés', 'Existant (S2)', 'Validation des orientations et des décisions réservées, à préciser dans la charte'],
      ['PMO de chaque société', 'Existant (S1, S2)', 'Planification et suivi des projets, plan de charge, remontée des besoins de ressources'],
      ['Coordination Groupe des PMO', { c: 'Proposé', color: 'C8401C', bold: true }, 'Consolidation du plan de charge, arbitrages de premier niveau, animation de la revue des PMO'],
      ['HR/Accounting', 'Existant (S2)', 'Comptabilité, gestion, RH et juridique pour les trois sociétés'],
      ['BPM', { c: 'Existant (S2), mission élargie proposée', color: 'C8401C' }, 'Reporting consolidé, suivi analytique, tableau de bord Groupe, registre des risques'],
      ['Advisory & Business Development', 'Existant (S2)', 'Développement commercial de chaque société, partage des opportunités'],
      ['Collaborateurs', 'Existant', 'Réalisation des missions, saisie des temps, signalement des surcharges'],
      ['Référents IA', { c: 'Proposé', color: 'C8401C', bold: true }, 'Accompagnement des usages, diffusion des bonnes pratiques, remontée des cas d\'usage'],
    ], [2700, 2300, 4412], { firstCol: true, size: 18 }),
    spacer(120),
    h3('Matrice des responsabilités proposée', [['PROPOSITION', 'proposition']]),
  );
  const rc = (v) => ({ c: v, align: AlignmentType.CENTER, bold: v.includes('A') || v.includes('R'), color: v.includes('A') ? ORANGE : v.includes('R') ? BLUE : MUT });
  const raci = [
    ['Définition et suivi de la stratégie 2027', 'A/R', 'C', 'C', 'C', 'C', 'C', 'I'],
    ['Planification et suivi d\'un projet', 'I', 'I', 'A/R', '-', '-', 'I', 'C'],
    ['Demande de mobilisation d\'un collaborateur d\'une autre société', 'I', 'C', 'R', 'C', '-', '-', 'I'],
    ['Validation d\'une mobilisation entre sociétés', 'I', 'A', 'C', 'R', '-', 'I', 'I'],
    ['Arbitrage d\'un conflit de ressources', 'A', 'R', 'C', 'C', '-', '-', 'I'],
    ['Saisie et validation des temps', '-', 'I', 'A', 'I', '-', 'C', 'R'],
    ['Signalement et traitement d\'une surcharge', 'I', 'C', 'C', 'A', '-', '-', 'R'],
    ['Production des données de reporting de la société', 'I', 'I', 'A/R', '-', 'C', 'C', '-'],
    ['Reporting consolidé Groupe', 'A', 'C', 'C', '-', 'C', 'R', '-'],
    ['Cartographie des compétences et plan de développement', 'A', 'C', 'C', 'C', 'R', '-', 'C'],
  ].map((r) => [r[0], ...r.slice(1).map(rc)]);
  out.push(
    table(['Activité', 'Gérant', 'Coord. PMO', 'PMO porteur', 'PMO employeur', 'HR/ Acc.', 'BPM', 'Collab.'], raci, [2900, 930, 930, 930, 930, 930, 930, 932], { firstCol: true, size: 17, keepTogether: true }),
    note('R : réalise. A : décide et rend compte, un seul A par activité. C : consulté. I : informé. « - » : non concerné. PMO porteur : PMO de la société qui porte le projet ; PMO employeur : PMO de la société qui emploie le collaborateur. Matrice à ajuster et valider en Comité de Direction.'),
    h3('Identification des compétences disponibles'),
    table(['Rubrique', 'Contenu proposé', 'Appui'], [
      ['Domaines d\'expertise', 'Marchés financiers, risques, actuariat, data, cloud, cybersécurité, santé, ingénierie logicielle, IA', 'Matrice des expertises (Partie I)'],
      ['Fonctions', 'Fonctions des organigrammes : PMO, Business Analyst, Software Engineering, etc.', 'S2'],
      ['Niveau', 'Rattachement aux classifications RH existantes', 'S3'],
      ['Compétences IA', 'Niveau d\'usage et de maîtrise des outils d\'IA', 'Axe 3'],
      ['Disponibilité', 'Charge actuelle et prévisionnelle', 'Suivi des charges'],
      ['Mise à jour', 'Semestrielle (proposition)', 'PMO, HR/Accounting'],
    ], [2200, 4900, 2312], { firstCol: true, size: 18 }),
    spacer(120),
    h3('Mobilisation des collaborateurs sur les projets', [['PROPOSITION', 'proposition']]),
    ...figure('mobilisation', 'Processus de mobilisation d\'un collaborateur entre sociétés.', null, { maxHcm: 6 }),
    para('Ce processus formalise une pratique existante. Il ne crée pas d\'étape supplémentaire lorsque la mobilisation fait consensus ; il donne une règle claire en cas de conflit de priorités.'),
    h3('Suivi simple des charges de travail par projet'),
    ...bullets([
      '**Unité** : la demi-journée (proposition).',
      '**Fréquence** : hebdomadaire.',
      '**Axes de saisie** : projet, société porteuse, société employeuse.',
      '**Outil** : modules RH ou gestion de projets de l\'outil de gestion des opérations (S3) s\'ils sont disponibles ; sinon, un tableur partagé.',
      '**Restitution** : plan de charge consolidé pour la revue des PMO.',
    ]),
    ...callout('Un seul dispositif de saisie, trois usages', 'Les mêmes données servent le plan de charge (Axe 2), le suivi analytique entre sociétés (Axe 1) et la mesure des gains liés à l\'IA (Axe 3). Cette mutualisation limite l\'effort demandé aux collaborateurs.', 'blue'),
    h3('Coordination entre collaborateurs et PMO'),
    ...bullets([
      'Un point de charge régulier entre chaque PMO et les collaborateurs mobilisés.',
      'Un canal simple de signalement des surcharges.',
      'Une visibilité du planning pour les collaborateurs qui interviennent pour plusieurs sociétés.',
      'Un interlocuteur PMO de référence pour chaque collaborateur mobilisé.',
    ]),
    h3('Développement progressif des compétences et productivité'),
    ...bullets([
      'Finaliser les chantiers RH 2026 : plan d\'évolution, critères d\'évaluation, plan de montée en compétences (S3).',
      'Retenir trois priorités 2027 (proposition) : IA, gestion de projet, expertises croisées entre sociétés.',
      'Constituer des binômes entre sociétés pour diffuser les expertises, par exemple entre l\'actuariat de RLCS et les équipes marchés financiers de KCS.',
      'Capitaliser : retours d\'expérience, modèles de livrables partagés.',
      'Agir sur la productivité : meilleure affectation, réduction des temps d\'attente de ressources, automatisation des tâches répétitives (Axe 3).',
    ]),
  );

  // ---------------- AXE 3
  out.push(
    h2('Axe 3. Transformation par l\'intelligence artificielle et renforcement de la productivité', { pageBreak: true }),
    ...orientation('Faire de l\'intelligence artificielle un levier transversal de transformation, d\'innovation, d\'amélioration de la productivité et de développement de nouvelles solutions métiers pour l\'ensemble du Groupe.'),
    ...callout('Le Groupe ne part pas de zéro', [
      'Les équipes disposent déjà de bases en IA et le Groupe a commencé à développer et intégrer des solutions utilisant cette technologie (S1). KCS dispose de fonctions AI Engineering et Architecture & innovation (S2) ; le plan 2026 prévoit une cellule d\'innovation et une veille technologique (S3) ; l\'offre Microsoft de KCS intègre Copilot (S5).',
      '**L\'enjeu de 2027 : consolider les initiatives existantes, structurer les usages et accélérer progressivement les projets engagés.**',
    ], 'navy'),
    ...figure('ia_trajectoire', 'Trajectoire IA 2027 : consolider, structurer, accélérer.', null, { maxHcm: 5.0 }),
    ...figure('ia_dimensions', 'Les quatre dimensions de l\'axe IA.', null, { maxHcm: 6.8 }),
    h3('Dimension 1. Renforcement des compétences en IA'),
    ...bullets([
      '**Compétences existantes** : état des lieux des usages et des niveaux de maîtrise (cartographie, Axe 2).',
      '**Accompagnement** : ateliers pratiques sur des cas réels du Groupe, partage de modèles.',
      '**Maîtrise des outils** : formation aux outils retenus et à la vérification des résultats.',
      '**Référents internes** : au moins un par société (proposition), appuyés par l\'AI Engineering de KCS.',
    ]),
    h3('Dimension 2. Intégration de l\'IA dans les processus métiers'),
    table(['Usage', 'Apport attendu (qualitatif, gains à mesurer)', 'Points de vigilance'], [
      ['Génération et automatisation des rapports', 'Réduction du temps de production des rapports de mission, de suivi et du reporting consolidé', 'Relecture humaine avant diffusion ; données clients'],
      ['Analyse intelligente des documents', 'Exploitation plus rapide de documents volumineux : cahiers des charges, textes réglementaires, contrats', 'Confidentialité ; fiabilité des synthèses'],
      ['Sécurisation et conformité', 'Appui aux contrôles de conformité et à la détection d\'anomalies', 'Responsabilité finale humaine ; traçabilité'],
      ['Optimisation des processus internes', 'Allègement des tâches répétitives de HR/Accounting, de BPM et des PMO', 'Priorité aux processus à fort volume'],
    ], [2700, 3900, 2812], { firstCol: true, size: 18 }),
    h3('Dimension 3. Développement des solutions et offres intégrant l\'IA'),
    table(['Société', 'Orientation (S1)', 'Pistes à instruire (hypothèses à valider avec les équipes)'], [
      [{ c: 'KCS', color: BLUE }, 'Enrichir les solutions métiers', 'Fonctions d\'assistance dans les suites ATLANTIS, TREND et AXIAGUARD (S4, S5) : aide à l\'analyse, automatisation de traitements et de reporting'],
      [{ c: 'RLCS', color: RL }, 'Développer les capacités RiskTech', 'Appui aux travaux d\'actuariat, de risk management, de performance et d\'ALM (S2) ; analyse de données de risques'],
      [{ c: 'LUKE', color: LU }, 'Intégrer des fonctionnalités intelligentes aux solutions e-santé', 'Aide à l\'exploitation des données et à la gestion documentaire pour les segments mutualité et e-santé (S3), dans le respect des exigences applicables aux données de santé'],
      [{ c: 'Groupe', color: NAVY }, 'Valoriser commercialement', 'Catalogue des offres intégrant l\'IA, démonstrateurs, références ; mutualisation des composants entre sociétés'],
    ], [1400, 2900, 5112], { firstCol: true, size: 18 }),
    spacer(120),
    h3('Dimension 4. Encadrement des usages et amélioration de la productivité', [['PROPOSITION', 'proposition']]),
    para('Contenu proposé pour une **charte d\'usage de l\'IA** du Groupe :', { keepNext: true }),
    table(['Thème', 'Règle proposée'], [
      ['Sécurité et confidentialité', 'Classification des données (publiques, internes, confidentielles clients, personnelles et de santé) ; aucune donnée confidentielle dans un outil non validé'],
      ['Outils autorisés', 'Liste des outils validés, tenue à jour par le réseau des référents IA'],
      ['Bonnes pratiques', 'Guides d\'utilisation, modèles de requêtes, documentation des usages'],
      ['Contrôle de la qualité', 'Relecture et validation humaines de tout contenu produit avec l\'IA avant usage client ; vérification des sources et des chiffres'],
      ['Conformité', 'Réglementation applicable aux données personnelles et de santé, à confirmer selon les pays d\'intervention ; engagements contractuels envers les clients'],
      ['Évaluation des gains', 'Mesure avant et après sur les cas d\'usage pilotes, à partir du suivi des charges (Axe 2)'],
    ], [2700, 6712], { firstCol: true, size: 18 }),
  );
  return out;
}

// --------------------------------------------------------------- Partie III
function planTable(rows) {
  const widths = [1250, 2300, 3700, 2600, 2600, 2120];
  const hz = { T1: ['T1 2027', BL, BLUE], T23: ['T2 et T3 2027', BMID, '1747C2'], T4: ['T4 2027', OL, 'C8401C'] };
  const counts = {};
  rows.forEach((r) => { counts[r[0]] = (counts[r[0]] || 0) + 1; });
  const seen = {};
  const data = rows.map((r) => {
    const first = !seen[r[0]]; seen[r[0]] = true;
    const [lab, fill, col] = hz[r[0]];
    const hcell = first ? { c: lab, fill, color: col, bold: true, rowSpan: counts[r[0]], vAlign: VerticalAlign.CENTER, align: AlignmentType.CENTER } : null;
    return [hcell, { c: r[1], bold: true, color: NAVY }, r[2], r[3], r[4], r[5]];
  });
  return table(['Horizon', 'Objectif stratégique', 'Actions prioritaires', 'Résultats attendus', 'Indicateurs de suivi', 'Pilotage proposé'], data, widths, { size: 17, zebra: false });
}
const planNote = () => note('Budgets, cibles chiffrées, échéances précises et responsables nominatifs : à définir lors de la validation. Les fonctions citées en pilotage sont des propositions.', { after: 160 });

function partie3() {
  return [
    ...partBanner('Partie III. Mise en œuvre et pilotage', 'Le plan d\'action suit trois horizons : court terme (T1 2027, cadrer et lancer), moyen terme (T2 et T3, déployer et structurer) et consolidation (T4, consolider et décider). Suivent le dispositif de pilotage et l\'analyse des risques.'),
    h2('1. Plan d\'action stratégique 2027'),
    ...figure('frise', 'Frise chronologique du plan d\'action 2027 (calendrier indicatif).', null, { landscape: true, maxHcm: 11.2 }),
    h3('Axe 1. Réorganisation et gouvernance du Groupe'),
    planTable([
      ['T1', '1.1 Formaliser la gouvernance commune', 'Rédiger la charte de gouvernance Groupe ; formaliser les circuits de décision ; installer le Comité de Direction Groupe et la revue stratégique', 'Charte validée par la Direction Générale et les associés ; instances en fonctionnement', 'Charte validée ; instances tenues sur instances prévues', 'Gérant'],
      ['T1', '1.2 Organiser la coordination des PMO', 'Décider de la fonction de coordination et de son titulaire ; instaurer la revue des PMO ; produire un premier plan de charge consolidé', 'Vision partagée des projets et des ressources', 'Revues tenues ; plan de charge consolidé à jour', 'Gérant, PMO des trois sociétés'],
      ['T1', '1.3 Lancer le suivi analytique (mesure)', 'Définir la codification des projets et des sociétés ; fixer les règles de saisie ; démarrer la collecte', 'Première base de données sur la mobilisation entre sociétés', 'Taux de saisie des temps', 'BPM (proposé), PMO'],
      ['T23', '1.4 Structurer les fonctions mutualisées', 'Catalogue de services HR/Accounting ; circuit de demande unique ; mission élargie de BPM', 'Offre de service claire pour les trois sociétés', 'Demandes traitées ; satisfaction des sociétés (à mesurer)', 'HR/Accounting, BPM'],
      ['T23', '1.5 Fiabiliser le reporting consolidé', 'Format commun mensuel par société ; tableau de bord Groupe ; calendrier de production', 'Reporting homogène et consolidé, disponible pour le Comité de Direction', 'Respect du calendrier ; complétude des données', 'BPM (proposé)'],
      ['T23', '1.6 Développer les synergies commerciales', 'Pipeline partagé ; règles d\'apport d\'affaires ; volet inter-sociétés des revues commerciales ; présentation commune des offres', 'Opportunités croisées identifiées et suivies', 'Opportunités inter-sociétés identifiées et converties ; offres conjointes', 'Gérant, Advisory & BD des trois sociétés'],
      ['T4', '1.7 Évaluer et ajuster le modèle', 'Bilan de la gouvernance ; analyse annuelle des données analytiques ; décision sur un éventuel mécanisme de répartition à partir de 2028', 'Modèle ajusté ; décision documentée', 'Bilan réalisé ; décision formalisée', 'Gérant, associés'],
    ]),
    planNote(),
    h3('Axe 2. Renforcement du capital humain et optimisation des ressources'),
    planTable([
      ['T1', '2.1 Clarifier les rôles et responsabilités', 'Finaliser les fiches de fonction (chantier 2026) ; valider la matrice des responsabilités ; la diffuser', 'Rôles connus et partagés', 'Fonctions couvertes par une fiche ; matrice validée', 'Gérant, HR/Accounting'],
      ['T1', '2.2 Cartographier les compétences', 'Référentiel adossé aux classifications RH ; auto-évaluation validée par les PMO ; consolidation', 'Vision Groupe des compétences et des disponibilités', 'Collaborateurs cartographiés', 'HR/Accounting, PMO'],
      ['T1', '2.3 Mettre en place le suivi des charges', 'Choix de l\'outil, l\'existant en priorité ; règle de saisie hebdomadaire ; première restitution', 'Plan de charge par projet et par société', 'Taux de saisie ; plan de charge produit', 'PMO, coordination des PMO'],
      ['T23', '2.4 Organiser la mobilisation entre sociétés', 'Processus de demande et d\'arbitrage ; planning partagé', 'Mobilisations plus rapides et arbitrées', 'Délai de mobilisation ; conflits remontés et résolus', 'Coordination des PMO'],
      ['T23', '2.5 Renforcer la coordination collaborateurs et PMO', 'Points de charge réguliers ; canal de signalement des surcharges', 'Surcharges détectées et traitées plus tôt', 'Alertes signalées et traitées', 'PMO'],
      ['T23', '2.6 Développer les compétences', 'Plan de développement 2027 : IA, gestion de projet, expertises croisées ; binômes entre sociétés', 'Montée en compétences ciblée', 'Actions réalisées sur actions prévues ; participation', 'HR/Accounting, référents IA'],
      ['T4', '2.7 Mesurer la productivité et ajuster', 'Analyse annuelle des charges ; bilan des compétences ; revue des rôles', 'Bases objectivées pour 2028', 'Taux d\'occupation ; part du temps consacré aux projets clients', 'Gérant, PMO'],
    ]),
    planNote(),
    h3('Axe 3. Transformation par l\'intelligence artificielle et productivité'),
    planTable([
      ['T1', '3.1 Recenser et structurer l\'existant', 'Inventaire des usages, outils et projets IA des trois sociétés ; désignation des référents IA ; premier réseau', 'Vision partagée des initiatives IA', 'Inventaire réalisé ; référents désignés', 'Gérant, AI Engineering (KCS)'],
      ['T1', '3.2 Encadrer les usages', 'Charte d\'usage ; classification des données ; liste des outils validés ; règle de relecture humaine', 'Usages sécurisés et homogènes', 'Charte diffusée ; collaborateurs informés', 'Référents IA, HR/Accounting (volet juridique)'],
      ['T23', '3.3 Renforcer les compétences IA', 'Parcours par niveau ; ateliers pratiques ; partage de modèles', 'Maîtrise accrue des outils', 'Participation ; usages déclarés', 'Référents IA, HR/Accounting'],
      ['T23', '3.4 Intégrer l\'IA dans les processus', 'Cas d\'usage pilotes : rapports, analyse documentaire, processus internes ; mesure avant et après', 'Gains démontrés sur des cas réels', 'Cas d\'usage déployés ; temps gagné mesuré', 'PMO, référents IA, BPM'],
      ['T23', '3.5 Enrichir les solutions', 'Feuille de route IA par société : solutions métiers KCS, capacités RiskTech RLCS, solutions e-santé LUKE', 'Fonctionnalités IA planifiées et livrées', 'Feuilles de route validées ; fonctionnalités livrées', 'Tech & Delivery de chaque société, AI Engineering'],
      ['T4', '3.6 Valoriser et évaluer', 'Catalogue des offres intégrant l\'IA ; supports commerciaux ; bilan des gains ; feuille de route 2028', 'Offres formalisées ; bilan partagé', 'Offres formalisées ; opportunités liées à l\'IA ; gains mesurés', 'Gérant, Advisory & BD'],
    ]),
    planNote(),
  ];
}

function pilotageSection() {
  return [
    h2('2. Dispositif de pilotage et de suivi', { pageBreak: false }),
    para('Le dispositif proposé permet à la Direction Générale de suivre l\'exécution de la stratégie à trois niveaux, avec un nombre limité d\'indicateurs et des revues à rythme régulier.'),
    h3('Architecture du dispositif', [['PROPOSITION', 'proposition']]),
    ...figure('pyramide', 'Trois niveaux de pilotage.', null, { maxHcm: 7 }),
    h3('Revues périodiques de performance'),
    table(['Revue', 'Fréquence proposée', 'Participants', 'Contenu', 'Livrable'], [
      ['Suivi opérationnel', 'Toutes les deux semaines', 'Coordination des PMO, PMO', 'Plan de charge, mobilisations, alertes', 'Plan de charge consolidé'],
      ['Comité de Direction Groupe', 'Mensuelle', 'Gérant, PMO, HR/Accounting, BPM, Advisory & BD', 'Tableau de bord mensuel, chantiers, risques', 'Relevé de décisions'],
      ['Revue stratégique', 'Trimestrielle', 'Gérant, associés', 'Tableau de bord stratégique, jalons, ajustements', 'Note de revue trimestrielle'],
      ['Bilan annuel', 'Fin du T4 2027', 'Gérant, associés', 'Bilan de la stratégie 2027, décisions pour 2028', 'Bilan et orientations 2028'],
    ], [1900, 1500, 2100, 2200, 1712], { firstCol: true, size: 18 }),
    spacer(120),
    h3('Tableau de bord stratégique Groupe'),
    para('Le tableau de bord distingue cinq familles d\'indicateurs. Chacun est suivi au niveau de chaque société, du Groupe, ou des deux.', { keepNext: true }),
    table(['Catégorie', 'Indicateur', 'Niveau', 'Fréquence', 'Cible 2027'], [
      [{ c: 'Organisationnelle', rowSpan: 3, fill: BL, color: BLUE, bold: true, vAlign: VerticalAlign.CENTER }, 'Instances tenues sur instances prévues', 'Groupe', 'Mensuelle', 'À définir'],
      [null, 'Jalons des chantiers atteints sur jalons prévus', 'Groupe', 'Mensuelle', 'À définir'],
      [null, 'Délai de production du reporting consolidé', 'Groupe', 'Mensuelle', 'À définir'],
      [{ c: 'Commerciale', rowSpan: 3, fill: OL, color: 'C8401C', bold: true, vAlign: VerticalAlign.CENTER }, 'Pipeline d\'opportunités', 'Société', 'Mensuelle', 'À définir'],
      [null, 'Opportunités inter-sociétés identifiées et converties', 'Société et Groupe', 'Mensuelle', 'À définir'],
      [null, 'Offres conjointes formalisées', 'Groupe', 'Trimestrielle', 'À définir'],
      [{ c: 'Financière', rowSpan: 3, fill: 'E3E7F0', color: NAVY, bold: true, vAlign: VerticalAlign.CENTER }, 'Chiffre d\'affaires par société et consolidé', 'Société et Groupe', 'Mensuelle', 'À définir'],
      [null, 'Jours mobilisés entre sociétés', 'Société et Groupe', 'Mensuelle', 'Observation en 2027, sans cible'],
      [null, 'Marge analytique par projet, ressources mobilisées comprises', 'Société', 'Trimestrielle', 'À définir'],
      [{ c: 'Humaine', rowSpan: 4, fill: 'E1E9F3', color: RL, bold: true, vAlign: VerticalAlign.CENTER }, 'Taux de saisie des temps', 'Société', 'Mensuelle', 'À définir'],
      [null, 'Taux d\'occupation des collaborateurs', 'Société et Groupe', 'Mensuelle', 'À définir'],
      [null, 'Alertes de surcharge signalées et traitées', 'Société', 'Mensuelle', 'À définir'],
      [null, 'Réalisation du plan de développement des compétences', 'Groupe', 'Trimestrielle', 'À définir'],
      [{ c: 'Technologique', rowSpan: 4, fill: 'DFF0F1', color: LU, bold: true, vAlign: VerticalAlign.CENTER }, 'Adoption des outils d\'IA validés', 'Société et Groupe', 'Trimestrielle', 'À définir'],
      [null, 'Cas d\'usage IA déployés et gains de temps mesurés', 'Groupe', 'Trimestrielle', 'À définir'],
      [null, 'Fonctionnalités IA intégrées aux solutions', 'Société', 'Trimestrielle', 'À définir'],
      [null, 'Incidents liés à l\'usage de l\'IA (confidentialité, qualité)', 'Groupe', 'Mensuelle', 'À définir'],
    ], [1800, 3600, 1500, 1200, 1312], { size: 18, zebra: false }),
    note('Les cibles seront fixées après une première période de mesure, principe déjà retenu par la stratégie de KCS : « la mesure est mise en place avant toute cible chiffrée » (S4).'),
    ...figure('dashboard', 'Maquette du tableau de bord stratégique Groupe (sans données).', null, { maxHcm: 7.8 }),
    h3('Indicateurs propres à chaque société et indicateurs consolidés'),
    table(['Périmètre', 'Indicateurs spécifiques proposés'], [
      [{ c: 'KCS', color: BLUE }, ['- Avancement des fonctionnalités IA dans les solutions métiers', '- Jours de consultants mis à disposition des autres sociétés', '- Opportunités apportées et reçues ; indicateurs commerciaux de la stratégie KCS 2026-2027 (S4)']],
      [{ c: 'RLCS', color: RL }, ['- Développement des capacités RiskTech', '- Mobilisation de ses expertises sur les projets des autres sociétés ; jours de consultants KCS reçus', '- Opportunités apportées et reçues']],
      [{ c: 'LUKE', color: LU }, ['- Intégration de fonctionnalités intelligentes aux solutions e-santé', '- Conformité des usages de données de santé ; jours de consultants KCS reçus', '- Opportunités apportées et reçues']],
      [{ c: 'Groupe (consolidé)', color: NAVY }, ['- Chiffre d\'affaires consolidé ; flux de ressources entre sociétés', '- Avancement des chantiers ; adoption de l\'IA ; opportunités inter-sociétés']],
    ], [2200, 7212], { firstCol: true, size: 18 }),
    spacer(120),
    h3('Suivi de l\'avancement des chantiers'),
    para('Chaque chantier du plan d\'action dispose d\'une fiche courte : objectif, pilote, jalons, état d\'avancement, risques, décisions attendues. L\'état est codé selon trois niveaux, examinés en Comité de Direction Groupe :', { keepNext: true }),
    table(null, [
      [{ c: 'Vert', fill: 'DFF3E7', color: '1B7F4B', bold: true, align: AlignmentType.CENTER }, 'Conforme au calendrier ; aucune décision requise'],
      [{ c: 'Orange', fill: 'FFF1D6', color: 'B26A00', bold: true, align: AlignmentType.CENTER }, 'Écart ou risque identifié ; mesure corrective à l\'étude'],
      [{ c: 'Rouge', fill: 'FDE2E2', color: 'B42318', bold: true, align: AlignmentType.CENTER }, 'Écart significatif ; arbitrage du Comité de Direction ou du gérant requis'],
    ], [1600, 7812], { zebra: false, size: 19 }),
    spacer(160),
    h3('Identification des risques et mesures correctives'),
    ...numbered([
      '**Identifier** : un registre des risques tenu par BPM (proposition), alimenté par les PMO et les référents.',
      '**Évaluer** : criticité appréciée en Comité de Direction lors du lancement, puis chaque mois.',
      '**Traiter** : pour chaque risque significatif, une mesure corrective, un pilote et une échéance.',
      '**Escalader** : au gérant, puis en revue stratégique trimestrielle si la mesure ne suffit pas.',
    ]),

    h2('3. Risques et conditions de réussite', { pageBreak: true }),
    table(['Risque', 'Signaux d\'alerte', 'Mesures de prévention et d\'atténuation', 'Pilotage proposé'], [
      ['Résistance au changement', 'Faible participation aux instances ; saisie des temps incomplète ; contournement des règles', 'Expliquer le sens de la démarche ; associer PMO et collaborateurs à la conception des outils ; progressivité ; valoriser les premiers résultats', 'Gérant, PMO'],
      ['Manque de clarification des responsabilités', 'Décisions en attente ; doublons ; conflits d\'affectation récurrents', 'Charte de gouvernance ; fiches de fonction ; matrice des responsabilités diffusée et revue chaque trimestre', 'Gérant, coordination des PMO'],
      ['Surcharge des ressources', 'Alertes de surcharge ; retards de projets ; sollicitation accrue des quatre titulaires des fonctions mutualisées et des consultants KCS', 'Plan de charge consolidé ; arbitrages en revue des PMO ; échelonnement des chantiers ; temps réservé aux chantiers ; automatisation', 'Coordination des PMO, gérant'],
      ['Faible coordination entre les sociétés', 'Opportunités non partagées ; revues commerciales peu alimentées', 'Volet inter-sociétés des revues commerciales ; règles d\'apport d\'affaires ; reconnaissance des contributions', 'Gérant, Advisory & BD'],
      ['Insuffisance de suivi des performances', 'Tableaux de bord non produits ou en retard ; indicateurs non renseignés', 'Nombre limité d\'indicateurs ; calendrier de production ; consolidation confiée à BPM ; revue mensuelle', 'BPM, gérant'],
      ['Risques liés à l\'utilisation de l\'IA', 'Données confidentielles exposées ; erreurs dans des livrables ; usages non déclarés', 'Charte d\'usage ; outils validés ; relecture humaine obligatoire ; sensibilisation ; registre des incidents', 'Référents IA, gérant'],
      ['Difficultés d\'adoption des nouveaux outils', 'Faible usage ; retour aux pratiques antérieures', 'Outils existants privilégiés ; formation pratique ; référents de proximité ; recueil des retours utilisateurs', 'Référents IA, PMO'],
    ], [2000, 2500, 3412, 1500], { firstCol: true, firstColColor: NAVY, size: 18 }),
    note('Criticité de chaque risque : à évaluer en Comité de Direction lors du lancement.'),
    h3('Conditions de réussite'),
    ...cards([
      { num: '1', t: 'Un portage visible', d: 'Le gérant et les associés portent la démarche et arbitrent rapidement.' },
      { num: '2', t: 'Des premiers résultats rapides', d: 'Charte, instances et suivi des temps opérationnels dès le premier trimestre.' },
      { num: '3', t: 'Des pilotes désignés', d: 'Un responsable par chantier dès la validation du document.' },
      { num: '4', t: 'Des outils simples', d: 'Intégrés aux pratiques et aux outils existants, sans double saisie.' },
      { num: '5', t: 'Une communication régulière', d: 'Les équipes connaissent les objectifs, les règles et les résultats obtenus.' },
      { num: '6', t: 'Du temps réservé', d: 'Les chantiers disposent d\'un temps distinct de la charge des projets clients.' },
    ], 3, { tSize: 20, dSize: 18 }),
  ];
}

function conclusionSection() {
  const pr = (n, t, d, fill) => ({ c: [new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: n, font: FONT, bold: true, size: 40, color: WHITE })] }),
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: fr(t), font: FONT, bold: true, size: 22, color: WHITE })] }),
    new Paragraph({ spacing: { after: 0, line: 260 }, children: [new TextRun({ text: fr(d), font: FONT, size: 19, color: WHITE })] })], fill });
  return [
    h1('Conclusion et ambition 2027'),
    para('La stratégie 2027 ne propose pas de rupture. Elle part d\'une organisation qui fonctionne, un gérant commun, des fonctions mutualisées, trois PMO et des consultants capables d\'intervenir pour les trois sociétés, pour lui donner **un cadre, des outils de mesure et des leviers d\'accélération**.'),
    para('2027 doit être l\'année de la **structuration et de la montée en puissance** du Groupe. Les règles communes seront posées au premier trimestre, déployées au cours de l\'année, puis évaluées au quatrième trimestre sur la base de données objectivées. Les décisions structurantes, comme un éventuel mécanisme de répartition des charges entre sociétés, seront prises sur ces bases et non sur des hypothèses.'),
    para('Trois priorités portent cette ambition :', { keepNext: true }),
    table(null, [[
      pr('1', 'Une gouvernance plus structurée', 'Une charte, des instances, des circuits de décision clairs et un reporting consolidé.', BLUE),
      pr('2', 'Un capital humain mieux organisé et plus performant', 'Des rôles clarifiés, des compétences cartographiées, une mobilisation arbitrée.', ORANGE),
      pr('3', 'Une intégration accrue de l\'IA', 'Dans les métiers, les solutions et les méthodes de travail, avec des usages encadrés et des gains mesurés.', NAVY),
    ]], [3137, 3137, 3138], { zebra: false, borders: { top: none, left: none, bottom: none, right: none, insideHorizontal: none, insideVertical: { style: BorderStyle.SINGLE, size: 24, color: WHITE } } }),
    spacer(200),
    ...callout(null, [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60, line: 300 }, children: [new TextRun({ text: fr('L\'ambition : faire de KCS, RLCS et LUKE un Groupe mieux coordonné, plus productif, plus innovant, et capable de valoriser pleinement les complémentarités de ses trois sociétés.'), font: FONT, size: 24, bold: true, color: NAVY })] })], 'blue'),
    h3('Prochaines étapes proposées'),
    ...numbered([
      'Présenter et discuter le document avec la Direction Générale et les associés.',
      'Arbitrer les propositions, en particulier les sept décisions listées en synthèse.',
      'Compléter les éléments manquants recensés en annexe.',
      'Désigner les pilotes et lancer les chantiers du premier trimestre 2027.',
    ]),
  ];
}

function annexeSection() {
  return [
    h1('Annexe. Éléments à compléter avant validation'),
    para('Les éléments suivants n\'étaient pas disponibles dans les sources ou nécessitent une confirmation. Ils conditionnent la finalisation du document.'),
    table(['Élément', 'Usage dans le document', 'Statut'], [
      ['Périmètre actuel de la fonction BPM', 'Mission élargie proposée (Axe 1)', 'À confirmer'],
      ['Composition des instances de gouvernance', 'Axe 1, Partie III', 'À valider'],
      ['Titulaires des fonctions proposées : coordination des PMO, référents IA', 'Plan d\'action', 'À désigner'],
      ['Inventaire des usages et solutions IA existants', 'Axe 3', 'Action prévue au T1 2027'],
      ['Avancement de l\'outil de gestion des opérations et de l\'outil de pilotage', 'Suivi des temps, tableau de bord', 'À confirmer (sans statut dans S3)'],
      ['Statut des chantiers 2026 non renseignés', 'Continuité 2026-2027', 'À mettre à jour'],
      ['Données commerciales et financières de RLCS et de LUKE', 'Présentation des sociétés, tableau de bord', 'Non communiquées'],
      ['Cibles chiffrées des indicateurs', 'Tableau de bord', 'À définir'],
      ['Budgets des chantiers', 'Plan d\'action', 'À définir'],
      ['Seuils d\'engagement et décisions réservées aux associés', 'Circuits de décision', 'À définir'],
      ['Perspective d\'ouverture du capital en 2027 (S5)', 'Enjeux 2027', 'À confirmer'],
      ['Nombre de pays couverts par KCS : 13 selon S4, « 15+ » selon S5', 'Présentation du Groupe', 'À harmoniser'],
    ], [4400, 3000, 2012], { firstCol: true, size: 18 }),
    spacer(160),
    h3('Note de méthode sur les décomptes'),
    para('Les décomptes de la figure 3 et de la Partie I correspondent aux noms affichés sur les trois organigrammes 2026 (S2). Dans la figure 3, un nom présent dans deux fonctions est compté dans chacune ; dans les totaux par société et pour le Groupe, chaque nom n\'est compté qu\'une fois. Les postes indiqués « Consultant KCS » ne sont pas nominatifs et ne sont pas décomptés. Ces chiffres ne remplacent pas les effectifs officiels, à confirmer par HR/Accounting.', { size: 19 }),
  ];
}

// ======================================================================
//                              ASSEMBLAGE
// ======================================================================
const objet = objetSection();
const synth = syntheseSection();
const p1 = partie1();
const p2 = partie2();
const p3 = partie3();
const pil = pilotageSection();
const concl = conclusionSection();
const annexe = annexeSection();

const portraitProps = { page: { size: { width: P.w, height: P.h }, margin: { top: P.mt, left: P.ml, bottom: P.mb, right: P.mr, header: 680, footer: 600 } } };
const landscapeProps = { page: { size: { width: P.w, height: P.h, orientation: PageOrientation.LANDSCAPE }, margin: { top: L.mt, left: L.ml, bottom: L.mb, right: L.mr, header: 600, footer: 560 } } };

const headingStyle = (size, color, before, after) => ({ run: { font: FONT, size, bold: true, color }, paragraph: { spacing: { before, after }, keepNext: true, keepLines: true } });

const doc = new Document({
  creator: 'Groupe KCS – RLCS – LUKE',
  title: 'Stratégie de développement et de transformation 2027',
  description: 'Orientations stratégiques du Groupe KCS – RLCS – LUKE. Document de travail – Confidentiel.',
  styles: {
    default: {
      document: { run: { font: FONT, size: 21, color: INK }, paragraph: { spacing: { after: 120, line: 276 } } },
      heading1: headingStyle(40, BLUE, 0, 240),
      heading2: headingStyle(30, NAVY, 360, 140),
      heading3: headingStyle(23, BLUE, 260, 100),
    },
    paragraphStyles: [
      { id: 'TOC1', name: 'toc 1', basedOn: 'Normal', next: 'Normal', run: { font: FONT, size: 21, bold: true, color: NAVY }, paragraph: { spacing: { before: 160, after: 40 }, tabStops: [{ type: TabStopType.RIGHT, position: CW, leader: 'dot' }] } },
      { id: 'TOC2', name: 'toc 2', basedOn: 'Normal', next: 'Normal', run: { font: FONT, size: 20, color: INK }, paragraph: { spacing: { before: 0, after: 30 }, indent: { left: 360 }, tabStops: [{ type: TabStopType.RIGHT, position: CW, leader: 'dot' }] } },
    ],
  },
  numbering: { config: [
    { reference: 'bul', levels: [
      { level: 0, format: LevelFormat.BULLET, text: '▪', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } }, run: { color: ORANGE, font: FONT } } },
      { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 260 } }, run: { color: BLUE, font: FONT } } },
    ] },
    { reference: 'bulcell', levels: [
      { level: 0, format: LevelFormat.BULLET, text: '▪', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 220, hanging: 180 } }, run: { color: ORANGE, font: FONT } } },
    ] },
    { reference: 'num', levels: [
      { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 340 } }, run: { bold: true, color: BLUE, font: FONT } } },
    ] },
  ] },
  sections: [
    coverSection(),
    { properties: portraitProps, headers: { default: header(CW) }, footers: { default: footer(CW) },
      children: [...tocBlock(), ...tocEntries(headings), ...objet, ...synth, ...p1, ...p2] },
    { properties: landscapeProps, headers: { default: header(CWL) }, footers: { default: footer(CWL) }, children: p3 },
    { properties: portraitProps, headers: { default: header(CW) }, footers: { default: footer(CW) }, children: [...pil, ...concl, ...annexe] },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUTFILE, buf);
  fs.writeFileSync(path.join(__dirname, 'headings.json'), JSON.stringify(headings, null, 1));
  console.log('écrit', OUTFILE, headings.length, 'titres');
});
