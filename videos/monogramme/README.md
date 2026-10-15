# Monogramme — animation sportive (5 s, 16:9)

Animation du monogramme vert citron sur noir, réalisée avec HyperFrames (v0.8.150) :
composition, animation, mixage et export.

## Livrables

| Fichier | Contenu |
| --- | --- |
| `renders/monogramme-sport-5s-16x9.mp4` | H.264 High, 1920 × 1080, 30 i/s, 150 images, 5,0 s, AAC 48 kHz stéréo, −15,2 LUFS |
| `renders/contact-sheet-mp4.png` | 12 images extraites du MP4 final (0,3 s → 4,95 s) |

## Fidélité au logo

- Source : `assets/logo/monogramme.png` (PNG opaque fourni, 1254 × 1254, fond noir).
- Couleur mesurée dans le fichier : `#C5F905`.
- Le logo n'est **pas redessiné**. `tools/split_logo.py` calcule pour chaque pixel la part de
  vert qu'il contient et découpe les deux glyphes en calques transparents. Recomposés sur noir,
  ils redonnent l'image avec un écart moyen de 0,32/255. 44 pixels isolés de bruit dans le fond
  noir (hors du logo) ont été écartés.
- Les effets (flash blanc, brouillage, halo, rayons, étincelles) sont temporaires. À partir de
  4,2 s l'image est fixe : le logo seul, **à l'échelle 1:1**, centré, sur noir pur. Écart moyen
  avec le fichier source : 1,5/255 (compression H.264).

## Déroulé

| Temps | Action | Son |
| --- | --- | --- |
| 0,10 → 0,45 s | le G gauche arrive de la gauche, en accélérant, avec des lignes de vitesse | whoosh (gauche) |
| 0,45 s | **impact 1** : il s'arrête net (écrasement + rebond), flash blanc, onde de choc, étincelles, secousse | frappe |
| 1,00 → 1,35 s | le G droit arrive de la droite | whoosh (droite) |
| 1,35 s | **impact 2** : même traitement, plus fort ; le G gauche encaisse le choc | frappe plus lourde |
| 1,62 → 2,05 s | les deux G reculent et se chargent (léger tremblement, zoom arrière) | montée de tension |
| 2,15 s | **impact 3, les deux ensemble** : flash plein écran, zoom-punch, triple onde de choc, étincelles | gros impact + basse |
| 2,15 → 2,55 s | **brouillage** : tranches décalées, double blanc, scintillement (12 images) | grésillements |
| 2,15 → 3,8 s | **les lumières apparaissent** : rayons tournants, deux faisceaux croisés, éclat horizontal, halo, deux flashs stroboscopiques | nappe lumineuse |
| 3,55 s | un reflet rapide traverse le logo | balayage |
| 4,2 → 5,0 s | image fixe : le logo seul, net, 1:1 | fin de la résonance |

Sons synthétisés par `tools/synth_sfx.py`, sans banque de sons tierce. Les étincelles, secousses
et le brouillage utilisent des valeurs fixes (graine) : chaque rendu est identique.

## Commandes (depuis ce dossier)

```bash
python3 tools/split_logo.py   # recrée les calques depuis assets/logo/monogramme.png
python3 tools/synth_sfx.py    # recrée les effets sonores
npx hyperframes@0.8.150 check
npx hyperframes@0.8.150 render --quality high --fps 30 --format mp4 --output renders/monogramme-sport-5s-16x9.mp4
```

## Historique

- v1 : révélation cinématographique (front lumineux, lumière par la fente centrale).
- v2 : les deux G se percutent en même temps ; tour rapide puis retour avec zoom.
- v3 (demande client : « logo sportif ») : style cinéma abandonné (grain, poussières,
  vignette, travelling) ; un G arrive et crée un impact, puis l'autre, puis les deux ensemble
  dans un gros impact brouillé où les lumières apparaissent. Durée ramenée à 5 s.
