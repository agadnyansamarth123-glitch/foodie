import { useNavigate } from "react-router-dom";

function FloatingButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/create-post")}
      aria-label="Create post"
      className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-brand-500 to-brand-600 text-3xl font-light text-white shadow-lg shadow-brand-600/30 transition hover:from-brand-600 hover:to-brand-700 hover:shadow-xl sm:bottom-8 sm:right-8"
    >
      +
    </button>
  );
}

export default FloatingButton;
