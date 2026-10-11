#!/usr/bin/env bash
# Builds a standalone copy of the character sheets for any normal website.
#
# The character pages in sheets/ are written for claude.ai, which adds the
# <!doctype>, <head> and <body> wrapper itself. This script adds that wrapper,
# adds the website-only scripts (js/cloud.js for online saving through Firebase,
# js/turn.js for turns from the DM's initiative tracker), copies the scripts
# and art, and writes an index page listing every character.
# Pages that are already full documents (party.html) are copied as they are.
#
# Usage (from the campaign folder, in Git Bash):   bash build-website.sh
# Then commit and push; GitHub Pages serves the docs/ folder.
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)/sheets"
OUT="$(cd "$(dirname "$0")" && pwd)/docs"

rm -rf "$OUT"
mkdir -p "$OUT"
cp "$SRC/engine.js" "$OUT/"
cp -r "$SRC/data" "$SRC/art" "$SRC/js" "$OUT/"

RESET=':root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}'

cards=""
party=""
for page in "$SRC"/*.html; do
  name="$(basename "$page")"
  id="${name%.html}"
  title="$(sed -n 's:.*<title>\(.*\)</title>.*:\1:p' "$page" | head -n 1)"
  if head -c 64 "$page" | grep -qi '<!doctype'; then
    cp "$page" "$OUT/$name"
    party="$party<li><a class=\"party\" href=\"$name\">Party sheet &amp; initiative<small>$title · for the DM</small></a></li>"
    echo "Copied $name ($title)"
    continue
  fi
  first="${title%% *}"
  {
    echo '<!doctype html>'
    echo '<html lang="en">'
    echo '<head>'
    echo '<meta charset="utf-8">'
    echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
    echo "<style>$RESET</style>"
    # Everything before the app container (title, fonts, styles) belongs in <head>.
    sed '/<div id="app">/,$d' "$page"
    echo '</head>'
    echo '<body>'
    # Online saving and turn pop-ups load before the sheet's own scripts.
    sed -n '/<div id="app">/,$p' "$page" | awk -v id="$id" -v nm="$first" '
      !done && /<script src="data\// {
        print "<script src=\"js/firebase-config.js\"></script>"
        print "<script src=\"js/cloud.js\"></script>"
        print "<script src=\"js/turn.js\" data-hero=\"" id "\" data-name=\"" nm "\"></script>"
        done = 1
      }
      { print }'
    echo '</body>'
    echo '</html>'
  } > "$OUT/$name"
  cards="$cards<li><a href=\"$name\">$title</a></li>"
  echo "Built $name ($title)"
done

cat > "$OUT/index.html" <<HTML
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dragon Riders</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Marcellus+SC&family=Alegreya+Sans:wght@400;700&display=swap">
<style>
:root { --bg: #e7eaee; --panel: #f9fafb; --ink: #1a1f29; --muted: #5a6371; --line: #cdd3db; --bronze: #8a5120; }
@media (prefers-color-scheme: dark) { :root { --bg: #0e1116; --panel: #161b22; --ink: #e6e9ee; --muted: #97a1b0; --line: #2b333e; --bronze: #d9965a; color-scheme: dark; } }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: "Alegreya Sans", "Segoe UI", system-ui, sans-serif; font-size: 17px; }
main { max-width: 720px; margin: 0 auto; padding: 48px 16px; }
h1 { font-family: "Marcellus SC", Georgia, serif; font-weight: 400; font-size: 2.4rem; margin: 0 0 4px; }
p { color: var(--muted); margin: 0 0 28px; }
ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
a { display: block; padding: 16px 18px; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; color: var(--ink); text-decoration: none; font-family: "Marcellus SC", Georgia, serif; font-size: 1.3rem; }
a:hover, a:focus-visible { border-color: var(--bronze); color: var(--bronze); outline: none; }
a.party { border-left: 5px solid var(--bronze); }
a small { display: block; font-family: "Alegreya Sans", "Segoe UI", system-ui, sans-serif; font-size: .9rem; color: var(--muted); margin-top: 2px; }
</style>
</head>
<body>
<main>
<h1>Dragon Riders</h1>
<p>Character sheets for the riders and their bonded dragons.</p>
<ul>$party$cards</ul>
</main>
</body>
</html>
HTML

echo "Done. Built into $OUT. Commit and push to publish."
