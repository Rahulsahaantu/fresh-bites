import Container from "@/components/shared/Container";
import SectionTitle from "@/components/shared/SectionTitle";

const steps = [
  {
    number: "01",
    emoji: "🍽️",
    title: "Choose Your Meal",
    description:
      "Browse our extensive menu of cuisines, filter by category, and pick your favorites from top-rated restaurants.",
    color: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    number: "02",
    emoji: "🚀",
    title: "Fast Delivery",
    description:
      "Our delivery partners bring your food fresh and hot to your doorstep in 30 minutes or less. Track in real-time.",
    color: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    number: "03",
    emoji: "😋",
    title: "Enjoy & Savor",
    description:
      "Sit back, relax, and enjoy restaurant-quality meals in the comfort of your home. Rate and review your experience.",
    color: "bg-blue-50",
    borderColor: "border-blue-200",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white py-12 md:py-16">
      <Container>
        <div className="text-center mb-10">
          <SectionTitle
            subTitle="HOW IT WORKS"
            title="Getting your food is easy"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`relative p-6 lg:p-8 rounded-2xl ${step.color} border ${step.borderColor} text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Step number */}
              <span className="absolute top-4 right-4 text-5xl font-black text-black/5">
                {step.number}
              </span>

              {/* Emoji icon */}
              <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">
                {step.emoji}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-warm-muted leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
