// Génère les schémas du document (HTML rendu en PNG via Playwright).
// Usage : node figures.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, 'figures');
const ASSETS = path.join(__dirname, 'assets');
fs.mkdirSync(OUT, { recursive: true });
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(ASSETS, f)).toString('base64');
const LOGO = { kcs: b64('logo_kcs.png'), rlcs: b64('logo_rlcs.png'), luke: b64('logo_luke.png') };

const C = {
  B: '#2161FF', O: '#FF6138', NAVY: '#0B1A3B', INK: '#11183A', MUT: '#5D6679',
  PANEL: '#F4F6FB', LINE: '#D9DEEA', BL: '#E8EEFF', OL: '#FFEDE7',
  RL: '#0E3A6B', LU: '#157A86',
};

const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#fff;font-family:Carlito,Calibri,sans-serif;color:${C.INK};font-size:15px;line-height:1.25;-webkit-font-smoothing:antialiased}
#fig{background:#fff;position:relative;padding:12px 14px}
b,.b{font-weight:700}
.mut{color:${C.MUT}}
.ex{background:#fff;border:1.6px solid ${C.B};border-radius:9px}
.pr{background:#FFF6F3;border:1.8px dashed ${C.O};border-radius:9px}
.pill{display:inline-block;font-size:11.5px;font-weight:700;letter-spacing:.4px;padding:2px 7px;border-radius:20px}
.pill.ex{background:${C.BL};color:${C.B};border:none}
.pill.pr{background:${C.OL};color:#C8401C;border:none}
.legend{display:flex;gap:22px;font-size:13px;color:${C.MUT};margin-top:12px;align-items:center;justify-content:center}
.sw{display:inline-block;width:26px;height:14px;border-radius:4px;vertical-align:-2px;margin-right:7px}
.sw.ex{border:1.6px solid ${C.B};background:#fff}
.sw.pr{border:1.8px dashed ${C.O};background:#FFF6F3}
.kick{font-size:11.5px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase}
`;

function page(width, body, css = '') {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}${css}</style></head>
<body><div id="fig" style="width:${width}px">${body}</div></body></html>`;
}

const figs = {};

// ---------------------------------------------------------------- F1 Groupe
figs.groupe = () => {
  const ent = (logo, col, acr, name, chips, sol) => `
  <div class="ent">
    <div class="logo"><img src="${logo}"></div>
    <div class="band" style="background:${col}"><b>${acr}</b> <span>${name}</span></div>
    <div class="body">
      <div class="lbl" style="color:${col}">Domaines d'intervention</div>
      <div class="chips">${chips.map((c) => `<span>${c}</span>`).join('')}</div>
      <div class="lbl" style="color:${col}">Solutions et capacités</div>
      <div class="sol">${sol}</div>
    </div>
  </div>`;
  const css = `
  .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .ent{border:1px solid ${C.LINE};border-radius:12px;overflow:hidden;background:#fff;display:flex;flex-direction:column}
  .logo{height:74px;display:flex;align-items:center;justify-content:center;padding:10px 16px;background:#fff}
  .logo img{max-height:52px;max-width:210px}
  .band{color:#fff;padding:7px 12px;font-size:14px}
  .band span{opacity:.9;font-size:13px}
  .body{padding:10px 12px 12px;background:${C.PANEL};flex:1}
  .lbl{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:4px 0 6px}
  .chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px}
  .chips span{background:#fff;border:1px solid ${C.LINE};border-radius:20px;padding:3px 9px;font-size:13.5px}
  .sol{font-size:14px;line-height:1.3}
  .conn{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;height:22px}
  .conn div{border-left:2px solid ${C.LINE};margin-left:50%}
  .socle{background:${C.NAVY};border-radius:12px;padding:12px 14px;color:#fff}
  .socle .kick{color:#FFB39E;margin-bottom:9px}
  .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
  .it{background:#16295A;border-radius:9px;padding:9px 10px;font-size:13.5px;line-height:1.3;color:#DCE4FA}
  .it b{color:#fff;display:block;font-size:14.5px;margin-bottom:2px}
  .foot{margin-top:10px;font-size:13px;color:${C.MUT};text-align:center}`;
  const body = `
  <div class="g3">
    ${ent(LOGO.kcs, C.B, 'KCS', 'Kyria Consultancy Services', ['Conseil', 'Transformation digitale', 'Marchés financiers', 'Industries'], 'Solutions métiers : ATLANTIS, TREND, AXIAGUARD ; offres Microsoft (Dynamics 365)')}
    ${ent(LOGO.rlcs, C.RL, 'RLCS', 'RiskLogics Consulting Services', ['Conseil', 'Data', 'Gestion des risques', 'Actuariat', 'Cloud', 'Cybersécurité'], 'Capacités RiskTech ; actuariat, risk management, performance, ALM')}
    ${ent(LOGO.luke, C.LU, 'LUKE', 'LukeHealth TECH', ['Conseil e-santé', 'Solutions numériques de santé'], 'Solutions e-santé ; segments identifiés en 2026 : mutualité, e-santé, e-déchets')}
  </div>
  <div class="conn"><div></div><div></div><div></div></div>
  <div class="socle">
    <div class="kick">Socle commun du Groupe (situation actuelle)</div>
    <div class="g4">
      <div class="it"><b>Gérant commun</b>gestion des trois sociétés</div>
      <div class="it"><b>Fonctions mutualisées</b>support et gestion, BPM : mêmes titulaires dans les trois sociétés</div>
      <div class="it"><b>Ressources partagées</b>collaborateurs mobilisables sur les projets des trois sociétés</div>
      <div class="it"><b>IA déjà engagée</b>intégrée aux activités, ingénierie IA chez KCS</div>
    </div>
  </div>
  <div class="foot">Trois sociétés juridiquement distinctes, chacune avec sa comptabilité, son chiffre d'affaires, sa clientèle et son PMO</div>`;
  return page(820, body, css);
};

// ---------------------------------------------------------- F2 Org actuelle
figs.org_actuelle = () => {
  const fn = (label, n, kcs = false) => kcs
    ? `<div class="fn"><span>${label}</span><span class="ck">Consultant KCS</span></div>`
    : `<div class="fn"><span>${label}</span><span class="n">${n}</span></div>`;
  const col = (color, acr, adv, fns) => `
  <div class="col">
    <div class="eh" style="background:${color}">${acr}</div>
    <div class="box"><div class="bt">Advisory &amp; Business Development</div><div class="bd">${adv}</div></div>
    <div class="box td"><div class="bt">Tech &amp; Delivery</div>${fns.join('')}</div>
  </div>`;
  const css = `
  .top{display:flex;justify-content:center}
  .dg{background:${C.NAVY};color:#fff;border-radius:10px;padding:9px 18px;text-align:center;width:330px}
  .dg .kick{color:#FFB39E;font-size:10.5px}
  .dg div:last-child{font-size:14px;color:#DCE4FA;margin-top:2px}
  .row2{display:grid;grid-template-columns:330px 1fr 330px;align-items:center;margin-top:0}
  .shared{border:1.6px solid ${C.B};border-radius:10px;background:#fff;padding:8px 11px}
  .shared .bt{font-weight:700;font-size:14px}
  .shared .bd{font-size:13px;color:${C.MUT};margin:2px 0 5px}
  .trunk{height:100%;position:relative}
  .trunk:before{content:'';position:absolute;left:50%;top:0;bottom:0;border-left:2px solid ${C.LINE}}
  .trunk:after{content:'';position:absolute;left:0;right:0;top:50%;border-top:2px solid ${C.LINE}}
  .v{height:14px;position:relative}.v:before{content:'';position:absolute;left:50%;top:0;bottom:0;border-left:2px solid ${C.LINE}}
  .bus{height:18px;position:relative;margin:0 calc(100%/6)}
  .bus:before{content:'';position:absolute;left:0;right:0;top:0;border-top:2px solid ${C.LINE}}
  .bus i{position:absolute;top:0;height:18px;border-left:2px solid ${C.LINE}}
  .cols{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .col{display:flex;flex-direction:column;gap:8px}
  .eh{color:#fff;font-weight:700;text-align:center;border-radius:9px;padding:6px;font-size:16px;letter-spacing:1px}
  .box{background:${C.PANEL};border:1px solid ${C.LINE};border-radius:9px;padding:8px 10px}
  .box .bt{font-weight:700;font-size:13.5px;margin-bottom:4px}
  .box .bd{font-size:13px;line-height:1.3}
  .td{flex:1}
  .fn{display:flex;justify-content:space-between;align-items:center;background:#fff;border:1px solid ${C.LINE};border-radius:7px;padding:4px 8px;margin-top:5px;font-size:13px}
  .fn .n{font-weight:700;color:${C.B};min-width:26px;text-align:right}
  .ck{background:${C.OL};color:#C8401C;font-weight:700;font-size:11.5px;border-radius:20px;padding:1px 8px;white-space:nowrap}
  .flow{margin-top:12px;background:${C.OL};border-radius:10px;padding:9px 14px;font-size:13.5px;display:flex;align-items:center;gap:12px}
  .flow svg{flex:none}
  .note{font-size:12px;color:${C.MUT};margin-top:8px;text-align:center}`;
  const body = `
  <div class="top"><div class="dg"><div class="kick">Executive management</div><b>Direction Générale et associés</b><div>Gérant commun aux trois sociétés</div></div></div>
  <div class="row2" style="height:84px">
    <div class="shared"><div class="bt">HR / Accounting</div><div class="bd">Support et gestion : comptabilité, gestion, RH, juridique</div><span class="pill ex">Mêmes titulaires (2) pour les trois sociétés</span></div>
    <div class="trunk"></div>
    <div class="shared"><div class="bt">BPM</div><div class="bd">Business Performance Management &amp; Partnership</div><span class="pill ex">Mêmes titulaires (2) pour les trois sociétés</span></div>
  </div>
  <div class="v"></div>
  <div class="bus"><i style="left:0"></i><i style="left:50%"></i><i style="right:0"></i></div>
  <div class="cols">
    ${col(C.B, 'KCS', '1 nom, également présent chez RLCS', [fn('PMO', 2), fn('Business Analyst', 11), fn('Software Engineering', 7), fn('Software Development', 20), fn('AI Engineering', 2)])}
    ${col(C.RL, 'RLCS', '2 noms, dont 1 commun avec KCS', [fn('PMO', 2), fn('Actuarial &amp; Risk Mgmt', 5), fn('Business Analyst', 0, true), fn('Software Development', 0, true), fn('Cloud et cybersécurité', 0, true)])}
    ${col(C.LU, 'LUKE', 'Business Development (stratégie, BD, marketing) et Advisory : 2 noms', [fn('PMO', 0, true), fn('Business Analyst', 0, true), fn('Software Development', 0, true)])}
  </div>
  <div class="flow"><svg width="40" height="18" viewBox="0 0 40 18"><path d="M2 9h34M28 3l8 6-8 6" stroke="${C.O}" stroke-width="2.4" fill="none"/></svg>
  <div><b>Mobilisation transversale :</b> six fonctions de RLCS et de LUKE sont indiquées comme tenues par des « Consultants KCS ». Les charges salariales restent portées par la société employeuse.</div></div>
  <div class="note">(n) : nombre de noms affichés sur l'organigramme 2026 de la société. Un même nom peut figurer dans deux fonctions.</div>`;
  return page(820, body, css);
};

// ---------------------------------------------------------------- F3 Maison
figs.maison = () => {
  const css = `
  .roof{height:118px;background:${C.NAVY};clip-path:polygon(50% 0,100% 100%,0 100%);display:flex;align-items:flex-end;justify-content:center;padding-bottom:12px}
  .roof div{color:#fff;text-align:center;width:520px;font-size:15px;line-height:1.3}
  .roof .kick{color:#FFB39E;display:block;margin-bottom:3px}
  .vis{background:${C.B};color:#fff;text-align:center;padding:9px;font-size:15.5px;margin:0 22px}
  .vis i{font-style:italic}
  .pil{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:10px 40px}
  .p{border-radius:8px;background:${C.PANEL};border:1px solid ${C.LINE};padding:12px 12px 14px;text-align:center;min-height:150px}
  .p .num{width:34px;height:34px;border-radius:50%;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 7px;font-size:16px}
  .p .t{font-weight:700;font-size:15.5px;margin-bottom:5px}
  .p .d{font-size:13.5px;color:${C.MUT};line-height:1.3}
  .pr2{background:${C.OL};text-align:center;padding:8px;font-size:13.5px;margin:0 22px;border-radius:6px}
  .pr2 b{color:#C8401C}
  .fd{background:#E3E7F0;text-align:center;padding:8px;font-size:13px;margin:6px 6px 0;border-radius:6px;color:#3B4458}`;
  const p = (n, col, t, d) => `<div class="p"><div class="num" style="background:${col}">${n}</div><div class="t">${t}</div><div class="d">${d}</div></div>`;
  const body = `
  <div class="roof"><div><span class="kick">Ambition 2027</span>Un Groupe mieux coordonné, plus productif, plus innovant,<br>qui valorise pleinement les complémentarités de KCS, RLCS et LUKE</div></div>
  <div class="vis">Vision proposée : <i>« Trois expertises complémentaires, un Groupe coordonné »</i></div>
  <div class="pil">
    ${p(1, C.B, 'Gouvernance', 'Structurer un modèle de gouvernance Groupe intégré et responsabilisant')}
    ${p(2, C.O, 'Capital humain', 'Mieux organiser, mobiliser et faire progresser les ressources du Groupe')}
    ${p(3, C.NAVY, 'Intelligence artificielle', 'Faire de l\'IA un levier transversal de productivité et d\'innovation')}
  </div>
  <div class="pr2"><b>Principes directeurs :</b> progressivité · préservation de ce qui fonctionne · mesurer avant de décider · responsabilisation des sociétés · simplicité des outils</div>
  <div class="fd"><b>Acquis :</b> gérant commun · fonctions support et BPM mutualisées · trois PMO · consultants mobilisables · chantiers 2026 · initiatives IA engagées</div>`;
  return page(820, body, css);
};

// ---------------------------------------------------------------- F4 Logique
figs.logique = () => {
  const css = `
  .wrap{position:relative;height:300px}
  .node{position:absolute;top:0;width:204px;border-radius:12px;padding:12px 14px;color:#fff;height:148px}
  .node .kick{opacity:.85;font-size:11px}
  .node .t{font-size:18px;font-weight:700;margin:2px 0 6px}
  .node .r{font-size:13.5px;line-height:1.3;opacity:.95}
  .node .role{display:inline-block;background:rgba(255,255,255,.18);border-radius:20px;padding:1px 9px;font-size:12.5px;margin-bottom:6px;font-weight:700}
  .lab{position:absolute;font-size:12.5px;color:${C.MUT};text-align:center;width:130px;line-height:1.25}
  .base{position:absolute;left:0;right:0;bottom:0;background:${C.PANEL};border:1px solid ${C.LINE};border-radius:10px;padding:10px 14px;font-size:14px;text-align:center}
  .base b{color:${C.B}}`;
  const body = `
  <div class="wrap">
    <div class="node" style="left:0;background:${C.B}"><div class="kick">Axe 1</div><div class="t">Gouvernance</div><span class="role">Le cadre</span><div class="r">Fixe les règles communes, arbitre entre sociétés, pilote la performance</div></div>
    <div class="node" style="left:294px;background:${C.O}"><div class="kick">Axe 2</div><div class="t">Capital humain</div><span class="role">La capacité</span><div class="r">Organise les rôles, les compétences et la mobilisation des collaborateurs</div></div>
    <div class="node" style="left:588px;background:${C.NAVY}"><div class="kick">Axe 3</div><div class="t">Intelligence artificielle</div><span class="role">Le levier</span><div class="r">Accroît la productivité et enrichit les solutions et les offres</div></div>
    <svg width="792" height="300" style="position:absolute;left:0;top:0;overflow:visible">
      <defs><marker id="a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="#8C95AA"/></marker></defs>
      <path d="M208 52 H288" stroke="#8C95AA" stroke-width="2" marker-end="url(#a)"/>
      <path d="M502 52 H582" stroke="#8C95AA" stroke-width="2" marker-end="url(#a)"/>
      <path d="M690 150 V178 Q690 196 672 196 H120 Q102 196 102 178 V156" stroke="${C.O}" stroke-width="2" fill="none" stroke-dasharray="6 4" marker-end="url(#a)"/>
    </svg>
    <div class="lab" style="left:206px;top:62px;width:84px">règles de mobilisation et d'arbitrage</div>
    <div class="lab" style="left:500px;top:62px;width:84px">compétences et usages</div>
    <div class="lab" style="left:246px;top:203px;width:300px">gains mesurés et nouvelles offres qui alimentent le pilotage</div>
    <div class="base"><b>Un socle de données commun :</b> suivi des temps par projet et par société · reporting consolidé · tableau de bord Groupe</div>
  </div>`;
  return page(820, body, css);
};

// ---------------------------------------------------------------- F5 Axes
figs.axes = () => {
  const card = (n, col, t, o, items) => `
  <div class="card">
    <div class="hd" style="background:${col}"><div class="n">${n}</div><div class="t">${t}</div></div>
    <div class="o">${o}</div>
    <ul>${items.map((i) => `<li><span style="background:${col}"></span>${i}</li>`).join('')}</ul>
  </div>`;
  const css = `
  .g{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .card{border:1px solid ${C.LINE};border-radius:12px;overflow:hidden;background:#fff}
  .hd{color:#fff;padding:12px 14px;display:flex;gap:12px;align-items:center;min-height:78px}
  .hd .n{font-size:34px;font-weight:700;opacity:.9;line-height:1}
  .hd .t{font-size:16.5px;font-weight:700;line-height:1.2}
  .o{background:${C.PANEL};padding:9px 14px;font-size:13.5px;font-style:italic;color:#3B4458;min-height:92px;line-height:1.3}
  ul{list-style:none;padding:10px 14px 12px}
  li{font-size:14px;margin:5px 0;display:flex;gap:8px;line-height:1.25}
  li span{flex:none;width:8px;height:8px;border-radius:2px;margin-top:5px}`;
  const body = `<div class="g">
  ${card('1', C.B, 'Réorganisation et gouvernance du Groupe', 'Un modèle de gouvernance intégré : gérant commun, ressources transversales, sociétés responsabilisées', ['Charte de gouvernance et circuits de décision', 'Trois PMO maintenus et coordonnés', 'Fonctions support et BPM structurées', 'Suivi analytique sans refacturation', 'Reporting consolidé', 'Synergies commerciales progressives'])}
  ${card('2', C.O, 'Capital humain et optimisation des ressources', 'Mieux organiser, mobiliser et faire progresser les ressources, sans rigidifier les pratiques', ['Rôles et matrice des responsabilités', 'Cartographie des compétences', 'Mobilisation inter-sociétés organisée', 'Suivi simple des charges par projet', 'Coordination collaborateurs et PMO', 'Développement progressif des compétences'])}
  ${card('3', C.NAVY, 'Transformation par l\'IA et productivité', 'Consolider les initiatives existantes, structurer les usages, accélérer les projets engagés', ['Compétences IA et référents internes', 'IA dans les processus métiers', 'Solutions et offres enrichies', 'Charte d\'usage et sécurité des données', 'Contrôle qualité des résultats', 'Mesure des gains de productivité'])}
  </div>`;
  return page(820, body, css);
};

// ---------------------------------------------------------- F6 Org cible
figs.org_cible = () => {
  const col = (color, acr) => `
  <div class="col">
    <div class="eh" style="background:${color}">${acr}</div>
    <div class="ex bx">Advisory &amp; Business Development</div>
    <div class="ex bx">PMO</div>
    <div class="ex bx">Tech &amp; Delivery</div>
    <div class="pr bx">Référent IA</div>
    <div class="own">Comptabilité, chiffre d'affaires et clientèle propres</div>
  </div>`;
  const css = `
  .c{display:flex;justify-content:center}
  .as{width:220px;text-align:center;padding:6px;border:1.6px solid ${C.NAVY};border-radius:9px;font-weight:700;font-size:14px}
  .v{height:14px;position:relative}.v:before{content:'';position:absolute;left:50%;top:0;bottom:0;border-left:2px solid #B8C0D2}
  .rowb{display:grid;grid-template-columns:1fr 300px 1fr;align-items:center;gap:0}
  .side{padding:7px 10px;font-size:13.5px;text-align:center;position:relative}
  .side b{display:block;font-size:14px}
  .dg{background:${C.NAVY};color:#fff;border-radius:10px;padding:9px 12px;text-align:center}
  .dg b{font-size:15.5px}.dg div{font-size:13px;color:#C9D3EE}
  .hl{height:2px;border-top:2px dashed ${C.O}}
  .rowb2{display:grid;grid-template-columns:230px 30px 1fr 30px 230px;align-items:center}
  .rowc{display:grid;grid-template-columns:1fr 60px 1fr;align-items:stretch}
  .sh{padding:8px 11px;font-size:13.5px}
  .sh .t{font-weight:700;font-size:14px}
  .sh .d{color:${C.MUT};font-size:12.5px;margin:1px 0 5px}
  .trunk{position:relative}.trunk:before{content:'';position:absolute;left:50%;top:0;bottom:0;border-left:2px solid #B8C0D2}
  .trunk:after{content:'';position:absolute;left:0;right:0;top:40%;border-top:2px solid #B8C0D2}
  .bus{height:16px;position:relative;margin:0 calc(100%/6)}
  .bus:before{content:'';position:absolute;left:0;right:0;top:0;border-top:2px solid #B8C0D2}
  .bus i{position:absolute;top:0;height:16px;border-left:2px solid #B8C0D2}
  .cols{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .col{display:flex;flex-direction:column;gap:6px}
  .eh{color:#fff;font-weight:700;text-align:center;border-radius:8px;padding:5px;font-size:15.5px;letter-spacing:1px}
  .bx{padding:5px 8px;font-size:13.5px;text-align:center}
  .own{font-size:12px;color:${C.MUT};text-align:center;line-height:1.25}
  .band{margin-top:9px;padding:8px 12px;font-size:13.5px;text-align:center}
  .band b{font-size:14px}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}`;
  const body = `
  <div class="c"><div class="as">Associés</div></div>
  <div class="v"></div>
  <div class="rowb2">
    <div class="pr side"><b>Comité de Direction Groupe</b>instance proposée</div>
    <div class="hl"></div>
    <div class="dg"><b>Gérant commun</b><div>Direction Générale du Groupe</div></div>
    <div class="hl"></div>
    <div class="pr side"><b>Coordination Groupe des PMO</b>fonction proposée</div>
  </div>
  <div class="rowc" style="height:96px">
    <div class="ex sh" style="margin-top:12px"><div class="t">HR / Accounting · support et gestion</div><div class="d">Comptabilité, gestion, RH, juridique · mutualisé (existant)</div><span class="pill pr">Proposé : catalogue de services partagés</span></div>
    <div class="trunk"></div>
    <div class="ex sh" style="margin-top:12px"><div class="t">BPM · Business Performance Mgmt</div><div class="d">Mutualisé (existant)</div><span class="pill pr">Proposé : reporting consolidé et suivi analytique</span></div>
  </div>
  <div class="v"></div>
  <div class="bus"><i style="left:0"></i><i style="left:50%"></i><i style="right:0"></i></div>
  <div class="cols">${col(C.B, 'KCS')}${col(C.RL, 'RLCS')}${col(C.LU, 'LUKE')}</div>
  <div class="two">
    <div class="pr band"><b>Revue commerciale inter-sociétés</b><br>pipeline partagé et règles d'apport d'affaires (proposés)</div>
    <div class="pr band"><b>Réseau des référents IA</b><br>appuyé sur l'AI Engineering de KCS (proposé)</div>
  </div>
  <div class="ex band" style="background:${C.BL};border-color:${C.B}"><b>Pool de compétences du Groupe :</b> consultants mobilisables entre sociétés, notamment ceux de Tech &amp; Delivery de KCS (existant) ;<br>cartographie des compétences et règles de mobilisation communes (proposées)</div>
  <div class="legend"><span><span class="sw ex"></span>Existant, maintenu</span><span><span class="sw pr"></span>Proposition soumise à validation</span></div>`;
  return page(820, body, css);
};

// ------------------------------------------------------- F7 Gouvernance
figs.gouvernance = () => {
  const lvl = (label, sub, boxes, bg) => `
  <div class="lv" style="background:${bg}">
    <div class="ll"><b>${label}</b><span>${sub}</span></div>
    <div class="bxs">${boxes}</div>
  </div>`;
  const bx = (cls, t, d, f) => `<div class="${cls} ib"><div class="t">${t}</div><div class="d">${d}</div><span class="pill ${cls === 'ex' ? 'ex' : 'pr'}">${f}</span></div>`;
  const css = `
  .g{display:grid;grid-template-columns:44px 1fr 44px;gap:10px}
  .arr{position:relative}
  .arr span{position:absolute;top:0;bottom:0;left:4px;writing-mode:vertical-rl;font-size:13px;font-weight:700;letter-spacing:.5px;color:#fff;border-radius:20px;width:34px;display:flex;align-items:center;justify-content:center;white-space:nowrap}
  .lvls{display:flex;flex-direction:column;gap:8px}
  .lv{border-radius:10px;display:grid;grid-template-columns:132px 1fr;align-items:center;padding:8px 10px;gap:10px}
  .ll b{display:block;font-size:14.5px}.ll span{font-size:12.5px;color:${C.MUT}}
  .bxs{display:flex;gap:8px}
  .ib{flex:1;padding:7px 10px}
  .ib .t{font-weight:700;font-size:14px}
  .ib .d{font-size:12.5px;color:${C.MUT};margin:2px 0 5px;line-height:1.25}`;
  const body = `
  <div class="g">
    <div class="arr"><span style="background:${C.B};transform:rotate(0deg)">▼ Décisions, priorités, arbitrages</span></div>
    <div class="lvls">
      ${lvl('Stratégique', 'Orientations', bx('pr', 'Revue stratégique', 'Gérant et associés : suivi de la stratégie 2027, arbitrages majeurs, ajustements', 'Trimestrielle (proposée)'), '#EEF1F8')}
      ${lvl('Pilotage Groupe', 'Performance et chantiers', bx('pr', 'Comité de Direction Groupe', 'Gérant, PMO, HR/Accounting, BPM, Advisory &amp; BD : performance, chantiers, risques, arbitrages inter-sociétés', 'Mensuelle (proposée)'), '#F2F4FA')}
      ${lvl('Coordination', 'Transversalité', bx('pr', 'Revue de coordination des PMO', 'Plan de charge consolidé, mobilisations, conflits de ressources', 'Toutes les deux semaines') + bx('pr', 'Revue commerciale inter-sociétés', 'Opportunités partagées, offres conjointes, apports d\'affaires', 'Mensuelle (proposée)') + bx('pr', 'Réseau des référents IA', 'Usages, cas d\'usage prioritaires, respect de la charte', 'Mensuelle (proposée)'), '#F6F7FB')}
      ${lvl('Opérationnel', 'Projets', bx('ex', 'PMO KCS · PMO RLCS · PMO LUKE', 'Pilotage des projets de chaque société, au plus près des clients', 'Existant, maintenu'), '#FAFBFD')}
    </div>
    <div class="arr"><span style="background:${C.O};transform:rotate(180deg)">▼ Reporting, alertes, demandes d'arbitrage</span></div>
  </div>
  <div class="legend"><span><span class="sw ex"></span>Existant</span><span><span class="sw pr"></span>Instance proposée, périodicité indicative</span></div>`;
  return page(820, body, css);
};

// --------------------------------------------------------- F8 Analytique
figs.analytique = () => {
  const ch = (n, col, t, h, d, first) => `
  <div class="ch" style="background:${col};clip-path:${first ? 'polygon(0 0,92% 0,100% 50%,92% 100%,0 100%)' : 'polygon(0 0,92% 0,100% 50%,92% 100%,0 100%,8% 50%)'};padding-left:${first ? 16 : 34}px">
    <div class="h">${h}</div><div class="t">${n} · ${t}</div><div class="d">${d}</div>
  </div>`;
  const css = `
  .row{display:grid;grid-template-columns:repeat(3,1fr);gap:0;padding-right:14px}
  .ch{color:#fff;height:150px;padding:14px 40px 12px 16px;margin-right:-14px}
  .ch .h{display:inline-block;background:rgba(255,255,255,.2);border-radius:20px;padding:1px 9px;font-size:12px;font-weight:700}
  .ch .t{font-size:18px;font-weight:700;margin:5px 0 4px;letter-spacing:.5px}
  .ch .d{font-size:13.5px;line-height:1.3}
  .keep{margin-top:12px;background:${C.PANEL};border:1px solid ${C.LINE};border-radius:10px;padding:10px 14px;font-size:14px;line-height:1.35}
  .keep b{color:${C.B}}`;
  const body = `
  <div class="row">
    ${ch('1', C.B, 'MESURER', '1er trimestre 2027', 'Saisie des temps par projet, société porteuse et société employeuse', true)}
    ${ch('2', '#1747C2', 'COMPRENDRE', '2e et 3e trimestres', 'Analyse des flux de ressources entre sociétés ; valorisation indicative au taux journalier par classe RH (chantier 2026)')}
    ${ch('3', C.O, 'DÉCIDER', '4e trimestre 2027', 'Décision documentée sur l\'opportunité, ou non, d\'un mécanisme de répartition à partir de 2028')}
  </div>
  <div class="keep"><b>Ce qui ne change pas en 2027 :</b> comptabilité et chiffre d'affaires propres à chaque société ; charges salariales portées par la société employeuse ; aucune refacturation imposée entre sociétés.</div>`;
  return page(820, body, css);
};

// --------------------------------------------------------- F9 Synergies
figs.synergies = () => {
  const st = (n, h, t, d, col, txt) => `<div class="st" style="height:${h}px;background:${col};color:${txt}"><div class="n">${n}</div><div class="t">${t}</div><div class="d">${d}</div></div>`;
  const css = `
  .wrap{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;align-items:end;height:250px}
  .st{border-radius:10px 10px 0 0;padding:10px 12px}
  .st .n{font-size:26px;font-weight:700;opacity:.85;line-height:1}
  .st .t{font-size:15.5px;font-weight:700;margin:4px 0 4px}
  .st .d{font-size:13px;line-height:1.3}
  .ground{height:3px;background:${C.NAVY};border-radius:2px}
  .br{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:8px}
  .br div{font-size:12.5px;text-align:center;border-top:3px solid;padding-top:5px;font-weight:700}`;
  const body = `
  <div class="wrap">
    ${st(1, 140, 'Partager l\'information', 'Connaissance mutuelle des offres, pipeline des opportunités partagé', C.BL, C.INK)}
    ${st(2, 175, 'Recommander', 'Apports d\'affaires entre sociétés, selon des règles communes', '#BFD0FF', C.INK)}
    ${st(3, 212, 'Co-construire', 'Offres conjointes et réponses communes aux appels d\'offres', C.B, '#fff')}
    ${st(4, 248, 'Développer des comptes partagés', 'Gestion concertée des clients communs aux sociétés', C.NAVY, '#fff')}
  </div>
  <div class="ground"></div>
  <div class="br">
    <div style="border-color:${C.O};color:#C8401C;grid-column:span 2">Ambition 2027 proposée : consolider</div>
    <div style="border-color:${C.B};color:${C.B}">2027 : engager</div>
    <div style="border-color:#9AA3B8;color:${C.MUT}">Horizon ultérieur</div>
  </div>`;
  return page(820, body, css);
};

// ------------------------------------------------------- F10 Mobilisation
figs.mobilisation = () => {
  const s = (n, t, a, col) => `<div class="s"><div class="c" style="background:${col}">${n}</div><div class="t">${t}</div><div class="a">${a}</div></div>`;
  const ar = `<div class="ar"><svg width="22" height="18"><path d="M1 9h16M11 3l7 6-7 6" stroke="#9AA3B8" stroke-width="2.2" fill="none"/></svg></div>`;
  const css = `
  .row{display:flex;align-items:stretch}
  .s{flex:1;background:${C.PANEL};border:1px solid ${C.LINE};border-radius:10px;padding:10px 10px 12px;text-align:center}
  .c{width:32px;height:32px;border-radius:50%;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;font-size:15px}
  .t{font-weight:700;font-size:14.5px;line-height:1.2;min-height:36px}
  .a{font-size:12.5px;color:${C.MUT};margin-top:5px;line-height:1.25}
  .ar{display:flex;align-items:center;padding:0 3px}
  .ft{margin-top:10px;font-size:13px;color:${C.MUT};text-align:center}`;
  const body = `<div class="row">
    ${s(1, 'Expression du besoin', 'PMO de la société porteuse du projet', C.B)}${ar}
    ${s(2, 'Vérification des disponibilités', 'PMO de la société employeuse, à partir de la cartographie des compétences', C.B)}${ar}
    ${s(3, 'Arbitrage en cas de conflit', 'Coordination Groupe des PMO, puis gérant en l\'absence d\'accord', C.O)}${ar}
    ${s(4, 'Affectation et information', 'PMO employeur, collaborateur concerné', C.B)}${ar}
    ${s(5, 'Saisie des temps et suivi', 'Collaborateur ; validation par le PMO porteur', C.NAVY)}
  </div>
  <div class="ft">Processus proposé, à ajuster lors de la validation ; aucun formulaire ni outil nouveau n'est requis si l'outil de gestion des opérations le permet.</div>`;
  return page(820, body, css);
};

// --------------------------------------------------- F11 IA trajectoire
figs.ia_trajectoire = () => {
  const ch = (t, h, d, col) => `<div class="ch" style="background:${col}"><div class="h">${h}</div><div class="t">${t}</div><div class="d">${d}</div></div>`;
  const css = `
  .row{display:grid;grid-template-columns:200px repeat(4,1fr);gap:0;align-items:stretch;padding-right:10px}
  .start{background:${C.PANEL};border:1px solid ${C.LINE};border-radius:10px;padding:10px 12px;margin-right:16px;font-size:13px;line-height:1.3}
  .start .kick{color:${C.B};margin-bottom:5px}
  .start li{margin:3px 0 3px 14px}
  .ch{color:#fff;padding:12px 26px 12px 26px;clip-path:polygon(0 0,90% 0,100% 50%,90% 100%,0 100%,10% 50%);margin-right:-10px}
  .ch .h{display:inline-block;background:rgba(255,255,255,.2);border-radius:20px;padding:1px 8px;font-size:11.5px;font-weight:700}
  .ch .t{font-size:16.5px;font-weight:700;margin:5px 0 4px}
  .ch .d{font-size:13px;line-height:1.28}`;
  const body = `<div class="row">
    <div class="start"><div class="kick">Point de départ</div><ul>
      <li>Bases IA des équipes</li><li>AI Engineering et Architecture &amp; innovation chez KCS</li><li>Cellule d'innovation et veille prévues au plan 2026</li><li>Solutions intégrant l'IA en cours</li></ul></div>
    ${ch('Recenser', 'T1', 'Inventaire des usages, outils et projets IA existants dans les trois sociétés', '#5B86FF')}
    ${ch('Structurer', 'T1 et T2', 'Référents, charte d\'usage, outils validés, priorités', C.B)}
    ${ch('Accélérer', 'T2 et T3', 'Cas d\'usage pilotes, parcours de compétences, feuilles de route des solutions', '#1747C2')}
    ${ch('Mesurer et valoriser', 'T4', 'Gains mesurés, offres formalisées, feuille de route 2028', C.O)}
  </div>`;
  return page(820, body, css);
};

// --------------------------------------------------- F12 IA dimensions
figs.ia_dimensions = () => {
  const q = (n, t, items, col) => `<div class="q"><div class="hd"><span style="background:${col}">${n}</span>${t}</div><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul></div>`;
  const css = `
  .wrap{position:relative}
  .g{display:grid;grid-template-columns:1fr 1fr;gap:14px 150px}
  .q{background:${C.PANEL};border:1px solid ${C.LINE};border-radius:12px;padding:12px 16px 12px;min-height:150px}
  .hd{font-weight:700;font-size:15.5px;display:flex;align-items:center;gap:9px;margin-bottom:6px}
  .hd span{width:28px;height:28px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;flex:none}
  ul{list-style:none}
  li{font-size:13.8px;margin:4px 0;padding-left:14px;position:relative;line-height:1.25}
  li:before{content:'';position:absolute;left:0;top:6px;width:6px;height:6px;border-radius:2px;background:${C.O}}
  .ctr{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:138px;height:138px;border-radius:50%;background:${C.NAVY};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:6px solid #fff;box-shadow:0 0 0 1px ${C.LINE}}
  .ctr b{font-size:17px}.ctr span{font-size:12.5px;color:#C9D3EE;margin-top:3px;line-height:1.2}`;
  const body = `<div class="wrap"><div class="g">
    ${q(1, 'Compétences en IA', ['Développer les compétences existantes', 'Accompagner les collaborateurs', 'Maîtriser les outils retenus', 'Identifier des référents internes'], C.B)}
    ${q(2, 'IA dans les processus', ['Génération et automatisation des rapports', 'Analyse intelligente des documents', 'Sécurisation et conformité', 'Optimisation des processus internes'], C.O)}
    ${q(3, 'Solutions et offres', ['Solutions métiers de KCS enrichies', 'Capacités RiskTech de RLCS', 'Fonctions intelligentes e-santé de LUKE', 'Valorisation commerciale'], C.RL)}
    ${q(4, 'Encadrement et productivité', ['Sécurité et confidentialité des données', 'Bonnes pratiques d\'utilisation', 'Contrôle de la qualité des résultats', 'Évaluation des gains de productivité'], C.LU)}
  </div><div class="ctr"><b>IA</b><span>levier transversal<br>consolider · structurer<br>accélérer</span></div></div>`;
  return page(820, body, css);
};

// --------------------------------------------------------- F13 Frise
figs.frise = () => {
  const it = (t, span = 1, cls = '') => `<div class="it ${cls}" style="grid-column:span ${span}">${t}</div>`;
  const lane = (name, col, cells) => `<div class="ln" style="background:${col}">${name}</div><div class="cells">${cells}</div>`;
  const css = `
  .g{display:grid;grid-template-columns:150px 1fr;gap:8px 10px;align-items:stretch}
  .hdr{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 7px}
  .hdr div{background:${C.NAVY};color:#fff;border-radius:8px;padding:6px 10px;font-size:15px}
  .hdr div span{font-size:12.5px;color:#C9D3EE;margin-left:6px}
  .ph{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 7px}
  .ph div{border-radius:20px;text-align:center;font-weight:700;font-size:13.5px;padding:4px;letter-spacing:.5px}
  .ln{color:#fff;border-radius:8px;padding:8px 10px;font-weight:700;font-size:14.5px;display:flex;align-items:center;line-height:1.2}
  .cells{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:${C.PANEL};border-radius:8px;padding:7px}
  .stack{display:flex;flex-direction:column;gap:5px}
  .it{background:#fff;border:1px solid ${C.LINE};border-radius:7px;padding:5px 8px;font-size:13px;line-height:1.22}
  .ms{display:flex;align-items:center;gap:7px;font-size:12.8px;font-weight:700}
  .ms i{width:12px;height:12px;background:${C.O};transform:rotate(45deg);flex:none;border-radius:2px}
  .lg{margin-top:9px;font-size:12.5px;color:${C.MUT};display:flex;gap:18px;justify-content:center}
  .lg i{display:inline-block;width:11px;height:11px;background:${C.O};transform:rotate(45deg);margin-right:6px;border-radius:2px}`;
  const col = (items) => `<div class="stack">${items.join('')}</div>`;
  const span2 = (items) => `<div class="stack" style="grid-column:span 2">${items.join('')}</div>`;
  const row = (a, bc, d) => `${col(a)}${span2(bc)}${col(d)}`;
  const ms = (t) => `<div class="ms"><i></i>${t}</div>`;
  const body = `<div class="g">
    <div></div>
    <div class="hdr"><div><b>T1</b><span>janvier à mars</span></div><div><b>T2</b><span>avril à juin</span></div><div><b>T3</b><span>juillet à septembre</span></div><div><b>T4</b><span>octobre à décembre</span></div></div>
    <div></div>
    <div class="ph"><div style="background:${C.BL};color:${C.B}">COURT TERME · CADRER ET LANCER</div><div style="grid-column:span 2;background:#DCE4FF;color:#1747C2">MOYEN TERME · DÉPLOYER ET STRUCTURER</div><div style="background:${C.OL};color:#C8401C">CONSOLIDATION · CONSOLIDER ET DÉCIDER</div></div>
    ${lane('Axe 1<br>Gouvernance', C.B, row(
      [it('Charte de gouvernance et circuits de décision'), it('Installation du CODIR Groupe et de la revue des PMO'), it('Lancement du suivi analytique (mesure)')],
      [it('Catalogue de services HR/Accounting et mission BPM élargie'), it('Reporting consolidé homogène et tableau de bord Groupe'), it('Pipeline partagé et revue commerciale inter-sociétés')],
      [it('Bilan de la gouvernance'), it('Décision sur un éventuel mécanisme de répartition (2028)')]))}
    ${lane('Axe 2<br>Capital humain', C.O, row(
      [it('Fiches de fonction finalisées et matrice RACI'), it('Cartographie des compétences'), it('Suivi simple des charges par projet')],
      [it('Processus de mobilisation inter-sociétés'), it('Points de charge PMO et collaborateurs'), it('Plan de développement des compétences')],
      [it('Bilan de la mobilisation et de la productivité'), it('Ajustement des rôles et du plan 2028')]))}
    ${lane('Axe 3<br>IA', C.NAVY, row(
      [it('Inventaire des usages et solutions IA'), it('Désignation des référents IA'), it('Charte d\'usage de l\'IA')],
      [it('Parcours de compétences IA'), it('Cas d\'usage pilotes dans les processus'), it('Feuilles de route IA des solutions KCS, RLCS, LUKE')],
      [it('Catalogue des offres intégrant l\'IA'), it('Mesure des gains de productivité'), it('Feuille de route IA 2028')]))}
    ${lane('Pilotage', C.RL, `${col([ms('Revue stratégique T1'), it('Tableau de bord Groupe, version initiale')])}${col([ms('Revue stratégique T2')])}${col([ms('Revue stratégique T3')])}${col([ms('Bilan stratégique annuel'), it('Orientations 2028')])}`)}
  </div>
  <div class="lg"><span><i></i>Jalon de revue proposé</span><span>Calendrier indicatif, à valider ; échéances précises et responsables à définir</span></div>`;
  return page(1240, body, css);
};

// ------------------------------------------------------- F14 Pyramide
figs.pyramide = () => {
  const css = `
  .wrap{display:grid;grid-template-columns:1fr 170px;gap:16px;align-items:center}
  .pyr{display:flex;flex-direction:column;align-items:center;gap:6px}
  .lv{color:#fff;text-align:center;display:flex;flex-direction:column;justify-content:center;height:92px}
  .lv b{font-size:15.5px}.lv span{font-size:13px;opacity:.92;line-height:1.3}
  .side{display:flex;flex-direction:column;gap:12px}
  .a{border-radius:10px;padding:10px 12px;font-size:13px;line-height:1.3;display:flex;gap:8px;align-items:center}
  .a svg{flex:none}`;
  const body = `<div class="wrap"><div class="pyr">
    <div class="lv" style="width:320px;background:${C.NAVY};clip-path:polygon(22% 0,78% 0,100% 100%,0 100%)"><b>Tableau de bord stratégique</b><span>Gérant et associés<br>trimestriel (proposé)</span></div>
    <div class="lv" style="width:470px;background:${C.B};clip-path:polygon(14% 0,86% 0,100% 100%,0 100%)"><b>Tableaux de bord sociétés et consolidé</b><span>Comité de Direction Groupe<br>mensuel (proposé)</span></div>
    <div class="lv" style="width:620px;background:#5B86FF;clip-path:polygon(10% 0,90% 0,100% 100%,0 100%)"><b>Suivi opérationnel des projets et des ressources</b><span>PMO et coordination Groupe des PMO<br>toutes les deux semaines (proposé)</span></div>
  </div>
  <div class="side">
    <div class="a" style="background:${C.OL}"><svg width="18" height="40"><path d="M9 38V4M3 10l6-7 6 7" stroke="${C.O}" stroke-width="2.4" fill="none"/></svg><span><b>Agrégation</b> des données, de l'opérationnel vers le stratégique</span></div>
    <div class="a" style="background:${C.BL}"><svg width="18" height="40"><path d="M9 2v34M3 30l6 7 6-7" stroke="${C.B}" stroke-width="2.4" fill="none"/></svg><span><b>Décisions</b> et priorités, du stratégique vers l'opérationnel</span></div>
  </div></div>`;
  return page(820, body, css);
};

// ------------------------------------------------------ F15 Dashboard
figs.dashboard = () => {
  const tile = (t, col, kpis) => `<div class="tile"><div class="th" style="background:${col}">${t}</div>${kpis.map((k) => `<div class="k"><div class="kn">${k}</div><div class="kv"><span>Valeur : à renseigner</span><span>Cible : à définir</span></div></div>`).join('')}</div>`;
  const css = `
  .top{display:flex;justify-content:space-between;align-items:center;background:${C.NAVY};color:#fff;border-radius:10px 10px 0 0;padding:9px 14px}
  .top b{font-size:16px}.top span{font-size:13px;color:#C9D3EE}
  .body{border:1px solid ${C.LINE};border-top:none;border-radius:0 0 10px 10px;padding:12px;background:${C.PANEL}}
  .g{display:grid;grid-template-columns:repeat(5,1fr);gap:9px}
  .tile{background:#fff;border:1px solid ${C.LINE};border-radius:9px;overflow:hidden}
  .th{color:#fff;font-weight:700;font-size:13.5px;padding:6px 9px}
  .k{padding:6px 9px;border-top:1px solid ${C.LINE}}
  .kn{font-size:12.8px;font-weight:700;line-height:1.2;min-height:31px}
  .kv{display:flex;flex-direction:column;font-size:11.5px;color:${C.MUT};margin-top:3px}
  .ch{margin-top:11px;background:#fff;border:1px solid ${C.LINE};border-radius:9px;padding:9px 12px;display:grid;grid-template-columns:170px repeat(3,1fr);gap:10px;align-items:center;font-size:13.5px}
  .ch .rag{display:flex;align-items:center;gap:7px}
  .dot{display:inline-flex;gap:4px}.dot i{width:13px;height:13px;border-radius:50%;border:1.5px solid #B8C0D2;display:inline-block}`;
  const rag = '<span class="dot"><i></i><i></i><i></i></span>';
  const body = `
  <div class="top"><b>Tableau de bord stratégique Groupe</b><span>Maquette indicative · trimestre : à renseigner</span></div>
  <div class="body">
    <div class="g">
      ${tile('Organisation', C.B, ['Instances tenues / prévues', 'Jalons atteints / prévus', 'Délai du reporting consolidé'])}
      ${tile('Commercial', C.O, ['Pipeline par société', 'Opportunités inter-sociétés', 'Offres conjointes'])}
      ${tile('Financier', C.NAVY, ['CA par société et consolidé', 'Jours mobilisés entre sociétés', 'Marge analytique par projet'])}
      ${tile('Humain', C.RL, ['Taux de saisie des temps', 'Taux d\'occupation', 'Plan de compétences réalisé'])}
      ${tile('Technologique', C.LU, ['Adoption des outils IA', 'Cas d\'usage déployés', 'Gains de temps mesurés'])}
    </div>
    <div class="ch"><b>Avancement des chantiers</b><div class="rag">${rag} Axe 1 · Gouvernance</div><div class="rag">${rag} Axe 2 · Capital humain</div><div class="rag">${rag} Axe 3 · IA</div></div>
  </div>`;
  return page(820, body, css);
};

// ---------------------------------------------------------------- Cover bg
figs.cover_bg = () => {
  // A4 à 96 dpi : 794 x 1123
  const css = `#fig{padding:0}
  .pg{width:794px;height:1123px;position:relative;overflow:hidden;background:#fff}
  .strip{position:absolute;left:0;top:0;width:38px;height:1123px;background:${C.B}}
  .strip2{position:absolute;left:0;top:0;width:38px;height:250px;background:${C.O}}
  .sq{position:absolute;border-radius:14px}
  .foot{position:absolute;left:38px;right:0;bottom:0;height:54px;background:${C.NAVY}}
  .foot i{position:absolute;left:0;top:0;height:4px;width:160px;background:${C.O}}`;
  const body = `<div class="pg"><div class="strip"></div><div class="strip2"></div>
    <div class="sq" style="right:-70px;bottom:120px;width:230px;height:230px;border:2px solid #E3E9FF;transform:rotate(18deg)"></div>
    <div class="sq" style="right:30px;bottom:200px;width:120px;height:120px;background:#F4F6FB;transform:rotate(18deg)"></div>
    <div class="sq" style="right:150px;bottom:90px;width:70px;height:70px;border:2px solid #FFD9CC;transform:rotate(18deg)"></div>
    <div class="foot"><i></i></div></div>`;
  return page(794, body, css);
};

(async () => {
  const browser = await chromium.launch();
  const only = process.argv.slice(2);
  const meta = {};
  for (const [name, fn] of Object.entries(figs)) {
    if (only.length && !only.includes(name)) continue;
    const isCover = name === 'cover_bg';
    const page = await browser.newPage({ deviceScaleFactor: isCover ? 2 : 3, viewport: { width: 1400, height: 1200 } });
    await page.setContent(fn(), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const el = await page.$('#fig');
    const box = await el.boundingBox();
    await el.screenshot({ path: path.join(OUT, `${name}.png`) });
    meta[name] = { w: Math.round(box.width), h: Math.round(box.height) };
    console.log(name, meta[name]);
    await page.close();
  }
  const metaPath = path.join(OUT, 'meta.json');
  const prev = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath)) : {};
  fs.writeFileSync(metaPath, JSON.stringify({ ...prev, ...meta }, null, 2));
  await browser.close();
})();
