import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import food1 from "../assets/images/food1.jpg.webp";
import food2 from "../assets/images/food2.jpg.avif";
import food3 from "../assets/images/food3.jpg.avif";
import food4 from "../assets/images/food4.jpg.webp";

const sliderImages = [
  { src: food1, alt: "Food product" },
  { src: food2, alt: "Ingredients label" },
  { src: food3, alt: "Checking food label" },
  { src: food4, alt: "Packaged food" },
];
function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Preload images
  useEffect(() => {
    sliderImages.forEach((image) => {
      const img = new Image();
      img.src = image.src;
    });
  }, []);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sliderImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-4 pb-20 pt-32 sm:px-8">
      
      {/* Background blur shapes */}
      <div className="pointer-events-none absolute -left-16 top-20 h-56 w-56 rounded-full bg-emerald-100 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-28 h-72 w-72 rounded-full bg-green-100 blur-3xl" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
        
        {/* LEFT CONTENT */}
        <div>
          <p className="mb-5 inline-block rounded-full border border-green-100 bg-white/90 px-4 py-1 text-sm font-semibold text-green-700">
            Trusted food safety and awareness platform
          </p>

          <h1 className="max-w-xl text-5xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Know What You Eat
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Analyze packaged food ingredients, identify harmful chemicals, and
            discover safer alternatives while spreading awareness through a
            community-driven platform.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/home"
              className="inline-block rounded-full bg-green-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-green-700"
            >
              Start Scanning
            </Link>

            <a
              href="#about"
              className="inline-block rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-green-200 hover:text-green-700"
            >
              Learn More
            </a>
          </div>

          {/* Small stats */}
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
              <p className="text-lg font-bold text-slate-900">3-Step</p>
              <p className="text-xs text-slate-600">Safety workflow</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
              <p className="text-lg font-bold text-slate-900">Clear</p>
              <p className="text-xs text-slate-600">Risk insights</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
              <p className="text-lg font-bold text-slate-900">Community</p>
              <p className="text-xs text-slate-600">Shared awareness</p>
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE SLIDER */}
        <div className="relative mx-auto w-full max-w-xl">
          <div className="relative h-[420px] overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-3 shadow-xl backdrop-blur">

            {sliderImages.map((image, index) => (
              <img
                key={image.src}
                src={image.src}
                alt={image.alt}
                loading="eager"
                className={`absolute left-3 top-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] rounded-2xl object-cover transition-all duration-700 ease-in-out ${
                  index === activeIndex
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-105"
                }`}
              />
            ))}

          </div>

          {/* Dots */}
          <div className="mt-4 flex justify-center gap-2">
            {sliderImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition ${
                  index === activeIndex
                    ? "w-8 bg-green-600"
                    : "w-2.5 bg-green-200 hover:bg-green-300"
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;