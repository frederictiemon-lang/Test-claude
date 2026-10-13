# Kyria Consultancy Services — logo animé (5 s, 9:16)

Animation du logo Kyria Consultancy Services, réalisée avec HyperFrames (v0.8.150) : composition,
animation, mixage et export.

## Livrables

| Fichier | Contenu |
| --- | --- |
| `renders/kyria-logo-anime-5s-9x16.mp4` | H.264 High, 1080 × 1920, 30 i/s, 150 images, 5,0 s, AAC 48 kHz stéréo, −17,3 LUFS |
| `renders/contact-sheet-mp4.png` | 10 images extraites du MP4 final (0,15 s → 4,95 s) |

## Fidélité au logo

- Source : `assets/logo/kyria-logo.jpg` (JPG fourni, 2576 × 819, fond blanc).
- Encres mesurées dans le fichier : bleu `#2261FE`, orange `#FD6236`, noir `#000000`.
- Le logo n'est **pas redessiné**. Le JPG n'ayant pas de transparence, `tools/split_logo.py`
  calcule pour chaque pixel la part d'encre qu'il contient (détourage d'un logo à aplats sur
  blanc), puis découpe 26 calques : les deux branches du K et chaque lettre.
  Recomposés sur blanc, ces calques redonnent le JPG avec un écart moyen de 0,125/255
  (99 % des pixels à 3/255 ou moins).
- Image finale : logo complet sur fond blanc, proportions d'origine (mise à l'échelle
  uniforme), 989 px de large. Comparée au JPG placé exactement au même endroit, l'écart moyen
  est de 1,6/255. Les différences restantes viennent du lissage des bords et de la compression
  H.264.
- Dans le fichier fourni, le K touche le bord gauche et le « y » de « Consultancy » touche
  le bord droit. Le logo est animé tel quel.

## Déroulé

| Temps | Action | Son |
| --- | --- | --- |
| 0,00 s | trame de points « plan d'architecte », un point bleu marque le futur centre du K | blip |
| 0,30 s | la branche bleue puis la branche orange convergent le long de leurs diagonales et forment le K | deux souffles |
| 1,00 s | verrouillage : légère pulsation du logo | accord résolu (Cmaj9) + nappe douce |
| 1,15 s | trois lignes-guides bleues sortent du K | ticks légers |
| 1,30 → 2,40 s | « Kyria », « Consultancy », « Services » se posent lettre par lettre ; chaque guide se retire une fois son mot posé | — |
| 2,70 s | un reflet lumineux traverse le logo | scintillement |
| 2,0 → 4,5 s | lente avancée caméra, la trame s'efface, image fixe de 4,5 à 5,0 s | la nappe s'éteint |

Idée directrice : deux trajectoires (technologie et stratégie) qui convergent en un point,
puis une structure (grille, lignes) qui organise le message, avant de s'effacer.
Sons synthétisés par `tools/synth_sfx.py`, sans banque de sons tierce.

## Commandes (depuis ce dossier)

```bash
python3 tools/split_logo.py   # recrée les calques depuis assets/logo/kyria-logo.jpg
python3 tools/synth_sfx.py    # recrée les effets sonores
npx hyperframes check
npx hyperframes render --quality high --fps 30 --format mp4 --output renders/kyria-logo-anime-5s-9x16.mp4
```
