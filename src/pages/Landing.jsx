import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import LandingNavbar from "../components/LandingNavbar";
import { useEffect } from "react";

const features = [
  {
    title: "Ingredient Scanner",
    description:
      "Scan packaged products and break down ingredient lists into understandable safety insights.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
        <path
          d="M11 4a7 7 0 1 0 4.4 12.45L20 21l1-1-4.55-4.55A7 7 0 0 0 11 4Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Risk Detection",
    description:
      "Flag potentially harmful additives and chemicals so users can make confident decisions.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
        <path
          d="m12 4 8 14H4L12 4Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 9v4m0 3h.01" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    title: "Safer Alternatives",
    description:
      "Discover cleaner food options and practical substitutes that support long-term health.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
        <path
          d="M6 18c7 0 11-4 12-12-8 1-12 5-12 12Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function Landing() {
  useEffect(() => {
    const animatedItems = document.querySelectorAll(".animate-on-scroll");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    animatedItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen">
      <LandingNavbar />
      <Hero />

      <section id="about" className="animate-on-scroll px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-brand-100 bg-white/90 p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-slate-900">
              What is FoodGuard?
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              FoodGuard helps users scan food ingredients, detect harmful
              substances, and spread awareness through community posts. It
              combines ingredient analysis, risk education, and social learning
              so people can make safer food choices with confidence.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                Scan products
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                Detect harmful ingredients
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                Share awareness posts
              </div>
            </div>
          </div>
          <div className="mx-auto mt-8 inline-flex rounded-2xl border border-brand-100 bg-brand-50 p-4 text-brand-700">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
              <path
                d="M7 4h10v16H7zM9 8h6M9 12h6M9 16h4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </section>

      <section className="animate-on-scroll px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Features</h2>
            <p className="mt-3 text-slate-600">
              Built to make healthy choices simple and informed.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="animate-on-scroll px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-100 bg-white p-8 shadow-sm md:p-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Why Food Awareness Matters
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div
              className="animate-on-scroll rounded-2xl border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{ transitionDelay: "80ms" }}
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                Point 01
              </p>
              <p className="mt-3 text-sm font-medium text-slate-700">
                Hidden chemicals in packaged foods
              </p>
            </div>
            <div
              className="animate-on-scroll rounded-2xl border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{ transitionDelay: "160ms" }}
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                Point 02
              </p>
              <p className="mt-3 text-sm font-medium text-slate-700">
                Long-term health risks
              </p>
            </div>
            <div
              className="animate-on-scroll rounded-2xl border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{ transitionDelay: "240ms" }}
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                Point 03
              </p>
              <p className="mt-3 text-sm font-medium text-slate-700">
                Importance of informed choices
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="animate-on-scroll px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Community-driven Awareness
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            FoodGuard is more than a scanner. Users can publish food experience
            posts, discuss ingredient concerns, and help others avoid risky
            products through practical real-world awareness.
          </p>
          <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/60 p-5 text-sm text-slate-700">
            Together, we build a trusted community focused on transparency,
            healthier habits, and informed daily food choices.
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default Landing;
