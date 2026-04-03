import { useState } from "react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "Free",
    subtitle: "Forever",
    features: ["Up to 50 credentials/mo", "Basic passport page", "QR verification", "Email support"],
    cta: "Get Started",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Institution",
    price: "₹4,999",
    subtitle: "/month",
    features: ["Unlimited credentials", "Custom branding", "Bulk upload via CSV", "Analytics dashboard", "Priority support", "Blockchain Explorer access"],
    cta: "Start Free Trial",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    subtitle: "Contact us",
    features: ["Everything in Institution", "Dedicated blockchain node", "API access", "White-label solution", "SLA guarantee", "Dedicated account manager"],
    cta: "Contact Sales",
    href: "/help",
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section className="py-32 px-6" style={{ background: "#0A0A0B" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block border border-[rgba(193,255,47,0.3)] text-[#C1FF2F] px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6 bg-[rgba(193,255,47,0.05)]">
            Pricing
          </span>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white leading-tight">
            SIMPLE,<br/><span className="italic text-[#C1FF2F]">HONEST PRICING.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 border transition-all ${
                plan.highlight
                  ? "border-[#C1FF2F] bg-[#C1FF2F] text-black"
                  : "border-white/8 glass-card text-white"
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">{plan.name}</p>
              <div className="mb-6">
                <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                <span className="text-sm font-bold opacity-50 ml-1">{plan.subtitle}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm font-medium">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke={plan.highlight ? "black" : "#C1FF2F"} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.href}
                className={`block w-full text-center py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${
                  plan.highlight
                    ? "bg-black text-[#C1FF2F] hover:bg-zinc-900"
                    : "border border-white/10 text-white hover:border-[#C1FF2F] hover:text-[#C1FF2F]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
