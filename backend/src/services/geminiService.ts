import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
// Load environment variables
dotenv.config({ override: true });

// Configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second
const MAX_DELAY = 8000; // 8 seconds
const DELAY_MULTIPLIER = 2;

class GeminiService {
  private ai: GoogleGenAI | null = null;

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async initializeIfNeeded() {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('Warning: GEMINI_API_KEY not set. Chat responses will be limited.');
        return false;
      }

      try {
        this.ai = new GoogleGenAI({ apiKey });
        return true;
      } catch (error) {
        console.error('Error initializing Gemini:', error);
        return false;
      }
    }
    return true;
  }

  async generateResponse(query: string): Promise<string> {
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      try {
        if (!await this.initializeIfNeeded()) {
          return "I apologize, but I'm not able to provide a response at the moment as the Gemini API key is not configured or the service is unavailable. Please contact the administrator.";
        }

        const prompt = `${query}

Instructions:
- Provide a direct answer to the question
- If you don't know something, say so clearly
- Be specific and relevant to the exact question
- Avoid generic responses
- Don't mention being an AI assistant unless relevant to the question
- Don't list news sources unless specifically asked about them
`;

        if (!this.ai) {
          throw new Error('Gemini client not initialized');
        }

        const response = await this.ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt
        });

        const text = response.text;
        if (!text) {
          throw new Error('Empty response from Gemini API');
        }

        return text;
      } catch (error) {
        lastError = error as Error;
        console.error(`Error generating response (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
        
        // Check if it's a rate limit or overload error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('503') || 
            errorMessage.includes('overloaded') || 
            errorMessage.includes('rate limit')) {
          
          // If we have more retries left, wait and try again
          if (attempt < MAX_RETRIES - 1) {
            const delay = Math.min(INITIAL_DELAY * Math.pow(DELAY_MULTIPLIER, attempt), MAX_DELAY);
            const jitter = Math.random() * 1000; // Random delay up to 1 second
            const totalDelay = delay + jitter;
            
            console.log(`Retrying in ${totalDelay.toFixed(0)}ms...`);
            await this.sleep(totalDelay);
            attempt++;
            continue;
          }
        }
        
        // For other types of errors or if we're out of retries, break the loop
        break;
      }
    }

    // If we get here, all retries failed
    if (lastError) {
      if (lastError.message.includes('503') || lastError.message.includes('overloaded')) {
        return "I apologize, but the service is currently experiencing high load. Please try again in a few moments.";
      }
      return `I apologize, but I encountered an error: ${lastError.message}. Please try again later.`;
    }
    return "I apologize, but I encountered an error while generating a response. Please try again later.";
  }
}

export const geminiService = new GeminiService();