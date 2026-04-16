import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (data, fileName) => {
  const ws = XLSX.utils.json_to_sheet(data.map(item => ({
    Año: item.year,
    Mes: item.month,
    Categoría: item.name,
    Monto: item.amount,
    Estado: item.status === 'paid' ? 'Pagado' : 'Pendiente',
    'Fecha Pago': item.payment_date || '-',
    Notas: item.notes || ''
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Finanzas");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPDF = (data, title) => {
  const doc = jsPDF();
  doc.text(title, 14, 15);
  
  const tableColumn = ["Categoría", "Monto", "Estado", "Fecha Pago", "Notas"];
  const tableRows = data.map(item => [
    item.name,
    `$${item.amount.toLocaleString()}`,
    item.status === 'paid' ? 'Pagado' : 'Pendiente',
    item.payment_date || '-',
    item.notes || ''
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    theme: 'grid',
    headStyles: { fillStyle: '#6366f1' }
  });

  doc.save(`${title.toLowerCase().replace(/ /g, '_')}.pdf`);
};
