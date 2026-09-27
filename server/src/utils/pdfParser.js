import pdfParse from 'pdf-parse';

/**
 * Requirement 2: Real Page-Number Tracking for PDFs
 * Uses custom render_page function to capture text per page before chunking.
 */
export async function extractPdfPages(pdfBuffer) {
  const pageMap = [];

  const customPagerender = (pageData) => {
    return pageData.getTextContent().then((textContent) => {
      let lastY, text = '';
      for (const item of textContent.items) {
        if (!item.str || !item.str.trim()) continue;
        if (lastY === item.transform[5] || !lastY) {
          text += ' ' + item.str;
        } else {
          text += '\n' + item.str;
        }
        lastY = item.transform[5];
      }
      
      const pageNum = pageData.pageIndex + 1; // 1-indexed page number
      pageMap.push({
        pageNumber: pageNum,
        text: text.replace(/\s+/g, ' ').trim()
      });
      return text;
    });
  };

  const options = {
    pagerender: customPagerender
  };

  await pdfParse(pdfBuffer, options);

  pageMap.sort((a, b) => a.pageNumber - b.pageNumber);
  return pageMap;
}

/**
 * Extract text from plain text buffer
 */
export function extractTxtPages(txtBuffer) {
  const text = txtBuffer.toString('utf-8');
  return [{ pageNumber: 1, text: text.trim() }];
}
