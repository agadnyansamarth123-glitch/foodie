function FeatureCard({ title, description, icon }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:scale-[1.02] hover:shadow-xl">
      <div className="mb-5 inline-flex rounded-xl border border-brand-100 bg-brand-50 p-3 text-brand-700">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold text-slate-800">{title}</h3>
      <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
    </article>
  );
}

export default FeatureCard;
