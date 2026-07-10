import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json(products);
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { title, price, description, category, image } = body;

        if (!title || !price || !description || !category || !image) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        const product = await Product.create({ title, price: parseFloat(price), description, category, image });
        return NextResponse.json(product, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
    }
}
