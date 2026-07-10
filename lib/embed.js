/**
 * Generate an embedding vector for a given text using
 * Hugging Face's free sentence-transformers model.
 * Returns a float array (384 dimensions).
 */
export async function getEmbedding(text) {
    const res = await fetch(
        "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
        }
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Embedding API error: ${err}`);
    }

    const data = await res.json();

    // HF returns either a flat array or nested array — normalize both
    if (Array.isArray(data[0])) return data[0];
    return data;
}

/**
 * Cosine similarity between two equal-length vectors.
 * Returns a value between -1 and 1 (higher = more similar).
 */
export function cosineSimilarity(a, b) {
    if (!a?.length || !b?.length || a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}
