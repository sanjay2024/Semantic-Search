import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB_NAME: z.string().min(1, 'MONGODB_DB_NAME is required'),
  MONGODB_COLLECTION: z.string().default('documents'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  EMBEDDING_DIM: z
    .string()
    .default('1536')
  ,
  USE_ATLAS_VECTOR: z.coerce.boolean().default(false)
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // Throw a concise error listing missing variables
  const issues = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
  throw new Error(`Invalid environment variables: ${issues}`);
}

export const env = {
  ...parsed.data,
  PORT: parseInt(parsed.data.PORT, 10),
  EMBEDDING_DIM: parseInt(parsed.data.EMBEDDING_DIM, 10)
};


