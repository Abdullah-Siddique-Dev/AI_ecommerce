import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    embedding:[Number],
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", productSchema);
