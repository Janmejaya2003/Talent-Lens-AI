import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ScorecardData } from '../types';

/**
 * Exports a DOM element to PDF.
 */
export async function exportToPdf(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Export element not found:', elementId);
    throw new Error('Could not find the report content to export. please try again.');
  }

  try {
    console.log('Starting PDF Export for:', elementId);
    
    // 1. Ensure fonts are ready
    if ('fonts' in document) {
      await (document as any).fonts.ready;
    }

    // 2. Prepare screen for capture
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Slightly longer wait

    // 3. Capture with safe settings
    const canvas = await html2canvas(element, {
      scale: 1.5, // Reduced scale for better performance/reliability
      useCORS: true,
      allowTaint: true,
      logging: true, // Enable logging for debugging
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.backgroundColor = '#ffffff';
          clonedElement.style.padding = '40px';
          clonedElement.style.width = '1200px';
        }
        
        // AGGRESSIVE OKLCH SANITIZATION
        // html2canvas 1.4.x crashes on modern CSS color functions like oklch/oklab
        
        // 1. Process all style tags in the cloned document
        const styles = clonedDoc.getElementsByTagName('style');
        for (let i = 0; i < styles.length; i++) {
          const style = styles[i];
          if (style.innerHTML.includes('oklch') || style.innerHTML.includes('oklab')) {
            // Replace all oklch/oklab calls with a safe hex blue or gray
            style.innerHTML = style.innerHTML
              .replace(/oklch\([^)]+\)/g, '#3b82f6')
              .replace(/oklab\([^)]+\)/g, '#3b82f6')
              .replace(/color-mix\([^)]+\)/g, '#e2e8f0');
          }
        }

        // 2. Process all elements for inline styles and attributes
        const all = clonedDoc.getElementsByTagName('*');
        const colorProps = ['color', 'background-color', 'background', 'border-color', 'fill', 'stroke', 'outline-color', 'stop-color'];
        
        for (let i = 0; i < all.length; i++) {
          const el = all[i] as HTMLElement;
          
          // Disable animations/transitions/shadows
          el.style.animation = 'none';
          el.style.transition = 'none';
          el.style.boxShadow = 'none';
          el.style.backdropFilter = 'none';
          
          // Check inline styles
          colorProps.forEach(prop => {
            try {
              const val = el.style.getPropertyValue(prop);
              if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('color-mix'))) {
                // Fallback to safe colors
                if (prop.includes('background')) el.style.setProperty(prop, '#ffffff', 'important');
                else if (prop === 'color') el.style.setProperty(prop, '#0f172a', 'important');
                else el.style.setProperty(prop, '#3b82f6', 'important');
              }
            } catch (e) {}
          });

          // Check style attribute string directly (brute force)
          const styleAttr = el.getAttribute('style');
          if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab'))) {
            const cleaned = styleAttr
              .replace(/oklch\([^)]+\)/g, '#3b82f6')
              .replace(/oklab\([^)]+\)/g, '#3b82f6')
              .replace(/color-mix\([^)]+\)/g, '#e2e8f0');
            el.setAttribute('style', cleaned);
          }
        }
      }
    });

    console.log('Canvas captured successfully. Generating PDF...');

    // 4. Convert to PDF using optimized image format
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    const imgWidth = 595.28; // A4 width in pts
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [imgWidth, imgHeight]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    
    // 5. Manual Download Trigger (More reliable than pdf.save in some iframes)
    const pdfOutput = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfOutput);
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = `${filename}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    }, 500);

    console.log('PDF Download triggered successfully.');
    return true;
  } catch (error: any) {
    console.error('CRITICAL PDF EXPORT FAILURE:', error);
    throw new Error(`Failed to generate PDF: ${error.message || 'Unknown capture error'}`);
  }
}

/**
 * Exports history data to CSV.
 */
export function exportToCsv(data: ScorecardData[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = ['Candidate Name', 'Email', 'Score', 'Timestamp', 'Technical Skills', 'Soft Skills'];
  const rows = data.map(record => [
    record.candidateName,
    record.email,
    record.score,
    new Date(record.timestamp).toLocaleString(),
    record.evaluation?.skills?.technical?.join('; ') || '',
    record.evaluation?.skills?.soft?.join('; ') || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Exports raw text data to a file.
 */
export function exportToTxt(content: string, filename: string) {
  if (!content) return;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.txt`;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
