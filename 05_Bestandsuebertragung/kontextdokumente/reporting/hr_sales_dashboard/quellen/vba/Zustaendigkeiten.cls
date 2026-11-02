Option Explicit

' Klick in ein Personenfeld oder auf ja/nein: Zuordnung bzw. Pflicht umschalten (modZuordnung, nur im Modus Bearbeiten)
Private Sub Worksheet_SelectionChange(ByVal Target As Range)
    On Error Resume Next
    modZuordnung.Klick Target
    Application.EnableEvents = True
End Sub

' Schutz fuer Makros freigeben (UserInterfaceOnly gilt nur je Sitzung) und Knoepfe zum Modus passend zeigen
Private Sub Worksheet_Activate()
    On Error Resume Next
    modZuordnung.Schuetzen
    modZuordnung.ModusAnzeigen
End Sub
