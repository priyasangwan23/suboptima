import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    console.log("Fetching models from v1beta...");
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      const flashModels = data.models.filter(m => m.name.includes("flash")).map(m => m.name);
      console.log("Flash Models:", flashModels);
      const allModels = data.models.map(m => m.name);
      console.log("All Models Count:", allModels.length);
      console.log("Is gemini-1.5-flash present?", allModels.includes("models/gemini-1.5-flash"));
    } else {
      console.error("Error Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

listModels();
