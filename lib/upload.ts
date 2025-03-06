import { initPinecone } from "./pinecone";
import { generateEmbedding } from "./embeddings";
import { v4 as uuidv4 } from "uuid";

export async function upsertDocuments(indexName: string, documents: { text: string }[]) {
    const pinecone = await initPinecone();
    const index = pinecone.Index(indexName);

    // Generate embeddings for all documents
    const embeddings = await Promise.all(documents.map(doc => generateEmbedding(doc.text)));

    // Prepare vectors for upsert
    const vectors = documents.map((doc, i) => ({
        id: uuidv4(),
        values: embeddings[i],
        metadata: { text: doc.text }
    }));

    // Store in Pinecone with namespace 'ns1'
    await index.namespace('ns1').upsert(vectors);

    return { message: "Documents uploaded successfully", ids: vectors.map(v => v.id) };
}
