#!/usr/bin/env bash
# Builds a standalone copy of the character sheets for any normal website.
#
# The pages in sheets/ are written for claude.ai, which adds the <!doctype>,
# <head> and <body> wrapper itself. This script adds that wrapper, copies the
# scripts and art, and writes an index page listing every character.
#
# Usage (from the campaign folder, in Git Bash):   bash build-website.sh
# Then commit and push; GitHub Pages serves the docs/ folder.
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)/sheets"
OUT="$(cd "$(dirname "$0")" && pwd)/docs"

rm -rf "$OUT"
mkdir -p "$OUT"
cp "$SRC/engine.js" "$OUT/"
cp -r "$SRC/data" "$SRC/art" "$OUT/"

RESET=':root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}'

cards=""
for page in "$SRC"/*.html; do
  name="$(basename "$page")"
  title="$(sed -n 's:.*<title>\(.*\)</title>.*:\1:p' "$page" | head -n 1)"
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
    sed -n '/<div id="app">/,$p' "$page"
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
</style>
</head>
<body>
<main>
<h1>Dragon Riders</h1>
<p>Character sheets for the riders and their bonded dragons.</p>
<ul>$cards</ul>
</main>
</body>
</html>
HTML

echo "Done. Built into $OUT. Commit and push to publish."
