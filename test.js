import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const genAI = new GoogleGenerativeAI("AIzaSyAauA2p8okahW6ercDjloFvfJ98bqNX_0I");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = "How does AI work?";

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
}
main();