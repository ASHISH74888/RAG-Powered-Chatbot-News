# News Assistant Frontend

This is the frontend application for the News Assistant chatbot, built with React and TypeScript. It provides a modern and responsive chat interface for interacting with the news-aware AI assistant.

## Tech Stack

- React 18+
- TypeScript
- SCSS for styling
- Axios for API calls
- Socket.IO client for real-time updates

## Features

- Clean and modern chat interface
- Real-time message updates
- Session management
- Chat history with timestamps
- Responsive design
- Loading states and error handling

## Prerequisites

- Node.js 18+
- Backend service running

## Environment Variables

Create a `.env` file in the root directory with:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/        # React components
│   ├── Chat.tsx      # Main chat container
│   ├── Message.tsx   # Individual message component
│   └── ChatInput.tsx # Message input component
├── services/         # API and utility services
│   └── api.ts        # API service for backend communication
├── styles/           # SCSS styles
│   ├── main.scss     # Main stylesheet
│   └── variables.scss # SCSS variables
└── App.tsx           # Root component
```

## Styling

The application uses SCSS for styling with:
- CSS variables for theming
- Responsive breakpoints
- Modern animations
- Consistent spacing and typography

## Component Architecture

1. **Chat Component**
   - Manages chat state and session
   - Handles message sending/receiving
   - Maintains message history

2. **Message Component**
   - Displays individual messages
   - Shows timestamps
   - Handles different message types

3. **ChatInput Component**
   - Handles message input
   - Shows loading states
   - Provides feedback for errors

## Development

- Start development server: `npm start`
- Run tests: `npm test`
- Build for production: `npm run build`
- Format code: `npm run format`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request