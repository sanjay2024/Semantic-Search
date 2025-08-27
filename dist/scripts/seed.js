"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_1 = require("../src/mongo");
const embeddings_1 = require("../src/embeddings");
async function main() {
    const samples = [
        { id: 'doc-1', text: 'The quick brown fox jumps over the lazy dog', metadata: { topic: 'pangram' } },
        { id: 'doc-2', text: 'MongoDB vector search supports semantic retrieval', metadata: { topic: 'database' } },
        { id: 'doc-3', text: 'OpenAI embeddings create dense vector representations of text', metadata: { topic: 'ml' } },
        { id: 'doc-4', text: 'Express is a minimal web framework for Node.js', metadata: { topic: 'node' } },
        { id: 'doc-5', text: 'TypeScript adds static typing to JavaScript for better safety', metadata: { topic: 'typescript' } }
    ];
    const vectors = await (0, embeddings_1.embedText)(samples.map((s) => s.text));
    const records = samples.map((s, i) => ({ ...s, embedding: vectors[i] }));
    await (0, mongo_1.upsertDocuments)(records);
}
main()
    .then(() => {
    // eslint-disable-next-line no-console
    console.log('Seeded sample documents.');
})
    .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
})
    .finally(async () => {
    await (0, mongo_1.closeMongo)();
});
//# sourceMappingURL=seed.js.map