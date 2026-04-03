export function BenefitsSection() {
  const logos = ["AICTE", "UGC", "IITs", "NITs", "RRU"];
  return (
    <section className="py-32 px-6 max-w-5xl mx-auto text-center">
      <h3 className="text-zinc-500 font-bold uppercase tracking-[0.3em] mb-12 text-sm">
        Trusted By Leading Institutions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-12 grayscale opacity-40">
        {logos.map((name) => (
          <div key={name} className="flex items-center justify-center font-black text-2xl tracking-tighter text-white">
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}
