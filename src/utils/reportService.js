// utils/reportService.js
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate PDF report
export const generatePdfReport = async (userData, transactions) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Add content to PDF
  page.drawText('Gold Trading Report', {
    x: 50,
    y: height - 50,
    size: 24,
    font,
    color: rgb(0, 0, 0)
  });
  
  // Add transaction details
  let yPosition = height - 100;
  transactions.forEach((transaction, index) => {
    page.drawText(`${index + 1}. ${transaction.type} - ${transaction.weight}g`, {
      x: 50,
      y: yPosition,
      size: 12,
      font
    });
    yPosition -= 20;
  });
  
  return await pdfDoc.save();
};

// Send email with PDF attachment
export const sendEmailWithPdf = async (email, pdfBuffer, reportType) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your Gold Trading ${reportType} Report`,
    text: `Please find attached your ${reportType} gold trading report.`,
    attachments: [{
      filename: `gold_report_${Date.now()}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }]
  };
  
  await transporter.sendMail(mailOptions);
};

// Get users who want reports
export const getSubscribedUsers = async () => {
  const q = query(
    collection(db, 'users'),
    where('reports.subscribed', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};