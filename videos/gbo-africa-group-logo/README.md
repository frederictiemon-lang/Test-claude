# GBÔ AFRICA GROUP — logo reveal (5 s, 16:9)

Animation du logo GBÔ, réalisée avec HyperFrames (v0.8.150) : composition, animation,
mixage et export.

## Livrables

| Fichier | Contenu |
| --- | --- |
| `renders/gbo-africa-group-logo-5s-16x9.mp4` | H.264 High, 1920 × 1080, 30 i/s, 150 images, 5,0 s, AAC 48 kHz stéréo, −15,2 LUFS |
| `renders/contact-sheet-mp4.png` | 9 images extraites du MP4 final (0,3 s → 4,95 s) |

## Fidélité au logo

- Source : `assets/logo/gbo-africa-group.png` (PNG fourni, 1254 × 1254, vert sur noir).
- Couleur **mesurée dans le fichier** : `#C1F405`. La charte indique `#C6F202` ; l'écart est faible
  et la vidéo garde la couleur du fichier, sans recoloration.
- Le logo n'est **pas redessiné, déplacé, tourné ni déformé**. `tools/split_logo.py` calcule la
  transparence de chaque pixel à partir de la couleur du fichier et sépare trois calques aux
  coordonnées d'origine : le logo sans signature, la signature, et l'haltère seul (utilisé
  uniquement pour sa lueur, jamais affiché net). Recomposés, ils redonnent l'image avec un écart
  moyen de 0,38/255.
- Le logo est affiché à l'échelle **1:1**, centré (62 % de la largeur de l'écran).
- Image finale : pixels du logo identiques à la source à la compression près (écart moyen
  2,5/255 ; couleur médiane `#C2F304` dans la vidéo, `#C1F405` dans le fichier). Le logo ne
  bouge pas entre 1,2 s et la fin (écart moyen 0,56/255, bruit de compression).
- Seul effet qui reste à la fin : un halo vert très léger derrière le logo (12 % d'opacité),
  la « finition lumineuse subtile » demandée.

## Déroulé

| Temps | Action | Son |
| --- | --- | --- |
| 0,00 → 0,12 s | écran noir | — |
| 0,12 → 1,00 s | un fin trait de lumière vert citron traverse l'écran ; le logo apparaît derrière sa tête, avec un bord adouci et une lueur discrète | souffle doux (gauche → droite) |
| 1,00 s | logo complet, parfaitement immobile ; une légère respiration du halo | impact grave et court |
| 1,15 → 2,05 s | brève lueur vert citron autour de l'haltère, dans le Ô (l'haltère lui-même ne bouge pas) | — |
| 2,00 → 3,20 s | la signature « Plus qu'une pratique, un style de vie » apparaît en fondu | — |
| 3,50 → 4,60 s | le halo redescend à un niveau très discret | — |
| 4,60 → 5,00 s | image fixe | — |

Aucun élément ajouté : pas de particules, fumée, flammes, texte ou filigrane. Sons synthétisés par
`tools/synth_sfx.py`, sans banque de sons tierce.

## Commandes (depuis ce dossier)

```bash
python3 tools/split_logo.py   # recrée les calques depuis assets/logo/gbo-africa-group.png
python3 tools/synth_sfx.py    # recrée le souffle et l'impact
npx hyperframes@0.8.150 check
npx hyperframes@0.8.150 render --quality high --fps 30 --format mp4 --output renders/gbo-africa-group-logo-5s-16x9.mp4
```
