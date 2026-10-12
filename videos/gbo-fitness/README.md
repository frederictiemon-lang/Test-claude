# GBÔ FITNESS — spot de lancement (30 s, 9:16)

Vidéo publicitaire réalisée entièrement avec HyperFrames (v0.8.150) : construction, animation,
mixage et export. Seule la voix off vient d'un outil de synthèse vocale externe à la
composition (Kokoro, exécuté en local par la commande `hyperframes tts`).

## Livrables

| Fichier | Contenu |
| --- | --- |
| `renders/gbo-fitness-30s-9x16.mp4` | Vidéo finale : H.264 High, 1080 × 1920, 30 i/s, 900 images, 30,0 s, AAC 48 kHz stéréo |
| `renders/voix-off-complete.wav` | Les 6 répliques de voix off mises bout à bout (26,5 s de parole, sans musique) |
| `renders/contact-sheet-mp4.png` | 18 images extraites du MP4 final, pour relecture rapide |
| `assets/vo/vo1.wav` … `vo6.wav` | Voix off, une réplique par scène, telles que placées dans le montage |

## Lancer, vérifier, exporter

Depuis ce dossier (`videos/gbo-fitness/`) :

```bash
npx hyperframes check                # lint + runtime + mise en page + mouvement + contraste
npx hyperframes preview --background # Studio (aperçu éditable dans le navigateur)
npx hyperframes render --quality high --fps 30 --format mp4 --output renders/gbo-fitness-30s-9x16.mp4
```

Regénérer les médias sources (facultatif) :

```bash
python3 tools/synth_audio.py   # musique + effets sonores (numpy, scipy, soundfile)
bash tools/make_vo.sh          # voix off (kokoro-onnx, soundfile, espeak-ng)
```

## Structure

```
index.html                 hôte : 7 sous-compositions + pistes audio + bus voix
styles/brand.css           polices, couleurs, classes partagées (masques de texte, colonnes sûres)
compositions/bg.html       fond noir + trame diagonale vert citron (0–30 s)
compositions/s1-hook.html  scène 1 — accroche              0–3 s
compositions/s2-brand.html scène 2 — révélation de la marque 3–7,5 s
compositions/s3-home.html  scène 3 — coaching à domicile    7,5–11,55 s
compositions/s4-gym.html   scène 4 — coaching en salle      11,3–14,05 s
compositions/s5-goals.html scène 5 — objectifs              14–18 s
compositions/s6-cta.html   scène 6 — réservation + logo     18–30 s
tools/                     scripts de génération audio
assets/                    logo, polices, voix, musique, sfx, GSAP 3.14.2 en local
                           (le CDN n'était pas joignable depuis le navigateur de rendu)
```

Dans chaque scène, les temps d'animation sont écrits en temps du spot (secondes depuis 0:00)
via `at(t)`, pour rester alignés avec la voix off.

## Voix off

- Moteur : Kokoro-82M en local, voix `ff_siwis` (français, féminine), la seule voix
  française proposée par `hyperframes tts --list`.
- Aucun service authentifié n'était disponible : pas de session HeyGen, aucune clé Google
  Cloud, ElevenLabs ou autre. FLORA n'a pas été utilisé, car aucun accès n'était configuré.
- Durées mesurées puis placement : vo1 0,35 s · vo2 3,15 s · vo3 7,65 s · vo4 11,6 s ·
  vo5 14,1 s · vo6 18,2 s (fin de la parole ≈ 29,1 s).
- Le script d'origine durait 29,1 s de parole, sans aucune respiration possible : les
  phrases secondaires des scènes 3 et 4 ont donc été raccourcies (texte exact dans
  `assets/vo/script.txt`). « Gbô » est écrit ainsi pour guider la prononciation.
  Les deux numéros, « Réservez votre séance » et « Partout à Abidjan » sont conservés intégralement.
- Traitement dans HyperFrames (bus `hf-audio-group`) : passe-haut 90 Hz, compresseur,
  léger relief à 3 kHz, gain, limiteur true-peak −1,5 dBTP. La musique est abaissée
  sous la voix par une automation de volume.

## Écarts par rapport au brief, à connaître

1. **Pas d'images de sportifs.** Le projet ne contient aucune photo ni vidéo de GBÔ, et
   aucune n'a été inventée. Les scènes reposent sur la typographie et des éléments
   graphiques (maison et pouls pour le domicile, barre de musculation pour la salle).
   Ajouter de vraies images exigerait des photos ou vidéos autorisées de sportifs
   africains (domicile, salle, coaching), à placer dans `assets/` puis à intégrer
   dans `compositions/s1-hook.html`, `s3-home.html`, `s4-gym.html` et `s5-goals.html`.
2. **Police BROAVEN absente** du projet et du système : remplacée par **Archivo**
   (SIL OFL, graisse 900, largeur étendue). **Manrope** (SIL OFL) est utilisée pour les
   textes secondaires. Pour passer à BROAVEN, remplacer le fichier et le nom dans
   `styles/brand.css` (`@font-face "GBO Display"`).
3. **Musique synthétisée.** Aucune piste sous licence n'était disponible : le fond musical
   (≈ 120 BPM, kick, clap, shaker, basse façon « log drum », nappes) et les effets
   (impact, whooshs, ticks) sont générés par code (`tools/synth_audio.py`), donc libres de
   droits. Ils n'égalent pas une production afro-urbaine professionnelle : pour la remplacer,
   changer `src` de `<audio id="music">` dans `index.html`.
4. **Logo.** C'est l'image fournie (`1280 × 462`, fond noir), utilisée sans recadrage ni
   recoloration. Dans le fichier source, le « e » final de la signature touche déjà le bord droit.
   Un fichier vectoriel ou PNG détouré améliorerait la netteté.
5. **Numéros** affichés exactement comme fournis : `0748414803` et `01 03161415`,
   apparaissent ensemble à 20,25 s, sont pleinement visibles dès 20,7 s et le restent
   jusqu'à 30 s (≈ 9,3 s). Seul un soulignement vert passe sous le numéro en cours de lecture,
   sans jamais le recouvrir.
