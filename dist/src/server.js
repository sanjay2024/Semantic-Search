"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const mongo_1 = require("./mongo");
const embeddings_1 = require("./embeddings");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '2mb' }));
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
// Ingest: { documents: [{ id, text, metadata? }] }
app.post('/ingest', async (req, res) => {
    try {
        const documents = (req.body?.documents ?? []);
        if (!Array.isArray(documents) || documents.length === 0) {
            return res.status(400).json({ error: 'documents array required' });
        }
        const texts = documents.map((d) => d.text);
        const embeddings = await (0, embeddings_1.embedText)(texts);
        const records = documents.map((d, i) => ({
            id: d.id,
            text: d.text,
            metadata: d.metadata ?? {},
            embedding: embeddings[i]
        }));
        await (0, mongo_1.upsertDocuments)(records);
        res.json({ upserted: records.length });
    }
    catch (err) {
        res.status(500).json({ error: err?.message ?? 'internal error' });
    }
});
// Search: { query: string, limit?: number }
app.post('/search', async (req, res) => {
    try {
        const query = req.body?.query;
        const limit = req.body?.limit ?? 5;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'query string required' });
        }
        const embedding = await (0, embeddings_1.embedSingle)(query);
        const results = await (0, mongo_1.vectorSearch)(embedding, limit);
        res.json({ results });
    }
    catch (err) {
        res.status(500).json({ error: err?.message ?? 'internal error' });
    }
});
app.listen(config_1.env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${config_1.env.PORT}`);
});
//# sourceMappingURL=server.js.map