# Dragon Riders Sheets

Character sheets for the Dragon Riders D&D 5e (2014) campaign: each rider and their bonded dragon.

Live site: https://arcanistxander.github.io/dragon-riders-sheets/

- `sheets/` is the source (also published to claude.ai).
- `docs/` is the website GitHub Pages serves. Rebuild it after any change with `bash build-website.sh`, then commit and push.
- Dragon growth rules live in `sheets/data/dragons.js` (beta).
- `sheets/party.html` is the DM's party sheet with the initiative tracker. Riders with a sheet on the site show live there (or switch them to Paper).
- Online saving and the live party link on the website use Firebase: see `firebase/README.md`.
