"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/shared/Container";
import FoodCard from "@/components/shared/FoodCard";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { getFoods } from "@/lib/api";
import type { Food } from "@/lib/types";
import { Search, SlidersHorizontal, UtensilsCrossed } from "lucide-react";

const categories = ["All", "Burgers", "Pizza", "Asian", "Salads", "Desserts", "Drinks"];
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Name A-Z", value: "name" },
];

function AllFoodsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlCategory = searchParams.get("category") || "All";
  const urlSearch = searchParams.get("search") || "";

  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [sortBy, setSortBy] = useState("newest");

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params: { category?: string; search?: string; sort?: string } = {};
    if (activeCategory !== "All") params.category = activeCategory;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (sortBy !== "newest") params.sort = sortBy;

    const res = await getFoods(params);
    if (res.success && res.data) {
      setFoods(res.data);
    } else {
      setError(res.message);
    }
    setLoading(false);
  }, [activeCategory, searchQuery, sortBy]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  // Sync URL params on mount
  useEffect(() => {
    setActiveCategory(urlCategory);
    setSearchQuery(urlSearch);
  }, [urlCategory, urlSearch]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const params = new URLSearchParams();
    if (cat !== "All") params.set("category", cat);
    if (searchQuery) params.set("search", searchQuery);
    const q = params.toString();
    router.replace(`/all-foods${q ? `?${q}` : ""}`, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (activeCategory !== "All") params.set("category", activeCategory);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    const q = params.toString();
    router.replace(`/all-foods${q ? `?${q}` : ""}`, { scroll: false });
  };

  return (
    <div className="bg-primary-bg-color min-h-screen">
      <Container className="py-8 md:py-12">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Our Menu
          </h1>
          <p className="text-warm-muted text-base">
            Explore our wide variety of delicious dishes
          </p>
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-muted" />
              <Input
                placeholder="Search for food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-white border-gray-200 focus-visible:border-primary-color"
                aria-label="Search foods"
              />
            </div>
            <button
              type="submit"
              className="px-5 h-11 bg-primary-color text-white text-sm font-semibold rounded-xl hover:bg-primary-color-dark transition-colors"
            >
              Search
            </button>
          </form>

          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-muted pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 pl-10 pr-4 rounded-xl bg-white border border-gray-200 text-sm text-gray-700 appearance-none cursor-pointer hover:border-primary-color focus:border-primary-color focus:ring-2 focus:ring-primary-color/20 outline-none transition-colors min-w-[180px]"
              aria-label="Sort foods"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-primary-color text-white shadow-md shadow-primary-color/20"
                  : "bg-white text-warm-text border border-gray-200 hover:border-primary-color hover:text-primary-color"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading && <LoadingState count={8} />}

        {error && !loading && (
          <ErrorState message={error} onRetry={fetchFoods} />
        )}

        {!loading && !error && foods.length === 0 && (
          <EmptyState
            icon={<UtensilsCrossed className="h-10 w-10 text-gray-400" />}
            title="No foods found"
            description={
              searchQuery
                ? `No results for "${searchQuery}". Try a different search term.`
                : `No foods available in this category yet.`
            }
            actionLabel="View All Foods"
            actionHref="/all-foods"
          />
        )}

        {!loading && !error && foods.length > 0 && (
          <>
            <p className="text-sm text-warm-muted mb-4">
              Showing {foods.length} {foods.length === 1 ? "item" : "items"}
              {activeCategory !== "All" && ` in ${activeCategory}`}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {foods.map((food) => (
                <FoodCard key={food._id} food={food} />
              ))}
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

export default function AllFoodsPage() {
  return (
    <Suspense fallback={
      <div className="bg-primary-bg-color min-h-screen">
        <Container className="py-8 md:py-12">
          <div className="mb-8">
            <div className="h-9 w-48 skeleton rounded mb-2" />
            <div className="h-5 w-72 skeleton rounded" />
          </div>
          <LoadingState count={8} />
        </Container>
      </div>
    }>
      <AllFoodsContent />
    </Suspense>
  );
}
