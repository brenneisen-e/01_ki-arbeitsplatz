# Schriften

## Uniform (Miller Type Foundry)
Hausschrift des Werkzeugs, drei Schnitte: Light 300, Regular 400, Medium 500.
Die Dateien stammen aus dem bereits lizenzierten Bestand des Repositories
(`03_banking-horizon/public/fonts/`). Ein schwereres Gewicht als Medium
gibt es nicht — im Stylesheet ist 500 deshalb das schwerste Gewicht, damit
der Browser kein Fett errechnet.

## Uniform Tab
Uniform hat proportionale Ziffern; die Eins ist rund 30 % schmaler als die
Null. In Geldspalten wandert das Komma dadurch von Zeile zu Zeile, und
genau davon lebt dieses Werkzeug nicht.

`uniformtab-*.woff2` ist aus denselben Originalen erzeugt: alle zehn Ziffern
bekommen dieselbe Dickte (die breiteste), die Zeichnung wird um die halbe
Differenz nach rechts verschoben und bleibt damit optisch mittig. Danach ist
die Datei auf Ziffern und Zahlenzeichen verkleinert — rund 4 kB je Schnitt.
Buchstaben fehlen absichtlich: sie fallen auf Uniform zurück, sodass
gemischte Angaben wie „65,7 Mio. EUR“ ihre normale Laufweite behalten.

Erzeugt mit fontTools:

    from fontTools.ttLib import TTFont
    from fontTools.pens.recordingPen import RecordingPen
    from fontTools.pens.transformPen import TransformPen
    from fontTools.pens.ttGlyphPen import TTGlyphPen
    from fontTools.misc.transform import Transform
    # je Ziffernglyph: Vorschub auf max setzen, Kontur um (max-alt)/2 verschieben

Wird Uniform ausgetauscht, muss `uniformtab-*` neu erzeugt werden.
