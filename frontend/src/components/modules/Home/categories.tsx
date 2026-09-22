import Container from "@/components/shared/Container";
import SectionTitle from "@/components/shared/SectionTitle";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const categories = [
  { name: "Burgers", emoji: "🍔", color: "bg-orange-50 hover:bg-orange-100", textColor: "text-orange-700" },
  { name: "Pizza", emoji: "🍕", color: "bg-red-50 hover:bg-red-100", textColor: "text-red-700" },
  { name: "Asian", emoji: "🍜", color: "bg-amber-50 hover:bg-amber-100", textColor: "text-amber-700" },
  { name: "Salads", emoji: "🥗", color: "bg-green-50 hover:bg-green-100", textColor: "text-green-700" },
  { name: "Desserts", emoji: "🍰", color: "bg-pink-50 hover:bg-pink-100", textColor: "text-pink-700" },
  { name: "Drinks", emoji: "🧃", color: "bg-sky-50 hover:bg-sky-100", textColor: "text-sky-700" },
];

export default function Categories() {
  return (
    <section className="bg-primary-bg-color py-10 md:py-14">
      <Container>
        {/* Section header */}
        <div className="flex justify-between items-center mb-8">
          <SectionTitle
            subTitle="CATEGORIES"
            title="What are you craving today?"
          />
          <Link
            href="/all-foods"
            className="text-primary-color hover:text-primary-color-dark font-medium flex items-center gap-0.5 text-sm transition-colors shrink-0"
          >
            See All <ChevronRight size={16} />
          </Link>
        </div>

        {/* Category cards */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/all-foods?category=${cat.name}`}
              className={`flex flex-col items-center gap-3 min-w-[120px] sm:min-w-[140px] p-6 rounded-2xl ${cat.color} transition-all duration-200 hover:shadow-md hover:-translate-y-1 group`}
            >
              <span className="text-4xl sm:text-5xl transition-transform duration-200 group-hover:scale-110">
                {cat.emoji}
              </span>
              <span className={`text-sm font-semibold ${cat.textColor}`}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
