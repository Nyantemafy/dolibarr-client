import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import { statusLabels } from '../utils/orderConstants';

export class ExportService {
  static exportToCSV(orders) {
    const csvHeaders = [
      'Référence',
      'Produit',
      'Quantité',
      'État',
      'Date création',
      'Date début prévue',
      'Date fin prévue'
    ];

    const csvData = orders.map(order => [
      order.ref,
      order.label,
      order.product?.label || order.product_ref,
      order.qty,
      statusLabels[order.status]?.label || 'Inconnu',
      new Date(order.date_creation).toLocaleDateString('fr-FR'),
      order.date_start_planned ? new Date(order.date_start_planned).toLocaleDateString('fr-FR') : '',
      order.date_end_planned ? new Date(order.date_end_planned).toLocaleDateString('fr-FR') : ''
    ]);

    let csvContent = '\uFEFF';
    csvContent += csvHeaders.join(';') + '\n';
    csvData.forEach(row => {
      csvContent += row.map(field => `"${field}"`).join(';') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `ordres_fabrication_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportToPDF(orders) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Export des Ordres de Fabrication', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Export du: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 15;

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const statusConfig = statusLabels[order.status];

      if (yPosition > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Ordre: ${order.ref}`, margin, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      const details = [
        `Produit: ${order.product?.label || order.product_ref}`,
        `Quantité: ${order.qty} unités`,
        `État: ${statusConfig.label}`,
        `Date création: ${new Date(order.date_creation).toLocaleDateString('fr-FR')}`,
        order.date_start_planned && `Début prévu: ${new Date(order.date_start_planned).toLocaleDateString('fr-FR')}`,
        order.date_end_planned && `Fin prévue: ${new Date(order.date_end_planned).toLocaleDateString('fr-FR')}`
      ].filter(Boolean);

      details.forEach(detail => {
        if (yPosition > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(detail, margin, yPosition);
        yPosition += 5;
      });

      yPosition += 5;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
    }

    doc.save(`ordres_fabrication_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static exportToPDFWithTable(orders) {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Liste des Ordres de Fabrication', 14, 15);
    doc.setFontSize(10);
    doc.text(`Export du: ${new Date().toLocaleDateString('fr-FR')}`, 14, 22);

    const tableData = orders.map(order => [
      order.ref,
      order.label,
      order.product?.label || order.product_ref,
      order.qty.toString(),
      statusLabels[order.status]?.label || 'Inconnu',
      new Date(order.date_creation).toLocaleDateString('fr-FR')
    ]);

    const headers = ['Référence', 'Produit', 'Quantité', 'État', 'Date Création'];

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    doc.save(`ordres_fabrication_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
