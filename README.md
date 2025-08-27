# Node.js + MongoDB Vector Search (with OpenAI embeddings)

This sample shows how to build a minimal vector database app using Node.js, Express, MongoDB, and OpenAI embeddings. It supports ingesting documents and running semantic search.

## Features

- Ingest documents with text and optional metadata
- Generate embeddings via OpenAI
- Store vectors in MongoDB
- Semantic search using cosine similarity aggregation
- (Optional) Atlas Vector Search support via configuration

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key

## Setup

1) Install dependencies

```bash
npm install
```

2) Configure environment

Copy `env.example` to `.env` and fill in values:

```bash
cp env.example .env
```

Required:

- `MONGODB_URI` (e.g. `mongodb://127.0.0.1:27017` or Atlas connection string)
- `MONGODB_DB_NAME`
- `OPENAI_API_KEY`

Optional:

- `MONGODB_COLLECTION` (default: `documents`)
- `EMBEDDING_MODEL` (default: `text-embedding-3-small`)
- `EMBEDDING_DIM` (default: `1536`)
- `USE_ATLAS_VECTOR` (default: `false`)

3) Build

```bash
npm run build
```

4) Seed sample data (uses your OpenAI key)

```bash
npm run seed
```

5) Run the server

```bash
npm run dev
# or
npm start
```

Server will listen on `http://localhost:3000` by default.

## API

### Health

```bash
curl http://localhost:3000/health
```

### Ingest

POST `/ingest`

Body:

```json
{
  "documents": [
    { "id": "doc-1", "text": "Hello world", "metadata": {"lang": "en"} }
  ]
}
```

Example:

```bash
curl -X POST http://localhost:3000/ingest \
  -H 'Content-Type: application/json' \
  -d '{"documents":[{"id":"doc-1","text":"Hello world","metadata":{"lang":"en"}}]}'
```

### Search

POST `/search`

Body:

```json
{ "query": "greeting", "limit": 5 }
```

Example:

```bash
curl -X POST http://localhost:3000/search \
  -H 'Content-Type: application/json' \
  -d '{"query":"greeting","limit":3}'
```

## Atlas Vector Search (optional)

If you use MongoDB Atlas with Vector Search, set `USE_ATLAS_VECTOR=true` in `.env` and create a vector index on your collection named `default` with the following definition (adjust `numDimensions` accordingly):

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

The example code already stores the vector under the `embedding` field. When `USE_ATLAS_VECTOR=true`, you can replace the aggregation in `src/mongo.ts` with a `$vectorSearch` stage for better performance.

## Notes

- This sample computes cosine similarity in aggregation as a fallback for local MongoDB. For production, prefer Atlas Vector Search `$vectorSearch`.
- Make sure the chosen OpenAI embedding model matches `EMBEDDING_DIM`.


