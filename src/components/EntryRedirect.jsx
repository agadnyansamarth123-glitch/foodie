import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../services/supabase";

function EntryRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        navigate("/home", { replace: true });
        return;
      }

      navigate("/landing", { replace: true });
    }

    checkSession();
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <p className="text-sm font-medium text-slate-600">Checking session...</p>
    </main>
  );
}

export default EntryRedirect;
