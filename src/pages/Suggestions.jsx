import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../services/supabase";

const alternatives = [
  { item: "Soft Drinks", better: "Lemon Water / Coconut Water" },
  { item: "Chips", better: "Roasted Nuts / Makhana" },
  { item: "Instant Noodles", better: "Homemade Food" },
  { item: "Sugary Cereals", better: "Oats / Fruits" },
];

const tips = [
  "Avoid products with high sugar.",
  "Check the ingredient list before buying.",
  "Short ingredient lists are usually better.",
  "Avoid artificial colors and preservatives.",
];

const awareness = [
  {
    title: "Sugar",
    text: "Can contribute to weight gain and energy crashes.",
  },
  {
    title: "Phosphoric Acid",
    text: "May affect bone health when consumed in excess.",
  },
  {
    title: "Artificial Colors",
    text: "Can cause issues for sensitive children.",
  },
  {
    title: "Caffeine",
    text: "Can be addictive when consumed in large amounts.",
  },
];

function Suggestions() {
  const navigate = useNavigate();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth/login", { replace: true });
        return;
      }
      setIsCheckingSession(false);
    }
    checkSession();
  }, [navigate]);

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm font-medium text-slate-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-700">
                Better choices
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Smart food suggestions</h1>
            </div>
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="inline-flex rounded-full bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-green-600 hover:to-green-700"
            >
              Back to Home
            </button>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            Learn how to choose healthier foods, understand common ingredient risks, and swap unhealthy items for better alternatives.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Healthy Alternatives</h2>
            <div className="mt-5 space-y-4">
              {alternatives.map((option) => (
                <div
                  key={option.item}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="text-sm text-slate-500">{option.item}</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{option.better}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Food Safety Tips</h2>
            <ul className="mt-5 space-y-3">
              {tips.map((tip) => (
                <li
                  key={tip}
                  className="rounded-2xl border border-slate-100 bg-green-50 p-4 text-sm text-slate-700"
                >
                  <span className="mr-2 text-green-700">✔️</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl">
              🧪
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-700">
                Ingredient Awareness
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">What to watch for</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {awareness.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
              >
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Suggestions;
