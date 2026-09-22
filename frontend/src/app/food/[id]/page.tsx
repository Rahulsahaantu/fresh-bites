"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Container from "@/components/shared/Container";
import QuantitySelector from "@/components/shared/QuantitySelector";
import { LoadingSpinner } from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import { getFoodById } from "@/lib/api";
import { useCart } from "@/lib/cart";
import type { Food } from "@/lib/types";
import { Star, ArrowLeft, ShoppingCart, Check, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function FoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const id = params.id as string;

  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function loadFood() {
      setLoading(true);
      setError(null);
      const res = await getFoodById(id);
      if (res.success && res.data) {
        setFood(res.data);
      } else {
        setError(res.message);
      }
      setLoading(false);
    }
    if (id) loadFood();
  }, [id]);

  const handleAddToCart = () => {
    if (!food) return;
    addItem({
      foodId: food._id,
      name: food.name,
      price: food.price,
      quantity,
      image: food.image,
      category: food.category,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-primary-bg-color min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="bg-primary-bg-color min-h-screen">
        <Container className="py-12">
          <ErrorState
            title="Food Not Found"
            message={error || "This food item could not be found."}
            onRetry={() => router.back()}
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-primary-bg-color min-h-screen">
      <Container className="py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-warm-muted mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary-color transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/all-foods" className="hover:text-primary-color transition-colors">Menu</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 font-medium truncate">{food.name}</span>
        </nav>

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-warm-text hover:text-primary-color transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={food.image}
              alt={food.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {!food.available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-full text-lg">
                  Currently Unavailable
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            {/* Category badge */}
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary-color bg-primary-color/10 px-3 py-1 rounded-full">
              {food.category}
            </span>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {food.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.floor(food.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-900">{food.rating}</span>
              {food.reviews && (
                <span className="text-warm-muted text-sm">
                  ({food.reviews} reviews)
                </span>
              )}
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-primary-color">
              ৳{food.price.toLocaleString()}
            </div>

            {/* Description */}
            <p className="text-warm-text leading-relaxed text-base">
              {food.description}
            </p>

            {/* Ingredients */}
            {food.ingredients && food.ingredients.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                  Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {food.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {food.tags && food.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {food.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full capitalize"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantity
                </label>
                <QuantitySelector
                  quantity={quantity}
                  onIncrement={() => setQuantity((q) => Math.min(q + 1, 20))}
                  onDecrement={() => setQuantity((q) => Math.max(q - 1, 1))}
                />
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!food.available || isAdded}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-200 ${
                  isAdded
                    ? "bg-green-500 text-white"
                    : "bg-primary-color text-white hover:bg-primary-color-dark hover:shadow-lg hover:shadow-primary-color/20 active:scale-[0.98]"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isAdded ? (
                  <>
                    <Check className="h-5 w-5" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart — ${(food.price * quantity).toLocaleString()}
                  </>
                )}
              </button>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  food.available ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-warm-muted">
                {food.available ? "Available for order" : "Currently unavailable"}
              </span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
