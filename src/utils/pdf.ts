import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface StatementRow {
  data: string;
  hora: string;
  descricao: string;
  tipo: string;
  valor: string;
}

export interface StatementFooter {
  label: string;
  value: string;
}

export async function exportStatementPdf(options: {
  title: string;
  subtitle: string;
  logoText?: string;
  rows: StatementRow[];
  footers: StatementFooter[];
  fileName: string;
}) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([612, 792]);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margin = 40;
  let y = height - margin;

  page.drawRectangle({
    x: margin,
    y: y - 30,
    width: 160,
    height: 28,
    color: rgb(0.05, 0.35, 0.65),
  });

  page.drawText(options.logoText ?? "SAVE PROJECT", {
    x: margin + 10,
    y: y - 22,
    size: 12,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  y -= 50;
  page.drawText(options.title, {
    x: margin,
    y,
    size: 18,
    font: helveticaBold,
    color: rgb(0.1, 0.18, 0.38),
  });

  y -= 24;
  page.drawText(options.subtitle, {
    x: margin,
    y,
    size: 12,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  y -= 24;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  y -= 24;
  const columns = [margin, margin + 70, margin + 132, margin + 320, margin + 430];
  const labels = ["Data", "Hora", "Descrição", "Tipo", "Valor"];
  labels.forEach((label, index) => {
    page.drawText(label, {
      x: columns[index],
      y,
      size: 11,
      font: helveticaBold,
      color: rgb(0.15, 0.15, 0.15),
    });
  });

  y -= 16;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.8,
    color: rgb(0.2, 0.35, 0.65),
  });

  y -= 18;
  const rowHeight = 18;

  for (const row of options.rows) {
    if (y < 90) {
      page = pdfDoc.addPage([612, 792]);
      y = height - margin;
    }

    page.drawText(row.data, { x: columns[0], y, size: 10, font: helvetica, color: rgb(0.12, 0.12, 0.12) });
    page.drawText(row.hora, { x: columns[1], y, size: 10, font: helvetica, color: rgb(0.12, 0.12, 0.12) });
    page.drawText(row.descricao, { x: columns[2], y, size: 10, font: helvetica, color: rgb(0.12, 0.12, 0.12) });
    page.drawText(row.tipo, { x: columns[3], y, size: 10, font: helvetica, color: rgb(0.12, 0.12, 0.12) });
    page.drawText(row.valor, { x: columns[4], y, size: 10, font: helvetica, color: rgb(0.12, 0.12, 0.12) });
    y -= rowHeight;
  }

  y -= 18;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.7,
    color: rgb(0.85, 0.85, 0.85),
  });

  y -= 20;
  for (const footer of options.footers) {
    if (y < 60) {
      page = pdfDoc.addPage([612, 792]);
      y = height - margin;
    }
    page.drawText(`${footer.label}: ${footer.value}`, {
      x: margin,
      y,
      size: 11,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 16;
  }

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(pdfBlob);
  link.download = options.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  return pdfBlob;
}

export async function exportPlainPdf(lines: string[], fileName: string) {
  const rows = lines.map((line) => ({ data: "", hora: "", descricao: line, tipo: "", valor: "" }));
  const blob = await exportStatementPdf({
    title: "Extrato",
    subtitle: "Relatório gerado",
    rows,
    footers: [],
    fileName,
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export { exportPlainPdf as exportPdf };
