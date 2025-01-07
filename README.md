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
3. Set up Supabase environment variables
4. Run development server: `npm run dev`