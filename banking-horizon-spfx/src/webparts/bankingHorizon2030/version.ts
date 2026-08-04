// Sichtbare App-Version (Badge im iframe unten rechts). Muss bei jedem
// Release zusammen mit package.json ("x.y.0") und
// config/package-solution.json (solution.version und features[*].version,
// vierstellig "x.y.0.0") erhöht werden — mindestens die MINOR-Stelle,
// sonst liefert SharePoint teils das alte Bundle weiter aus.
export const APP_VERSION: string = '1.2.0';
