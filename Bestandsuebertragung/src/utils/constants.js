export const STATUS_ICONS = {
  'unvollstaendig': '◇',
  'zu-validieren': '◐',
  'export-bereit': '●',
  'abgeschlossen': '✓',
  'abgelehnt': '✕',
  'wiedervorlage': '⟳'
}

export const STATUS_LABELS = {
  'unvollstaendig': 'Unvollständig',
  'zu-validieren': 'Zu Validieren',
  'export-bereit': 'Export-Bereit',
  'abgeschlossen': 'Abgeschlossen',
  'abgelehnt': 'Abgelehnt',
  'wiedervorlage': 'Wiedervorlage'
}

export const STATUS_ORDER = ['unvollstaendig', 'zu-validieren', 'export-bereit', 'abgeschlossen', 'abgelehnt', 'wiedervorlage']

export const WORKFLOW_STEPS = [
  { key: 'mailReceived', label: 'Mail erhalten', icon: '◉' },
  { key: 'mailUploaded', label: 'Importiert', icon: '↑' },
  { key: 'kiRecognized', label: 'Von KI erkannt', icon: '◈' },
  { key: 'pvValidated', label: 'Von PV validiert', icon: '✓' },
  { key: 'exported', label: 'Exportiert', icon: '↗' }
]

export const SPARTEN = ['KFZ', 'Leben', 'Kranken', 'Haftpflicht', 'Hausrat', 'Rechtsschutz', 'Unfall', 'BU', 'Wohngebäude', 'Rente']
