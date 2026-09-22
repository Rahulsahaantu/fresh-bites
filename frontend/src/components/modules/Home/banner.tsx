import Image from "next/image";
import bannerImage from "@/assets/banner_image.png";
import Container from "@/components/shared/Container";
import { Flame } from "lucide-react";
import SearchBar from "./SearchBar";
import Link from "next/link";

export default function Banner() {
  return (
    <section className="bg-linear-to-b from-[#FFDBD166] via-primary-bg-color to-[#F0F3FF]">
      <Container className="w-full flex xl:flex-row flex-col-reverse justify-between items-center flex-wrap py-10 md:py-14 lg:py-16 lg:gap-8 gap-6">
        {/* Banner content */}
        <div className="space-y-5 md:space-y-6 flex-1 max-w-xl">
          <div className="flex items-center gap-x-1.5 font-semibold py-2 px-4 rounded-full bg-green-badge w-fit">
            <Flame color="#217128" fill="#217128" className="h-4 w-4" />
            <span className="text-xs text-green-text">
              Lightning Fast Delivery in 30 Mins
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            Fresh cravings, <br />
            <span className="text-primary-color">delivered hot </span>to your
            door.
          </h2>

          <p className="text-warm-text text-base md:text-lg leading-relaxed max-w-lg">
            Discover top-rated local restaurants, gourmet street food, and
            farm-fresh organic bowls crafted by award-winning chefs.
          </p>

          <SearchBar />

          <Link
            href="/all-foods"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-color text-white font-semibold rounded-full hover:bg-primary-color-dark transition-all duration-200 hover:shadow-lg hover:shadow-primary-color/20 active:scale-[0.98]"
          >
            Explore Food
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Banner image */}
        <div className="flex-shrink-0 w-full max-w-[280px] md:max-w-[380px] lg:max-w-[440px] xl:max-w-[500px]">
          <Image
            src={bannerImage}
            alt="Delicious food bowl with fresh ingredients"
            priority
            className="w-full h-auto"
          />
        </div>
      </Container>
    </section>
  );
}
