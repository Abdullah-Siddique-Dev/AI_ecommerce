import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    title: String,
    image: String,
    price: Number,
    qty: Number,
});

const orderSchema = new mongoose.Schema({
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        zip: { type: String, required: true },
    },
    items: [orderItemSchema],
    subtotal: Number,
    shipping: Number,
    tax: Number,
    total: Number,
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered"],
        default: "pending",
    },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
