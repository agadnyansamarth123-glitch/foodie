import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../services/supabase";

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Suggestions Page</h1>
        <p className="mt-2 text-slate-600">
          Personalized food suggestions will appear here. Coming soon.
        </p>
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="mt-6 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Back to Home
        </button>
      </div>
    </main>
  );
}

export default Suggestions;
