/**
 * @module AIService
 * @description Tích hợp API trí tuệ nhân tạo (Gemini thông qua OpenRouter API) nhằm hỗ trợ Chatbot tư vấn FAQ và tự động tóm tắt báo cáo minh chứng ngoại khóa. Tự động fallback dữ liệu giả lập (mock) khi chưa cấu hình API Key.
 * 
 * @function callOpenRouter
 * @description Gửi câu lệnh (prompt) trực tiếp tới OpenRouter API endpoint (`google/gemini-2.5-flash`).
 * @param {string} prompt - Câu lệnh chỉ dẫn cho mô hình ngôn ngữ.
 * @returns {Promise<string>} Chuỗi văn bản trả lời từ AI.
 * 
 * @function answerFAQ
 * @description Trả lời thắc mắc của người dùng dựa trên danh sách FAQ có sẵn (Retrieval-Augmented Generation context).
 * @param {string} userQuestion - Câu hỏi nhập từ giao diện Chatbot.
 * @param {Array<Object>} faqs - Danh sách tất cả câu hỏi thường gặp đã kích hoạt trong hệ thống.
 * @returns {Promise<string>} Câu trả lời phù hợp nhất.
 * 
 * @function summarizeReport
 * @description Tự động tóm tắt bài báo cáo minh chứng của sinh viên thành 2-3 câu cô đọng giúp Admin nhanh chóng duyệt.
 * @param {string} description - Nội dung mô tả chi tiết hoạt động.
 * @param {string} eventName - Tên sự kiện hoạt động ngoại khóa.
 * @returns {Promise<string>} Đoạn văn tóm tắt.
 * 
 * @implementation
 * - Bước 1: Kiểm tra xem `OPENROUTER_API_KEY` đã được thiết lập chưa.
 * - Bước 2: Nếu có Key, đóng gói câu hỏi kèm danh sách FAQs dạng ngữ cảnh (Context) gửi sang OpenRouter.
 * - Bước 3: Nếu không có Key hoặc gặp lỗi mạng, kích hoạt hàm `mockFAQAnswer` (tìm kiếm từ khóa) hoặc `mockSummary` để hệ thống không bị ngắt quãng.
 * 
 * @relations
 * - Controllers liên quan: `aiController.js`, `faqController.js`, `participationController.js`.
 * - Frontend Components: `FAQChatWidget.jsx`, `LandingChatWidget.jsx`, `ParticipationReview.jsx`.
 */
const logger = require('../utils/logger');

const apiKey = process.env.OPENROUTER_API_KEY;

if (apiKey) {
  logger.info('✅ OpenRouter AI initialized');
} else {
  logger.warn('⚠️  OPENROUTER_API_KEY not set. AI features will use mock responses.');
}

async function callOpenRouter(prompt) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:3000",
      "X-Title": "EcoSurvey",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "google/gemini-2.5-flash",
      "max_tokens": 1000,
      "messages": [
        {"role": "user", "content": prompt}
      ]
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status} ${errorText}`);
  }

  const data = await response.json();
  if (data && data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  }
  throw new Error("Invalid response format from OpenRouter");
}

exports.answerFAQ = async (userQuestion, faqs) => {
  if (!apiKey) {
    return mockFAQAnswer(userQuestion, faqs);
  }

  try {
    const faqContext = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');

    const prompt = `You are a helpful assistant for EcoSurvey, an environmental awareness survey portal at an educational institution.

Your knowledge is strictly limited to the following FAQ database:
---
${faqContext}
---

User's question: "${userQuestion}"

Instructions:
- Answer ONLY based on the FAQ context above.
- If the question is not covered in the FAQs, politely explain that you don't have that information and they should contact Admin. Do this in the same language as the user's question.
- Be concise and friendly.
- Respond in the same language as the user's question.`;

    return await callOpenRouter(prompt);
  } catch (err) {
    logger.error('OpenRouter answerFAQ error:', err.message);
    return mockFAQAnswer(userQuestion, faqs);
  }
};

exports.summarizeReport = async (description, eventName) => {
  if (!apiKey) {
    return mockSummary(description, eventName);
  }

  try {
    const prompt = `Summarize the following environmental activity report in 2-3 concise sentences. Be objective and professional.

Event: ${eventName}
Report: ${description}

Provide only the summary, no introduction or extra text.`;

    return await callOpenRouter(prompt);
  } catch (err) {
    logger.error('OpenRouter summarizeReport error:', err.message);
    return mockSummary(description, eventName);
  }
};

// ── Hàm giả lập dữ liệu trả về khi không cấu hình API Key ───
function mockFAQAnswer(question, faqs) {
  const q = question.toLowerCase();
  for (const faq of faqs) {
    const words = faq.question.toLowerCase().split(/\s+/);
    const matchCount = words.filter((w) => w.length > 3 && q.includes(w)).length;
    if (matchCount >= 2) return faq.answer;
  }
  return "Tôi không có thông tin về chủ đề này. Vui lòng liên hệ Quản trị viên để được hỗ trợ chi tiết hơn.";
}

function mockSummary(description, eventName) {
  const sentences = description.replace(/\s+/g, ' ').trim().split(/[.!?]+/).filter(Boolean);
  const first2 = sentences.slice(0, 2).join('. ').trim();
  return `${first2}. Báo cáo hoạt động môi trường cho "${eventName}" thể hiện tinh thần tham gia tích cực các sáng kiến bền vững.`;
}
