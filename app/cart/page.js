"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";

export default function CartPage() {
  const { cart, removeFromCart, updateQty, clearCart, totalItems, totalPrice } = useCart();
  const [step, setStep] = useState("cart"); // "cart" | "checkout" | "thankyou"
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", address: "", city: "", zip: "" });
  const [formError, setFormError] = useState("");

  const shipping = totalPrice >= 50 ? 0 : 4.99;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shipping + tax;

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.name || !form.email || !form.address || !form.city || !form.zip) {
      setFormError("Please fill in all fields.");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: cart.map((item) => ({
            productId: item._id,
            title: item.title,
            image: item.image,
            price: item.price,
            qty: item.qty,
          })),
          subtotal: totalPrice,
          shipping,
          tax,
          total,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Something went wrong.");
        return;
      }
      setOrder(data);
      clearCart();
      setStep("thankyou");
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  // ── Thank You Screen ──────────────────────────────────────────────
  if (step === "thankyou") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Order Placed!</h1>
            <p className="text-gray-400 mb-1">Thank you, <span className="font-semibold text-gray-700">{order?.customer?.name}</span> 🎉</p>
            <p className="text-gray-400 text-sm mb-6">
              A confirmation will be sent to <span className="font-medium text-indigo-600">{order?.customer?.email}</span>
            </p>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 text-left mb-6 space-y-2">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Order Summary</p>
              {order?.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 font-medium line-clamp-1">{item.title}</p>
                    <p className="text-xs text-gray-400">× {item.qty}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">${(item.price * item.qty).toFixed(2)}</p>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-3 mt-3 space-y-1 text-sm text-gray-500">
                <div className="flex justify-between"><span>Subtotal</span><span>${order?.subtotal?.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{order?.shipping === 0 ? "Free" : `$${order?.shipping?.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>${order?.tax?.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-gray-800 text-base pt-1 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-indigo-600">${order?.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-400 bg-indigo-50 rounded-xl px-4 py-2 mb-6">
              Order ID: <span className="font-mono text-indigo-600">{order?._id}</span>
            </div>

            <Link href="/products"
              className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition text-center">
              Continue Shopping
            </Link>
          </div>
        </div>
        <footer className="bg-white border-t border-gray-100 text-center py-6 text-gray-400 text-sm">
          © 2025 ShopZone. All rights reserved.
        </footer>
      </div>
    );
  }

  // ── Empty Cart ────────────────────────────────────────────────────
  if (cart.length === 0 && step === "cart") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto text-center py-32 px-6">
          <p className="text-7xl mb-6">🛒</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Looks like you haven't added anything yet.</p>
          <Link href="/products" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Steps indicator */}
        <div className="flex items-center gap-3 mb-10">
          {["cart", "checkout"].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 text-sm font-semibold ${step === s ? "text-indigo-600" : "text-gray-400"}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}>{i + 1}</span>
                {s === "cart" ? "Cart" : "Checkout"}
              </div>
              {i === 0 && <span className="text-gray-300">→</span>}
            </div>
          ))}
        </div>

        {/* ── CART STEP ── */}
        {step === "cart" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-800">Your Cart <span className="text-gray-400 font-normal text-lg">({totalItems} items)</span></h1>
                <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 hover:underline transition">Clear all</button>
              </div>

              {cart.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 items-center">
                  <Link href={`/products/${item._id}`}>
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 cursor-pointer">
                      <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item._id}`}>
                      <p className="text-gray-800 font-semibold text-sm hover:text-indigo-600 transition line-clamp-1">{item.title}</p>
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                    <p className="text-indigo-600 font-bold text-sm mt-1">${item.price?.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => updateQty(item._id, item.qty - 1)} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center font-bold transition">−</button>
                    <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => updateQty(item._id, item.qty + 1)} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center font-bold transition">+</button>
                  </div>
                  <p className="text-sm font-bold text-gray-800 w-16 text-right shrink-0">${(item.price * item.qty).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item._id)} className="text-gray-300 hover:text-red-400 transition text-lg ml-1">✕</button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-800 mb-5">Order Summary</h2>
                <div className="space-y-2 text-sm text-gray-500 border-b border-gray-100 pb-4 mb-4">
                  <div className="flex justify-between"><span>Subtotal ({totalItems} items)</span><span>${totalPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span className={shipping === 0 ? "text-green-600 font-medium" : ""}>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
                  <div className="flex justify-between"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-base mb-1">
                  <span>Total</span>
                  <span className="text-indigo-600">${total.toFixed(2)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-amber-500 mb-4">Add ${(50 - totalPrice).toFixed(2)} more for free shipping</p>
                )}
                <button onClick={() => setStep("checkout")} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold py-3.5 rounded-xl transition-all">
                  Proceed to Checkout →
                </button>
                <Link href="/products" className="block text-center text-sm text-indigo-500 hover:underline mt-4">← Continue Shopping</Link>
              </div>
            </div>
          </div>
        )}

        {/* ── CHECKOUT STEP ── */}
        {step === "checkout" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* LEFT — Checkout Form */}
            <div className="lg:col-span-3">
              <button onClick={() => setStep("cart")} className="flex items-center gap-1 text-sm text-gray-400 hover:text-indigo-600 mb-6 transition">
                ← Back to Cart
              </button>

              <form onSubmit={handlePlaceOrder} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Shipping Details</h2>
                  <p className="text-gray-400 text-sm mt-1">Enter your delivery information below</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input name="name" value={form.name} onChange={handleFormChange} placeholder="John Doe" required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="john@example.com" required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                  <input name="address" value={form.address} onChange={handleFormChange} placeholder="123 Main Street, Apt 4B" required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                    <input name="city" value={form.city} onChange={handleFormChange} placeholder="New York" required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ZIP / Postal Code</label>
                    <input name="zip" value={form.zip} onChange={handleFormChange} placeholder="10001" required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
                  </div>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-3 py-2">
                  {[["🔒", "Secure Checkout"], ["🚚", "Fast Delivery"], ["↩️", "Easy Returns"]].map(([icon, label]) => (
                    <div key={label} className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl py-3 text-center">
                      <span className="text-xl">{icon}</span>
                      <span className="text-xs text-gray-500 font-medium">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Payment note */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                  <span>💳</span> Payment integration coming soon — orders are saved for demo purposes.
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                    <span>❌</span> {formError}
                  </div>
                )}

                <button type="submit" disabled={placing}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base">
                  {placing
                    ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Placing Order...</>
                    : <>Place Order — ${total.toFixed(2)} →</>}
                </button>
              </form>
            </div>

            {/* RIGHT — Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-800 mb-5">Order Summary</h2>

                {/* Items list */}
                <div className="space-y-4 mb-5">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
                        <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {item.qty}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-semibold line-clamp-1">{item.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                        <p className="text-xs text-indigo-500 font-medium mt-0.5">${item.price?.toFixed(2)} each</p>
                      </div>
                      <p className="text-sm font-bold text-gray-800 shrink-0">${(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-medium text-gray-700">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-600 font-semibold" : "font-medium text-gray-700"}>
                      {shipping === 0 ? "Free 🎉" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span className="font-medium text-gray-700">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-extrabold text-indigo-600">${total.toFixed(2)}</span>
                </div>

                {shipping > 0 && (
                  <p className="text-xs text-amber-500 mt-3 bg-amber-50 rounded-lg px-3 py-2 text-center">
                    Add ${(50 - totalPrice).toFixed(2)} more to get free shipping!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-white border-t border-gray-100 text-center py-6 text-gray-400 text-sm mt-10">
        © 2025 ShopZone. All rights reserved.
      </footer>
    </div>
  );
}
