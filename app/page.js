"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { useCart } from "./context/CartContext";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResults, setAiResults] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState("");
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

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResults(null);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiQuery }),
      });
      const data = await res.json();
      setAiResults(Array.isArray(data.products) ? data.products : []);
      setAiSource(data.source || "ai");
    } catch {
      setAiResults([]);
    } finally {
      setAiLoading(false);
    }
  };

  const clearAiSearch = () => { setAiResults(null); setAiQuery(""); setAiSource(""); };

  const filtered = (Array.isArray(aiResults) ? aiResults : products).filter(
    (p) =>
      p.title?.toLowerCase().includes(query.toLowerCase()) ||
      p.category?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-center py-20 px-4">
        <h2 className="text-5xl font-extrabold mb-4 leading-tight">Fresh Arrivals<br />Just for You</h2>
        <p className="text-indigo-200 text-lg mb-8 max-w-md mx-auto">Discover top quality products at unbeatable prices, powered by AI search.</p>
        <a href="#products" className="bg-white text-indigo-600 font-bold px-8 py-3 rounded-full hover:bg-indigo-50 transition shadow-lg">
          Shop Now
        </a>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name or category..."
            className="bg-transparent w-full text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
          {query && <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">✕</button>}
        </div>
      </div>

      {/* AI Search */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-bold text-gray-800">AI Smart Search</h3>
            <span className="text-xs bg-indigo-100 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">Powered by Groq</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">Describe what you need — typos, sentences, anything works</p>
          <div className="flex gap-3">
            <input
              type="text" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
              placeholder='e.g. "somthing for gym" or "gift for tech person"'
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <button onClick={handleAiSearch} disabled={aiLoading || !aiQuery.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition flex items-center gap-2">
              {aiLoading ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Searching...</> : "Search"}
            </button>
          </div>
          {aiResults !== null && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                🤖 Found <span className="font-semibold text-indigo-600">{aiResults.length}</span> result{aiResults.length !== 1 ? "s" : ""} for <span className="font-semibold">"{aiQuery}"</span>
              </p>
              <button onClick={clearAiSearch} className="text-xs text-gray-400 hover:text-red-400">Clear ✕</button>
            </div>
          )}
          {aiLoading && <p className="text-xs text-gray-400 mt-2 animate-pulse">AI is thinking...</p>}
        </div>
      </div>

      {/* Products */}
      <section id="products" className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {aiResults !== null ? `Results for "${aiQuery}"` : query ? `Results for "${query}"` : "All Products"}
          </h3>
          {!loading && <span className="text-sm text-gray-400">{filtered.length} items</span>}
        </div>

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

        {!loading && !error && (
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
                    <h4 className="text-gray-800 font-semibold text-sm mb-1 leading-snug hover:text-indigo-600 transition">{product.title}</h4>
                  </Link>
                  <p className="text-gray-400 text-xs flex-1 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-indigo-600">${product.price?.toFixed(2)}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`text-xs font-medium px-4 py-2 rounded-xl transition-all duration-150 active:scale-95 ${
                        addedId === product._id ? "bg-green-500 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
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
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-400 text-lg">No products found.</p>
            <button onClick={clearAiSearch} className="mt-3 text-indigo-500 text-sm hover:underline">Clear search</button>
          </div>
        )}
      </section>

      <footer className="bg-white border-t border-gray-100 text-center py-6 text-gray-400 text-sm">
        © 2025 ShopZone. All rights reserved.
      </footer>
    </div>
  );
}
