import { MongoClient, Db, Collection } from 'mongodb';
import { env } from './config';

export type DocumentRecord = {
  _id?: string;
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
  embedding: number[];
};

let client: MongoClient | null = null;
let db: Db | null = null;
let collection: Collection<DocumentRecord> | null = null;

export async function getMongoCollection(): Promise<Collection<DocumentRecord>> {
  if (collection) return collection;
  if (!client) {
    client = new MongoClient(env.MONGODB_URI);
  }
  if (!db) {
    await client.connect();
    db = client.db(env.MONGODB_DB_NAME);
  }
  if (!collection) {
    collection = db.collection<DocumentRecord>(env.MONGODB_COLLECTION);
    await ensureVectorIndex(collection);
  }
  return collection;
}

async function ensureVectorIndex(col: Collection<DocumentRecord>): Promise<void> {
  // Try creating an Atlas vector search index definition if running on Atlas Search
  // For local MongoDB 7.0+ you can create an index using $vectorSearch in aggregation without a separate index.
  try {
    // Create a standard index on id for upserts and lookup
    await col.createIndex({ id: 1 }, { unique: true });
  } catch (err) {
    // ignore if exists
  }
}

export async function upsertDocuments(records: DocumentRecord[]): Promise<void> {
  const col = await getMongoCollection();
  const ops = records.map((r) => ({
    updateOne: {
      filter: { id: r.id },
      update: { $set: r },
      upsert: true
    }
  }));
  if (ops.length > 0) {
    await col.bulkWrite(ops, { ordered: false });
  }
}

export async function vectorSearch(queryEmbedding: number[], limit = 5) {
  const col = await getMongoCollection();
  // Prefer $vectorSearch when available (MongoDB Atlas / Server 7.2+ with vector search)
  // Fallback to cosine similarity via dot product using $vectorSearch-like aggregation
  // Note: For local server without vector indexes, we approximate using $set + $sort
  const pipeline: object[] = [
    {
      $set: {
        similarity: {
          $let: {
            vars: { a: '$embedding', b: queryEmbedding },
            in: {
              $divide: [
                {
                  $sum: {
                    $map: {
                      input: { $range: [0, { $size: '$$a' }] },
                      as: 'idx',
                      in: {
                        $multiply: [
                          { $arrayElemAt: ['$$a', '$$idx'] },
                          { $arrayElemAt: ['$$b', '$$idx'] }
                        ]
                      }
                    }
                  }
                },
                {
                  $multiply: [
                    {
                      $sqrt: {
                        $sum: {
                          $map: {
                            input: { $range: [0, { $size: '$$a' }] },
                            as: 'i',
                            in: { $pow: [{ $arrayElemAt: ['$$a', '$$i'] }, 2] }
                          }
                        }
                      }
                    },
                    {
                      $sqrt: {
                        $sum: {
                          $map: {
                            input: { $range: [0, { $size: '$$b' }] },
                            as: 'j',
                            in: { $pow: [{ $arrayElemAt: ['$$b', '$$j'] }, 2] }
                          }
                        }
                      }
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    },
    { $sort: { similarity: -1 } },
    { $limit: limit },
    { $project: { _id: 0 } }
  ];

  const results = await col.aggregate(pipeline).toArray();
  return results;
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    collection = null;
  }
}


