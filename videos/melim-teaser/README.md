# MELIM — teaser démonstration interne (10 s, 9:16, WhatsApp)

Teaser vertical réalisé avec HyperFrames (v0.8.150) : composition, animation, mixage et export.
Référence de marque : `assets/src/MELIM_Brand_Book_V1.0.pdf`.

## Livrables

| Fichier | Contenu |
| --- | --- |
| `renders/melim-teaser-10s-9x16.mp4` | H.264 High, yuv420p, 1080 × 1920, 30 i/s, 300 images, 10,0 s, AAC 48 kHz stéréo, −16,5 LUFS, 2,5 Mo, index en tête de fichier (lecture immédiate) |
| `renders/contact-sheet-mp4.png` | 12 images extraites du MP4 final (0,5 s → 9,9 s) |
| `assets/vo/vo1.wav` … `vo4.wav` | voix off, une phrase par scène (texte : `assets/vo/script.txt`) |
| `assets/music/melim-electro-120bpm.wav` | musique électronique (120 BPM, la mineur), générée par code |

## Déroulé

| Temps | Scène | Image | Voix |
| --- | --- | --- | --- |
| 0 → 2,5 s | L'accroche | fond nuit, particules lumineuses, lueur bleue, une interface de chat s'esquisse (bulles, champ de saisie) | « Et si l'IA devenait votre meilleur allié ? » |
| 2,5 → 4,9 s | La découverte | trois vrais écrans de l'application, un par temps musical : champ de discussion, puis « Code », « Rédaction », « Documents », puis « Mes images », « Clés API », chacun cerclé de bleu | « Découvrez une nouvelle façon de travailler. » |
| 4,9 → 7,0 s | La marque | plongée dans l'écran blanc, le logo officiel MELIM apparaît (symbole puis nom) | « L'intelligence artificielle, autrement. » |
| 7,0 → 10 s | Le rendez-vous | le logo remonte ; « Rendez-vous à 15h pour la démonstration interne. » | « Rendez-vous à quinze heures pour la démonstration interne. » |

## Conformité au brand book (et écarts à la demande)

- **Nom affiché : MELIM, sans « AI ».** Le storyboard demandait « MELIM AI », mais le brand book
  (ch. 05, statut validé, et liste des interdits ch. 08) impose « MELIM » seul.
- **Couleurs.** Seules les couleurs officielles sont utilisées : bleu MELIM `#035BF7`, nuit
  `#0A1A33`, noir `#0B1220`, blanc et les neutres. Le cyan demandé n'est pas dans la palette ; la
  « lumière numérique » est rendue en bleu et blanc, sans néon ni dégradé appuyé (ch. 09 et 11).
- **Logo.** Fichier officiel `assets/src/logo-melim-couleur.png`, non redessiné. `tools/split_logo.py`
  sépare le symbole et le mot MELIM à partir des pixels du fichier (écart de recomposition 0,57/255).
  Il est montré sur fond blanc, comme la version « couleur sur fond clair » du brand book.
  Couleurs mesurées dans ce fichier : bleu `#004AF8`, nuit `#011838`, légèrement différentes des
  valeurs du brand book (`#035BF7`, `#0A1A33`) ; le logo n'est pas recoloré.
- **Typographie.** Sora pour les titres, Inter pour le texte (SIL OFL, fichiers dans `assets/fonts`).
- **À valider.** « L'intelligence artificielle, autrement. » vient du storyboard. Le brand book
  indique qu'aucun slogan officiel n'est arrêté (ch. 02) : cette phrase ne doit pas devenir un
  slogan sans validation.
- Les captures d'écran sont celles fournies : elles montrent le prénom « Frédéric » et un titre de
  conversation (« Comment gérer deux jours »).
- Non utilisés : le visuel « Coming soon », le mockup téléphone et l'icône seule (le brand book
  réserve le symbole seul aux petits formats).

## Voix et son

- Voix : Kokoro (local, `hyperframes tts`), voix française `ff_siwis`, vitesse 1,1. Aucun service
  de voix authentifié n'était disponible. « IA » est écrit « I.A. » pour être prononcé « i-a » et
  « 15h » est lu « quinze heures ».
- Chaîne voix (bus HyperFrames) : passe-haut, compresseur, clarté, gain, limiteur ; musique
  abaissée sous la voix par automation.
- Musique et effets (whooshs, ticks, montée lumineuse, impact) générés par `tools/synth_audio.py`,
  sans banque de sons tierce.

## Commandes (depuis ce dossier)

```bash
python3 tools/split_logo.py    # calques du logo
python3 tools/synth_audio.py   # musique + effets
bash -c 'i=1; while IFS= read -r l; do npx hyperframes@0.8.150 tts "$l" --voice ff_siwis --speed 1.1 -o assets/vo/vo$i.wav </dev/null; i=$((i+1)); done < assets/vo/script.txt'
npx hyperframes@0.8.150 check
npx hyperframes@0.8.150 render --quality high --fps 30 --format mp4 --output renders/melim-teaser-10s-9x16.mp4
```
