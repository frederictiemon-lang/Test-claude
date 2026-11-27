// Charte ORA : identité digitale (noir et blanc), signature RELEVER VOTRE AURA.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const L = require('./lib');
const { SYM } = L;
const N = '#000000', B = '#FFFFFF';
const SIG = 'RELEVER VOTRE AURA.';
const R = (f) => `data:image/${f.endsWith('.png') ? 'png' : 'jpeg'};base64,` + fs.readFileSync(path.join(L.OUT, f)).toString('base64');
const sigText = (x, y, size, fill, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Cormorant Garamond" font-weight="500" font-size="${size}" letter-spacing="${size * 0.22}" fill="${fill}">${SIG}</text>`;
const svg = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;

// ----- posts 1080 x 1080 -----
const posts = {
  post_signature: () => svg(1080, 1080, `<rect width="1080" height="1080" fill="${N}"/>${L.symbolC(540, 470, 330, B)}${sigText(540, 860, 40, B)}`),
  post_accroche: () => svg(1080, 1080, `<rect width="1080" height="1080" fill="${B}"/>
    <text x="540" y="430" text-anchor="middle" font-family="Cormorant Garamond" font-size="70" fill="${N}">Chaque détail révèle</text>
    <text x="540" y="515" text-anchor="middle" font-family="Cormorant Garamond" font-size="70" fill="${N}">votre style.</text>
    <text x="540" y="620" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-size="56" fill="${N}">Chaque choix affirme votre personnalité.</text>
    ${L.symbolC(540, 200, 90, N)}${sigText(540, 900, 30, N)}`),
  post_produit: () => `<div style="position:relative;width:1080px;height:1080px;background:#000;overflow:hidden">
    <div style="position:absolute;inset:0;background:url('${R('photo_detail.jpg')}') 60% 40%/cover"></div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:300px;background:#000"></div>
    <svg style="position:absolute;left:0;top:0" width="1080" height="1080">${sigText(540, 900, 40, B)}<text x="540" y="985" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="22" letter-spacing="7" fill="${B}">MONTRES · CHAÎNES · BRACELETS</text></svg></div>`,
};
// ----- stories 1080 x 1920 -----
const stories = {
  story_noire: () => `<div style="position:relative;width:1080px;height:1920px;background:#000;overflow:hidden">
    <div style="position:absolute;left:0;top:380px;width:1080px;height:900px;background:url('${R('photo_chaine.jpg')}') center/cover"></div>
    <svg style="position:absolute;left:0;top:0" width="1080" height="1920">${L.symbolC(540, 220, 120, B)}
      <text x="540" y="1460" text-anchor="middle" font-family="Cormorant Garamond" font-size="84" fill="${B}">Portez ce qui</text>
      <text x="540" y="1560" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-size="84" fill="${B}">vous ressemble.</text>
      ${sigText(540, 1760, 40, B)}</svg></div>`,
  story_blanche: () => svg(1080, 1920, `<rect width="1080" height="1920" fill="${B}"/>${L.lockupC(540, 760, 520, N)}
    <text x="540" y="1220" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="30" letter-spacing="9" fill="${N}">MONTRES · CHAÎNES · BRACELETS</text>
    <text x="540" y="1275" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="30" letter-spacing="9" fill="${N}">ACCESSOIRES DE MODE</text>
    <text x="540" y="1360" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-size="50" fill="${N}">Pour hommes et femmes</text>
    ${sigText(540, 1740, 44, N)}`),
};
function fbCover() {
  const w = 1640, h = 624;
  return `<div style="position:relative;width:${w}px;height:${h}px;background:#000;overflow:hidden">
    <div style="position:absolute;right:0;top:0;width:560px;height:${h}px;background:url('${R('photo_montre.jpg')}') 50% 45%/cover"></div>
    <svg style="position:absolute;left:0;top:0" width="${w}" height="${h}">${L.lockupC(250, h / 2 - 6, 230, B)}
      <text x="460" y="${h / 2 - 10}" font-family="Cormorant Garamond" font-size="46" fill="${B}">Chaque détail révèle votre style.</text>
      <text x="460" y="${h / 2 + 48}" font-family="Cormorant Garamond" font-weight="500" font-size="26" letter-spacing="6" fill="${B}">${SIG}</text></svg></div>`;
}
function promo() {
  const w = 1600, h = 900;
  return `<div style="position:relative;width:${w}px;height:${h}px;background:#fff;overflow:hidden">
    <div style="position:absolute;left:0;top:0;width:800px;height:${h}px;background:url('${R('photo_chaine.jpg')}') 45% 50%/cover"></div>
    <svg style="position:absolute;left:800px;top:0" width="800" height="${h}">${L.symbolC(400, 210, 110, N)}
      <text x="400" y="420" text-anchor="middle" font-family="Cormorant Garamond" font-size="58" fill="${N}">Un accessoire ne complète</text>
      <text x="400" y="490" text-anchor="middle" font-family="Cormorant Garamond" font-size="58" fill="${N}">pas une tenue.</text>
      <text x="400" y="575" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-size="58" fill="${N}">Il révèle une personnalité.</text>
      ${sigText(400, 740, 30, N)}</svg></div>`;
}
function phone() {
  const w = 600, h = 1230;
  const tile = (src, pos = 'center') => `<div style="aspect-ratio:1/1;background:url('${R(src)}') ${pos}/cover"></div>`;
  const hl = (label, bg, fg) => `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100px">
      <div style="width:84px;height:84px;border-radius:50%;border:2px solid #000;display:flex;align-items:center;justify-content:center">
        <div style="width:72px;height:72px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center">
          <svg width="44" height="44" viewBox="0 0 44 44">${L.symbolC(22, 22, 34, fg)}</svg></div></div>
      <div style="font:500 15px Manrope;color:#000">${label}</div></div>`;
  return `<div style="width:${w}px;height:${h}px;border-radius:86px;background:#000;padding:22px;box-sizing:border-box">
    <div style="position:relative;width:100%;height:100%;border-radius:66px;background:#fff;overflow:hidden;font-family:Manrope;color:#000">
      <div style="position:absolute;left:50%;top:16px;transform:translateX(-50%);width:150px;height:40px;border-radius:20px;background:#000"></div>
      <div style="height:78px"></div>
      <div style="display:flex;align-items:center;justify-content:center;height:50px;font:700 22px Manrope;letter-spacing:1px">ORA</div>
      <div style="display:flex;align-items:center;gap:26px;padding:14px 30px 0">
        <div style="width:150px;height:150px;border-radius:50%;background:#000;display:flex;align-items:center;justify-content:center;flex:none">
          <svg width="96" height="96" viewBox="0 0 96 96">${L.symbolC(48, 48, 92, B)}</svg></div>
        <div><div style="font:700 26px Manrope">ORA</div><div style="font:500 17px Manrope;margin-top:4px">Accessoires de mode</div></div></div>
      <div style="padding:18px 30px 0;font:400 17px/1.5 Manrope">Montres · Chaînes · Bracelets · Accessoires<br>Pour hommes et femmes<br><span style="font:500 18px 'Cormorant Garamond';letter-spacing:3px">${SIG}</span></div>
      <div style="display:flex;gap:10px;padding:18px 30px 0">
        <div style="flex:1;height:44px;border-radius:10px;background:#000;color:#fff;font:600 17px Manrope;display:flex;align-items:center;justify-content:center">Suivre</div>
        <div style="flex:1;height:44px;border-radius:10px;border:2px solid #000;box-sizing:border-box;font:600 17px Manrope;display:flex;align-items:center;justify-content:center">Message</div></div>
      <div style="display:flex;gap:14px;padding:22px 24px 6px">${hl('Montres', B, N)}${hl('Chaînes', N, B)}${hl('Bracelets', B, N)}${hl('Boutique', N, B)}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-top:14px">
        ${tile('post_signature.png')}${tile('photo_detail.jpg')}${tile('post_accroche.png')}
        ${tile('pack_sacs.jpg', '50% 50%')}${tile('post_produit.png')}${tile('app_etiquettes.jpg', '50% 50%')}
        ${tile('photo_chaine.jpg', '50% 50%')}${tile('pack_ecrin_bijou.jpg', '20% 50%')}${tile('app_gravure_montre.jpg', '50% 50%')}
      </div></div></div>`;
}

// ----- intro animation (white on black) with the official signature -----
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (t, a, b) => ease((t - a) / (b - a));
function animFrame(t, w, h, lw) {
  const d = L.lockupDims(lw), tagGap = lw * 0.13, tagSize = lw * 0.06;
  const top = (h - (d.H + tagGap + tagSize)) / 2;
  const move = seg(t, 1.9, 2.7);
  const symCy = h / 2 + (top + d.sh / 2 - h / 2) * move;
  const sx = w / 2 - d.sw / 2, sy = symCy - d.sh / 2, s = d.sw / SYM.w;
  const cx = sx + (SYM.c.x - SYM.ink.x0) * s, cy = sy + (SYM.c.y - SYM.ink.y0) * s;
  const rIn = SYM.rIn * s, rOut = (SYM.rOut + 60) * s, rMid = (rIn + rOut) / 2;
  const pRing = seg(t, 0.2, 1.3), pBlade = seg(t, 1.1, 1.8), pWord = seg(t, 2.3, 3.1), pTag = seg(t, 2.9, 3.6);
  const dW = -rIn * 1.05 + pBlade * rIn * 2.1;
  const defs = `<defs><mask id="mR" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><circle cx="${cx}" cy="${cy}" r="${rMid}" fill="none" stroke="#fff" stroke-width="${(rOut - rIn) * 1.6}" pathLength="100" stroke-dasharray="${(pRing * 100).toFixed(3)} 200" transform="rotate(-125 ${cx} ${cy})"/></mask>
    <clipPath id="cR"><path clip-rule="evenodd" d="M${cx - rOut},${cy} a${rOut},${rOut} 0 1,0 ${2 * rOut},0 a${rOut},${rOut} 0 1,0 ${-2 * rOut},0 Z M${cx - rIn},${cy} a${rIn},${rIn} 0 1,0 ${2 * rIn},0 a${rIn},${rIn} 0 1,0 ${-2 * rIn},0 Z"/></clipPath>
    <clipPath id="cI"><circle cx="${cx}" cy="${cy}" r="${rIn}"/></clipPath>
    <clipPath id="cW"><rect x="${-4 * rOut}" y="${-4 * rOut}" width="${Math.max(0, 4 * rOut + dW)}" height="${8 * rOut}" transform="translate(${cx},${cy}) rotate(-45)"/></clipPath></defs>`;
  const sym = L.symbol(sx, sy, d.sw, B);
  return svg(w, h, `${defs}<rect width="${w}" height="${h}" fill="#000"/>
    <g clip-path="url(#cR)"><g mask="url(#mR)">${sym}</g></g><g clip-path="url(#cI)"><g clip-path="url(#cW)">${sym}</g></g>
    <g opacity="${pWord.toFixed(3)}">${L.wordmark(w / 2 - lw / 2, top + d.sh + d.gap + (1 - pWord) * lw * 0.04, lw, B)}</g>
    <g opacity="${pTag.toFixed(3)}">${sigText(w / 2, top + d.H + tagGap + tagSize * 0.8, tagSize, B)}</g>`);
}
async function animation() {
  const { chromium } = require('playwright');
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  const dir = path.join(L.OUT, 'anim'); fs.mkdirSync(dir, { recursive: true });
  await p.setContent(L.page('<div id="s"></div>', 1920, 1080, '#000'));
  for (let i = 0; i < 150; i++) {
    await p.evaluate((s) => { document.getElementById('s').innerHTML = s; }, animFrame(i / 30, 1920, 1080, 560));
    await p.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.png`) });
  }
  await b.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(dir, 'f%04d.png'), '-vf', 'format=gray,format=yuv420p', '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart', path.join(L.OUT, 'ORA_animation_logo.mp4')]);
  console.log('rendered ORA_animation_logo.mp4');
}

async function main() {
  const only = process.argv[2];
  if (!only || only === 'posts') {
    for (const [n, f] of Object.entries(posts)) await L.render(n, L.page(f(), 1080, 1080, '#000'), 1080, 1080, { dsf: 1 });
    for (const [n, f] of Object.entries(stories)) await L.render(n, L.page(f(), 1080, 1920, '#000'), 1080, 1920, { dsf: 1 });
    await L.render('digital_facebook', L.page(fbCover(), 1640, 624, '#000'), 1640, 624, { dsf: 1 });
    await L.render('digital_promo', L.page(promo(), 1600, 900, '#fff'), 1600, 900, { dsf: 1 });
  }
  if (!only || only === 'phone') await L.render('digital_instagram', L.page(phone(), 600, 1230), 600, 1230, { dsf: 2 });
  await L.close();
  if (!only || only === 'anim') await animation();
}
main().catch(e => { console.error(e); process.exit(1); });
