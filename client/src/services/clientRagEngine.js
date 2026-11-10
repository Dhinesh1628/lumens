/**
 * Client-Side Grounded RAG & Document Processing Engine
 * Enables Lumen to run 100% autonomously in standalone/Vercel deployments
 * while seamlessly delegating to the backend server when connected.
 */

// In-memory client document cache: Map<sessionId, { filename, pageCount, chunkCount, chunks }>
const clientDocuments = new Map();

/**
 * Extract pages from PDF or TXT in the browser
 */
export async function extractDocumentPages(file) {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    const rawText = await file.text();
    if (!rawText.trim()) {
      throw new Error('Text file is empty.');
    }
    // Break into pages by form feeds or 2000-character blocks
    const rawPages = rawText.split(/\f|\n{4,}/).filter(p => p.trim());
    if (rawPages.length === 0) {
      return [{ pageNumber: 1, text: rawText.trim() }];
    }
    return rawPages.map((text, idx) => ({ pageNumber: idx + 1, text: text.trim() }));
  }

  // PDF Text Extraction using pdfjs-dist
  const arrayBuffer = await file.arrayBuffer();
  try {
    const pdfjsLib = await import('pdfjs-dist');
    // Configure worker for browser runtime
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const pages = [];

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ').trim();
      if (pageText) {
        pages.push({ pageNumber: pageNum, text: pageText });
      }
    }

    if (pages.length === 0) {
      // Fallback: scanned/empty PDF
      return [{ pageNumber: 1, text: `[PDF: ${file.name} (Scanned or image-only content)]` }];
    }

    return pages;
  } catch (pdfErr) {
    console.warn('[Client PDF Parser] pdfjs-dist failed, attempting raw stream extraction:', pdfErr);
    // Fallback simple string extraction for basic PDFs
    const textDecoder = new TextDecoder('latin1');
    const raw = textDecoder.decode(arrayBuffer);
    const matches = raw.match(/\(([^()]{3,})\)[\s]*Tj/g);
    if (matches && matches.length > 0) {
      const extracted = matches.map(m => m.replace(/^\(|\)[\s]*Tj$/g, '')).join(' ');
      return [{ pageNumber: 1, text: extracted }];
    }
    throw new Error('Unable to parse PDF text. Please ensure the document contains selectable text or upload a .txt file.');
  }
}

/**
 * Token/Word Chunking with overlap
 */
export function chunkPages(pages, filename) {
  const chunks = [];
  const TARGET_WORDS = 250;
  const OVERLAP_WORDS = 30;

  let globalChunkIndex = 1;

  for (const page of pages) {
    const words = page.text.split(/\s+/).filter(Boolean);
    if (words.length <= TARGET_WORDS) {
      chunks.push({
        id: `${filename}_p${page.pageNumber}_c${globalChunkIndex++}`,
        text: words.join(' '),
        metadata: {
          filename,
          pageNumber: page.pageNumber,
          chunkIndex: globalChunkIndex
        }
      });
      continue;
    }

    let i = 0;
    while (i < words.length) {
      const slice = words.slice(i, i + TARGET_WORDS);
      chunks.push({
        id: `${filename}_p${page.pageNumber}_c${globalChunkIndex++}`,
        text: slice.join(' '),
        metadata: {
          filename,
          pageNumber: page.pageNumber,
          chunkIndex: globalChunkIndex
        }
      });
      i += (TARGET_WORDS - OVERLAP_WORDS);
    }
  }

  return chunks;
}

/**
 * Store indexed document in client memory
 */
export function storeClientDocument(sessionId, filename, pages, chunks) {
  clientDocuments.set(sessionId, {
    filename,
    pageCount: pages.length,
    chunkCount: chunks.length,
    chunks,
    indexedAt: Date.now()
  });

  return {
    success: true,
    sessionId,
    filename,
    pageCount: pages.length,
    chunkCount: chunks.length
  };
}

/**
 * Query-driven Lexical Match Score
 */
function calculateKeywordMatchScore(query, text) {
  if (typeof query !== 'string') return 0;
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  let matches = 0;
  const queryWords = queryLower.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);

  for (const word of queryWords) {
    if (textLower.includes(word)) {
      matches += 3.0;
    }
  }

  // Exact phrase match bonus
  if (textLower.includes(queryLower)) {
    matches += 10.0;
  }

  return matches;
}

/**
 * Grounded Response Synthesizer
 */
function synthesizeResponse(query, chunks) {
  const topChunk = chunks[0];
  const combinedText = chunks.map(c => c.text).join(' ');
  const qLower = query.toLowerCase();
  const citationTag = `[Source: ${topChunk.metadata.filename}, Page ${topChunk.metadata.pageNumber}]`;

  // Filter relevant sentences from top chunks
  const sentences = combinedText
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const queryKeywords = qLower.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  const scoredSentences = sentences.map(s => {
    const sLower = s.toLowerCase();
    let score = 0;
    for (const kw of queryKeywords) {
      if (sLower.includes(kw)) score += 2;
    }
    return { text: s, score };
  });

  scoredSentences.sort((a, b) => b.score - a.score);
  const bestSentences = scoredSentences.filter(s => s.score > 0).slice(0, 3);

  if (bestSentences.length > 0) {
    const summary = bestSentences.map(s => s.text).join(' ');
    return `Based on **${topChunk.metadata.filename}**:

> "${summary}"

${citationTag}`;
  }

  // Dynamic fallback
  const fallback = sentences[0] || topChunk.text.substring(0, 150);
  return `According to **${topChunk.metadata.filename}** (Page ${topChunk.metadata.pageNumber}):

"${fallback}..."

${citationTag}`;
}

/**
 * Client-Side Query Execution
 */
export async function queryClientDocument(sessionId, question) {
  const doc = clientDocuments.get(sessionId);
  if (!doc || !doc.chunks || doc.chunks.length === 0) {
    return {
      success: false,
      answer: "No active document was found for this session. Please upload a document first.",
      citations: [],
      found: false
    };
  }

  // Score chunks
  const scored = doc.chunks.map(chunk => ({
    chunk,
    score: calculateKeywordMatchScore(question, chunk.text)
  }));

  scored.sort((a, b) => b.score - a.score);
  const topCandidates = scored.slice(0, 3).map(item => item.chunk);

  if (topCandidates.length === 0) {
    return {
      success: true,
      answer: "The uploaded document does not contain relevant information to answer this question.",
      citations: [],
      found: false
    };
  }

  const answer = synthesizeResponse(question, topCandidates);
  const citations = topCandidates.map((c, idx) => ({
    rank: idx + 1,
    pageNumber: c.metadata.pageNumber,
    chunkIndex: c.metadata.chunkIndex,
    filename: c.metadata.filename,
    snippet: c.text.length > 180 ? c.text.substring(0, 180) + '...' : c.text
  }));

  return {
    success: true,
    answer,
    citations,
    found: true
  };
}
