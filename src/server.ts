import express from 'express';
import { env } from './config';
import { upsertDocuments, vectorSearch, DocumentRecord } from './mongo';
import { embedText, embedSingle } from './embeddings';

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Ingest: { documents: [{ id, text, metadata? }] }
app.post('/ingest', async (req, res) => {
  try {
    const documents = (req.body?.documents ?? []) as Array<{
      id: string;
      text: string;
      metadata?: Record<string, unknown>;
    }>;
    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: 'documents array required' });
    }

    const texts = documents.map((d) => d.text);
    const embeddings = await embedText(texts);
    const records: DocumentRecord[] = documents.map((d, i) => ({
      id: d.id,
      text: d.text,
      metadata: d.metadata ?? {},
      embedding: embeddings[i]!
    }));
    await upsertDocuments(records);
    res.json({ upserted: records.length });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'internal error' });
  }
});

// Search: { query: string, limit?: number }
app.post('/search', async (req, res) => {
  try {
    const query = req.body?.query as string;
    const limit = (req.body?.limit as number) ?? 5;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'query string required' });
    }
    const embedding = await embedSingle(query);
    const results = await vectorSearch(embedding, limit);
    res.json({ results });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'internal error' });
  }
});

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${env.PORT}`);
});


