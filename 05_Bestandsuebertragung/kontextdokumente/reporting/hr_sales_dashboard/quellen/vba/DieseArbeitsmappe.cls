Option Explicit

Private Sub Workbook_Open()
    On Error Resume Next
    modKarte.KartenEntfernen
    modStart.BerichtstagAufraeumen          ' Berichtstag von Hand = automatischer -> wieder automatisch
    modKommentar.AlleZeichnen
    modPPT.SpartenStapeln                   ' BUE-Kacheln: groesste Sparte unten
    modKW.TextBeschriftungen                ' Beschriftungen aus Zellen (Erledigungsquote) als Text neu schreiben
    modZuordnung.Sperren                    ' Zuordnung startet gesperrt
    ThisWorkbook.Worksheets("Start").Activate
End Sub

Private Sub Workbook_SheetActivate(ByVal Sh As Object)
    On Error Resume Next
    If Sh.Name = "PPT_2" Or Sh.Name = "PPT_3" Then modKW.TextBeschriftungen
End Sub
