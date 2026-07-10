import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { customer, items, subtotal, shipping, tax, total } = body;

        if (!customer?.name || !customer?.email || !customer?.address || !items?.length) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        const order = await Order.create({ customer, items, subtotal, shipping, tax, total });
        return NextResponse.json(order, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to place order." }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();
        const orders = await Order.find().sort({ createdAt: -1 });
        return NextResponse.json(orders);
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
    }
}
