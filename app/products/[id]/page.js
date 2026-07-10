"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import Navbar from "../../components/Navbar";

export default function ProductDetailPage({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((p) => p._id === id);
        setProduct(found || null);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="rounded-2xl bg-gray-200 h-96" />
          <div className="space-y-4 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-10 bg-gray-200 rounded w-1/3 mt-6" />
            <div className="h-12 bg-gray-200 rounded w-full mt-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-32">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-gray-500 text-xl font-medium">Product not found</p>
          <Link href="/products" className="mt-4 inline-block text-indigo-500 hover:underline text-sm">
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-indigo-600 transition">Products</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {/* Image */}
          <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
              unoptimized
            />
            <span className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between py-2">
            <div>
              <p className="text-indigo-500 text-sm font-semibold uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">
                {product.title}
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-extrabold text-indigo-600">
                  ${product.price?.toFixed(2)}
                </span>
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">
                  In Stock
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-8">
                {["Free shipping on orders over $50", "30-day return policy", "Secure checkout"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  added
                    ? "bg-green-500 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95"
                }`}
              >
                {added ? "✓ Added to Cart!" : "🛒 Add to Cart"}
              </button>
              <Link
                href="/cart"
                className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition text-center"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>

        {/* Back link */}
        <Link href="/products" className="inline-flex items-center gap-1 text-gray-400 hover:text-indigo-600 text-sm mt-8 transition">
          ← Back to all products
        </Link>
      </div>

      <footer className="bg-white border-t border-gray-100 text-center py-6 text-gray-400 text-sm mt-10">
        © 2025 ShopZone. All rights reserved.
      </footer>
    </div>
  );
}
