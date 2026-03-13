// =============================================================================
// Contract Export Utilities – Word (.docx) and PDF generation
// =============================================================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  PageBreak,
  BorderStyle,
  TabStopType,
  TabStopPosition,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
} from 'docx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

// =============================================================================
// Word (.docx) Export
// =============================================================================

/**
 * Generate and download a Word document from the contract text.
 * @param {string} contractText - The full contract text (plain text with line breaks)
 * @param {object} company - Company object for metadata
 * @param {string} contractNr - Contract number string
 */
export async function exportContractAsDocx(contractText, company, contractNr) {
  const lines = contractText.split('\n');
  const children = [];

  // Title page
  children.push(
    new Paragraph({ spacing: { before: 3000 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'KREDITVERTRAG',
          bold: true,
          size: 48,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: '(Standardisierter Kreditvertrag nach vdp/LMA-Standard)',
          size: 20,
          color: '666666',
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `Nr. ${contractNr}`,
          size: 24,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `${company.firma}`,
          bold: true,
          size: 28,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Erstellt am ${new Date().toLocaleDateString('de-DE')}`,
          size: 20,
          color: '999999',
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // Parse contract text into formatted paragraphs
  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines but add spacing
    if (!trimmed) {
      children.push(new Paragraph({ spacing: { after: 100 } }));
      continue;
    }

    // Detect section headings (§ X TITLE or numbered sections)
    const sectionMatch = trimmed.match(/^§\s*\d+\s+[A-ZÄÖÜ]/);
    const subSectionMatch = trimmed.match(/^\d+\.\d+\s+/);
    const anlageMatch = trimmed.match(/^ANLAGE\s+\d+:/i);
    const mainHeading = trimmed.match(/^KREDITVERTRAG$/i) || trimmed.match(/^Inhaltsverzeichnis$/i);

    if (mainHeading) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
              size: 32,
              font: 'Arial',
            }),
          ],
        })
      );
    } else if (sectionMatch || anlageMatch) {
      children.push(
        new Paragraph({
          spacing: { before: 360, after: 120 },
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
              size: 24,
              font: 'Arial',
            }),
          ],
        })
      );
    } else if (subSectionMatch) {
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 80 },
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
              size: 22,
              font: 'Arial',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('Zwischen') || trimmed.startsWith('und') || trimmed.startsWith('–')) {
      // Contract party lines
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: trimmed,
              size: 22,
              font: 'Arial',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('_')) {
      // Signature lines
      children.push(
        new Paragraph({
          spacing: { before: 400, after: 40 },
          children: [
            new TextRun({
              text: '________________________________________',
              size: 20,
              font: 'Arial',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('a)') || trimmed.startsWith('b)') || trimmed.startsWith('c)') || trimmed.startsWith('d)') || trimmed.startsWith('e)') || trimmed.startsWith('f)') || trimmed.startsWith('g)') || trimmed.startsWith('h)')) {
      // Lettered list items
      children.push(
        new Paragraph({
          indent: { left: 720 },
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: trimmed,
              size: 20,
              font: 'Arial',
            }),
          ],
        })
      );
    } else {
      // Regular paragraph
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: trimmed,
              size: 20,
              font: 'Arial',
            }),
          ],
        })
      );
    }
  }

  // Build document
  const doc = new Document({
    creator: 'KI-Kreditanalyse – Musterbank AG',
    title: `Kreditvertrag ${company.firma}`,
    description: `Standardisierter Kreditvertrag nach vdp/LMA-Standard für ${company.firma}`,
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 20,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `Kreditvertrag ${contractNr} – ${company.firma}`,
                    size: 16,
                    color: '999999',
                    font: 'Arial',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Seite ',
                    size: 16,
                    color: '999999',
                    font: 'Arial',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: '999999',
                    font: 'Arial',
                  }),
                  new TextRun({
                    text: ' – Vertraulich / Bankgeheimnis',
                    size: 16,
                    color: '999999',
                    font: 'Arial',
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const filename = `Kreditvertrag_${company.firma.replace(/\s+/g, '_')}.docx`;
  saveAs(blob, filename);
}

// =============================================================================
// PDF Export
// =============================================================================

/**
 * Generate and download a PDF from the contract text.
 * @param {string} contractText - The full contract text
 * @param {object} company - Company object for metadata
 * @param {string} contractNr - Contract number string
 */
export function exportContractAsPdf(contractText, company, contractNr) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 25;
  const marginRight = 25;
  const marginTop = 30;
  const marginBottom = 25;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let y = marginTop;

  const addHeader = () => {
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Kreditvertrag ${contractNr} – ${company.firma}`, pageWidth - marginRight, 15, { align: 'right' });
  };

  const addFooter = (pageNum) => {
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Seite ${pageNum} – Vertraulich / Bankgeheimnis`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  };

  const checkNewPage = (needed) => {
    if (y + needed > pageHeight - marginBottom) {
      addFooter(doc.getNumberOfPages());
      doc.addPage();
      addHeader();
      y = marginTop;
    }
  };

  // Title page
  addHeader();
  doc.setFontSize(28);
  doc.setTextColor(27, 43, 75); // primary color
  doc.setFont('helvetica', 'bold');
  doc.text('KREDITVERTRAG', pageWidth / 2, 80, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text('(Standardisierter Kreditvertrag nach vdp/LMA-Standard)', pageWidth / 2, 92, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(50);
  doc.text(`Nr. ${contractNr}`, pageWidth / 2, 105, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(27, 43, 75);
  doc.setFont('helvetica', 'bold');
  doc.text(company.firma, pageWidth / 2, 125, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.setFont('helvetica', 'normal');
  doc.text(`Erstellt am ${new Date().toLocaleDateString('de-DE')}`, pageWidth / 2, 140, { align: 'center' });

  addFooter(1);
  doc.addPage();
  addHeader();
  y = marginTop;

  // Parse and render contract text
  const lines = contractText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      y += 3;
      continue;
    }

    const isSectionHeading = /^§\s*\d+\s+[A-ZÄÖÜ]/.test(trimmed);
    const isSubSection = /^\d+\.\d+\s+/.test(trimmed);
    const isAnlage = /^ANLAGE\s+\d+:/i.test(trimmed);
    const isMainHeading = /^KREDITVERTRAG$/i.test(trimmed) || /^Inhaltsverzeichnis$/i.test(trimmed);

    if (isMainHeading) {
      checkNewPage(15);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 43, 75);
      doc.text(trimmed, pageWidth / 2, y, { align: 'center' });
      y += 10;
    } else if (isSectionHeading || isAnlage) {
      checkNewPage(15);
      y += 5;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 43, 75);
      doc.text(trimmed, marginLeft, y);
      y += 7;
    } else if (isSubSection) {
      checkNewPage(10);
      y += 3;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50);
      doc.text(trimmed, marginLeft, y);
      y += 6;
    } else {
      // Regular text - wrap lines
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30);

      const wrappedLines = doc.splitTextToSize(trimmed, contentWidth);
      const lineHeight = 4.2;

      checkNewPage(wrappedLines.length * lineHeight + 2);

      for (const wl of wrappedLines) {
        doc.text(wl, marginLeft, y);
        y += lineHeight;
      }
      y += 1;
    }
  }

  addFooter(doc.getNumberOfPages());

  // Download
  const filename = `Kreditvertrag_${company.firma.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
