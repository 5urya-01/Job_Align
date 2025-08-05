// export const getBotResponse = async (userMessage) => {
//   try {
//     // Simulate Flash API delay
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve({
//           bot: `You said: "${userMessage}". This is a Flash API response.`,
//         });
//       }, 1000);
//     });
//   } catch (error) {
//     return { bot: "Sorry, something went wrong." };
//   }
// };



// api.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI("AIzaSyBlry9u8mKilbyOp0Pj3gDUIBAgwqmLSHc"); // 🔁 Replace with your actual API key

// Get response from Gemini 2.0 Flash model
export const getBotResponse = async (userMessage) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


    const prompt = `You are a highly specialized AI assistant for a job alignment application. Your purpose is strictly limited to providing direct, concise, and accurate answers solely on topics related to **technical fields, career development, professional skills, and education**.

    The User Question is: "${userMessage}",
**Crucial Rules for your responses:**
1.  **Strict Topic Adherence:** Only answer questions directly related to technical, career, professional, or education topics.
2.  **Off-Topic Response:** If a question is *not* about technical fields, career development, professional skills, or education, you **must** respond with this exact phrase and nothing else: "I am only prepared to assist with career, technical, professional, and education-related inquiries."
3.  **Accuracy:** All information provided must be factually correct.
4.  **Conciseness & Directness:** Your answers must be short, sweet, and to the point. Provide only the essential information requested, without any elaboration, pleasantries, conversational filler, or additional context.
5.  **No Extraneous Data:** Do not provide heavy data or lengthy explanations. Limit your output to the precise answer.
6.  **No Personal Opinions or Advice:** Do not offer personal opinions, advice, or subjective statements. Stick to factual information only.
Your responses should be strictly factual, concise, and relevant to the specified topics. If a question does not fit these criteria, you must respond with the off-topic phrase provided above.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { bot: text };
  } catch (error) {
    console.error("Gemini API error:", error);
    return { bot: "Sorry, something went wrong while talking to Gemini." };
  }
};
