import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { query } = await req.json();
        if (!query?.trim()) return NextResponse.json({ products: [], source: "empty" });

        await connectDB();

        // ── STEP 1: Atlas AutoEmbed Vector Search ─────────────────────────
        // Uses $vectorSearch with autoembed_index — MongoDB auto-embeds the query
        // using voyage-4, then finds nearest neighbors in vector space
        try {
            const pipeline = [
                {
                    $vectorSearch: {
                        index: "autoembed_index",
                        path: "description",
                        query: query,          // AutoEmbed uses "query" not "queryText"
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
                // Filter out low confidence matches
                const confident = results.filter((r) => r.vectorScore >= 0.5);
                const toReturn = confident.length > 0 ? confident : results.slice(0, 5);

                console.log(`✅ Atlas Vector Search: ${toReturn.length} results for "${query}" | top score: ${results[0]?.vectorScore?.toFixed(3)}`);
                return NextResponse.json({ products: toReturn, source: "vector" });
            }
        } catch (vectorErr) {
            console.warn("⚠️ Atlas Vector Search failed:", vectorErr.message);
            // Falls through to Groq
        }

        // ── STEP 2: Groq LLM Fallback ────────────────────────────────────
        // Handles abstract/vague queries the vector can't handle alone
        console.log(`🤖 Falling back to Groq for "${query}"`);
        const products = await Product.find();

        const productList = products.map((p) =>
            `ID:${p._id} | ${p.title} | ${p.category} | $${p.price} | ${p.description}`
        ).join("\n");

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `You are a strict product search engine. Fix typos, understand intent, handle disordered sentences. Only return genuinely relevant product IDs as a raw JSON array. No explanation, no markdown — ONLY the array.`,
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
        const matched = products.filter((p) => ids.includes(p._id.toString()));

        console.log(`✅ Groq fallback: ${matched.length} results for "${query}"`);
        return NextResponse.json({ products: matched, source: "ai" });

    } catch (err) {
        console.error("Search error:", err);
        return NextResponse.json({ products: [], source: "error" });
    }
}
