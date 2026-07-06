const logger = require('../utils/logger');

/**
 * AI Service — Gemini API integration with graceful mock fallback.
 * When GEMINI_API_KEY is not set, returns intelligent mock responses.
 */

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    logger.info('✅ Gemini AI initialized');
  } catch (e) {
    logger.warn('⚠️  Failed to initialize Gemini AI:', e.message);
  }
} else {
  logger.warn('⚠️  GEMINI_API_KEY not set. AI features will use mock responses.');
}

/**
 * Answer a user's FAQ question using active FAQs as context.
 */
exports.answerFAQ = async (userQuestion, faqs) => {
  if (!genAI) {
    return mockFAQAnswer(userQuestion, faqs);
  }

  try {
    const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const faqContext = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');

    const prompt = `You are a helpful assistant for EcoSurvey, an environmental awareness survey portal at an educational institution.

Your knowledge is strictly limited to the following FAQ database:
---
${faqContext}
---

User's question: "${userQuestion}"

Instructions:
- Answer ONLY based on the FAQ context above.
- If the question is not covered in the FAQs, respond with: "I don't have information about that. Please contact Admin through the Support page."
- Be concise and friendly.
- Respond in English.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    logger.error('Gemini answerFAQ error:', err.message);
    return mockFAQAnswer(userQuestion, faqs);
  }
};

/**
 * Summarize a participation report description.
 */
exports.summarizeReport = async (description, eventName) => {
  if (!genAI) {
    return mockSummary(description, eventName);
  }

  try {
    const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Summarize the following environmental activity report in 2-3 concise sentences. Be objective and professional.

Event: ${eventName}
Report: ${description}

Provide only the summary, no introduction or extra text.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    logger.error('Gemini summarizeReport error:', err.message);
    return mockSummary(description, eventName);
  }
};

// ── Mock responses when no API key ───────────────────────────
function mockFAQAnswer(question, faqs) {
  const q = question.toLowerCase();
  // Simple keyword match against FAQs
  for (const faq of faqs) {
    const words = faq.question.toLowerCase().split(/\s+/);
    const matchCount = words.filter((w) => w.length > 3 && q.includes(w)).length;
    if (matchCount >= 2) return faq.answer;
  }
  return "I don't have information about that specific topic. Please contact Admin through the Support page for further assistance.";
}

function mockSummary(description, eventName) {
  const sentences = description.replace(/\s+/g, ' ').trim().split(/[.!?]+/).filter(Boolean);
  const first2 = sentences.slice(0, 2).join('. ').trim();
  return `${first2}. This environmental activity report for "${eventName}" demonstrates active participation in sustainability initiatives.`;
}
