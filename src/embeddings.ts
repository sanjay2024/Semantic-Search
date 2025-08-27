import OpenAI from 'openai';
import { env } from './config';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function embedText(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const response = await openai.embeddings.create({
    model: env.EMBEDDING_MODEL,
    input: texts
  });
  return response.data.map((d) => d.embedding as number[]);
}

export async function embedSingle(text: string): Promise<number[]> {
  const vectors = await embedText([text]);
  const vec = vectors[0];
  if (!vec) {
    throw new Error('Failed to generate embedding');
  }
  return vec;
}


