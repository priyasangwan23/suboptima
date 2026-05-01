import Subscription from '../models/Subscription.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// @desc    Get subscription insights and classification
// @route   GET /api/insights
// @access  Private
export const getInsights = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id });

    const now = new Date();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

    let totalWasteCount = 0;
    let totalWarningCount = 0;
    let totalHealthyCount = 0;

    const classifiedSubscriptions = subscriptions.map(sub => {
      let status = 'healthy';
      const isInactive = sub.lastUsedDate < fourteenDaysAgo;
      const isUpcomingRenewal = sub.renewalDate > now && sub.renewalDate <= fiveDaysFromNow;

      // Classification Logic
      if (isUpcomingRenewal) {
        status = 'warning';
        totalWarningCount++;
      } else if (isInactive && sub.cost > 300) {
        status = 'waste';
        totalWasteCount++;
      } else {
        status = 'healthy';
        totalHealthyCount++;
      }

      // Return a plain object with the status field added
      return {
        ...sub.toObject(),
        status
      };
    });

    res.status(200).json({
      success: true,
      data: {
        subscriptions: classifiedSubscriptions,
        summary: {
          totalWasteCount,
          totalWarningCount,
          totalHealthyCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate AI insights using Gemini
// @route   GET /api/insights/ai
// @access  Private
export const generateAIInsights = async (req, res) => {
  try {
    // Log API Key presence (safe way)
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      console.log('Gemini API Key detected. Starts with:', apiKey.substring(0, 7) + '...');
    } else {
      console.error('CRITICAL: GEMINI_API_KEY is missing in .env');
    }

    const subscriptions = await Subscription.find({ user: req.user.id });
    
    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        aiInsights: "Add some subscriptions first so I can analyze your spending and provide insights!"
      });
    }

    // Prepare data for prompt
    const subData = subscriptions.map(s => ({
      name: s.name,
      cost: s.cost,
      category: s.category,
      lastUsed: s.lastUsedDate
    }));

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `Analyze these subscriptions and provide 4-5 short, friendly tips to save money. Use a conversational tone like "You are spending..." or "You can consider...". 
    
    Each tip should be only 1-2 lines. Avoid technical jargon or long paragraphs.
    
    Data:
    ${JSON.stringify(subData, null, 2)}
    
    Format the output as a simple list of bullet points. No markdown formatting.`;

    try {
      console.log('Sending request to Gemini API...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Gemini API Response received successfully.');

      res.status(200).json({
        success: true,
        aiInsights: text
      });
    } catch (apiError) {
      console.error('GEMINI API ERROR DETAIL:', apiError);
      res.status(200).json({
        success: true,
        aiInsights: "Unable to generate AI insights at the moment. Please check your API key or try again later."
      });
    }
  } catch (error) {
    console.error('INTERNAL SERVER ERROR (Insights):', error);
    res.status(500).json({ message: error.message });
  }
};
