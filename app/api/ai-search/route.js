import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { query } = await req.json();

        if (!query || query.trim() === "") {
            return NextResponse.json({ products: [], source: "empty" });
        }

        await connectDB();
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
                        content: `You are a strict and intelligent product search engine for an ecommerce store.

RULES:
1. Fix typos and misspellings in the user query before searching (e.g. "headphonse" = headphones, "sneeker" = sneakers, "keyborad" = keyboard)
2. Understand natural language and intent (e.g. "something for the gym" = yoga mat, running sneakers, resistance bands, foam roller, water bottle)
3. Handle disordered or broken sentences (e.g. "want buy thing music listen" = headphones, earbuds, speaker)
4. Match by concept, not just keywords (e.g. "gift for tech person" = keyboard, headphones, mouse, smartwatch, laptop stand)
5. ONLY return products that are genuinely relevant to the query intent
6. Do NOT return random or unrelated products just to fill results
7. If truly nothing matches, return []
8. Return ONLY a raw JSON array of IDs, nothing else — no explanation, no markdown, no text`
                    },
                    {
                        role: "user",
                        content: `User search query: "${query}"

Products available:
${productList}

Return ONLY a JSON array of matching product IDs. Example: ["id1","id2"]
Be strict — only include products genuinely relevant to what the user wants.`
                    },
                ],
                temperature: 0.0,
                max_tokens: 400,
            }),
        });

        const groqData = await groqRes.json();

        if (groqData.error) {
            console.error("Groq error:", groqData.error);
            return NextResponse.json({ products: [], source: "error" });
        }

        const text = groqData.choices?.[0]?.message?.content?.trim() || "[]";

        // Extract JSON array robustly
        const match = text.match(/\[[\s\S]*?\]/);
        if (!match) {
            return NextResponse.json({ products: [], source: "no-match" });
        }

        let ids = [];
        try {
            ids = JSON.parse(match[0]);
        } catch {
            return NextResponse.json({ products: [], source: "parse-error" });
        }

        const matched = products.filter((p) => ids.includes(p._id.toString()));

        return NextResponse.json({ products: matched, source: "ai" });

    } catch (err) {
        console.error("AI search error:", err);
        return NextResponse.json({ products: [], source: "error" });
    }
}
