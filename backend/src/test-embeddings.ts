import { embeddingService } from './services/embeddingService';
import { newsService } from './services/newsService';

async function testEmbeddings() {
  try {
    console.log('1. Testing news article ingestion...');
    const sampleArticles = [
      {
        title: "AI Breakthrough in Healthcare",
        content: "Scientists have developed a new AI model that can predict patient outcomes with 95% accuracy. The model uses deep learning to analyze medical records and identify patterns that human doctors might miss.",
        url: "https://example.com/ai-healthcare",
        publishedDate: new Date().toISOString()
      },
      {
        title: "Climate Change Impact on Agriculture",
        content: "A new study shows that changing weather patterns are affecting crop yields worldwide. Farmers are adapting by using drought-resistant crops and advanced irrigation systems.",
        url: "https://example.com/climate-agriculture",
        publishedDate: new Date().toISOString()
      },
      {
        title: "Space Exploration Update",
        content: "NASA announces plans for new Mars mission in 2026. The mission will focus on searching for signs of ancient microbial life and testing new propulsion technologies.",
        url: "https://example.com/space-exploration",
        publishedDate: new Date().toISOString()
      }
    ];

    console.log('2. Indexing sample articles...');
    for (const article of sampleArticles) {
      await embeddingService.indexArticle(article);
    }
    console.log(`✅ Indexed ${embeddingService.getIndexedArticlesCount()} articles`);

    console.log('\n3. Testing semantic search...');
    const queries = [
      "What's new in healthcare AI?",
      "Tell me about farming and weather",
      "Latest space news"
    ];

    for (const query of queries) {
      console.log(`\nSearching for: "${query}"`);
      const results = await embeddingService.searchSimilar(query, 2);
      console.log('Results:');
      results.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
      });
    }

    console.log('\n✅ Embedding tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
  }
}

// Run the tests
console.log('Starting embedding tests...\n');
testEmbeddings();
