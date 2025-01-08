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

### Local Development
Create a `.env.local` file in the root directory with the above variables.

### Netlify Deployment
1. Go to Site Settings → Build & Deploy → Environment
2. Add the environment variables listed above
3. Without `VITE_OPENAI_API_KEY`, the app will still work but AI chat features will be limited to basic text search
4. Run development server: `npm run dev`
