"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/all-foods?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="py-3 px-3 bg-white rounded-xl shadow-xl shadow-black/8 flex items-center w-full max-w-xl"
    >
      <Search size={18} className="ml-2 text-warm-muted shrink-0" />
      <Input
        placeholder="Search for sushi, burgers, poke bowls..."
        className="border-none focus-visible:ring-0 text-base placeholder:text-warm-muted text-warm-text shadow-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search for food"
      />
      <button
        type="submit"
        className="px-5 py-2 bg-primary-color text-white text-sm font-semibold rounded-lg hover:bg-primary-color-dark transition-colors shrink-0"
      >
        Search
      </button>
    </form>
  );
}
