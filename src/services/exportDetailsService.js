import html2pdf from 'html2pdf.js';

export class exportDetailsService {
  static exportOrderToPDF(order, elementId = 'order-detail-content') {
    const content = document.getElementById(elementId);
    const opt = {
      margin: 10,
      filename: `ordre_fabrication_${order?.ref || 'inconnu'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(content).save();
  }
}