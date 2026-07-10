/**
 * Generate embedding vector using HuggingFace sentence-transformers
 * Returns float array (384 dimensions)
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
            body: JSON.stringify({
                inputs: text,
                options: { wait_for_model: true },
            }),
        }
    );

    if (!res.ok) throw new Error(`HF embedding failed: ${res.status}`);

    const data = await res.json();
    // HF returns nested array for feature-extraction
    if (Array.isArray(data[0])) return data[0];
    return data;
}

/**
 * Cosine similarity between two vectors (-1 to 1, higher = more similar)
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
