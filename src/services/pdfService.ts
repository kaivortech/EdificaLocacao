import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Rental, Client } from '../types';

// ============================================================
// DADOS DA EMPRESA
// ============================================================
const EMPRESA = {
  nome: 'Edifica Locação',
  cnpj: '54.567.138/0001-04',
  endereco: 'Rua Carine Cristina Monteiro da Silva, 305 - Lot. Oceania VI',
  complemento: 'Portal do Poço, Cabedelo - PB. CEP: 58106-086',
  telefone: '(83) 99664-7788',
  email: 'Georrandes@hotmail.com',
};

// ============================================================
// CORES DA PALETA
// ============================================================
const COLORS = {
  primary: [145, 117, 35] as [number, number, number],
  secondary: [44, 46, 48] as [number, number, number],
  neutral: [108, 117, 125] as [number, number, number],
  light: [248, 249, 250] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  border: [222, 226, 230] as [number, number, number],
};

// ============================================================
// GERAR PDF DO CONTRATO
// ============================================================
export const gerarPDFContratoLocacao = (
  rental: Rental,
  client?: Client | null
): void => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // ── CABEÇALHO ──────────────────────────────────────────────
  // Barra superior dourada
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Nome da empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.white);
  doc.text(EMPRESA.nome.toUpperCase(), margin, 13);

  // Subtítulo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('CONTRATO DE LOCAÇÃO DE EQUIPAMENTOS', margin, 20);

  // Dados de contato no cabeçalho (direita)
  doc.setFontSize(8);
  doc.text(`Tel: ${EMPRESA.telefone}`, pageWidth - margin, 12, { align: 'right' });
  doc.text(EMPRESA.email, pageWidth - margin, 17, { align: 'right' });
  doc.text(`CNPJ: ${EMPRESA.cnpj}`, pageWidth - margin, 22, { align: 'right' });

  // ── NÚMERO DO CONTRATO ──────────────────────────────────────
  doc.setFillColor(...COLORS.light);
  doc.rect(margin, 36, contentWidth, 10, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.rect(margin, 36, contentWidth, 10, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.secondary);
  const contractNum = rental.id.slice(-8).toUpperCase();
  doc.text(`CONTRATO Nº: ${contractNum}`, margin + 4, 42.5);

  const emissaoDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.neutral);
  doc.text(`Emitido em: ${emissaoDate}`, pageWidth - margin - 4, 42.5, { align: 'right' });

  let y = 52;

  // ── SEÇÃO: DADOS DO LOCATÁRIO ───────────────────────────────
  const drawSection = (title: string, yPos: number): number => {
    doc.setFillColor(...COLORS.primary);
    doc.rect(margin, yPos, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.white);
    doc.text(title, margin + 3, yPos + 5);
    return yPos + 7;
  };

  const drawRow = (label: string, value: string, yPos: number, col2?: boolean): number => {
    const colX = col2 ? margin + contentWidth / 2 + 2 : margin;
    const colW = col2 ? contentWidth / 2 - 2 : contentWidth;

    doc.setFillColor(248, 249, 250);
    if (!col2) doc.rect(margin, yPos, contentWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.neutral);
    doc.text(label + ':', colX + 2, yPos + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.secondary);
    const labelWidth = doc.getTextWidth(label + ': ');
    doc.text(value || '—', colX + 2 + labelWidth + 1, yPos + 4.5);

    if (!col2) {
      doc.setDrawColor(...COLORS.border);
      doc.line(margin, yPos + 7, margin + contentWidth, yPos + 7);
      return yPos + 7;
    }
    return yPos;
  };

  // DADOS DO LOCATÁRIO
  y = drawSection('DADOS DO LOCATÁRIO', y) + 1;
  y = drawRow('Nome', rental.clientName, y);
  if (client) {
    const cpfCnpj = client.cpf || client.cnpj || '';
    drawRow('CPF/CNPJ', cpfCnpj, y);
    drawRow('Telefone', client.phone || '', y, true);
    y += 7;
    if (client.address) {
      y = drawRow('Endereço', `${client.address}${client.city ? `, ${client.city}` : ''}${client.state ? `/${client.state}` : ''}`, y);
    }
  }

  y += 4;

  // DADOS DO EQUIPAMENTO
  y = drawSection('DADOS DO EQUIPAMENTO', y) + 1;
  y = drawRow('Equipamento', rental.machineName, y);
  drawRow('Tipo/Categoria', rental.machineType, y);
  drawRow('ID Equipamento', rental.machineId.slice(-8).toUpperCase(), y, true);
  y += 7;

  y += 4;

  // PERÍODO E VALORES
  y = drawSection('PERÍODO E VALORES', y) + 1;
  drawRow('Data de Início', rental.startDate, y);
  drawRow('Data de Devolução', rental.endDate, y, true);
  y += 7;
  drawRow('Diária', `R$ ${rental.dailyRate.toFixed(2).replace('.', ',')}`, y);
  drawRow('Total de Dias', `${rental.totalDays} dia(s)`, y, true);
  y += 7;

  if (rental.deliveryAddress) {
    y = drawRow('Local de Entrega', rental.deliveryAddress, y);
  }

  if (rental.depositAmount && rental.depositAmount > 0) {
    y = drawRow('Caução', `R$ ${rental.depositAmount.toFixed(2).replace('.', ',')}`, y);
  }

  y += 4;

  // TOTAL DESTACADO
  doc.setFillColor(...COLORS.secondary);
  doc.rect(margin, y, contentWidth, 14, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.white);
  doc.text('VALOR TOTAL DO CONTRATO:', margin + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 215, 0); // dourado
  const totalStr = `R$ ${rental.totalAmount.toFixed(2).replace('.', ',')}`;
  doc.text(totalStr, pageWidth - margin - 4, y + 9, { align: 'right' });

  y += 18;

  // OBSERVAÇÕES
  if (rental.notes && rental.notes.trim()) {
    y = drawSection('OBSERVAÇÕES', y) + 1;
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, y, contentWidth, 14, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.secondary);
    const lines = doc.splitTextToSize(rental.notes, contentWidth - 8);
    doc.text(lines, margin + 4, y + 5);
    y += 18;
  }

  y += 4;

  // CLÁUSULAS
  y = drawSection('CONDIÇÕES GERAIS', y) + 1;
  const clausulas = [
    '1. O locatário se responsabiliza pela conservação e uso adequado do equipamento durante o período de locação.',
    '2. Danos por mau uso, acidentes ou negligência são de responsabilidade do locatário.',
    '3. A devolução deve ocorrer na data pactuada. Atrasos serão cobrados proporcionalmente à diária.',
    '4. O equipamento deve ser devolvido limpo e em perfeitas condições de funcionamento.',
    '5. Este contrato é regido pelas normas do Código Civil Brasileiro.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.neutral);

  clausulas.forEach((c) => {
    const lines = doc.splitTextToSize(c, contentWidth - 8);
    if (y + lines.length * 4 > pageHeight - 60) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines, margin + 3, y + 5);
    y += lines.length * 4 + 2;
  });

  y += 10;

  // ASSINATURAS
  if (y > pageHeight - 55) {
    doc.addPage();
    y = margin;
  }

  doc.setDrawColor(...COLORS.border);
  const sigWidth = (contentWidth - 20) / 2;

  // Locador
  doc.line(margin, y + 20, margin + sigWidth, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.secondary);
  doc.text(EMPRESA.nome, margin + sigWidth / 2, y + 25, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.neutral);
  doc.text('Locador — CNPJ: ' + EMPRESA.cnpj, margin + sigWidth / 2, y + 30, { align: 'center' });

  // Locatário
  const sig2X = margin + sigWidth + 20;
  doc.line(sig2X, y + 20, sig2X + sigWidth, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.secondary);
  doc.text(rental.clientName, sig2X + sigWidth / 2, y + 25, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.neutral);
  doc.text('Locatário', sig2X + sigWidth / 2, y + 30, { align: 'center' });

  // ── RODAPÉ ─────────────────────────────────────────────────
  const footerY = pageHeight - 12;
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, footerY - 4, pageWidth, 16, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.white);
  doc.text(
    `${EMPRESA.nome} | ${EMPRESA.endereco}, ${EMPRESA.complemento} | ${EMPRESA.telefone}`,
    pageWidth / 2,
    footerY + 2,
    { align: 'center' }
  );

  // ── ABRIR PDF ───────────────────────────────────────────────
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const safeName = (rental.clientName || 'cliente').replace(/\s+/g, '_');
  const fileName = `Contrato_Edifica_${contractNum}_${safeName}.pdf`;

  // Tenta abrir em nova aba; fallback para download
  const newWindow = window.open(pdfUrl, '_blank');
  if (!newWindow) {
    // Popup bloqueado — faz download direto
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    link.click();
  }
};
