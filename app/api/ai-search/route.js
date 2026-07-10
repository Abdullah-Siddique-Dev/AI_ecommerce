import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { getEmbedding, cosineSimilarity } from "@/lib/embed";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { query } = await req.json();
        if (!query?.trim()) return NextResponse.json({ products: [], source: "empty" });

        await connectDB();

        // ── LAYER 1: Atlas AutoEmbed Vector Search (voyage-4) ─────────────
        // Fastest — runs inside MongoDB using the autoembed_index
        try {
            const pipeline = [
                {
                    $vectorSearch: {
                        index: "autoembed_index",
                        path: "description",
                        query: query,
                        numCandidates: 50,
                        limit: 10,
                    },
                },
                {
                    $addFields: {
                        vectorScore: { $meta: "vectorSearchScore" },
                    },
                },
            ];

            const results = await Product.aggregate(pipeline);

            if (results.length > 0) {
                const confident = results.filter(r => r.vectorScore >= 0.5);
                const toReturn = confident.length > 0 ? confident : results.slice(0, 6);
                console.log(`✅ [Layer 1] Atlas Vector Search: ${toReturn.length} results | top score: ${results[0]?.vectorScore?.toFixed(3)}`);
                return NextResponse.json({ products: toReturn, source: "vector" });
            }
        } catch (atlasErr) {
            console.warn(`⚠️ [Layer 1] Atlas failed: ${atlasErr.message}`);
        }

        // ── LAYER 2: HF MiniLM Cosine Similarity (stored embeddings) ──────
        // Uses the embedding[] field stored in each document during seed
        try {
            const queryEmbedding = await getEmbedding(query);
            const products = await Product.find({ "embedding.0": { $exists: true } });

            if (products.length > 0) {
                const scored = products
                    .map(p => ({ product: p, score: cosineSimilarity(queryEmbedding, p.embedding) }))
                    .filter(s => s.score >= 0.2)
                    .sort((a, b) => b.score - a.score);

                if (scored.length > 0) {
                    const results = scored.slice(0, 8).map(s => s.product);
                    console.log(`✅ [Layer 2] HF Cosine Search: ${results.length} results | top score: ${scored[0].score.toFixed(3)}`);
                    return NextResponse.json({ products: results, source: "vector" });
                }
            }
        } catch (hfErr) {
            console.warn(`⚠️ [Layer 2] HF cosine failed: ${hfErr.message}`);
        }

        // ── LAYER 3: Groq LLM Fallback ────────────────────────────────────
        // Handles abstract queries — "gift for dad", "something cozy"
        console.log(`🤖 [Layer 3] Groq fallback for "${query}"`);
        const allProducts = await Product.find();

        const productList = allProducts.map(p =>
            `ID:${p._id} | ${p.title} | ${p.category} | $${p.price} | ${p.description}`
        ).join("\n");

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `You are a strict product search engine. Fix typos, understand intent, handle disordered sentences. Return ONLY a raw JSON array of relevant product IDs. No explanation, no markdown.`,
                    },
                    {
                        role: "user",
                        content: `Query: "${query}"\n\nProducts:\n${productList}\n\nReturn ONLY a JSON array of matching IDs. Be strict. If nothing matches return [].`,
                    },
                ],
                temperature: 0.0,
                max_tokens: 300,
            }),
        });

        const groqData = await groqRes.json();
        if (groqData.error) {
            console.error("Groq error:", groqData.error.message);
            return NextResponse.json({ products: [], source: "error" });
        }

        const text = groqData.choices?.[0]?.message?.content?.trim() || "[]";
        const match = text.match(/\[[\s\S]*?\]/);
        if (!match) return NextResponse.json({ products: [], source: "no-match" });

        const ids = JSON.parse(match[0]);
        const matched = allProducts.filter(p => ids.includes(p._id.toString()));
        console.log(`✅ [Layer 3] Groq: ${matched.length} results for "${query}"`);
        return NextResponse.json({ products: matched, source: "ai" });

    } catch (err) {
        console.error("Search error:", err);
        return NextResponse.json({ products: [], source: "error" });
    }
}
