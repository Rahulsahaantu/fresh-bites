"use client";

import Image from "next/image";
import Link from "next/link";
import Container from "@/components/shared/Container";
import QuantitySelector from "@/components/shared/QuantitySelector";
import EmptyState from "@/components/shared/EmptyState";
import { useCart } from "@/lib/cart";
import { Trash2, ShoppingCart, Truck, ChevronRight } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, deliveryFee, total, isHydrated } = useCart();

  if (!isHydrated) {
    return (
      <div className="bg-primary-bg-color min-h-screen">
        <Container className="py-8 md:py-12">
          <div className="h-8 w-48 skeleton rounded mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 skeleton rounded-xl" />
            ))}
          </div>
        </Container>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-primary-bg-color min-h-screen">
        <Container className="py-8 md:py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
          <EmptyState
            icon={<ShoppingCart className="h-10 w-10 text-gray-400" />}
            title="Your cart is empty"
            description="Looks like you haven't added any items to your cart yet. Explore our menu and find something delicious!"
            actionLabel="Browse Menu"
            actionHref="/all-foods"
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-primary-bg-color min-h-screen">
      <Container className="py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-warm-muted mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary-color transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 font-medium">Cart</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Cart</h1>
        <p className="text-warm-muted mb-8">
          {items.length} {items.length === 1 ? "item" : "items"} in your cart
        </p>

        {/* Delivery banner */}
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
          <Truck className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800">
            {subtotal >= 30
              ? "🎉 You've unlocked free delivery!"
              : `Add ৳${(30 - subtotal).toLocaleString()} more for free delivery (orders over $30)`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.foodId}
                className="flex gap-4 bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors"
              >
                {/* Image */}
                <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      {item.category && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-color">
                          {item.category}
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-900 text-base truncate">
                        {item.name}
                      </h3>
                      <p className="text-warm-muted text-sm mt-0.5">
                        ৳{item.price.toLocaleString()} each
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.foodId)}
                      className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <QuantitySelector
                      quantity={item.quantity}
                      onIncrement={() => updateQuantity(item.foodId, item.quantity + 1)}
                      onDecrement={() => updateQuantity(item.foodId, item.quantity - 1)}
                      size="sm"
                    />
                    <span className="font-bold text-gray-900">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-warm-muted">Subtotal</span>
                  <span className="font-medium text-gray-900">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-warm-muted">Delivery Fee</span>
                  <span className={`font-medium ${deliveryFee === 0 ? "text-green-600" : "text-gray-900"}`}>
                    {deliveryFee === 0 ? "Free" : `৳${deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-gray-900">
                    ৳{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary-color text-white font-semibold rounded-full hover:bg-primary-color-dark transition-all duration-200 hover:shadow-lg hover:shadow-primary-color/20 active:scale-[0.98]"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/all-foods"
                className="flex items-center justify-center gap-2 w-full py-3 mt-3 text-primary-color font-medium text-sm hover:bg-primary-color/5 rounded-full transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
