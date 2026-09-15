#!/usr/bin/env python3
"""Bundel de demo tot één zelfstandig HTML-bestand.

Handig om de demo te delen als losse bijlage of te publiceren op een plek
waar je geen losse assets kwijt kunt.

    python3 tools/bundel.py            # -> clover-demo.html
    python3 tools/bundel.py uit.html
"""
import pathlib
import re
import sys

root = pathlib.Path(__file__).resolve().parent.parent
doel = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'clover-demo.html'

html = (root / 'index.html').read_text()
body = html.split('<body>', 1)[1].split('</body>', 1)[0]
body = re.sub(r'<script src="[^"]+"></script>\s*', '', body)
fonts = re.search(r'<link href="https://fonts\.googleapis[^>]+>', html).group(0)

css = '\n'.join((root / 'assets/css' / f).read_text() for f in ('tokens.css', 'style.css'))
js = '\n'.join((root / 'assets/js' / f).read_text()
               for f in ('data.js', 'icons.js', 'views.js', 'app.js'))

doel.write_text(f'''<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Clover Uitzendbureau — werk dat bij je past</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{fonts}
<style>
{css}
</style>
</head>
<body>
{body}
<script>
{js}
</script>
</body>
</html>
''')
print(f'{doel} geschreven ({doel.stat().st_size / 1024:.0f} kB)')
