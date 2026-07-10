"use client";

import { useState } from "react";
import Image from "next/image";

const CATEGORIES = ["Clothing", "Footwear", "Electronics", "Accessories", "Kitchen", "Sports", "Bags", "Home"];

export default function AddProductPage() {
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    category: "Electronics",
    image: "",
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "image") setPreview(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSuccess(`"${data.title}" added successfully!`);
        setForm({ title: "", price: "", description: "", category: "Electronics", image: "" });
        setPreview("");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <a href="/" className="text-2xl font-extrabold text-indigo-600 tracking-tight">🛒 ShopZone</a>
        <div className="flex gap-6 text-gray-600 font-medium text-sm">
          <a href="/" className="hover:text-indigo-600 transition">Home</a>
          <a href="/products" className="hover:text-indigo-600 transition">Products</a>
          <a href="/admin/add-product" className="text-indigo-600 border-b-2 border-indigo-600 pb-0.5">Add Product</a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
          <p className="text-gray-400 mt-1 text-sm">Fill in the details below to add a product to the store</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Wireless Headphones"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 49.99"
                min="0"
                step="0.01"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
              <p className="text-xs text-gray-400 mt-1">Paste any image URL — Unsplash, Imgur, etc.</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Write a detailed 1-2 sentence description of the product..."
                rows={4}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition resize-none"
              />
            </div>

            {/* Success / Error */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                <span>✅</span> {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                <span>❌</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Adding Product...
                </>
              ) : "Add Product"}
            </button>

            <a
              href="/products"
              className="block text-center text-sm text-indigo-500 hover:underline mt-1"
            >
              ← View all products
            </a>
          </form>

          {/* Live Preview */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Live Preview</h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Image Preview */}
              <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
                {preview ? (
                  <Image
                    src={preview}
                    alt="preview"
                    fill
                    className="object-cover"
                    unoptimized
                    onError={() => setPreview("")}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <div className="text-center">
                      <p className="text-4xl mb-2">🖼️</p>
                      <p className="text-sm">Image preview will appear here</p>
                    </div>
                  </div>
                )}
                {form.category && (
                  <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {form.category}
                  </span>
                )}
              </div>

              {/* Info Preview */}
              <div className="p-4">
                <h3 className="text-gray-800 font-semibold text-sm mb-1 leading-snug min-h-[20px]">
                  {form.title || <span className="text-gray-300">Product title</span>}
                </h3>
                <p className="text-gray-400 text-xs mb-4 line-clamp-2 min-h-[32px]">
                  {form.description || <span className="text-gray-200">Product description will appear here...</span>}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-indigo-600">
                    {form.price ? `$${parseFloat(form.price).toFixed(2)}` : <span className="text-gray-300 text-base">$0.00</span>}
                  </span>
                  <button className="bg-indigo-600 text-white text-xs font-medium px-4 py-2 rounded-xl opacity-50 cursor-not-allowed">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">This is how the product card will look in the store</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-center py-6 text-gray-400 text-sm mt-10">
        © 2025 ShopZone. All rights reserved.
      </footer>
    </div>
  );
}
