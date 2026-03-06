import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SEV_LABEL } from './data';

export function generatePDF(findings, score, scoreLabel, scoreDesc) {  
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  // ── En-tête ───────────────────────────────────────────────────────────────
  doc.setFillColor(8, 14, 26);
  doc.rect(0, 0, W, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SecureScan', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(160, 180, 210);
  doc.text('Rapport d\'analyse de sécurité OWASP Top 10 · 2025', 14, 19);
  doc.text(`Généré le ${date}`, W - 14, 19, { align: 'right' });

  // ── Score ─────────────────────────────────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Score de sécurité', 14, 40);

  doc.setFontSize(28);
  doc.setTextColor(score >= 75 ? 16 : score >= 50 ? 180 : 220, score >= 75 ? 185 : score >= 50 ? 100 : 50, score >= 75 ? 129 : 30);
  doc.text(`${score}`, 14, 56);

  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.text(`/ 100  —  Grade ${scoreLabel}  —  ${scoreDesc}`, 30, 56);

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(14, 62, W - 14, 62);

  // ── Résumé ────────────────────────────────────────────────────────────────
  const counts = { 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const f of findings) if (counts[f.severity] !== undefined) counts[f.severity]++;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text('Résumé', 14, 70);

  const labels = [
    { sev: 4, label: 'Critique', color: [220, 50, 50] },
    { sev: 3, label: 'Elevée',   color: [200, 100, 20] },
    { sev: 2, label: 'Moyenne',  color: [30, 160, 100] },
    { sev: 1, label: 'Faible',   color: [60, 120, 200] },
  ];

  let x = 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  for (const { sev, label, color } of labels) {
    doc.setTextColor(...color);
    doc.text(`${counts[sev]} ${label}`, x, 78);
    x += 38;
  }

  doc.setTextColor(100, 100, 100);
  doc.text(`${findings.length} finding(s) au total`, W - 14, 78, { align: 'right' });

  doc.setDrawColor(220, 220, 220);
  doc.line(14, 83, W - 14, 83);

  // ── Tableau ───────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text('Détail des vulnérabilités', 14, 91);

  autoTable(doc, {
    startY: 96,
    head: [['Fichier', 'Ligne', 'Description', 'Sévérité', 'OWASP']],
    body: findings.map((f) => [
      f.file,
      f.line != null ? String(f.line) : '–',
      f.desc,
      SEV_LABEL[f.severity] ?? String(f.severity),
      `${f.owasp} · ${f.category}`,
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [40, 40, 40],
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [8, 14, 26],
      textColor: [200, 215, 235],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: [248, 250, 253] },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold' },
      1: { cellWidth: 12, halign: 'center' },
      2: { cellWidth: 70 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 42 },
    },
    margin: { left: 14, right: 14 },
    didParseCell(data) {
      if (data.column.index === 3 && data.section === 'body') {
        const sev = findings[data.row.index]?.severity;
        const colors = { 4: [220, 50, 50], 3: [200, 100, 20], 2: [30, 160, 100], 1: [60, 120, 200] };
        if (colors[sev]) data.cell.styles.textColor = colors[sev];
      }
    },
  });

  // ── Pied de page ──────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(`SecureScan — Rapport confidentiel`, 14, 290);
    doc.text(`Page ${i} / ${pageCount}`, W - 14, 290, { align: 'right' });
  }

  doc.save(`securescan-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
