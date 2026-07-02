# -*- coding: utf-8 -*-
"""Befüllt das SIPOC-SmartArt im FRQ (data1.xml + drawing1.xml). Läuft NACH fill_frq.py."""
import zipfile, shutil
REPL = {
 'hier kommt die Rolle rein, die den Roboter antriggert':
   'Celonis-Strukturierung – legt den strukturierten BÜ-Vorgang (KI-Deckblatt) im Übergabepunkt ab',
 'wenn mehrere':
   'Ursprüngliche Quelle: Makler (BÜ-Anfrage per E-Mail)',
 'aus welchem Eingangskanal nutzt der Roboter Daten (z.Be. Excel)':
   'Übergabepunkt: SharePoint-Liste bzw. ERGO Datapool (strukturierter Vorgang / KI-Deckblatt)',
 'z.B. Postkorbvorgang mit Datenpool':
   'Host-System-Daten (Makler, Kunde, Vertrag) aus den Quellsystemen',
 'hier kommen die groben Prozessschritte hin':
   'Strukturierten Vorgang abholen (SharePoint / ERGO Datapool)',
 'noch ein Schritt auch gerne mit Systemangabe':
   'Prüfschritte 6–16 gegen Hostsysteme (Scout, IS100, OB726/510/735/729, KV050, VA210/250, PDB, SV001, DiOrg/SAP)',
 'und noch einer':
   'Digitales Prüfdeckblatt + Kriterien-Matrix (hart/weich/optional), dann Postkorb mit Roboter-Notiz (Entwurf)',
 'welche Artekfakte erzeugt die Arbeit des Roboters':
   'Digitales Prüfdeckblatt je Vorgang; Roboter-Notiz (Entwurf) im Postkorb; bei harten Kriterien automatische Absage-Mail an den Makler',
 'hier kommt der Empfänger der Ergebnisse hin':
   'Sachbearbeitung HS / KBI / ODPB – bestätigt oder ändert die Roboter-Notiz',
 'falls es mehrere Rollen gibt':
   'Nachgelagert: Ausführung (72h-/BÜ-Bot, BeMaS); Makler (Information bzw. Absage)',
}
src='1. FRQ-2026_BUE-Pruefbot.docx'; tmp='_frq_tmp.docx'
TARGET={'word/diagrams/data1.xml','word/diagrams/drawing1.xml'}
zin=zipfile.ZipFile(src,'r'); zout=zipfile.ZipFile(tmp,'w',zipfile.ZIP_DEFLATED)
total=0
for item in zin.infolist():
    data=zin.read(item.filename)
    if item.filename in TARGET:
        xml=data.decode('utf-8')
        for old,new in REPL.items():
            total+=xml.count(old); xml=xml.replace(old,new)
        data=xml.encode('utf-8')
    zout.writestr(item, data)
zin.close(); zout.close(); shutil.move(tmp, src)
print('SIPOC-Ersetzungen gesamt (beide XML):', total)
