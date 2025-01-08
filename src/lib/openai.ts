// Types for structured query parsing
export interface ParsedTimeRange {
  type: 'relative' | 'absolute';
  start: string; // ISO date string
  end: string;   // ISO date string
  original: string; // Original text (e.g., "last week")
}

export interface ParsedQuery {
  topics: string[];
  timeRange?: ParsedTimeRange;
  action?: string; // e.g., "find", "show", "list"
  contentType?: string; // e.g., "meeting", "note", "document"
}

// Check if OpenAI API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const isAIEnabled = Boolean(apiKey);

if (!isAIEnabled) {
  console.warn('OpenAI API key is not configured. AI chat features will be disabled.');
}

// Dynamic import and lazy initialization of OpenAI client
let openaiInstance: any = null;
let openaiModule: any = null;

async function getOpenAIClient(): Promise<any> {
  if (!isAIEnabled) return null;
  
  if (!openaiInstance) {
    try {
      // Dynamically import OpenAI only when needed
      if (!openaiModule) {
        openaiModule = await import('openai');
      }
      
      openaiInstance = new openaiModule.default({
        apiKey: apiKey as string,
        dangerouslyAllowBrowser: true
      });
    } catch (error) {
      console.warn('Failed to initialize OpenAI client:', error);
      return null;
    }
  }
  
  return openaiInstance;
}

export function isAIChatEnabled(): boolean {
  return isAIEnabled;
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
  const client = await getOpenAIClient();
  if (!client) {
    console.warn('Skipping embedding generation: OpenAI features are disabled');
    return null;
  }

  try {
    const response = await client.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

export async function parseNaturalLanguageQuery(query: string): Promise<ParsedQuery | null> {
  const client = await getOpenAIClient();
  if (!client) return null;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a query parser that extracts structured data from natural language questions about notes."
        },
        { role: "user", content: query }
      ],
      functions: [
        {
          name: "parse_query",
          description: "Parse the user's query into structured data",
          parameters: {
            type: "object",
            properties: {
              topics: {
                type: "array",
                items: { type: "string" },
                description: "Key topics or concepts mentioned in the query"
              },
              timeRange: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["relative", "absolute"] },
                  start: { type: "string", format: "date-time" },
                  end: { type: "string", format: "date-time" },
                  original: { type: "string" }
                },
                required: ["type", "start", "end", "original"]
              },
              action: { type: "string" },
              contentType: { type: "string" }
            },
            required: ["topics"]
          }
        }
      ],
      function_call: { name: "parse_query" }
    });

    const functionCall = response.choices[0].message.function_call;
    if (!functionCall?.arguments) return null;

    const parsed = JSON.parse(functionCall.arguments);
    return parsed as ParsedQuery;
  } catch (error) {
    console.error('Error parsing natural language query:', error);
    return null;
  }
}

export async function generateChatResponse(prompt: string): Promise<string> {
  const client = await getOpenAIClient();
  if (!client) {
    return "AI chat is currently disabled. Please configure the OpenAI API key to enable this feature.";
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content || "No response generated";
  } catch (error) {
    console.error('Error generating chat response:', error);
    return "Sorry, there was an error processing your request. Please try again later.";
  }
}
