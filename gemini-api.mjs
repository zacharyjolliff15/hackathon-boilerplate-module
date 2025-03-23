import { GoogleGenerativeAI } from '@google/generative-ai';

export async function fetchQuote(apiKey) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = "Please give me a statement that welcomes judges and asks what would they like to know about the project.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        return response.text();
    } catch (error) {
        console.error("Error in Gemini API call:", error);
        return "Error fetching quote.";
    }
}