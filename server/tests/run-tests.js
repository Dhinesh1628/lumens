import assert from 'assert';
import { extractPdfPages, extractTxtPages } from '../src/utils/pdfParser.js';
import { chunkPages } from '../src/utils/chunker.js';
import { deduplicateAndRerank } from '../src/services/ragService.js';
import { generateEmbedding, initEmbeddingModel } from '../src/services/embeddingService.js';
import { CONFIG } from '../src/config.js';

async function runTests() {
  console.log('\n🧪 --- STARTING LUMEN BACKEND VERIFICATION TESTS --- 🧪\n');

  // Test 1: Embedding Dimension Safety (384 dimensions)
  console.log('Test 1: Embedding Model & Dimension Safety (384 dims)');
  await initEmbeddingModel();
  const testVec = await generateEmbedding('Testing embedding output dimensions');
  assert.strictEqual(testVec.length, CONFIG.EMBEDDING_DIM, `Embedding vector must be exactly ${CONFIG.EMBEDDING_DIM} dims`);
  console.log(`✅ Passed: Embedding model pinned to ${CONFIG.EMBEDDING_MODEL} returning ${testVec.length} dimensions.\n`);

  // Test 2: Real Page Number Tracking for PDFs & Token-Accurate Chunking
  console.log('Test 2: Page-Accurate Extraction & Token Chunking');
  const mockPages = [
    { pageNumber: 1, text: 'This is the content on page one of our security policy report.' },
    { pageNumber: 2, text: 'This is the content on page two discussing data encryption standards and key rotation.' },
    { pageNumber: 3, text: 'This is page three with details on compliance and auditing guidelines.' }
  ];

  const chunks = chunkPages(mockPages, 'security_policy.pdf');
  assert(chunks.length >= 3, 'Should produce at least 3 chunks for 3 pages');
  assert.strictEqual(chunks[0].metadata.pageNumber, 1, 'Chunk 1 must belong to page 1');
  assert.strictEqual(chunks[1].metadata.pageNumber, 2, 'Chunk 2 must belong to page 2');
  assert.strictEqual(chunks[2].metadata.pageNumber, 3, 'Chunk 3 must belong to page 3');
  assert(chunks[0].metadata.tokenCount > 0, 'Chunk must contain a valid token count');
  console.log(`✅ Passed: Per-page tracking confirmed. Page 1 -> ${chunks[0].metadata.pageNumber}, Page 2 -> ${chunks[1].metadata.pageNumber}, Page 3 -> ${chunks[2].metadata.pageNumber}.\n`);

  // Test 3: Deduplication of Near-Duplicate Chunks & Re-ranking
  console.log('Test 3: Jaccard Deduplication & Re-ranking');
  const duplicateCandidates = [
    { id: 'c1', text: 'Data encryption is mandatory for all user databases and backups.', metadata: { filename: 'doc.pdf', pageNumber: 1 } },
    { id: 'c2', text: 'Data encryption is mandatory for all user databases and backups.', metadata: { filename: 'doc.pdf', pageNumber: 1 } }, // Exact duplicate
    { id: 'c3', text: 'Data encryption is mandatory for user databases and backup storage.', metadata: { filename: 'doc.pdf', pageNumber: 1 } }, // Near duplicate
    { id: 'c4', text: 'Password policies require a minimum length of 16 characters.', metadata: { filename: 'doc.pdf', pageNumber: 2 } }  // Distinct topic
  ];

  const reranked = deduplicateAndRerank(duplicateCandidates, 4);
  assert.strictEqual(reranked.length, 2, 'Should deduplicate 4 chunks down to 2 distinct topics');
  assert.strictEqual(reranked[0].id, 'c1', 'First chunk should be preserved');
  assert.strictEqual(reranked[1].id, 'c4', 'Distinct chunk should be preserved');
  console.log('✅ Passed: Near-duplicate chunks filtered successfully before LLM context generation.\n');

  console.log('🎉 --- ALL BACKEND UNIT TESTS PASSED SUCCESSFULLY! --- 🎉\n');
}

runTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
