# Schriften

## Uniform (Miller Type Foundry)
Hausschrift der Kreditanalyse wie im Vertriebsarbeitsplatz, drei Schnitte:
Light 300, Regular 400, Medium 500. Die Dateien sind eine Kopie aus
`22_vertriebsarbeitsplatz/src/schrift/` (dort aus `21_vertragsumstellung/src/schrift/`,
Ursprung `03_banking-horizon/public/fonts/`). Regular ist die Grundschrift;
alles ab `font-medium` sowie `strong` liegt auf Medium, Light nur ausdrücklich
über `font-light`. Ein schwereres Gewicht gibt es nicht — Medium deckt im
Stylesheet 500 bis 900 ab, und `font-synthesis-weight: none` verhindert ein
vom Browser errechnetes Fett.

## Uniform Tab
Uniform hat proportionale Ziffern. `uniformtab-*.woff2` enthält nur Ziffern
und Zahlenzeichen auf einer gemeinsamen Dickte; Buchstaben fallen auf Uniform
zurück. Die Klasse `font-mono` nutzt sie für Kennzahlen, Beträge und
Tabellenspalten.
