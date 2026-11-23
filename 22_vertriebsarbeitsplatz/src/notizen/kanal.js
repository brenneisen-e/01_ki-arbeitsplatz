// Kopplung zwischen Arbeitsplatz und Notizfenster (speakernotes.html), beide
// unter derselben Origin:
//
//  · Stand: Der Arbeitsplatz schreibt Modus, Ansicht, Reiter und offene Stellen
//    nach localStorage (kopplung.jsx); das storage-Ereignis kommt im
//    Notizfenster an, auch wenn es per Adresse geöffnet wurde.
//  · Kanal: Das Notizfenster meldet sich per Herzschlag („offen“, mit der
//    Angabe, ob das Mausrad des Arbeitsplatzes die Notizen scrollen soll) und
//    beim Schließen („zu“); der Arbeitsplatz schickt Rad-Bewegungen als „scroll“.
//
// Eigene Namen, damit sich das Strukturbild von Banking Horizon (Kanal
// „bh-notizen“) und der Arbeitsplatz nicht gegenseitig für offen halten.
export const NOTIZEN_KANAL = 'kia-notizen';
export const STAND_KEY = 'kia-notizen-stand';
export const HERZSCHLAG_MS = 2000;
export const FENSTER_NAME = 'kia-speakernotes';
