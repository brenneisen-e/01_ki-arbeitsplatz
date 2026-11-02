// AUTO-GENERIERT von kaesten_export.py — nicht von Hand pflegen.
//
// Lage des Bildschirms im 1920x1080-Szenenbild jeder Station, als Anteile
// (x0, y0, x1, y1). Die Buehne zoomt nach der Ankunft auf diesen Bereich
// plus Rand; bei `null` gibt es kein Zoomziel und die Szene bleibt ganz.
// s1-Familie stammt aus der Ausschnittsrechnung; s4-s7 sind AM STANDBILD
// NACHGEMESSEN (Gitterlinien), nachdem die Quellraeume einem Container-
// Rollback zum Opfer fielen und die gerechneten Werte nicht mehr zu den
// committeten Stills passten — das Overlay hing im Teamraum vor den Menschen.
export const SCHIRM_KAESTEN: Record<string, [number, number, number, number] | null> = {
  home: null,
  s0: null,
  s1: [0.3031, 0.1731, 0.8583, 0.7676],
  s2: [0.3031, 0.1731, 0.8583, 0.7676],
  s2b: [0.515, 0.065, 0.985, 0.87],
  s3: [0.3031, 0.1731, 0.8583, 0.7676],
  s4: [0.2974, 0.0037, 0.7776, 0.2769],
  s5: [0.303, 0.175, 0.857, 0.765],
  s6: [0.303, 0.175, 0.857, 0.765],
  s7: [0.316, 0.18, 0.826, 0.768],
  s8: [0.3031, 0.1731, 0.8583, 0.7676],
  s9: [0.3031, 0.1731, 0.8583, 0.7676],
  s10: null,
}
