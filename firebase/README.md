# Online saving for the website (Firebase)

Until this is set up, the website saves in each browser only, and the party sheet sees a rider's sheet live only
when both are open in the same browser. With it, every sheet saves online, and the party sheet sees all of them live
from any device: HP, AC, saves, conditions, and turn and initiative pop-ups.

It's free (Firebase's Spark plan) and takes about 10 minutes.

1. Go to https://console.firebase.google.com and **Add project** (for example `dragon-riders`). Google Analytics isn't needed.
2. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable.**
3. **Build → Firestore Database → Create database.** Pick a nearby location, start in **production mode**.
4. **Firestore → Rules:** paste `firestore.rules` from this folder, replace `PLAYER-PASSCODE` and `DM-PASSWORD`
   with your own (the passcode goes to the players; the DM password stays with you), and **Publish**.
   Don't put the real passcodes in this repo; it's public.
5. **Project settings (gear) → Your apps → Web (`</>`)**, register an app (no hosting needed), and copy the
   `firebaseConfig` values into `sheets/js/firebase-config.js`.
6. **Authentication → Settings → Authorized domains:** add `arcanistxander.github.io`.
7. Rebuild and publish: `bash build-website.sh`, then commit and push.

Each device asks for the campaign passcode once. The party sheet also asks for the DM password once per device.

When a new character sheet goes up, add it to `SHEET_PAGES` near the top of the script in `sheets/party.html`
(rider id: page) so the party sheet reads it live.
