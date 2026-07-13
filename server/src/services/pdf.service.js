const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

/**
 * Generate a simple invoice PDF for an order and return base64 encoded string.
 * In production, upload to Cloudinary and return the URL.
 */
const generateInvoice = async (order, payment) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const green = rgb(0.106, 0.478, 0.239);
  const dark = rgb(0.1, 0.1, 0.1);
  const gray = rgb(0.5, 0.5, 0.5);

  let y = 800;

  // Header
  page.drawRectangle({ x: 0, y: 820, width: 595, height: 45, color: green });
  page.drawText('AI FARMER MARKETPLACE', { x: 150, y: 830, size: 18, font: boldFont, color: rgb(1, 1, 1) });

  y -= 30;
  page.drawText('INVOICE', { x: 40, y, size: 24, font: boldFont, color: green });
  page.drawText(`#${payment.id.slice(0, 8).toUpperCase()}`, { x: 300, y, size: 14, font, color: gray });

  y -= 30;
  page.drawText(`Date: ${new Date().toLocaleDateString('en-IN')}`, { x: 40, y, size: 11, font, color: dark });
  page.drawText(`Status: ${payment.status}`, { x: 300, y, size: 11, font, color: green });

  y -= 20;
  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });

  y -= 25;
  page.drawText('Bill To:', { x: 40, y, size: 11, font: boldFont, color: dark });
  page.drawText(order.buyer?.name || 'Buyer', { x: 40, y: y - 15, size: 11, font, color: dark });

  y -= 50;
  // Table header
  page.drawRectangle({ x: 40, y: y - 5, width: 515, height: 20, color: rgb(0.9, 0.95, 0.9) });
  page.drawText('Item', { x: 45, y, size: 10, font: boldFont, color: dark });
  page.drawText('Qty', { x: 280, y, size: 10, font: boldFont, color: dark });
  page.drawText('Unit Price', { x: 360, y, size: 10, font: boldFont, color: dark });
  page.drawText('Total', { x: 460, y, size: 10, font: boldFont, color: dark });

  y -= 25;
  for (const item of (order.items || [])) {
    page.drawText(item.product?.name || 'Product', { x: 45, y, size: 10, font, color: dark });
    page.drawText(`${item.quantity} ${item.product?.unit || ''}`, { x: 280, y, size: 10, font, color: dark });
    page.drawText(`₹${item.price.toFixed(2)}`, { x: 360, y, size: 10, font, color: dark });
    page.drawText(`₹${(item.quantity * item.price).toFixed(2)}`, { x: 460, y, size: 10, font, color: dark });
    y -= 20;
  }

  y -= 10;
  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  y -= 20;
  page.drawText('Total Amount:', { x: 360, y, size: 12, font: boldFont, color: dark });
  page.drawText(`₹${payment.amount.toFixed(2)}`, { x: 460, y, size: 12, font: boldFont, color: green });

  y -= 20;
  page.drawText(`Payment Method: ${payment.method}`, { x: 40, y, size: 10, font, color: gray });

  y -= 40;
  page.drawText('Thank you for supporting Indian farmers! 🌱', { x: 120, y, size: 11, font: boldFont, color: green });

  const pdfBytes = await pdfDoc.save();
  return `data:application/pdf;base64,${Buffer.from(pdfBytes).toString('base64')}`;
};

module.exports = { generateInvoice };
