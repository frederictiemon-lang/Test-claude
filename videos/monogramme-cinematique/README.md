# Monogramme — collision cinématographique (6 s, 16:9)

Animation cinématographique du monogramme vert citron sur noir, réalisée avec HyperFrames
(v0.8.150) : composition, animation, mixage et export.

## Livrables

| Fichier | Contenu |
| --- | --- |
| `renders/monogramme-cinematique-6s-16x9.mp4` | H.264 High, 1920 × 1080, 30 i/s, 180 images, 6,0 s, AAC 48 kHz stéréo, −17,9 LUFS |
| `renders/contact-sheet-mp4.png` | 12 images extraites du MP4 final (0,3 s → 5,95 s) |

Le fichier pèse 24,9 Mo : le grain argentique, par nature peu compressible, en est la cause.

## Fidélité au logo

- Source : `assets/logo/monogramme.png` (PNG opaque fourni, 1254 × 1254, fond noir).
- Couleur mesurée dans le fichier : `#C5F905`.
- Le logo n'est **pas redessiné**. `tools/split_logo.py` calcule pour chaque pixel la part de
  vert qu'il contient et découpe les deux glyphes en calques transparents. Recomposés sur noir,
  ils redonnent l'image avec un écart moyen de 0,32/255. 44 pixels isolés de bruit dans le fond
  noir (hors du logo) ont été écartés.
- L'image finale montre le logo **à l'échelle 1:1**, centré, sur noir pur. Le grain, la
  vignette, le halo et les poussières sont tous éteints à partir de 5,2 s. Écart moyen avec le
  fichier source : 1,5/255 (compression H.264).
- Les traînées de vitesse sont des copies exactes des glyphes, floutées et éclaircies le temps
  de l'entrée ; elles disparaissent au moment de l'impact.

## Déroulé

| Temps | Action | Son |
| --- | --- | --- |
| 0,0 → 0,9 s | noir, grain argentique, poussières ; un rayon de lumière anamorphique traverse l'écran | grondement + souffle |
| 0,45 → 1,20 s | le G gauche arrive de la gauche, l'autre de la droite, en accélérant, avec des traînées de vitesse | deux whooshs (gauche / droite) |
| 1,20 s | **impact** à leur rencontre : léger recul, secousse de 3 images, éclat dans la fente centrale, onde de choc, éclat horizontal, halo | impact grave |
| 1,22 → 1,97 s | l'impact fait faire au logo **un tour complet rapide** (360°), en reculant (zoom arrière à 72 %) | tourbillon |
| 1,55 → 1,97 s | le logo **revient à sa position initiale avec un zoom** (jusqu'à 114 %) | coup sourd à 1,94 s |
| 1,98 → 2,7 s | il se **stabilise** à sa taille réelle (petit rebond amorti) | résonance |
| 2,8 s | un reflet lumineux traverse le logo | scintillement |
| 4,4 → 5,2 s | l'atmosphère se dissipe (grain, vignette, halo, poussières) | la résonance s'éteint |
| 5,2 → 6,0 s | image fixe : le logo seul, net, 1:1 | — |

Sons synthétisés par `tools/synth_sfx.py`, sans banque de sons tierce. Le grain et les
poussières sont générés avec des graines fixes : chaque rendu est identique.

## Commandes (depuis ce dossier)

```bash
python3 tools/split_logo.py   # recrée les calques, traînées et texture de grain
python3 tools/synth_sfx.py    # recrée les effets sonores
npx hyperframes@0.8.150 check
npx hyperframes@0.8.150 render --quality high --fps 30 --format mp4 --output renders/monogramme-cinematique-6s-16x9.mp4
```

## Historique

- v1 : chaque glyphe révélé par un front lumineux, lumière par la fente centrale.
- v2 (demande client) : les deux G arrivent de part et d'autre et se percutent ; l'impact
  fait tourner le logo rapidement, qui revient à sa position initiale avec un zoom avant de
  se stabiliser.
