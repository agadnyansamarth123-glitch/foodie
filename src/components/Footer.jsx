import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer
      id="contact"
      className="mt-24 border-t border-slate-300/70 bg-slate-100 px-4 py-12 sm:px-8"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-8 sm:flex-row">
        <div>
          <h4 className="text-lg font-bold text-brand-700">FoodGuard</h4>
          <p className="mt-2 max-w-sm text-sm text-slate-600">
            FoodGuard helps users scan ingredients, identify harmful substances,
            and build safer eating habits through shared awareness.
          </p>
          <p className="mt-4 text-xs text-slate-500">
            © 2026 FoodGuard. All rights reserved.
          </p>
        </div>

        <div className="flex gap-6 text-sm font-medium text-slate-700 sm:items-start">
          <Link to="/" className="transition hover:text-brand-600">
            Home
          </Link>
          <a href="#about" className="transition hover:text-brand-600">
            About
          </a>
          <a href="#contact" className="transition hover:text-brand-600">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
