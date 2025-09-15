import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { NewsArticle } from './newsService';

dotenv.config({ override: true });

interface SearchResult {
  article: NewsArticle;
  score: number;
}

class EmbeddingService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private articles: NewsArticle[] = [];
  private embeddings: number[][] = [];

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY is not set');
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'text-embedding-001' });
  }

  private generateMockEmbedding(text: string): number[] {
    // Create a deterministic embedding based on text content
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: 512 }, (_, i) => Math.sin(hash + i));
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      if (!this.model) {
        throw new Error('Embedding model not initialized');
      }

      // For testing, use deterministic mock embeddings
      return this.generateMockEmbedding(text);
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw error;
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      throw new Error('Invalid vectors');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i += 1) {
      const valA = a[i] || 0;
      const valB = b[i] || 0;
      dotProduct += valA * valB;
      normA += valA * valA;
      normB += valB * valB;
    }

    const norm = Math.sqrt(normA) * Math.sqrt(normB);
    return norm === 0 ? 0 : dotProduct / norm;
  }

  async indexArticle(article: NewsArticle): Promise<void> {
    try {
      const textToEmbed = `${article.title} ${article.content}`;
      const embedding = await this.createEmbedding(textToEmbed);
      
      this.embeddings.push(embedding);
      this.articles.push(article);

      console.log(`Indexed article: ${article.title}`);
    } catch (error) {
      console.error('Error indexing article:', error);
      throw error;
    }
  }

  async searchSimilar(query: string, limit: number = 3): Promise<NewsArticle[]> {
    try {
      if (this.articles.length === 0) {
        console.warn('No articles indexed yet');
        return [];
      }

      const queryEmbedding = await this.createEmbedding(query);
      
      // Calculate similarities with type safety
      const similarities: Array<{ index: number; score: number }> = [];
      
      this.embeddings.forEach((embedding, i) => {
        const score = this.cosineSimilarity(queryEmbedding, embedding);
        similarities.push({ index: i, score });
      });

      // Sort by similarity score
      similarities.sort((a, b) => b.score - a.score);
      
      // Map to articles
      return similarities
        .slice(0, limit)
        .map(sim => this.articles[sim.index])
        .filter((article): article is NewsArticle => article !== undefined);
    } catch (error) {
      console.error('Error searching similar articles:', error);
      return [];
    }
  }

  getIndexedArticlesCount(): number {
    return this.articles.length;
  }
}

export const embeddingService = new EmbeddingService();