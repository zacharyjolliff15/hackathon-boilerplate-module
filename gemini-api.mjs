import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Fetches a response from Gemini based on the provided text input.
 * @param {string} apiKey - Your Gemini API key.
 * @param {string} text - The text input (e.g., recognized speech).
 * @returns {Promise<string>} - The Gemini response.
 */
export async function fetchQuote(apiKey, text) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Use the provided text as the prompt
        const prompt = text || "Please give me a statement that welcomes judges and asks what would they like to know about the project.";
        const result = await model.generateContent(prompt);
        const response = await result.response;

        return response.text();
    } catch (error) {
        console.error("Error in Gemini API call:", error);
        return "Error fetching quote.";
    }
}