import jsPDF from 'jspdf';

export const generateTicketPDF = (booking) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 140] // Dimensions like a receipt/ticket
  });

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 80, 140, 'F');

  // Header
  doc.setFillColor(63, 13, 18); // #3F0D12
  doc.rect(0, 0, 80, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('times', 'bold');
  doc.text("Hair Ways", 40, 12, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text("Booking Confirmation", 40, 18, { align: 'center' });

  // Token Number
  doc.setTextColor(63, 13, 18);
  doc.setFontSize(10);
  doc.text("QUEUE TOKEN", 40, 35, { align: 'center' });
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(String(booking.token_number), 40, 48, { align: 'center' });

  // Details
  let y = 60;
  const addRow = (label, value) => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150); // Gray
    doc.text(label.toUpperCase(), 10, y);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Black
    doc.text(String(value), 70, y, { align: 'right' });
    y += 10;
  };

  doc.setDrawColor(230, 230, 230);
  doc.line(10, 55, 70, 55); // Divider

  addRow("Date", booking.booking_date);
  addRow("Time", booking.booking_time);
  addRow("Stylist", booking.employee_details?.user_details?.username || "Any");

  // Services
  y += 5;
  doc.line(10, y - 5, 70, y - 5);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("SERVICES", 10, y);
  y += 5;

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  if (booking.items && booking.items.length > 0) {
    booking.items.forEach(item => {
      doc.text(`• ${item.service_name}`, 10, y);
      y += 5;
    });
  } else {
    doc.text("• Custom Service", 10, y);
  }

  // Footer
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 125, 80, 15, 'F');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("Thank you for choosing Hair Ways!", 40, 132, { align: 'center' });
  doc.text("Please arrive 5 mins early.", 40, 136, { align: 'center' });

  // Save
  doc.save(`HairWays_Ticket_${booking.token_number}.pdf`);
};