"use client";

import Container from "@/components/shared/Container";
import SectionTitle from "@/components/shared/SectionTitle";
import FoodCard from "@/components/shared/FoodCard";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Food } from "@/lib/types";
import { getFoods } from "@/lib/api";

const filterTabs = ["All", "Popular", "Trending", "Top Rated"];

export default function FeaturedDishes() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    async function loadFoods() {
      setLoading(true);
      setError(null);
      const res = await getFoods({ limit: 12 });
      if (res.success && res.data) {
        setFoods(res.data);
      } else {
        setError(res.message);
      }
      setLoading(false);
    }
    loadFoods();
  }, []);

  const filteredFoods = foods.filter((food) => {
    if (activeTab === "All") return true;
    if (activeTab === "Popular") return food.tags?.includes("popular") || food.tags?.includes("bestseller");
    if (activeTab === "Trending") return food.tags?.includes("trending");
    if (activeTab === "Top Rated") return food.rating >= 4.7;
    return true;
  });

  return (
    <section className="bg-primary-bg-color py-10 md:py-14">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <SectionTitle
            subTitle="FEATURED DISHES"
            title="Our Most Popular Foods"
          />
          <Link
            href="/all-foods"
            className="text-primary-color hover:text-primary-color-dark font-medium flex items-center gap-0.5 text-sm transition-colors shrink-0"
          >
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? "bg-primary-color text-white shadow-md shadow-primary-color/20"
                  : "bg-white text-warm-text border border-gray-200 hover:border-primary-color hover:text-primary-color"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && <LoadingState count={8} />}

        {error && (
          <ErrorState
            message={error}
            onRetry={() => window.location.reload()}
          />
        )}

        {!loading && !error && filteredFoods.length === 0 && (
          <div className="text-center py-12">
            <p className="text-warm-muted text-lg">
              No dishes found for &quot;{activeTab}&quot;
            </p>
          </div>
        )}

        {!loading && !error && filteredFoods.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFoods.slice(0, 8).map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
