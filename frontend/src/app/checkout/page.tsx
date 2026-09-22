"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/shared/Container";
import EmptyState from "@/components/shared/EmptyState";
import { useCart } from "@/lib/cart";
import { createOrder } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  ShoppingBag,
  CreditCard,
  Banknote,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: "cash" | "card";
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, clearCart, isHydrated } = useCart();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "cash",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (formData.phone.replace(/\D/g, "").length < 7) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!formData.address.trim()) newErrors.address = "Delivery address is required";
    else if (formData.address.trim().length < 10) {
      newErrors.address = "Please enter a complete address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const orderData = {
        items: items.map((item) => ({
          foodId: item.foodId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
        },
        subtotal,
        deliveryFee,
        total,
      };

      const res = await createOrder(orderData);

      if (res.success && res.data) {
        clearCart();
        const orderId = res.data.orderId || res.data._id;
        router.push(`/order/${orderId}`);
      } else {
        setSubmitError(res.message || "Failed to place order. Please try again.");
      }
    } catch {
      setSubmitError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isHydrated) {
    return (
      <div className="bg-primary-bg-color min-h-screen">
        <Container className="py-8 md:py-12">
          <div className="h-8 w-48 skeleton rounded mb-6" />
        </Container>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-primary-bg-color min-h-screen">
        <Container className="py-8 md:py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          <EmptyState
            icon={<ShoppingBag className="h-10 w-10 text-gray-400" />}
            title="Nothing to checkout"
            description="Your cart is empty. Add some items before checking out."
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
          <Link href="/cart" className="hover:text-primary-color transition-colors">Cart</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 font-medium">Checkout</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Information */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  Delivery Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className={`h-11 rounded-xl ${errors.name ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-200" : ""}`}
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={`h-11 rounded-xl ${errors.email ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-200" : ""}`}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (234) 567-8900"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={`h-11 rounded-xl ${errors.phone ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-200" : ""}`}
                      aria-invalid={!!errors.phone}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="address"
                      placeholder="Street address, apartment, city, state, zip code"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      rows={3}
                      className={`w-full rounded-xl border px-3 py-2.5 text-base transition-colors outline-none resize-none focus:border-ring focus:ring-3 focus:ring-ring/50 ${
                        errors.address ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-input"
                      }`}
                      aria-invalid={!!errors.address}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  Payment Method
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: "cash" }))}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      formData.paymentMethod === "cash"
                        ? "border-primary-color bg-primary-color/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Banknote
                      className={`h-6 w-6 ${
                        formData.paymentMethod === "cash" ? "text-primary-color" : "text-gray-400"
                      }`}
                    />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Cash on Delivery</p>
                      <p className="text-xs text-warm-muted">Pay when you receive</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: "card" }))}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      formData.paymentMethod === "card"
                        ? "border-primary-color bg-primary-color/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard
                      className={`h-6 w-6 ${
                        formData.paymentMethod === "card" ? "text-primary-color" : "text-gray-400"
                      }`}
                    />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Credit / Debit Card</p>
                      <p className="text-xs text-warm-muted">Secure payment</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.foodId} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-warm-muted">
                          x{item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 shrink-0">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <hr className="border-gray-100 mb-4" />

                {/* Totals */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-muted">Subtotal</span>
                    <span className="font-medium">৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-muted">Delivery</span>
                    <span className={`font-medium ${deliveryFee === 0 ? "text-green-600" : ""}`}>
                      {deliveryFee === 0 ? "Free" : `৳৳{deliveryFee.toLocaleString()}`}
                    </span>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">৳{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Error */}
                {submitError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary-color text-white font-semibold rounded-full hover:bg-primary-color-dark transition-all duration-200 hover:shadow-lg hover:shadow-primary-color/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Place Order — ৳৳{total.toLocaleString()}`
                  )}
                </button>

                <Link
                  href="/cart"
                  className="flex items-center justify-center w-full py-3 mt-3 text-primary-color font-medium text-sm hover:bg-primary-color/5 rounded-full transition-colors"
                >
                  Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
