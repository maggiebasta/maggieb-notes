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
