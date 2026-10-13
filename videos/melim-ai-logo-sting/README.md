# MELIM AI — logo animé (5 s, 9:16)

Animation du logo MELIM AI, réalisée avec HyperFrames (v0.8.150) : composition, animation,
mixage et export.

## Livrables

| Fichier | Contenu |
| --- | --- |
| `renders/melim-ai-logo-anime-5s-9x16.mp4` | H.264 High, 1080 × 1920, 30 i/s, 150 images, 5,0 s, AAC 48 kHz stéréo, −15,6 LUFS |
| `renders/contact-sheet-mp4.png` | 10 images extraites du MP4 final (0,35 s → 4,95 s) |

## Fidélité au logo

- Source : `assets/logo/melim-ai-logo.png` (PNG opaque fourni, 1254 × 1254).
- Couleurs mesurées dans le fichier : fond `#FEFEFE`, bleu `#0757F4`, bleu nuit `#000619`.
- Le logo n'est **pas redessiné**. `tools/split_logo.py` calcule pour chaque pixel la part
  d'encre qu'il contient (détourage d'un logo à aplats), puis découpe 10 calques : les deux
  moitiés du M, la goutte, M-E-L-I-M, A et I. Recomposés sur le fond, ces calques redonnent
  l'image avec un écart moyen de 0,46/255.
- L'image finale montre le logo **à l'échelle 1:1** (aucun redimensionnement), centré, sur le
  même fond `#FEFEFE`. L'écart moyen avec le fichier source est de 1,5/255 (compression H.264,
  et le léger bruit du fond source qui n'est pas reproduit).
- À 1:1, de petites irrégularités sont visibles sur certains bords du fichier source (par exemple
  les diagonales des lettres). Elles viennent du fichier et sont conservées telles quelles.
  Un fichier vectoriel (SVG ou PDF) donnerait des bords plus nets.

## Déroulé

| Temps | Action | Son |
| --- | --- | --- |
| 0,15 → 0,60 s | la goutte tombe du haut en s'étirant, puis s'écrase et rebondit | chute + « plic » |
| 0,60 s | trois ondes s'étendent sur la ligne de base | résonance grave |
| 0,80 → 1,55 s | les deux moitiés du M émergent de l'onde, du bas vers le haut, et se referment sur la goutte | montée |
| 1,35 s | verrouillage : légère pulsation | accord (Fa maj9) + nappe |
| 1,55 → 2,0 s | M-E-L-I-M sortent d'un flou, lettre par lettre | 5 notes montantes |
| 2,05 s | « AI » apparaît d'un coup, avec une étincelle | « ping » |
| 2,70 s | un reflet lumineux traverse le logo | scintillement |
| 1,66 → 4,40 s | lente avancée caméra jusqu'à l'échelle 1:1, puis image fixe jusqu'à 5,0 s | la nappe s'éteint |

Idée directrice : une goutte (une idée, une donnée) tombe, se propage, et fait naître la marque.
Sons synthétisés par `tools/synth_sfx.py`, sans banque de sons tierce.

## Commandes (depuis ce dossier)

```bash
python3 tools/split_logo.py   # recrée les calques depuis assets/logo/melim-ai-logo.png
python3 tools/synth_sfx.py    # recrée les effets sonores
npx hyperframes check
npx hyperframes render --quality high --fps 30 --format mp4 --output renders/melim-ai-logo-anime-5s-9x16.mp4
```
