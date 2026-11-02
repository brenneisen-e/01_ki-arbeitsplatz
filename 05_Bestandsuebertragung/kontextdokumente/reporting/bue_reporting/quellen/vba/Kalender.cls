Option Explicit
' Blattmodul Kalender: beim ersten Aufruf je Sitzung zum heutigen Tag springen. Danach bleibt die Position, wie der
' Nutzer sie verlaesst ("Zu heute" springt jederzeit zurueck).
Private gesprungen As Boolean

Private Sub Worksheet_Activate()
    If gesprungen Then Exit Sub
    On Error Resume Next
    modCockpit.KalenderZuHeute
    gesprungen = True
End Sub
