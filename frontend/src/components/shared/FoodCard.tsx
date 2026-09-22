"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, MapPin, Store } from "lucide-react";
import type { Food } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface FoodCardProps {
  food: Food;
}

export default function FoodCard({ food }: FoodCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addItem({
      foodId: food._id,
      name: food.name,
      price: food.price,
      quantity: 1,
      image: food.image,
      category: food.category,
    });
    setTimeout(() => setIsAdding(false), 400);
  };

  return (
    <Link
      href={`/food/${food._id}`}
      className="group block food-card-hover rounded-2xl bg-white border border-gray-100 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={food.image.startsWith("/uploads") ? `${API_BASE}${food.image}` : food.image}
          alt={food.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {food.tags && food.tags.includes("bestseller") && (
          <span className="absolute top-3 left-3 bg-primary-color text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wide">
            Bestseller
          </span>
        )}
        {food.tags && food.tags.includes("trending") && !food.tags.includes("bestseller") && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wide">
            Trending
          </span>
        )}
        {!food.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 text-sm font-semibold px-4 py-2 rounded-full">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Category */}
        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-color">
          {food.category}
        </span>

        {/* Name */}
        <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-1 group-hover:text-primary-color transition-colors">
          {food.name}
        </h3>

        {/* Restaurant Info */}
        {(food.restaurantName || food.location) && (
          <div className="flex flex-col gap-1 mt-1 text-xs text-gray-500">
            {food.restaurantName && (
              <span className="flex items-center gap-1">
                <Store className="w-3 h-3 text-orange-500 flex-shrink-0" />
                <span className="truncate">{food.restaurantName}</span>
              </span>
            )}
            {food.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="truncate">{food.location}</span>
              </span>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-warm-muted text-sm line-clamp-2 leading-relaxed mt-2">
          {food.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-gray-900">{food.rating}</span>
          {food.reviews && (
            <span className="text-xs text-warm-muted">({food.reviews} reviews)</span>
          )}
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-gray-900">
            ৳{food.price.toLocaleString()}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!food.available}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
              transition-all duration-200
              ${isAdding
                ? "bg-green-badge text-green-text scale-105"
                : "bg-primary-color text-white hover:bg-primary-color-dark active:scale-95"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={`Add ${food.name} to cart`}
          >
            <ShoppingCart className={`h-3.5 w-3.5 ${isAdding ? "cart-pulse" : ""}`} />
            {isAdding ? "Added!" : "Add"}
          </button>
        </div>
      </div>
    </Link>
  );
}
