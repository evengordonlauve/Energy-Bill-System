export function createPrintView(element: HTMLElement) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write('<html><head><title>Print</title></head><body>');
  win.document.write(element.outerHTML);
  win.document.write('</body></html>');
  win.document.close();
  win.focus();
  win.print();
}

export async function generatePDF(element: HTMLElement, filename: string, _opts?: { orientation?: 'landscape' | 'portrait' }) {
  // Fallback to print dialog for PDF generation
  createPrintView(element);
}
