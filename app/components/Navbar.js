"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100">
      <Link href="/" className="text-2xl font-extrabold text-indigo-600 tracking-tight">
        🛒 ShopZone
      </Link>

      <div className="flex gap-6 text-gray-600 font-medium text-sm">
        <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
        <Link href="/products" className="hover:text-indigo-600 transition">Products</Link>
        <Link href="/admin/add-product" className="hover:text-indigo-600 transition">Add Product</Link>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/cart"
          className="relative bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          🛒 Cart
          {totalItems > 0 && (
            <span className="bg-white text-indigo-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
