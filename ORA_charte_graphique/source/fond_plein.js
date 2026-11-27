// Logos sur fond plein (noir ou blanc), 3000 x 3000 px, PNG opaque. Conversion JPG faite ensuite en Python.
const path = require('path');
const fs = require('fs');
const L = require('./lib');
const N = '#000000', B = '#FFFFFF';
const S = 3000;
const OUT = path.resolve(__dirname, '../livrables_charte/04_logos_fond_plein');
fs.mkdirSync(OUT, { recursive: true });

const svg = (bg, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><rect width="${S}" height="${S}" fill="${bg}"/>${inner}</svg>`;
// Symbole : diamètre D = 50 % du format (marge ≥ X = D/4 respectée). Logo complet : nom = 60 % du format (marge ≥ 2 X).
const files = [
  ['ORA_symbole_fond_noir', N, L.symbolC(S / 2, S / 2, S * 0.5, B)],
  ['ORA_symbole_fond_blanc', B, L.symbolC(S / 2, S / 2, S * 0.5, N)],
  ['ORA_logo_complet_fond_noir', N, L.lockupC(S / 2, S / 2, S * 0.6, B)],
  ['ORA_logo_complet_fond_blanc', B, L.lockupC(S / 2, S / 2, S * 0.6, N)],
  // Nom seul : largeur = 60 % du format, centré
  ['ORA_nom_fond_noir', N, L.wordmark(S * 0.2, (S - L.wmH(S * 0.6)) / 2, S * 0.6, B)],
  ['ORA_nom_fond_blanc', B, L.wordmark(S * 0.2, (S - L.wmH(S * 0.6)) / 2, S * 0.6, N)],
];
const only = process.argv[2];

(async () => {
  for (const [n, bg, inner] of files) {
    if (only && !n.includes(only)) continue;
    const f = await L.render(n, L.page(svg(bg, inner), S, S, bg), S, S, { dsf: 1, type: 'png' });
    fs.copyFileSync(f, path.join(OUT, n + '.png'));
  }
  await L.close();
})().catch(e => { console.error(e); process.exit(1); });
