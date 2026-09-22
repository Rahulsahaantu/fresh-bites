import Banner from "@/components/modules/Home/banner";
import Categories from "@/components/modules/Home/categories";
import FeaturedDishes from "@/components/modules/Home/FeaturedDishes";
import HowItWorks from "@/components/modules/Home/HowItWorks";
import PromoSection from "@/components/modules/Home/PromoSection";

export default function Home() {
  return (
    <>
      <Banner />
      <Categories />
      <FeaturedDishes />
      <HowItWorks />
      <PromoSection />
    </>
  );
}
