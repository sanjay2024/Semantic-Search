"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.embedText = embedText;
exports.embedSingle = embedSingle;
const openai_1 = __importDefault(require("openai"));
const config_1 = require("./config");
const openai = new openai_1.default({ apiKey: config_1.env.OPENAI_API_KEY });
async function embedText(texts) {
    if (texts.length === 0)
        return [];
    const response = await openai.embeddings.create({
        model: config_1.env.EMBEDDING_MODEL,
        input: texts
    });
    return response.data.map((d) => d.embedding);
}
async function embedSingle(text) {
    const [vec] = await embedText([text]);
    return vec;
}
//# sourceMappingURL=embeddings.js.map