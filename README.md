# MaggieB's Notes

A note-taking application built with React, TypeScript, and Supabase.

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── AuthForm.tsx    # Authentication form
│   │   ├── Editor.tsx      # Note editor
│   │   ├── NoteList.tsx    # List of notes
│   │   └── TemplateSelector.tsx # Template management
│   ├── lib/
│   │   └── supabase.ts     # Supabase client configuration
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── supabase/
│   └── migrations/        # Database migrations
└── config files          # Various configuration files
```

## Key Components

- **AuthForm**: Handles user authentication with email/password
- **Editor**: Rich text editor for creating and editing notes
- **NoteList**: Displays all user notes with sorting and filtering
- **TemplateSelector**: Manages note templates and creates new notes

## Features

- User authentication
- Note creation and editing
- Template system
- Real-time updates
- Markdown support
- Automatic saving

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Supabase (Backend & Authentication)
- Vite (Build Tool)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables

### Required Environment Variables
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Optional Environment Variables
- `VITE_OPENAI_API_KEY`: Your OpenAI API key (required for AI chat features)

### AI Chat Features
The app includes an AI-powered chat interface for searching and interacting with your notes:

#### With OpenAI API Key (`VITE_OPENAI_API_KEY` configured):
- Full RAG (Retrieval Augmented Generation) capabilities
- Semantic search using vector embeddings
- Natural language understanding of note contents
- Contextual responses based on note content

#### Without OpenAI API Key:
- Basic text search functionality remains available
- Searches note titles and content for matching terms
- Results are deduplicated and sorted by relevance
- Simple list-based presentation of matching notes

### Local Development
Create a `.env.local` file in the root directory with the above variables.

### Netlify Deployment
1. Go to Site Settings → Build & Deploy → Environment
2. Add the environment variables listed above
3. The app will automatically detect available features based on configuration
4. Run development server: `npm run dev`
