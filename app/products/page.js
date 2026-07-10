"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

const CATEGORIES = ["All", "Clothing", "Footwear", "Electronics", "Accessories", "Kitchen", "Sports", "Bags", "Home"];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => { setError("Failed to load products."); setLoading(false); });
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const filtered = products
    .filter((p) => activeCategory === "All" || p.category === activeCategory)
    .filter((p) =>
      p.title?.toLowerCase().includes(query.toLowerCase()) ||
      p.category?.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name") return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">All Products</h1>
          <p className="text-gray-400 text-sm">Browse our full collection of {products.length} products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 shadow-sm">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..." className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent" />
            {query && <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">✕</button>}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 shadow-sm outline-none cursor-pointer">
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                activeCategory === cat ? "bg-indigo-600 text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-400 hover:text-indigo-600"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {!loading && !error && (
          <p className="text-sm text-gray-400 mb-6">
            Showing <span className="font-semibold text-gray-600">{filtered.length}</span> products
            {activeCategory !== "All" && <> in <span className="font-semibold text-indigo-600">{activeCategory}</span></>}
          </p>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
                <div className="h-52 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-8 bg-gray-200 rounded w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <div className="text-center py-20"><p className="text-red-500 text-lg">{error}</p></div>}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div key={product._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group">
                <Link href={`/products/${product._id}`}>
                  <div className="relative w-full h-52 bg-gray-100 overflow-hidden cursor-pointer">
                    <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                    <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full">{product.category}</span>
                  </div>
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <Link href={`/products/${product._id}`}>
                    <h2 className="text-gray-800 font-semibold text-sm mb-1 leading-snug hover:text-indigo-600 transition">{product.title}</h2>
                  </Link>
                  <p className="text-gray-400 text-xs flex-1 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-indigo-600">${product.price?.toFixed(2)}</span>
                    <button onClick={() => handleAddToCart(product)}
                      className={`text-xs font-medium px-4 py-2 rounded-xl transition-all duration-150 active:scale-95 ${
                        addedId === product._id ? "bg-green-500 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}>
                      {addedId === product._id ? "✓ Added" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-gray-500 text-lg font-medium">No products found</p>
            <button onClick={() => { setQuery(""); setActiveCategory("All"); }} className="mt-4 text-indigo-500 text-sm hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </div>

      <footer className="bg-white border-t border-gray-100 text-center py-6 text-gray-400 text-sm mt-10">
        © 2025 ShopZone. All rights reserved.
      </footer>
    </div>
  );
}
