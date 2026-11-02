Option Explicit
' Attrappe PropertyAccessor eines AddressEntry: PR_SMTP_ADDRESS (0x39FE001F/001E), sonst Fehler wie Outlook
' ("Eigenschaft unbekannt oder nicht gefunden"). (nur Testvariante)
Private mSmtp As String

Public Sub Init(ByVal smtp As String)
    mSmtp = smtp
End Sub

Public Function GetProperty(ByVal schema As String) As Variant
    Dim s As String
    s = LCase(schema)
    If mSmtp = "" Or (Right(s, 10) <> "0x39fe001f" And Right(s, 10) <> "0x39fe001e") Then
        Err.Raise 5270, "Attrappe", "Eigenschaft unbekannt oder nicht gefunden: " & schema
    End If
    GetProperty = mSmtp
End Function
