import Container from "@/components/shared/Container";
import Link from "next/link";
import { Star, Truck, Shield } from "lucide-react";

export default function PromoSection() {
  return (
    <section className="bg-linear-to-r from-primary-color to-primary-color-dark py-14 md:py-20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <Container className="relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Hungry? We&apos;ve got you covered.
          </h2>
          <p className="text-white/80 text-base md:text-lg mb-8 leading-relaxed">
            Join thousands of food lovers who trust FreshBites for their daily
            meals. Quality ingredients, talented chefs, and lightning-fast
            delivery.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              href="/all-foods"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary-color font-bold rounded-full hover:bg-gray-50 transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
            >
              Order Now
            </Link>
            <Link
              href="/all-foods"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 text-white font-semibold rounded-full border border-white/30 hover:bg-white/20 transition-all duration-200"
            >
              Browse Menu
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2 text-white/90">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">4.9 App Rating</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Truck className="h-5 w-5" />
              <span className="text-sm font-medium">30 Min Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">100% Safe & Hygienic</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
