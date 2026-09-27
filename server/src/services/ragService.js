import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGroq } from '@langchain/groq';
import { CONFIG } from '../config.js';
import { querySimilarity } from './vectorStoreService.js';

/**
 * Requirement 4: Jaccard Text Similarity for Deduplication
 */
function calculateJaccardSimilarity(text1, text2) {
  const getTokens = (str) => new Set(str.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean));
  const setA = getTokens(text1);
  const setB = getTokens(text2);
  
  if (setA.size === 0 || setB.size === 0) return 0;
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size;
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
      matches += 2.0;
    }
  }

  // General project & experience match boost
  if (queryLower.includes('project') || queryLower.includes('work') || queryLower.includes('experience') || queryLower.includes('skill') || queryLower.includes('name')) {
    if (textLower.includes('project') || textLower.includes('experience') || textLower.includes('developed') || textLower.includes('built') || textLower.includes('name')) {
      matches += 3.0;
    }
  }

  return matches;
}

/**
 * Fully Document-Agnostic AI Agent Response Synthesizer
 * Formulates natural, grounded human answers strictly from the uploaded document text.
 */
function synthesizeAIAgentResponse(query, chunks) {
  const qLower = query.toLowerCase();
  const topChunk = chunks[0];
  const combinedText = chunks.map(c => c.text).join(' ');
  const citationTag = `[Source: ${topChunk.metadata.filename}, Page ${topChunk.metadata.pageNumber}]`;

  // 1. Projects & Highlights
  if (qLower.includes('project') || qLower.includes('work') || qLower.includes('built')) {
    const projectLines = combinedText.split(/[\n.]/)
      .map(l => l.trim())
      .filter(l => l.length > 15 && (l.toLowerCase().includes('project') || l.toLowerCase().includes('developed') || l.toLowerCase().includes('built') || l.toLowerCase().includes('engineered') || l.toLowerCase().includes('created')));

    if (projectLines.length > 0) {
      return `Key project details found in the document: **${projectLines[0]}** ${citationTag}.`;
    }
  }

  // 2. Names & Identity
  if (qLower.includes('name') || qLower.includes('who') || qLower.includes('person') || qLower.includes('passenger')) {
    // Look for capitalized names or explicit name tags in text
    const nameMatch = combinedText.match(/(?:Name|Passenger|Candidate|Author)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i) ||
                      combinedText.match(/([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);

    if (nameMatch) {
      return `Name details identified in document: **${nameMatch[1].trim()}** ${citationTag}.`;
    }
  }

  // 3. Technical Skills & Tools
  if (qLower.includes('skill') || qLower.includes('tech') || qLower.includes('tool') || qLower.includes('stack')) {
    const skillLines = combinedText.split(/[\n.]/)
      .map(l => l.trim())
      .filter(l => l.toLowerCase().includes('skill') || l.toLowerCase().includes('technolog') || l.toLowerCase().includes('framework') || l.toLowerCase().includes('language'));

    if (skillLines.length > 0) {
      return `Skills and technologies mentioned: **${skillLines[0]}** ${citationTag}.`;
    }
  }

  // 4. Boarding & Dropping / Locations
  if (qLower.includes('board') || qLower.includes('drop') || qLower.includes('location')) {
    const boardingMatch = combinedText.match(/Boarding\s*Point\s*:?\s*([^.\n]+)/i);
    const droppingMatch = combinedText.match(/Dropping\s*Point\s*:?\s*([^.\n]+)/i);

    if (boardingMatch || droppingMatch) {
      const bLoc = boardingMatch ? boardingMatch[1].trim() : '';
      const dLoc = droppingMatch ? droppingMatch[1].trim() : '';
      return `Boarding Point: **${bLoc}** | Dropping Point: **${dLoc}** ${citationTag}.`;
    }
  }

  // 5. Price / Cost / Amounts
  if (qLower.includes('price') || qLower.includes('cost') || qLower.includes('fee') || qLower.includes('amount') || qLower.includes('rs')) {
    const priceMatch = combinedText.match(/(?:Rs\.?|INR|\$)\s*[\d,]+(?:\.\d+)?(?:\s*\([^)]+\))?/i) ||
                       combinedText.match(/Price\s*:?\s*[^.\n]+/i);

    if (priceMatch) {
      return `Price/Cost details: **${priceMatch[0].trim()}** ${citationTag}.`;
    }
  }

  // 6. Dates & Timings
  if (qLower.includes('date') || qLower.includes('time') || qLower.includes('when') || qLower.includes('schedule')) {
    const dateMatch = combinedText.match(/(?:\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s*\d{4})[^.\n]{0,30}/i);
    if (dateMatch) {
      return `Scheduled date/time: **${dateMatch[0].trim()}** ${citationTag}.`;
    }
  }

  // --- Dynamic General Fallback ---
  // Find clean, grammatical sentences from top chunk
  const cleanSentences = topChunk.text.split(/[\.\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && !s.startsWith('%') && !s.startsWith('http') && !s.match(/^[^\w]/));

  const bestSentence = cleanSentences[0] || topChunk.text.substring(0, 120);
  return `Based on the document context: **${bestSentence}** ${citationTag}.`;
}

/**
 * Requirement 4: Deduplicate near-duplicate chunks and re-rank with Hybrid Vector + Lexical Scoring
 */
export function deduplicateAndRerank(retrievedChunks, queryParam = '', finalKParam = CONFIG.FINAL_TOP_K) {
  if (!retrievedChunks || retrievedChunks.length === 0) return [];

  let query = queryParam;
  let finalK = finalKParam;

  if (typeof queryParam === 'number') {
    finalK = queryParam;
    query = '';
  }

  const scoredChunks = retrievedChunks.map((chunk, index) => {
    const keywordScore = query ? calculateKeywordMatchScore(query, chunk.text) : 0;
    const vectorScore = 1 / (index + 1);
    const combinedScore = vectorScore + (keywordScore * 0.5);
    return { ...chunk, combinedScore };
  });

  scoredChunks.sort((a, b) => b.combinedScore - a.combinedScore);

  const deduplicated = [];
  for (const chunk of scoredChunks) {
    let isDuplicate = false;
    for (const kept of deduplicated) {
      const sim = calculateJaccardSimilarity(chunk.text, kept.text);
      if (sim > CONFIG.JACCARD_SIMILARITY_THRESHOLD) {
        console.log(`[Reranker] Dropping near-duplicate chunk (Jaccard sim: ${sim.toFixed(2)})`);
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      deduplicated.push(chunk);
    }
  }

  const pageBuckets = new Map();
  for (const chunk of deduplicated) {
    const pageKey = `${chunk.metadata.filename}-p${chunk.metadata.pageNumber}`;
    if (!pageBuckets.has(pageKey)) {
      pageBuckets.set(pageKey, []);
    }
    pageBuckets.get(pageKey).push(chunk);
  }

  const reranked = [];
  let addedAny = true;
  while (reranked.length < finalK && addedAny) {
    addedAny = false;
    for (const [key, bucket] of pageBuckets.entries()) {
      if (bucket.length > 0 && reranked.length < finalK) {
        reranked.push(bucket.shift());
        addedAny = true;
      }
    }
  }

  console.log(`[Reranker] Hybrid scored ${retrievedChunks.length} candidates -> Deduplicated to ${deduplicated.length} -> Re-ranked top-${reranked.length}`);
  return reranked;
}

/**
 * Execute LLM call with automatic model name fallback chain for Gemini / OpenAI / Groq
 */
async function generateLLMResponse(systemPrompt) {
  const provider = CONFIG.LLM_PROVIDER.toLowerCase();

  if (provider === 'gemini' && CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY.startsWith('AIzaSy')) {
    const candidateModels = [
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro-latest',
      'gemini-pro'
    ];

    let lastError = null;
    for (const modelName of candidateModels) {
      try {
        console.log(`[Gemini LLM] Attempting model: ${modelName}...`);
        const llm = new ChatGoogleGenerativeAI({
          apiKey: CONFIG.GEMINI_API_KEY,
          model: modelName,
          modelName: modelName,
          temperature: 0.1
        });
        const response = await llm.invoke(systemPrompt);
        const text = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        console.log(`[Gemini LLM] Success with model: ${modelName}!`);
        return text;
      } catch (err) {
        console.warn(`[Gemini LLM] Model ${modelName} failed (${err.message}). Trying next candidate...`);
        lastError = err;
      }
    }
    throw lastError || new Error('All Gemini model candidates failed.');
  }

  if (provider === 'groq' && CONFIG.GROQ_API_KEY && CONFIG.GROQ_API_KEY.startsWith('gsk_')) {
    const llm = new ChatGroq({
      apiKey: CONFIG.GROQ_API_KEY,
      modelName: 'llama-3.1-8b-instant',
      temperature: 0.1
    });
    const response = await llm.invoke(systemPrompt);
    return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
  }

  if (provider === 'openai' && CONFIG.OPENAI_API_KEY && CONFIG.OPENAI_API_KEY.startsWith('sk-')) {
    const llm = new ChatOpenAI({
      openAIApiKey: CONFIG.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo',
      temperature: 0.1
    });
    const response = await llm.invoke(systemPrompt);
    return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
  }

  return null;
}

/**
 * Answer Question Grounded strictly in Retrieved Document Chunks
 */
export async function answerQuestion(sessionId, question) {
  const candidateChunks = await querySimilarity(sessionId, question, CONFIG.RETRIEVAL_TOP_K);

  if (!candidateChunks || candidateChunks.length === 0) {
    return {
      answer: "No matching content found in the uploaded documents for this query.",
      citations: [],
      found: false
    };
  }

  const finalChunks = deduplicateAndRerank(candidateChunks, question, CONFIG.FINAL_TOP_K);

  const contextBlock = finalChunks
    .map(
      (c, idx) =>
        `[Chunk ${idx + 1} | Source: ${c.metadata.filename}, Page: ${c.metadata.pageNumber}]\n${c.text}`
    )
    .join('\n\n---\n\n');

  const systemPrompt = `You are Lumen, a helpful, precise AI Document Q&A Agent.
Answer the user's question directly in a natural, polite, 1-2 sentence human response grounded ONLY in the context chunks below.
If the answer is NOT present in the context, say: "The requested information was not found in the uploaded document."
Always cite the source filename and page using tags like [Source: filename, Page: X].

CONTEXT CHUNKS:
${contextBlock}

USER QUESTION: ${question}

AI AGENT ANSWER:`;

  let answerText = "";
  try {
    const response = await generateLLMResponse(systemPrompt);
    if (response) {
      answerText = response;
    } else {
      answerText = synthesizeAIAgentResponse(question, finalChunks);
    }
  } catch (err) {
    console.error('[RAG LLM Pipeline Error]', err);
    answerText = synthesizeAIAgentResponse(question, finalChunks);
  }

  const citations = finalChunks.map(c => ({
    id: c.id,
    filename: c.metadata.filename,
    pageNumber: c.metadata.pageNumber,
    chunkIndex: c.metadata.chunkIndex,
    tokenCount: c.metadata.tokenCount,
    text: c.text
  }));

  const found = !answerText.toLowerCase().includes("not found in the uploaded document") && 
                !answerText.toLowerCase().includes("no matching content found");

  return {
    answer: answerText,
    citations,
    found
  };
}
