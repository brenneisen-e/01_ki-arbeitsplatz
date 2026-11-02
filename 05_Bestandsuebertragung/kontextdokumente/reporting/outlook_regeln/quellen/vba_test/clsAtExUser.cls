Option Explicit
' Attrappe ExchangeUser / ExchangeDistributionList (nur Testvariante)
Public Name As String
Public PrimarySmtpAddress As String

Public Sub Init(ByVal anzeige As String, ByVal smtp As String)
    Name = anzeige
    PrimarySmtpAddress = smtp
End Sub
