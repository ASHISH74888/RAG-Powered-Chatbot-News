import { newsService } from '../services/newsService';
import { embeddingService } from '../services/embeddingService';
import * as dotenv from 'dotenv';

dotenv.config();

async function ingestNews() {
  try {
    console.log('Initializing Qdrant collection...');
    await embeddingService.initializeCollection();

    console.log('Fetching news articles...');
    const articles = await newsService.fetchLatestArticles(50);
    console.log(`Found ${articles.length} articles`);

    console.log('Indexing articles...');
    for (const article of articles) {
      try {
        await embeddingService.indexArticle(article);
        console.log(`Indexed article: ${article.title}`);
      } catch (error) {
        console.error(`Error indexing article ${article.title}:`, error);
      }
    }

    console.log('News ingestion completed successfully!');
  } catch (error) {
    console.error('Error during news ingestion:', error);
    process.exit(1);
  }
}

ingestNews();
