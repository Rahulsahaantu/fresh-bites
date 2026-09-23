"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/shared/Container";
import { LoadingSpinner } from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import { getOrderById } from "@/lib/api";
import type { Order } from "@/lib/types";
import { CheckCircle2, Package, Truck, Clock, ArrowRight, MapPin, XCircle, AlertCircle } from "lucide-react";

function OrderConfirmationContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      setError(null);
      const res = await getOrderById(id);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError(res.message);
      }
      setLoading(false);
    }
    if (id) loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-primary-bg-color min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-primary-bg-color min-h-screen flex items-center">
        <Container>
          <ErrorState
            title="Order Not Found"
            message={error || "We couldn't find the details for this order."}
            onRetry={() => router.push("/")}
          />
        </Container>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isFailed = statusParam === "fail" || statusParam === "cancel" || order.status === "cancelled";

  return (
    <div className="bg-primary-bg-color min-h-screen">
      <Container className="py-10 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Status Header */}
          <div className="text-center mb-10 animate-in zoom-in duration-500">
            {isFailed ? (
              <>
                <div className="inline-flex items-center justify-center h-20 w-20 bg-red-100 rounded-full mb-6">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Payment Failed
                </h1>
                <p className="text-warm-text text-lg">
                  Unfortunately, your payment could not be processed. Please try placing the order again.
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center h-20 w-20 bg-green-100 rounded-full mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Order Confirmed!
                </h1>
                <p className="text-warm-text text-lg">
                  Thank you for your order, {order.customer.name.split(" ")[0]}. Your payment was successful.
                </p>
              </>
            )}
          </div>

          <div className="space-y-6">
            {/* Order Status & Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                <div>
                  <p className="text-sm text-warm-muted mb-1">Order ID</p>
                  <p className="font-semibold text-gray-900 break-all">{order._id}</p>
                </div>
                <div>
                  <p className="text-sm text-warm-muted mb-1">Order Date</p>
                  <p className="font-semibold text-gray-900">{orderDate}</p>
                </div>
                <div>
                  <p className="text-sm text-warm-muted mb-1">Status</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full font-medium text-sm capitalize">
                    <Clock className="h-3.5 w-3.5" />
                    {order.status || "Pending"}
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Delivery Address</h3>
                    <p className="text-warm-text text-sm leading-relaxed whitespace-pre-line">
                      {order.customer.address}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Truck className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Estimated Delivery</h3>
                    <p className="text-warm-text text-sm">
                      30 - 45 Minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary-color" />
                Order Details
              </h2>

              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                {order.items.map((item, index) => (
                  <div key={`${item.foodId}-${index}`} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-warm-muted">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-900 shrink-0">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-warm-muted">Subtotal</span>
                  <span className="font-medium text-gray-900">৳{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-warm-muted">Delivery Fee</span>
                  <span className={`font-medium ${order.deliveryFee === 0 ? "text-green-600" : "text-gray-900"}`}>
                    {order.deliveryFee === 0 ? "Free" : `৳${order.deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <span className="font-bold text-gray-900 text-lg">Total</span>
                  <span className="font-bold text-primary-color text-xl">৳{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/all-foods"
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-color text-white font-semibold rounded-full hover:bg-primary-color-dark transition-all duration-200 hover:shadow-lg hover:shadow-primary-color/20 active:scale-[0.98]"
              >
                Order More Food
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-full border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="bg-primary-bg-color min-h-screen">
        <LoadingSpinner />
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
