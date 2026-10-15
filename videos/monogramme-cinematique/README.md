# Monogramme — révélation cinématographique (6 s, 16:9)

Animation cinématographique du monogramme vert citron sur noir, réalisée avec HyperFrames
(v0.8.150) : composition, animation, mixage et export.

## Livrables

| Fichier | Contenu |
| --- | --- |
| `renders/monogramme-cinematique-6s-16x9.mp4` | H.264 High, 1920 × 1080, 30 i/s, 180 images, 6,0 s, AAC 48 kHz stéréo, −16,9 LUFS |
| `renders/contact-sheet-mp4.png` | 9 images extraites du MP4 final (0,5 s → 5,95 s) |

Le fichier pèse 24,5 Mo : le grain argentique, par nature peu compressible, en est la cause.

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

## Déroulé

| Temps | Action | Son |
| --- | --- | --- |
| 0,0 s | noir, grain argentique et poussières en suspension, lente avancée caméra (jusqu'à 5,2 s) | grondement grave |
| 0,1 → 1,7 s | un rayon de lumière anamorphique traverse l'écran | souffle |
| 0,45 → 2,25 s | le glyphe gauche est éclairé par un front lumineux, de son bord extérieur vers le centre | balayage (gauche) |
| 0,65 → 2,35 s | le glyphe droit, de la droite vers le centre | balayage (droite) |
| 2,35 s | les deux fronts se rejoignent : la lumière jaillit par la fente centrale, éclat horizontal, halo | impact grave |
| 3,25 s | un reflet lumineux traverse le logo | scintillement |
| 4,4 → 5,2 s | l'atmosphère se dissipe (grain, vignette, halo, poussières) | résonance qui s'éteint |
| 5,2 → 6,0 s | image fixe : le logo seul, net, 1:1 | — |

Sons synthétisés par `tools/synth_sfx.py`, sans banque de sons tierce. Le grain et les
poussières sont générés avec des graines fixes : chaque rendu est identique.

## Commandes (depuis ce dossier)

```bash
python3 tools/split_logo.py   # recrée les calques et la texture de grain
python3 tools/synth_sfx.py    # recrée les effets sonores
npx hyperframes@0.8.150 check
npx hyperframes@0.8.150 render --quality high --fps 30 --format mp4 --output renders/monogramme-cinematique-6s-16x9.mp4
```
