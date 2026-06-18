import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Rental, Client, Machine } from '../types';

const EMPRESA = {
  nome: 'Edifica Locações de Máquinas e Equipamentos Ltda.',
  cnpj: '54.567.138/0001-04',
  endereco: 'Rua Carine Cristina Monteiro da Silva, 305 - Lot. Oceania VI',
  complemento: 'Portal do Poço, Cabedelo - PB. CEP: 58106-086',
  telefone: '(83) 99664-7788',
  email: 'Georrandes@hotmail.com',
};

const COLORS = {
  primary: [145, 117, 35] as [number, number, number],
  secondary: [44, 46, 48] as [number, number, number],
  neutral: [108, 117, 125] as [number, number, number],
  light: [248, 249, 250] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  border: [200, 200, 200] as [number, number, number],
};

export const gerarPDFContratoLocacao = (
  rental: Rental,
  client?: Client | null,
  machine?: Machine | null
): void => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  const identifier = `LOC-RENT-${rental.id.slice(-3)}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
  const emitDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const drawHeader = () => {
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.white);
    doc.text('CONTRATO DE LOCAÇÃO DE EQUIPAMENTO E ACESSÓRIOS', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Identificador: ${identifier}`, margin, 20);
    doc.text(`Emitido em: ${emitDate}`, pageWidth - margin, 20, { align: 'right' });
  };

  const drawSectionTitle = (title: string, y: number): number => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.secondary);
    doc.text(title, margin, y);
    const y2 = y + 2;
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.8);
    doc.line(margin, y2, pageWidth - margin, y2);
    return y2 + 4;
  };

  const drawRow = (label: string, value: string, x: number, y: number, labelW = 45): number => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.neutral);
    doc.text(label, x, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.secondary);
    doc.text(value || '—', x + labelW, y);
    return y + 5;
  };

  const drawTable = (headers: string[], rows: string[][], y: number, startX?: number, colWidths?: number[]): number => {
    const sx = startX || margin;
    const cw = colWidths || [contentWidth / 2 - 4, contentWidth / 2 - 4];
    const rowH = 6.5;
    const padX = 2;
    const padY = 4.5;

    const drawCell = (text: string, x: number, w: number, isHeader: boolean) => {
      if (isHeader) {
        doc.setFillColor(...COLORS.primary);
        doc.rect(x, y, w, rowH, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.white);
      } else {
        doc.setFillColor(248, 249, 250);
        doc.rect(x, y, w, rowH, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.secondary);
      }
      doc.text(text, x + padX, y + padY);
    };

    headers.forEach((h, i) => drawCell(h, sx + (cw[i] || cw[0]) * i, cw[i], true));
    y += rowH;

    rows.forEach((row) => {
      row.forEach((cell, i) => drawCell(cell, sx + (cw[i] || cw[0]) * i, cw[i], false));
      y += rowH;
    });

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    return y + 3;
  };

  drawHeader();

  let y = 36;

  // Locador
  y = drawSectionTitle('LOCADOR (EMPRESA)', y);
  y = drawRow('Nome:', EMPRESA.nome, margin, y);
  y = drawRow('CNPJ:', EMPRESA.cnpj, margin, y);
  y = drawRow('Endereço:', `${EMPRESA.endereco}, ${EMPRESA.complemento}`, margin, y);
  y = drawRow('Telefone:', EMPRESA.telefone, margin, y);
  y = drawRow('Email:', EMPRESA.email, margin, y);
  y += 2;

  // Locatário
  y = drawSectionTitle('LOCATÁRIO (CLIENTE)', y);
  const docCPF = client?.cpf || client?.cnpj || '';
  const docAddress = client?.address || '';
  const docPhone = client?.phone || '';
  const docEmail = client?.email || '';
  y = drawRow('Nome:', rental.clientName || client?.name || '', margin, y);
  y = drawRow('CPF/CNPJ:', docCPF, margin, y);
  y = drawRow('Endereço:', docAddress, margin, y);
  y = drawRow('Telefone:', docPhone, margin, y);
  y = drawRow('Email:', docEmail, margin, y);
  y += 2;

  // Equipamento
  y = drawSectionTitle('EQUIPAMENTO', y);
  const machineModel = machine?.model || rental.machineType || '';
  const machineSerial = machine?.serialNumber || '';
  const dailyRateStr = `R$ ${rental.dailyRate.toFixed(2).replace('.', ',')} por Dia`;
  const techNotes = machine?.description || 'Nenhuma ressalva técnica cadastrada. Equipamento em pleno estado operacional.';

  const eqHeaders = ['Campo', 'Valor'];
  const eqRows: string[][] = [
    ['Equipamento/Máquina', rental.machineName || ''],
    ['Modelo', machineModel],
    ['Número de Série', machineSerial],
    ['Tarifa Pactuada', dailyRateStr],
    ['Notas Técnicas', techNotes],
  ];
  y = drawTable(eqHeaders, eqRows, y);
  y += 1;

  // Condições Comerciais
  y = drawSectionTitle('CONDIÇÕES COMERCIAIS', y);

  const discountAmount = rental.hasDiscount && rental.originalAmount
    ? rental.originalAmount - rental.totalAmount
    : 0;
  const discountStr = discountAmount > 0
    ? `R$ ${discountAmount.toFixed(2).replace('.', ',')}`
    : 'Nenhum';

  const ccHeaders = ['Campo', 'Valor'];
  const ccRows: string[][] = [
    ['Data Inicial', rental.startDate || ''],
    ['Devolução/Término', rental.endDate || ''],
    ['Forma de Cobrança', 'Acúmulo de Diárias'],
    ['Desconto Aplicado', discountStr],
    ['Valor Total Acumulado', `R$ ${rental.totalAmount.toFixed(2).replace('.', ',')}`],
    ['Forma de Pagamento', 'Boleto Bancário / À Vista na Devolução'],
    ['Observações', rental.notes || '—'],
  ];
  y = drawTable(ccHeaders, ccRows, y);
  y += 1;

  // Cláusulas
  y = drawSectionTitle('CLÁUSULAS', y);
  const clausulas = [
    '1. Objeto — O LOCADOR disponibiliza o equipamento acima descrito em perfeito estado de funcionamento, e o LOCATÁRIO declara tê-lo recebido e inspecionado, concordando integralmente com os termos deste contrato.',
    '2. Obrigações de Guarda — O LOCATÁRIO assume total responsabilidade civil e criminal pela guarda, conservação e uso adequado do equipamento durante todo o período de locação, responsabilizando-se por quaisquer danos, furtos ou extravios.',
    '3. Prazo e Multas — O equipamento deverá ser devolvido na data limite estipulada. A prorrogação da locação será automaticamente aplicada com cobrança pró-rata das diárias. O descumprimento das condições poderá acarretar multa de 10% sobre o valor total do contrato.',
    '4. Avarias e Manutenções — Danos causados por mau uso, negligência ou acidentes serão de inteira responsabilidade do LOCATÁRIO, e os custos de reparo serão cobrados mediante laudo técnico. O equipamento deverá ser devolvido limpo e nas mesmas condições em que foi recebido.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.secondary);

  clausulas.forEach((c) => {
    const lines = doc.splitTextToSize(c, contentWidth);
    if (y + lines.length * 4 > pageHeight - 55) {
      doc.addPage();
      y = margin + 10;
    }
    doc.text(lines, margin, y + 3);
    y += lines.length * 4 + 2;
  });

  y += 4;

  // Assinatura Eletrônica
  if (y > pageHeight - 40) {
    doc.addPage();
    y = margin + 10;
  }

  y = drawSectionTitle('ASSINATURA ELETRÔNICA', y);

  const hashRaw = `${rental.id}-${Date.now()}`;
  const hashMd5 = `MD5: ${hashRaw}`;

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, contentWidth, 20, 'S');
  doc.setFillColor(252, 252, 252);
  doc.rect(margin, y, contentWidth, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  doc.text('Token ID-EDIFICA', margin + 3, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.neutral);
  doc.text(`HASH_VERIFICATION_${hashMd5}-${rental.id.slice(-8)}${Date.now()}`, margin + 3, y + 14);

  y += 24;

  // Footer
  if (y > pageHeight - 16) {
    doc.addPage();
    y = margin + 10;
  }

  const footerY = pageHeight - 14;
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, footerY, pageWidth, 14, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.white);
  doc.text(
    'ESTE CONTRATO É VÁLIDO COMO COMPROVANTE OFICIAL DE LOCAÇÃO.',
    pageWidth / 2,
    footerY + 5,
    { align: 'center' }
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(
    `${EMPRESA.nome} | ${EMPRESA.telefone} | ${EMPRESA.email}`,
    pageWidth / 2,
    footerY + 10,
    { align: 'center' }
  );

  // Open PDF
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const safeName = (rental.clientName || 'cliente').replace(/\s+/g, '_');
  const fileName = `contrato_locacao_${identifier}_${safeName}.pdf`;

  const newWindow = window.open(pdfUrl, '_blank');
  if (!newWindow) {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    link.click();
  }
};
