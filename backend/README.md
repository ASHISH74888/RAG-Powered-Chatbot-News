# News Assistant Backend

This is the backend service for the News Assistant chatbot, built with Node.js, Express, and TypeScript. It uses RAG (Retrieval-Augmented Generation) to provide accurate answers based on news articles.

## Tech Stack

- Node.js & Express
- TypeScript
- Redis (for session management and chat history)
- Qdrant (vector database for embeddings)
- Jina Embeddings (for text embeddings)
- Google Gemini (for text generation)
- Socket.IO (for real-time communication)

## Prerequisites

- Node.js 18+
- Redis server
- Qdrant server
- Jina AI API key
- Google Gemini API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3001
REDIS_URL=redis://localhost:6379
QDRANT_URL=http://localhost:6333
JINA_API_KEY=your_jina_api_key
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start Redis server:
   ```bash
   redis-server
   ```

3. Start Qdrant server (using Docker):
   ```bash
   docker run -p 6333:6333 qdrant/qdrant
   ```

4. Ingest news articles:
   ```bash
   npm run ingest
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/session` - Create a new chat session
- `GET /api/history/:sessionId` - Get chat history for a session
- `DELETE /api/history/:sessionId` - Clear chat history for a session
- `POST /api/chat/:sessionId` - Send a message and get a response

## Caching Strategy

- Redis is used for caching chat history with a TTL of 24 hours
- Each session's messages are stored in a Redis list
- Messages are automatically expired after the TTL to prevent memory issues

## Architecture

1. **News Ingestion**
   - Scrapes news articles from Reuters
   - Processes and cleans article content
   - Stores article metadata and content

2. **Embedding Pipeline**
   - Uses Jina Embeddings to create vector representations
   - Stores embeddings in Qdrant for similarity search
   - Updates embeddings periodically with new articles

3. **Chat Processing**
   - Retrieves relevant articles using similarity search
   - Generates responses using Google Gemini
   - Maintains conversation context in Redis

## Development

- Run tests: `npm test`
- Build for production: `npm run build`
- Start production server: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
