import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using Vite's bundled worker URL
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  // Try to use the bundled worker first, fallback to CDN if it looks incorrect
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker || `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

/**
 * Extracts raw text from PDF, DOCX, and TXT files.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  try {
    if (extension === 'pdf') {
       return await extractTextFromPDF(file);
    } else if (extension === 'docx') {
       return await extractTextFromDOCX(file);
    } else if (extension === 'txt') {
       return await file.text();
    } else {
       throw new Error("Unsupported file format. Please upload PDF, DOCX, or TXT.");
    }
  } catch (error: any) {
    console.error("Text extraction failed:", error);
    if (error.message?.includes("worker")) {
      throw new Error("PDF Worker failed to initialize. Please try refreshing the page or using a different browser.");
    }
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n";
  }
  
  return fullText;
}

async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
