"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const EnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.string().default('3000'),
    MONGODB_URI: zod_1.z.string().min(1, 'MONGODB_URI is required'),
    MONGODB_DB_NAME: zod_1.z.string().min(1, 'MONGODB_DB_NAME is required'),
    MONGODB_COLLECTION: zod_1.z.string().default('documents'),
    OPENAI_API_KEY: zod_1.z.string().min(1, 'OPENAI_API_KEY is required'),
    EMBEDDING_MODEL: zod_1.z.string().default('text-embedding-3-small'),
    EMBEDDING_DIM: zod_1.z
        .string()
        .default('1536'),
    USE_ATLAS_VECTOR: zod_1.z.coerce.boolean().default(false)
});
const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
    // Throw a concise error listing missing variables
    const issues = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Invalid environment variables: ${issues}`);
}
exports.env = {
    ...parsed.data,
    PORT: parseInt(parsed.data.PORT, 10),
    EMBEDDING_DIM: parseInt(parsed.data.EMBEDDING_DIM, 10)
};
//# sourceMappingURL=config.js.map