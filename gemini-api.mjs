import { GoogleGenerativeAI } from '@google/generative-ai';

export async function fetchQuote(apiKey, prompt) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const result = await model.generateContent(prompt); // Use dynamic prompt
        const response = await result.response;
        
        return response.text(); // Return the response
    } catch (error) {
        console.error("Error in Gemini API call:", error);
        return "Error fetching quote."; // Return error message
    }
}
