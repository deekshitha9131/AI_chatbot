const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async generateResponse(query, model = process.env.DEFAULT_MODEL) {
    try {
      if (model === 'openai') {
        return await this.getOpenAIResponse(query);
      } else if (model === 'gemini') {
        return await this.getGeminiResponse(query);
      }
      throw new Error('Invalid model specified');
    } catch (error) {
      console.error('AI Service Error:', error.message);
      throw new Error('Failed to generate AI response');
    }
  }

  async getOpenAIResponse(query) {
    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [{ role: 'user', content: query }],
      max_tokens: parseInt(process.env.MAX_TOKENS),
      temperature: parseFloat(process.env.TEMPERATURE)
    });

    return {
      reply: response.choices[0].message.content,
      model: 'openai',
      tokens: response.usage.total_tokens
    };
  }

  async getGeminiResponse(query) {
    const model = this.genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
    const result = await model.generateContent(query);
    const response = await result.response;

    return {
      reply: response.text(),
      model: 'gemini',
      tokens: 0 // Gemini doesn't provide token count in free tier
    };
  }
}

module.exports = new AIService();