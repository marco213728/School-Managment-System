export interface GenerateAiOptions {
  prompt: string;
  systemInstruction?: string;
  responseMimeType?: 'application/json' | 'text/plain' | string;
  model?: string;
}

export interface GenerateAiResult {
  success: boolean;
  text: string;
  warning?: string;
  error?: string;
}

/**
 * Client-side AI service that calls the server proxy endpoint /api/ai/generate.
 * Prevents client-side API key exposure and provides structured pedagogical fallbacks
 * if the live Gemini key is missing or revoked.
 */
export async function generateWithAi(options: GenerateAiOptions): Promise<GenerateAiResult> {
  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Error del servidor AI (HTTP ${res.status})`);
    }

    const data = await res.json();
    return {
      success: true,
      text: data.text || '',
      warning: data.warning,
    };
  } catch (err: any) {
    console.error('Error in generateWithAi:', err);
    throw err;
  }
}
