const escapePdfText = (text) => String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

// ─── Constants ───────────────────────────────────────────────────────────────
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN_X = 50;
const MARGIN_Y = 60;
const CONTENT_W = PAGE_W - MARGIN_X * 2; // 512 pt
const RIGHT_X = MARGIN_X + CONTENT_W;    // 562 pt

// Approximate glyph width multiplier for Helvetica at 1pt
const CHAR_W = 0.52;
const approxWidth = (text, fontSize) => String(text).length * fontSize * CHAR_W;
const centerX = (text, fontSize) =>
    MARGIN_X + (CONTENT_W - approxWidth(text, fontSize)) / 2;
const rightX = (text, fontSize) =>
    RIGHT_X - approxWidth(text, fontSize);

// ─── Content Stream Helpers ──────────────────────────────────────────────────
// Each helper returns an array of PDF content stream operator strings.

const opText = (x, y, font, size, text) =>
    `BT /${font} ${size} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td (${escapePdfText(text)}) Tj ET`;

const opLine = (x1, y1, x2, y2, width = 0.5, gray = 0.6) => [
    `${gray} G`,
    `${width} w`,
    `${x1.toFixed(1)} ${y1.toFixed(1)} m ${x2.toFixed(1)} ${y2.toFixed(1)} l S`,
    `0 G`,
];

// ─── Page Layout Engine ──────────────────────────────────────────────────────
/**
 * Accepts a list of drawing commands and returns an array of pages,
 * each with a `lines` array of PDF content stream strings.
 *
 * Command types:
 *   { type: 'title',    text }
 *   { type: 'subtitle', text }
 *   { type: 'heading',  text }
 *   { type: 'text',     text }
 *   { type: 'keyvalue', key, value }
 *   { type: 'divider' }
 *   { type: 'spacer',   h? }   (h = pt, default 10)
 */
const buildPages = (commands) => {
    const pages = [];
    let lines = [];
    let y = PAGE_H - MARGIN_Y;

    const flush = () => { pages.push({ lines }); lines = []; y = PAGE_H - MARGIN_Y; };
    const need  = (h) => { if (y - h < MARGIN_Y) flush(); };
    const drop  = (h) => { y -= h; };

    for (const cmd of commands) {
        switch (cmd.type) {

            case 'title': {
                const fs = 16, h = 28;
                need(h);
                lines.push(opText(centerX(cmd.text, fs), y, 'F2', fs, cmd.text));
                drop(h);
                break;
            }

            case 'subtitle': {
                const fs = 11, h = 20;
                need(h);
                lines.push(opText(centerX(cmd.text, fs), y, 'F1', fs, cmd.text));
                drop(h);
                break;
            }

            case 'heading': {
                const fs = 10, h = 18;
                need(h);
                lines.push(opText(MARGIN_X, y, 'F2', fs, cmd.text.toUpperCase()));
                drop(h);
                break;
            }

            case 'text': {
                const fs = 9, h = 14;
                need(h);
                lines.push(opText(MARGIN_X, y, 'F1', fs, cmd.text));
                drop(h);
                break;
            }

            case 'keyvalue': {
                const fs = 9, h = 14;
                need(h);
                lines.push(opText(MARGIN_X,             y, 'F1', fs, cmd.key));
                lines.push(opText(rightX(cmd.value, fs), y, 'F1', fs, cmd.value));
                drop(h);
                break;
            }

            case 'divider': {
                const h = 12;
                need(h);
                const ly = y - 4;
                lines.push(...opLine(MARGIN_X, ly, RIGHT_X, ly));
                drop(h);
                break;
            }

            case 'spacer': {
                drop(cmd.h ?? 10);
                break;
            }

            default: break;
        }
    }

    if (lines.length) flush();
    return pages;
};

// ─── PDF Assembly ────────────────────────────────────────────────────────────
export const generateSimplePdfBuffer = (lines) => {
    // Accept plain string[] for backwards-compatibility:
    // each string becomes a { type: 'text', text } command.
    const commands = lines.map((l) => ({ type: 'text', text: l }));
    return generatePdfFromCommands(commands);
};

/**
 * Core PDF builder — call this directly when you want rich formatting.
 * Embeds Helvetica (F1) and Helvetica-Bold (F2).
 */
export const generatePdfFromCommands = (commands) => {
    const pages = buildPages(commands);
    const N = pages.length;

    // Object id plan:
    //   1          → Catalog
    //   2          → Pages (root)
    //   3…(2+N)    → Page dicts
    //   (3+N)…(2+2N) → Content streams
    //   3+2N       → F1 (Helvetica)
    //   4+2N       → F2 (Helvetica-Bold)
    const pageBase    = 3;
    const contentBase = pageBase + N;
    const fontF1Id    = contentBase + N;
    const fontF2Id    = fontF1Id + 1;
    const totalObjs   = fontF2Id;

    const pageIds    = Array.from({ length: N }, (_, i) => pageBase + i);
    const kidsRef    = pageIds.map((id) => `${id} 0 R`).join(' ');
    const fontRes    = `/Font << /F1 ${fontF1Id} 0 R /F2 ${fontF2Id} 0 R >>`;

    const objStrings = [];

    // 1: Catalog
    objStrings.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

    // 2: Pages root
    objStrings.push(`2 0 obj\n<< /Type /Pages /Kids [${kidsRef}] /Count ${N} >>\nendobj\n`);

    // Page dicts (ids 3…2+N)
    for (let i = 0; i < N; i++) {
        const pid = pageBase + i;
        const cid = contentBase + i;
        objStrings.push(
            `${pid} 0 obj\n` +
            `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}]\n` +
            `   /Resources << ${fontRes} >> /Contents ${cid} 0 R >>\nendobj\n`
        );
    }

    // Content streams (ids 3+N…2+2N)
    for (let i = 0; i < N; i++) {
        const cid    = contentBase + i;
        const body   = pages[i].lines.join('\n');
        const length = Buffer.byteLength(body, 'utf8');
        objStrings.push(
            `${cid} 0 obj\n<< /Length ${length} >>\nstream\n${body}\nendstream\nendobj\n`
        );
    }

    // Font objects
    objStrings.push(
        `${fontF1Id} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`
    );
    objStrings.push(
        `${fontF2Id} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`
    );

    // Assemble byte stream + xref table
    let pdf = '%PDF-1.4\n';
    const offsets = [];

    for (const obj of objStrings) {
        offsets.push(Buffer.byteLength(pdf, 'utf8'));
        pdf += obj;
    }

    const xrefOffset = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${totalObjs + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (const offset of offsets) {
        pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\n`;
    pdf += `startxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf, 'utf8');
};

// ─── Statement Summary ───────────────────────────────────────────────────────
export const buildStatementSummary = ({ account, transactions, periodStart, periodEnd }) => {
    const totals = {
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalTransfersSent: 0,
        totalTransfersReceived: 0,
        interestEarned: 0,
        feesCharged: 0
    };

    let netChange = 0;

    for (const tx of transactions) {
        const amount = Number(tx.amount) || 0;
        const isSource      = tx.sourceAccountNumber      === account.accountNumber;
        const isDestination = tx.destinationAccountNumber === account.accountNumber;

        if (tx.transactionType === 'deposito' && isDestination) {
            totals.totalDeposits += amount;
            netChange += amount;
        }
        if (tx.transactionType === 'retiro' && isSource) {
            totals.totalWithdrawals += amount;
            netChange -= amount;
        }
        if (tx.transactionType === 'transferencia' && isSource) {
            totals.totalTransfersSent += amount;
            netChange -= amount;
        }
        if (tx.transactionType === 'transferencia' && isDestination) {
            totals.totalTransfersReceived += amount;
            netChange += amount;
        }
        if (['pago_servicio', 'pago_prestamo'].includes(tx.transactionType) && isSource) {
            totals.feesCharged += amount;
            netChange -= amount;
        }
    }

    const closingBalance = Number(account.balance) || 0;
    const openingBalance = closingBalance - netChange;

    return { periodStart, periodEnd, openingBalance, closingBalance, ...totals };
};

// ─── Convenience: Statement PDF ──────────────────────────────────────────────
/**
 * Generates a fully formatted bank-statement PDF.
 *
 * Usage:
 *   const summary = buildStatementSummary({ account, transactions, periodStart, periodEnd });
 *   const buffer  = generateStatementPdf({ account, summary, transactions });
 */
export const generateStatementPdf = ({ account, summary, transactions }) => {
    const fmt     = (n)  => Number(n).toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' });
    const fmtDate = (d)  => d ? new Date(d).toLocaleDateString('es-GT') : '—';
    const txLabel = (tx) => {
        const labels = {
            deposito:      'Depósito',
            retiro:        'Retiro',
            transferencia: 'Transferencia',
            pago_servicio: 'Pago de Servicio',
            pago_prestamo: 'Pago de Préstamo',
        };
        return labels[tx.transactionType] ?? tx.transactionType;
    };

    const commands = [
        // ── Cover / Header ───────────────────────────────────────────────────
        { type: 'spacer', h: 20 },
        { type: 'title',    text: 'Estado de Cuenta' },
        { type: 'subtitle', text: account.bankName ?? 'Banco Nacional' },
        { type: 'spacer', h: 6 },
        { type: 'divider' },

        // ── Account Info ─────────────────────────────────────────────────────
        { type: 'spacer', h: 6 },
        { type: 'heading',  text: 'Información de la cuenta' },
        { type: 'spacer', h: 4 },
        { type: 'keyvalue', key: 'Titular',        value: account.ownerName     ?? '—' },
        { type: 'keyvalue', key: 'No. de cuenta',  value: account.accountNumber ?? '—' },
        { type: 'keyvalue', key: 'Tipo de cuenta', value: account.accountType   ?? '—' },
        { type: 'keyvalue', key: 'Moneda',         value: account.currency      ?? 'GTQ' },
        { type: 'spacer', h: 6 },
        { type: 'divider' },

        // ── Period ───────────────────────────────────────────────────────────
        { type: 'spacer', h: 6 },
        { type: 'heading',  text: 'Período del estado' },
        { type: 'spacer', h: 4 },
        { type: 'keyvalue', key: 'Fecha de inicio', value: fmtDate(summary.periodStart) },
        { type: 'keyvalue', key: 'Fecha de corte',  value: fmtDate(summary.periodEnd) },
        { type: 'spacer', h: 6 },
        { type: 'divider' },

        // ── Summary ──────────────────────────────────────────────────────────
        { type: 'spacer', h: 6 },
        { type: 'heading',  text: 'Resumen de movimientos' },
        { type: 'spacer', h: 4 },
        { type: 'keyvalue', key: 'Saldo inicial',             value: fmt(summary.openingBalance) },
        { type: 'keyvalue', key: 'Total depósitos',           value: fmt(summary.totalDeposits) },
        { type: 'keyvalue', key: 'Total retiros',             value: fmt(summary.totalWithdrawals) },
        { type: 'keyvalue', key: 'Transferencias enviadas',   value: fmt(summary.totalTransfersSent) },
        { type: 'keyvalue', key: 'Transferencias recibidas',  value: fmt(summary.totalTransfersReceived) },
        { type: 'keyvalue', key: 'Pagos de servicios/préstamos', value: fmt(summary.feesCharged) },
        { type: 'spacer', h: 4 },
        { type: 'divider' },
        { type: 'keyvalue', key: 'SALDO FINAL',               value: fmt(summary.closingBalance) },
        { type: 'divider' },

        // ── Transactions ─────────────────────────────────────────────────────
        { type: 'spacer', h: 6 },
        { type: 'heading', text: 'Detalle de transacciones' },
        { type: 'spacer', h: 4 },
    ];

    for (const tx of transactions) {
        const label = `${fmtDate(tx.date)}   ${txLabel(tx)}`;
        commands.push({ type: 'keyvalue', key: label, value: fmt(tx.amount) });
        if (tx.description) {
            commands.push({ type: 'text', text: `  ${tx.description}` });
        }
    }

    commands.push(
        { type: 'spacer', h: 14 },
        { type: 'divider' },
        { type: 'text', text: 'Documento generado electrónicamente. No requiere firma.' },
    );

    return generatePdfFromCommands(commands);
};