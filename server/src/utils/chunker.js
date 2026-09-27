import { getEncoding } from 'js-tiktoken';
import { CONFIG } from '../config.js';

let tokenizerInstance = null;

function getTokenizer() {
  if (!tokenizerInstance) {
    tokenizerInstance = getEncoding('cl100k_base');
  }
  return tokenizerInstance;
}

/**
 * Requirement 3: Token-Accurate Chunking using js-tiktoken
 * Split text into chunks bounded by actual token count.
 */
export function chunkPages(pages, filename) {
  const tokenizer = getTokenizer();
  const chunks = [];
  let totalChunkIndex = 0;

  for (const page of pages) {
    const text = page.text;
    if (!text || text.trim().length === 0) continue;

    const tokens = tokenizer.encode(text);
    if (tokens.length === 0) continue;

    const targetTokens = CONFIG.TARGET_CHUNK_TOKENS;
    const overlapTokens = CONFIG.CHUNK_OVERLAP_TOKENS;
    const step = targetTokens - overlapTokens;

    for (let start = 0; start < tokens.length; start += step) {
      const end = Math.min(start + targetTokens, tokens.length);
      const chunkTokens = tokens.slice(start, end);
      const chunkText = tokenizer.decode(chunkTokens);

      totalChunkIndex++;
      const actualTokenCount = chunkTokens.length;

      console.log(
        `[Chunker] File: "${filename}" | Page: ${page.pageNumber} | Chunk Index: ${totalChunkIndex} | Token Count: ${actualTokenCount}`
      );

      chunks.push({
        id: `${filename}-p${page.pageNumber}-c${totalChunkIndex}`,
        text: chunkText,
        metadata: {
          filename,
          pageNumber: page.pageNumber,
          chunkIndex: totalChunkIndex,
          tokenCount: actualTokenCount
        }
      });

      if (end >= tokens.length) break;
    }
  }

  return chunks;
}
