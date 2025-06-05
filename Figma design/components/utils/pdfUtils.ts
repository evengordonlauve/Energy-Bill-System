
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Generate a PDF from a HTML element
export const generatePDF = async (
  element: HTMLElement, 
  filename: string = 'download.pdf',
  options = { 
    quality: 2, 
    format: 'a4',
    orientation: 'portrait' as 'portrait' | 'landscape'
  }
) => {
  try {
    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      scale: options.quality,
      logging: false,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Initialize PDF document
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.format
    });

    // Calculate dimensions
    const imgWidth = options.orientation === 'portrait' ? 210 : 297; // A4 width in portrait or landscape
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Save or return the PDF
    pdf.save(filename);
    
    return {
      success: true,
      message: 'PDF generated successfully',
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      success: false,
      message: 'Failed to generate PDF',
      error
    };
  }
};

// Create a printable version of a component
export const createPrintView = (content: HTMLElement) => {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    console.error('Unable to open print window');
    return null;
  }
  
  const documentContent = content.cloneNode(true);
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print View</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .logo {
            font-weight: bold;
            font-size: 24px;
          }
          .date {
            text-align: right;
          }
          @media print {
            body {
              padding: 0;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="printable-content"></div>
      </body>
    </html>
  `);
  
  printWindow.document.querySelector('.printable-content')!.appendChild(documentContent);
  
  setTimeout(() => {
    printWindow.print();
  }, 500);
  
  return printWindow;
};
