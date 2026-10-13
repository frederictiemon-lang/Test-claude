# GBÔ — logo animé (5 s, 9:16)

Animation du logo officiel GBÔ, réalisée avec HyperFrames (v0.8.150) : composition, animation,
mixage et export.

## Livrables

| Fichier | Contenu |
| --- | --- |
| `renders/gbo-logo-anime-5s-9x16.mp4` | H.264 High, 1080 × 1920, 30 i/s, 150 images, 5,0 s, AAC 48 kHz stéréo, −15,4 LUFS |
| `renders/contact-sheet-mp4.png` | 12 images extraites du MP4 final (0,2 s → 4,95 s) |

## Fidélité au logo

- Source : `assets/logo/gbo-logo.png` (PNG transparent fourni, 1461 × 527, couleur #C6F202).
- Le logo n'est **pas redessiné**. `tools/split_logo.py` découpe le PNG en 12 calques
  (G, B, anneau du Ô, accent, haltère, 7 mots de la signature) par composantes connexes.
  Chaque calque est une copie exacte des pixels d'origine, et le script vérifie qu'ensemble
  ils reconstituent le PNG pixel pour pixel.
- Image finale : logo complet, proportions d'origine (mise à l'échelle uniforme), centré,
  sur fond noir. Comparée au PNG source redimensionné à la même taille, l'écart moyen est
  de 4,2/255. Il s'explique par le rééchantillonnage et la compression H.264.
- Le halo flou et le reflet sont des effets temporaires posés autour ou par-dessus le
  logo : le halo s'éteint à 3,07 s et le reflet se termine à 3,6 s. Une lueur vert citron
  très faible (30 %) reste en fond, derrière le logo. Toutes les pièces sont en place et
  immobiles à partir de 4,1 s, et l'image est totalement fixe de 4,6 s à 5,0 s.
- À noter dans le fichier fourni : l'accent circonflexe touche le bord haut de l'image et
  le Ô ainsi que le « e » de « vie » touchent le bord droit. Le logo est animé tel quel.

## Déroulé

| Temps | Action | Son |
| --- | --- | --- |
| 0,00 s | deux traits vert citron traversent le noir | whoosh |
| 0,18 s | le G arrive de la gauche, le B de la droite | whooshs |
| 0,45 s | l'anneau du Ô tourne et se met en place | pop |
| 0,80 s | l'haltère pivote et se verrouille dans le Ô | clank métallique |
| 0,50 → 1,45 s | montée de tension | riser |
| 1,15 → 1,47 s | l'accent tombe du haut et s'écrase, puis rebondit | sifflement + impact |
| 1,47 s | impact : secousse de 3 images, onde de choc, halo | impact grave |
| 1,85 s | la signature apparaît mot par mot | — |
| 2,75 s | un reflet lumineux traverse le logo | scintillement |
| 3,45 s | l'haltère fait un petit « lift » | — |
| 2,0 → 4,6 s | lente avancée caméra, puis image fixe jusqu'à 5,0 s | nappe grave qui s'éteint |

Sons synthétisés par `tools/synth_sfx.py` (aucune banque de sons tierce).
Techniques reprises des blocs `logo-outro` et `shimmer-sweep` du registre HyperFrames.

## Commandes (depuis ce dossier)

```bash
python3 tools/split_logo.py   # recrée les calques depuis assets/logo/gbo-logo.png
python3 tools/synth_sfx.py    # recrée les effets sonores
npx hyperframes check
npx hyperframes preview --background
npx hyperframes render --quality high --fps 30 --format mp4 --output renders/gbo-logo-anime-5s-9x16.mp4
```

Version avec fond transparent (à poser sur une autre vidéo) : retirer les fonds noirs de
`html, body` et `#root` dans `index.html`, puis exporter avec `--format mov` ou `--format webm`.
Ce n'est pas encore fait ici.
