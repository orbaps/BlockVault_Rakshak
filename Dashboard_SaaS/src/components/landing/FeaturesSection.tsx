import { useState } from "react";

const features = [
  {
    num: "01",
    title: "Instant Verification",
    desc: "Recruiters scan a QR code and instantly see blockchain proof, AI confidence score, and credential details — no manual checks needed.",
  },
  {
    num: "02",
    title: "Revocable Access",
    desc: "Students control who sees their credentials. Share with a verified bundle, then revoke access after hiring — zero friction.",
  },
  {
    num: "03",
    title: "AI Validation",
    desc: "Automated fraud detection and metadata analysis for external certificates, generating a reliable confidence score for verifiers.",
  },
];

export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <section className="bg-white text-black diagonal-section py-32 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">

        {/* Left: Features list */}
        <div className="lg:col-span-2">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-12">
            YOUR CREDENTIALS ARE FOR{" "}
            <span className="bg-black text-white px-4">TRUST</span>, NOT FOR FILING CABINETS.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, idx) => {
              const isActive = activeFeature === idx;
              return (
                <div
                  key={f.num}
                  onClick={() => setActiveFeature(isActive ? null : idx)}
                  className={`p-8 border-2 border-black rounded-3xl cursor-pointer transition-all duration-500 ${
                    isActive ? "bg-black text-white shadow-xl" : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`mb-6 w-12 h-12 flex items-center justify-center rounded-full font-black transition-colors ${
                      isActive ? "text-black" : "bg-black text-white"
                    }`}
                    style={isActive ? { background: "#C1FF2F" } : {}}
                  >
                    {f.num}
                  </div>
                  <h3 className="text-2xl font-black mb-4 uppercase">{f.title}</h3>
                  {isActive && (
                    <p className="font-medium leading-relaxed opacity-70">{f.desc}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Rotating text path */}
        <div className="relative flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className="w-full max-w-sm"
            style={{ animation: "spin 10s linear infinite" }}
          >
            <path id="circlePath" d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0" fill="transparent" />
            <text style={{ fontSize: "14px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em" }}>
              <textPath href="#circlePath">Stop Fraud • Verify Instantly • Trust Blockchain •</textPath>
            </text>
          </svg>
          <div className="absolute text-5xl font-black tracking-tighter">100%</div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>

      </div>
    </section>
  );
}
