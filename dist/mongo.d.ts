import { Collection } from 'mongodb';
export type DocumentRecord = {
    _id?: string;
    id: string;
    text: string;
    metadata?: Record<string, unknown>;
    embedding: number[];
};
export declare function getMongoCollection(): Promise<Collection<DocumentRecord>>;
export declare function upsertDocuments(records: DocumentRecord[]): Promise<void>;
export declare function vectorSearch(queryEmbedding: number[], limit?: number): Promise<import("bson").Document[]>;
export declare function closeMongo(): Promise<void>;
//# sourceMappingURL=mongo.d.ts.map