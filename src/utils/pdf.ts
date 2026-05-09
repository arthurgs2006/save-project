import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

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

interface ExportStatementPdfOptions {
    title: string;
    subtitle: string;
    logoText?: string;
    rows: StatementRow[];
    footers: StatementFooter[];
    fileName: string;
}

type PdfContext = {
    pdfDoc: PDFDocument;
    page: PDFPage;
    regularFont: PDFFont;
    boldFont: PDFFont;
    width: number;
    height: number;
};

const colors = {
    dark: rgb(0.06, 0.09, 0.16),
    primary: rgb(0.08, 0.36, 0.66),
    primarySoft: rgb(0.9, 0.95, 1),
    text: rgb(0.08, 0.1, 0.16),
    muted: rgb(0.39, 0.45, 0.55),
    line: rgb(0.84, 0.88, 0.93),
    rowAlt: rgb(0.97, 0.98, 1),
    white: rgb(1, 1, 1),
    green: rgb(0.1, 0.5, 0.22),
    greenSoft: rgb(0.9, 0.98, 0.93),
    red: rgb(0.78, 0.13, 0.13),
    redSoft: rgb(1, 0.92, 0.92),
};

const pageSize: [number, number] = [842, 595]; // A4 landscape
const margin = 36;

export async function exportStatementPdf(options: ExportStatementPdfOptions) {
    const pdfDoc = await PDFDocument.create();

    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage(pageSize);
    const { width, height } = page.getSize();

    const context: PdfContext = {
        pdfDoc,
        page,
        regularFont,
        boldFont,
        width,
        height,
    };

    let y = drawHeader(context, options);

    y = drawSummaryCards(context, y, options.rows, options.footers);

    y = drawTableHeader(context, y);

    options.rows.forEach((row, index) => {
        const rowHeight = calculateRowHeight(context, row);

        if (y - rowHeight < 82) {
            page = pdfDoc.addPage(pageSize);
            context.page = page;

            y = drawHeader(context, options, true);
            y = drawTableHeader(context, y);
        }

        drawTableRow(context, row, y, rowHeight, index);
        y -= rowHeight;
    });

    y -= 16;

    if (y < 150) {
        page = pdfDoc.addPage(pageSize);
        context.page = page;

        y = drawHeader(context, options, true);
    }

    drawFooterSummary(context, y, options.footers);

    drawPageNumbers(context);

    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });

    downloadPdf(pdfBlob, options.fileName);

    return pdfBlob;
}

function drawHeader(context: PdfContext, options: ExportStatementPdfOptions, compact = false) {
    const { page, width, height, regularFont, boldFont } = context;

    const headerHeight = compact ? 82 : 104;
    const topY = height - margin;

    page.drawRectangle({
        x: 0,
        y: height - headerHeight,
        width,
        height: headerHeight,
        color: colors.dark,
    });

    page.drawRectangle({
        x: margin,
        y: topY - 34,
        width: 132,
        height: 30,
        color: colors.primary,
    });

    page.drawText(options.logoText ?? "SAVEAPP", {
        x: margin + 12,
        y: topY - 24,
        size: 12,
        font: boldFont,
        color: colors.white,
    });

    page.drawText(options.title, {
        x: margin,
        y: compact ? topY - 62 : topY - 62,
        size: compact ? 16 : 22,
        font: boldFont,
        color: colors.white,
    });

    if (!compact) {
        page.drawText(options.subtitle, {
            x: margin,
            y: topY - 84,
            size: 10.5,
            font: regularFont,
            color: rgb(0.78, 0.84, 0.92),
        });

        page.drawText(`Gerado em ${new Date().toLocaleString("pt-BR")}`, {
            x: width - margin - 190,
            y: topY - 24,
            size: 9,
            font: regularFont,
            color: rgb(0.78, 0.84, 0.92),
        });
    }

    return height - headerHeight - 24;
}

function drawSummaryCards(
    context: PdfContext,
    startY: number,
    rows: StatementRow[],
    footers: StatementFooter[]
) {
    const { page, width, regularFont, boldFont } = context;

    const totalCredits = getFooterValue(footers, "créditos") || getTotalByType(rows, "crédito");
    const totalDebits = getFooterValue(footers, "débitos") || getTotalByType(rows, "débito");
    const balance = getFooterValue(footers, "saldo") || "-";
    const count = getFooterValue(footers, "quantidade") || String(rows.length);

    const cards = [
        {
            label: "Total de créditos",
            value: totalCredits,
            color: colors.green,
            bg: colors.greenSoft,
        },
        {
            label: "Total de débitos",
            value: totalDebits,
            color: colors.red,
            bg: colors.redSoft,
        },
        {
            label: "Saldo do período",
            value: balance,
            color: balance.includes("-") ? colors.red : colors.green,
            bg: colors.primarySoft,
        },
        {
            label: "Registros",
            value: count,
            color: colors.primary,
            bg: colors.primarySoft,
        },
    ];

    const gap = 10;
    const cardWidth = (width - margin * 2 - gap * 3) / 4;
    const cardHeight = 62;

    cards.forEach((card, index) => {
        const x = margin + index * (cardWidth + gap);

        page.drawRectangle({
            x,
            y: startY - cardHeight,
            width: cardWidth,
            height: cardHeight,
            color: card.bg,
            borderColor: colors.line,
            borderWidth: 0.6,
        });

        page.drawText(card.label, {
            x: x + 12,
            y: startY - 22,
            size: 8.8,
            font: regularFont,
            color: colors.muted,
        });

        drawClippedText(page, card.value, x + 12, startY - 45, cardWidth - 24, 11.5, boldFont, card.color);
    });

    return startY - cardHeight - 26;
}

function drawTableHeader(context: PdfContext, y: number) {
    const { page, boldFont } = context;

    const columns = getColumns();

    page.drawRectangle({
        x: margin,
        y: y - 26,
        width: context.width - margin * 2,
        height: 30,
        color: colors.dark,
    });

    columns.forEach((column) => {
        page.drawText(column.label, {
            x: column.x + 8,
            y: y - 16,
            size: 9,
            font: boldFont,
            color: colors.white,
        });
    });

    return y - 40;
}

function drawTableRow(
    context: PdfContext,
    row: StatementRow,
    y: number,
    rowHeight: number,
    index: number
) {
    const { page, regularFont, boldFont, width } = context;
    const columns = getColumns();

    const isCredit = normalize(row.tipo).includes("credito");
    const isDebit = normalize(row.tipo).includes("debito");

    page.drawRectangle({
        x: margin,
        y: y - rowHeight + 6,
        width: width - margin * 2,
        height: rowHeight,
        color: index % 2 === 0 ? colors.white : colors.rowAlt,
        borderColor: colors.line,
        borderWidth: 0.45,
    });

    page.drawText(row.data || "-", {
        x: columns[0].x + 8,
        y: y - 13,
        size: 8.7,
        font: regularFont,
        color: colors.text,
    });

    page.drawText(row.hora || "-", {
        x: columns[1].x + 8,
        y: y - 13,
        size: 8.7,
        font: regularFont,
        color: colors.text,
    });

    const descriptionLines = wrapText(
        row.descricao || "-",
        columns[2].width - 16,
        regularFont,
        8.7
    );

    descriptionLines.slice(0, 3).forEach((line, lineIndex) => {
        page.drawText(line, {
            x: columns[2].x + 8,
            y: y - 13 - lineIndex * 11,
            size: 8.7,
            font: regularFont,
            color: colors.text,
        });
    });

    const typeColor = isCredit ? colors.green : isDebit ? colors.red : colors.text;

    drawCenteredText(
        page,
        row.tipo || "-",
        columns[3].x,
        y - 13,
        columns[3].width,
        8.7,
        boldFont,
        typeColor
    );

    drawRightText(
        page,
        row.valor || "-",
        columns[4].x,
        y - 13,
        columns[4].width - 8,
        8.7,
        boldFont,
        typeColor
    );
}

function drawFooterSummary(context: PdfContext, y: number, footers: StatementFooter[]) {
    const { page, width, regularFont, boldFont } = context;

    if (!footers.length) return;

    const boxHeight = Math.max(88, footers.length * 18 + 42);

    page.drawRectangle({
        x: margin,
        y: y - boxHeight,
        width: width - margin * 2,
        height: boxHeight,
        color: colors.rowAlt,
        borderColor: colors.line,
        borderWidth: 0.7,
    });

    page.drawText("Resumo final", {
        x: margin + 16,
        y: y - 24,
        size: 12,
        font: boldFont,
        color: colors.dark,
    });

    footers.forEach((footer, index) => {
        const lineY = y - 48 - index * 16;

        page.drawText(footer.label, {
            x: margin + 16,
            y: lineY,
            size: 9.2,
            font: regularFont,
            color: colors.muted,
        });

        drawRightText(
            page,
            footer.value,
            margin,
            lineY,
            width - margin * 2 - 16,
            9.2,
            boldFont,
            colors.text
        );
    });
}

function drawPageNumbers(context: PdfContext) {
    const { pdfDoc, regularFont } = context;
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    pages.forEach((page, index) => {
        const { width } = page.getSize();

        page.drawLine({
            start: { x: margin, y: 34 },
            end: { x: width - margin, y: 34 },
            thickness: 0.5,
            color: colors.line,
        });

        page.drawText("Documento gerado automaticamente pelo SaveApp.", {
            x: margin,
            y: 18,
            size: 7.5,
            font: regularFont,
            color: colors.muted,
        });

        page.drawText(`Página ${index + 1} de ${totalPages}`, {
            x: width - margin - 70,
            y: 18,
            size: 7.5,
            font: regularFont,
            color: colors.muted,
        });
    });
}

function calculateRowHeight(context: PdfContext, row: StatementRow) {
    const columns = getColumns();
    const lines = wrapText(row.descricao || "-", columns[2].width - 16, context.regularFont, 8.7);

    return Math.max(28, Math.min(lines.length, 3) * 11 + 17);
}

function getColumns() {
    return [
        {
            label: "Data",
            x: margin,
            width: 80,
        },
        {
            label: "Hora",
            x: margin + 80,
            width: 70,
        },
        {
            label: "Descrição",
            x: margin + 150,
            width: 390,
        },
        {
            label: "Tipo",
            x: margin + 540,
            width: 88,
        },
        {
            label: "Valor",
            x: margin + 628,
            width: 140,
        },
    ];
}

function wrapText(text: string, maxWidth: number, font: PDFFont, size: number) {
    const words = text.replace(/\s+/g, " ").trim().split(" ");

    const lines: string[] = [];
    let line = "";

    words.forEach((word) => {
        const testLine = line ? `${line} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, size);

        if (testWidth <= maxWidth) {
            line = testLine;
            return;
        }

        if (line) {
            lines.push(line);
            line = word;
            return;
        }

        lines.push(truncateText(word, maxWidth, font, size));
        line = "";
    });

    if (line) {
        lines.push(line);
    }

    if (lines.length > 3) {
        const firstLines = lines.slice(0, 3);
        firstLines[2] = truncateText(`${firstLines[2]}...`, maxWidth, font, size);

        return firstLines;
    }

    return lines.length ? lines : ["-"];
}

function truncateText(text: string, maxWidth: number, font: PDFFont, size: number) {
    if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;

    let result = text;

    while (result.length > 3 && font.widthOfTextAtSize(`${result}...`, size) > maxWidth) {
        result = result.slice(0, -1);
    }

    return `${result}...`;
}

function drawRightText(
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    width: number,
    size: number,
    font: PDFFont,
    color = colors.text
) {
    const safeText = text || "-";
    const textWidth = font.widthOfTextAtSize(safeText, size);

    page.drawText(safeText, {
        x: x + width - textWidth,
        y,
        size,
        font,
        color,
    });
}

function drawCenteredText(
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    width: number,
    size: number,
    font: PDFFont,
    color = colors.text
) {
    const safeText = text || "-";
    const textWidth = font.widthOfTextAtSize(safeText, size);

    page.drawText(safeText, {
        x: x + (width - textWidth) / 2,
        y,
        size,
        font,
        color,
    });
}

function drawClippedText(
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    size: number,
    font: PDFFont,
    color = colors.text
) {
    page.drawText(truncateText(text || "-", maxWidth, font, size), {
        x,
        y,
        size,
        font,
        color,
    });
}

function getFooterValue(footers: StatementFooter[], term: string) {
    const footer = footers.find((item) =>
        normalize(item.label).includes(normalize(term))
    );

    return footer?.value;
}

function getTotalByType(rows: StatementRow[], type: "crédito" | "débito") {
    const normalizedType = normalize(type);

    const total = rows
        .filter((row) => normalize(row.tipo).includes(normalizedType))
        .reduce((sum, row) => {
            const number = Number(
                row.valor
                    .replace("R$", "")
                    .replace(/\./g, "")
                    .replace(",", ".")
                    .trim()
            );

            return sum + (Number.isNaN(number) ? 0 : number);
        }, 0);

    return total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function normalize(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function downloadPdf(pdfBlob: Blob, fileName: string) {
    const link = document.createElement("a");
    const url = URL.createObjectURL(pdfBlob);

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

export async function exportPlainPdf(lines: string[], fileName: string) {
    return exportStatementPdf({
        title: "Relatório",
        subtitle: "Documento gerado pelo SaveApp",
        logoText: "SAVEAPP",
        rows: lines.map((line) => ({
            data: "",
            hora: "",
            descricao: line,
            tipo: "",
            valor: "",
        })),
        footers: [],
        fileName,
    });
}

export { exportPlainPdf as exportPdf };