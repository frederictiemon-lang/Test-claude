// Digital assets (slide 9) + logo intro animation (MP4 + storyboard frames).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const L = require('./lib');
const { C, SYM } = L;
const R = (f) => `data:image/${f.endsWith('.png') ? 'png' : 'jpeg'};base64,` + fs.readFileSync(path.join(L.OUT, f)).toString('base64');

// ---------- Logo intro animation ----------
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (t, a, b) => ease((t - a) / (b - a));
// One frame of the animation at time t (s) on a w x h black canvas. Lockup wordmark width = lw.
function animFrame(t, w, h, lw, { tagline = true } = {}) {
  const d = L.lockupDims(lw);
  const tagGap = lw * 0.12, tagSize = lw * 0.072;
  const totalH = d.H + (tagline ? tagGap + tagSize : 0);
  const top = (h - totalH) / 2;
  const finalSymCy = top + d.sh / 2;
  const move = seg(t, 1.9, 2.7);
  const symCy = h / 2 + (finalSymCy - h / 2) * move;
  const sx = w / 2 - d.sw / 2, sy = symCy - d.sh / 2;
  const s = d.sw / SYM.w;
  const cx = sx + (SYM.c.x - SYM.ink.x0) * s, cy = sy + (SYM.c.y - SYM.ink.y0) * s;
  const rIn = SYM.rIn * s, rOut = (SYM.rOut + 60) * s, rMid = (rIn + rOut) / 2;
  const pRing = seg(t, 0.2, 1.3), pBlade = seg(t, 1.1, 1.8);
  const pWord = seg(t, 2.3, 3.1), pTag = seg(t, 2.9, 3.6);
  const dWipe = -rIn * 1.05 + pBlade * rIn * 2.1;
  const defs = `<defs>
    <mask id="mRing" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">
      <circle cx="${cx}" cy="${cy}" r="${rMid}" fill="none" stroke="#fff" stroke-width="${(rOut - rIn) * 1.6}" pathLength="100" stroke-dasharray="${(pRing * 100).toFixed(3)} 200" transform="rotate(-125 ${cx} ${cy})"/>
    </mask>
    <clipPath id="cRing"><path clip-rule="evenodd" d="M${cx - rOut},${cy} a${rOut},${rOut} 0 1,0 ${2 * rOut},0 a${rOut},${rOut} 0 1,0 ${-2 * rOut},0 Z M${cx - rIn},${cy} a${rIn},${rIn} 0 1,0 ${2 * rIn},0 a${rIn},${rIn} 0 1,0 ${-2 * rIn},0 Z"/></clipPath>
    <clipPath id="cIn"><circle cx="${cx}" cy="${cy}" r="${rIn}"/></clipPath>
    <clipPath id="cWipe"><rect x="${-4 * rOut}" y="${-4 * rOut}" width="${Math.max(0, 4 * rOut + dWipe)}" height="${8 * rOut}" transform="translate(${cx},${cy}) rotate(-45)"/></clipPath>
  </defs>`;
  const sym = (fill) => L.symbol(sx, sy, d.sw, fill);
  const wy = top + d.sh + d.gap + (1 - pWord) * lw * 0.04;
  const inner = `<rect width="${w}" height="${h}" fill="#000"/>
    <g clip-path="url(#cRing)"><g mask="url(#mRing)">${sym(C.ivoire)}</g></g>
    <g clip-path="url(#cIn)"><g clip-path="url(#cWipe)">${sym(C.ivoire)}</g></g>
    <g opacity="${pWord.toFixed(3)}">${L.wordmark(w / 2 - lw / 2, wy, lw, C.ivoire)}</g>
    ${tagline ? `<text x="${w / 2}" y="${top + d.H + tagGap + tagSize * 0.8}" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-size="${tagSize}" fill="${C.ivoire}" opacity="${pTag.toFixed(3)}">Votre présence, votre signature.</text>` : ''}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${inner}</svg>`;
}

async function renderAnimation() {
  const { chromium } = require('playwright');
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const dir = path.join(L.OUT, 'anim'); fs.mkdirSync(dir, { recursive: true });
  const fps = 30, T = 5.0;
  await p.setContent(L.page('<div id="s"></div>', 1920, 1080, '#000'));
  await p.evaluate(() => document.fonts.ready).catch(() => {});
  for (let i = 0; i < Math.round(T * fps); i++) {
    const svg = animFrame(i / fps, 1920, 1080, 560);
    await p.evaluate((s) => { document.getElementById('s').innerHTML = s; }, svg);
    await p.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.png`) });
  }
  await b.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(dir, 'f%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', path.join(L.OUT, 'ORA_animation_introduction.mp4')]);
  console.log('rendered ORA_animation_introduction.mp4');
}

// ---------- Static digital assets ----------
function launchPost() {
  const w = 1080, h = 1080;
  const inner = `<rect width="${w}" height="${h}" fill="${C.ivoire}"/>${L.grainOverlay(w, h, 0.05)}
    <text x="${w / 2}" y="150" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="22" letter-spacing="9" fill="${C.gris}">NOUVELLE IDENTITÉ</text>
    ${L.lockupC(w / 2, 520, 430, C.noir)}
    <text x="${w / 2}" y="930" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-size="50" fill="${C.noir}">Votre présence, votre signature.</text>`;
  return L.svgDoc(w, h, inner);
}
function quotePost() {
  const w = 1080, h = 1080;
  const inner = `<rect width="${w}" height="${h}" fill="${C.noir}"/>
    ${L.symbolC(w / 2, 330, 150, C.ivoire)}
    <text x="${w / 2}" y="620" text-anchor="middle" font-family="Cormorant Garamond" font-size="78" fill="${C.ivoire}">L’élégance</text>
    <text x="${w / 2}" y="710" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-size="78" fill="${C.ivoire}">dans chaque détail.</text>`;
  return L.svgDoc(w, h, inner);
}
function symbolPost(bg, fg) {
  const w = 1080, h = 1080;
  return L.svgDoc(w, h, `<rect width="${w}" height="${h}" fill="${bg}"/>${L.symbolC(w / 2, h / 2, 380, fg)}`);
}
function lockupPost(bg, fg) {
  const w = 1080, h = 1080;
  return L.svgDoc(w, h, `<rect width="${w}" height="${h}" fill="${bg}"/>${L.lockupC(w / 2, h / 2, 380, fg)}`);
}

function fbCover() {
  const w = 1640, h = 608;
  return `<div style="position:relative;width:${w}px;height:${h}px;background:#000;overflow:hidden">
    <div style="position:absolute;right:0;top:0;width:820px;height:${h}px;background:url('${R('mock_gravure.jpg')}') center/cover;"></div>
    <div style="position:absolute;right:0;top:0;width:820px;height:${h}px;background:linear-gradient(90deg,#000 0%,rgba(0,0,0,.85) 22%,rgba(0,0,0,0) 70%)"></div>
    <svg style="position:absolute;left:0;top:0" width="${w}" height="${h}">${L.lockupC(330, h / 2, 250, C.ivoire)}
      <text x="560" y="${h / 2 - 6}" font-family="Cormorant Garamond" font-style="italic" font-size="54" fill="${C.ivoire}">Votre présence,</text>
      <text x="560" y="${h / 2 + 58}" font-family="Cormorant Garamond" font-style="italic" font-size="54" fill="${C.ivoire}">votre signature.</text>
    </svg></div>`;
}

function boutique() {
  const w = 1600, h = 900;
  return `<div style="position:relative;width:${w}px;height:${h}px;background:#000;overflow:hidden">
    <div style="position:absolute;right:0;top:0;width:800px;height:${h}px;background:url('${R('photo_direction.jpg')}') 70% 50%/cover;"></div>
    <svg style="position:absolute;left:0;top:0" width="800" height="${h}">${L.lockupC(400, 370, 300, C.ivoire)}
      <text x="400" y="640" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="20" letter-spacing="6" fill="${C.ivoire}">MONTRES · CHAÎNES · BRACELETS</text>
      <text x="400" y="676" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="20" letter-spacing="6" fill="${C.ivoire}">ACCESSOIRES DE MODE</text>
      <text x="400" y="750" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-size="40" fill="${C.grisClair}">Pour hommes et femmes</text>
    </svg></div>`;
}

function phone() {
  const w = 600, h = 1230;
  const tile = (src, pos = 'center') => `<div style="aspect-ratio:1/1;background:url('${R(src)}') ${pos}/cover"></div>`;
  const hl = (label, bg, fg, kind) => `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100px">
      <div style="width:84px;height:84px;border-radius:50%;border:2px solid #d9d4cb;display:flex;align-items:center;justify-content:center">
        <div style="width:74px;height:74px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center">
          <svg width="44" height="44" viewBox="0 0 44 44">${L.symbolC(22, 22, 34, fg)}</svg></div></div>
      <div style="font:500 15px Manrope;color:#111">${label}</div></div>`;
  return `<div style="width:${w}px;height:${h}px;border-radius:86px;background:linear-gradient(145deg,#3a3a3a,#0b0b0b 30%,#000 70%,#2a2a2a);padding:14px;box-sizing:border-box">
   <div style="width:100%;height:100%;border-radius:74px;background:#000;padding:8px;box-sizing:border-box">
    <div style="position:relative;width:100%;height:100%;border-radius:66px;background:#fff;overflow:hidden;font-family:Manrope;color:#111">
      <div style="position:absolute;left:50%;top:16px;transform:translateX(-50%);width:150px;height:40px;border-radius:20px;background:#000"></div>
      <div style="height:78px"></div>
      <div style="display:flex;align-items:center;justify-content:center;height:50px;font:700 22px Manrope;letter-spacing:1px">ORA</div>
      <div style="display:flex;align-items:center;gap:26px;padding:14px 30px 0">
        <div style="width:150px;height:150px;border-radius:50%;background:#000;display:flex;align-items:center;justify-content:center;flex:none">
          <svg width="96" height="96" viewBox="0 0 96 96">${L.symbolC(48, 48, 92, C.ivoire)}</svg></div>
        <div><div style="font:700 26px Manrope">ORA</div>
          <div style="font:500 17px Manrope;color:#6B655B;margin-top:4px">Accessoires de mode</div></div>
      </div>
      <div style="padding:18px 30px 0;font:400 17px/1.5 Manrope;color:#111">Montres · Chaînes · Bracelets · Accessoires<br>Pour hommes et femmes<br><span style="font:italic 400 21px 'Cormorant Garamond'">Votre présence, votre signature.</span></div>
      <div style="display:flex;gap:10px;padding:18px 30px 0">
        <div style="flex:1;height:44px;border-radius:10px;background:#000;color:#fff;font:600 17px Manrope;display:flex;align-items:center;justify-content:center">Suivre</div>
        <div style="flex:1;height:44px;border-radius:10px;background:#EFEDE8;font:600 17px Manrope;display:flex;align-items:center;justify-content:center">Message</div></div>
      <div style="display:flex;gap:14px;padding:22px 24px 6px">${hl('Montres', C.ivoire, C.noir)}${hl('Chaînes', '#000', C.ivoire)}${hl('Bracelets', C.ivoire, C.noir)}${hl('Boutique', '#000', C.ivoire)}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-top:14px">
        ${tile('post_lancement.png')}${tile('mock_gravure.jpg')}${tile('post_logo_noir.png')}
        ${tile('mock_sac.jpg', '100% 50%')}${tile('post_citation.png')}${tile('mock_etiquette.jpg', '40% 50%')}
        ${tile('post_symbole_ivoire.png')}${tile('mock_ecrin.jpg', '100% 50%')}${tile('mock_carte.jpg', '0% 50%')}
      </div>
    </div></div></div>`;
}

function storyboard() {
  // 4 square frames from the real animation, side by side
  const f = 500, gap = 52, times = [0.75, 1.45, 2.0, 4.0];
  const w = 4 * f + 3 * gap, h = f;
  const frames = times.map((t, i) => `<svg x="${i * (f + gap)}" y="0" width="${f}" height="${f}" viewBox="0 0 1000 1000">${animFrame(t, 1000, 1000, 600).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg>`).join('');
  // unique ids per frame
  let k = 0; const fr = frames.replace(/id="(m|c)(Ring|In|Wipe)"/g, (m) => m).split('<svg x=').map((part, i) => i === 0 ? part : '<svg x=' + part.replace(/(mRing|cRing|cIn|cWipe)/g, `$1_${i}`)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${fr}</svg>`;
}

async function main() {
  const only = process.argv[2];
  if (!only || only === 'posts') {
    await L.render('post_lancement', L.page(launchPost(), 1080, 1080), 1080, 1080, { dsf: 1 });
    await L.render('post_citation', L.page(quotePost(), 1080, 1080), 1080, 1080, { dsf: 1 });
    await L.render('post_logo_noir', L.page(lockupPost(C.noir, C.ivoire), 1080, 1080), 1080, 1080, { dsf: 1 });
    await L.render('post_symbole_ivoire', L.page(symbolPost(C.ivoire, C.noir), 1080, 1080), 1080, 1080, { dsf: 1 });
  }
  if (!only || only === 'assets') {
    await L.render('digital_facebook', L.page(fbCover(), 1640, 608, '#000'), 1640, 608, { dsf: 1, type: 'jpeg', quality: 90 });
    await L.render('digital_boutique', L.page(boutique(), 1600, 900, '#000'), 1600, 900, { dsf: 1, type: 'jpeg', quality: 90 });
    await L.render('digital_instagram', L.page(phone(), 600, 1230), 600, 1230, { dsf: 2 });
    await L.render('digital_storyboard', L.page(storyboard(), 2156, 500, '#F5F1E9'), 2156, 500, { dsf: 1, type: 'jpeg', quality: 92 });
  }
  await L.close();
  if (!only || only === 'anim') await renderAnimation();
}
if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { animFrame };
