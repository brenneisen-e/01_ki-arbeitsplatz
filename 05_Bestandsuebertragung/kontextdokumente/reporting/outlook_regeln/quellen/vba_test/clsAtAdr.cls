Option Explicit
' Attrappe AddressEntry (nur Testvariante). Art (aus dem Verzeichnis bzw. je Empfaenger):
'   ""    Exchange-Benutzer/-Verteiler: GetExchangeUser bzw. GetExchangeDistributionList, PropertyAccessor
'   "pa"  ohne ExchangeUser/-DistributionList (z. B. dynamischer Verteiler), SMTP nur ueber PropertyAccessor
'   "dn"  nur Exchange-DN (Address), PropertyAccessor ohne SMTP
'   "tot" wie "dn", laesst sich aber ueber nichts aufloesen (z. B. Systemabsender)
Public Name As String
Public Address As String
Private mSmtp As String
Private mListe As Boolean
Private mArt As String

Public Sub Init(ByVal anzeige As String, ByVal dn As String, ByVal smtp As String, ByVal liste As Boolean, _
                ByVal art As String)
    Name = anzeige
    Address = dn
    mSmtp = smtp
    mListe = liste
    mArt = art
End Sub

Public Function GetExchangeUser() As Object
    Dim u As Object
    If Not mListe And mArt = "" Then
        Set u = New clsAtExUser
        u.Init Name, mSmtp
        Set GetExchangeUser = u
    End If
End Function

Public Function GetExchangeDistributionList() As Object
    Dim u As Object
    If mListe And mArt = "" Then
        Set u = New clsAtExUser
        u.Init Name, mSmtp
        Set GetExchangeDistributionList = u
    End If
End Function

Public Property Get PropertyAccessor() As Object
    Dim p As Object
    Set p = New clsAtPa
    If mArt = "" Or mArt = "pa" Then
        p.Init mSmtp
    Else
        p.Init ""
    End If
    Set PropertyAccessor = p
End Property

Public Property Get AddressEntryUserType() As Long
    Select Case mArt
        Case "tot": AddressEntryUserType = 40
        Case Else: AddressEntryUserType = IIf(mListe, 1, 0)
    End Select
End Property
