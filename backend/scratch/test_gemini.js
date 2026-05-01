import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Note: The SDK doesn't have a direct listModels method on the genAI instance in all versions, 
    // but we can try to find the correct model by iterating or checking common ones.
    // Actually, let's just try the absolute most common ones and log the error details better.
    
    console.log("Testing API Key with gemini-pro...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("test");
    const response = await result.response;
    console.log("Response:", response.text());
  } catch (error) {
    console.error("Error Details:", JSON.stringify(error, null, 2));
  }
}

listModels();
