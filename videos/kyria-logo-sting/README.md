# Kyria Consultancy Services — logo animé (5 s, 9:16)

Animation du logo Kyria Consultancy Services, réalisée avec HyperFrames (v0.8.150) : composition,
animation, mixage et export.

## Livrables

| Fichier | Contenu |
| --- | --- |
| `renders/kyria-logo-anime-5s-9x16.mp4` | H.264 High, 1080 × 1920, 30 i/s, 150 images, 5,0 s, AAC 48 kHz stéréo, −17,4 LUFS |
| `renders/kyria-logo-anime-5s-1080x642.mp4` | le même film recadré en 1080 × 642 (bande y = 676 → 1318), le cadrage de la version retravaillée par le client |
| `renders/contact-sheet-mp4.png` | 9 images extraites du MP4 9:16 (0,45 s → 4,95 s) |

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
| 1,20 → 1,66 s | « Kyria » s'écrit, lettre par lettre de gauche à droite | tick |
| 1,72 → 2,49 s | puis « Consultancy » | tick |
| 2,47 → 3,16 s | une seule ligne-guide bleue se trace sous « Services », puis « Services » s'écrit | tick |
| 3,30 s | la ligne-guide se retire | — |
| 3,50 s | un reflet lumineux traverse le logo | scintillement |
| 2,0 → 4,5 s | lente avancée caméra, la trame s'efface, image fixe de 4,5 à 5,0 s | la nappe s'éteint |

Idée directrice : deux trajectoires (technologie et stratégie) qui convergent en un point,
puis le nom qui s'écrit ligne après ligne sur une trame discrète, qui s'efface à la fin.
Sons synthétisés par `tools/synth_sfx.py`, sans banque de sons tierce.

## Commandes (depuis ce dossier)

```bash
python3 tools/split_logo.py   # recrée les calques depuis assets/logo/kyria-logo.jpg
python3 tools/synth_sfx.py    # recrée les effets sonores
npx hyperframes check
npx hyperframes@0.8.150 render --quality high --fps 30 --format mp4 --output renders/kyria-logo-anime-5s-9x16.mp4
# version 1080 x 642 (recadrage du rendu 9:16)
ffmpeg -i renders/kyria-logo-anime-5s-9x16.mp4 -vf "crop=1080:642:0:676" -c:v libx264 -crf 16 -pix_fmt yuv420p -c:a copy renders/kyria-logo-anime-5s-1080x642.mp4
```

## Historique

- v2 : une seule ligne-guide (sous « Services ») ; les trois lignes du nom s'écrivent l'une
  après l'autre, chaque lettre tracée de gauche à droite ; reflet décalé à 3,5 s.
