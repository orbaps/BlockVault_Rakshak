import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function HowItWorksSection() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [step, setStep] = useState<"auth" | "success">("auth");
  const [credAccess, setCredAccess] = useState(true);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const handleAuth = () => {
    if (isAuthorizing || !credAccess) return;
    setIsAuthorizing(true);
    setTimeout(() => { setIsAuthorizing(false); setStep("success"); }, 2000);
  };

  return (
    <section className="py-32 px-6 flex items-center justify-center relative z-10">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-16 items-center">

        {/* Left: Narrative */}
        <div
          className="space-y-8"
          style={{ transform: `translate3d(${mouse.x * 0.2}px, ${mouse.y * 0.2}px, 0)` }}
        >
          <span className="inline-block border border-[rgba(193,255,47,0.3)] text-[#C1FF2F] px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[rgba(193,255,47,0.05)]">
            Seamless Integration
          </span>
          <h2 className="text-5xl md:text-6xl font-black leading-tight tracking-tighter uppercase text-white">
            LINK YOUR <br /><span className="italic text-[#C1FF2F]">CREDENTIALS.</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            By authorizing, recruiters and institutions gain the ability to securely manage and verify
            your blockchain-backed credential passport directly inside their existing dashboard.
          </p>

          {/* Connection visual */}
          <div className="flex items-center gap-6 pt-8">
            <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center float">
              <div className="w-8 h-8 flex items-center justify-center rounded-sm" style={{ background: "#C1FF2F" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
            </div>
            <div className="flex-grow h-[2px] bg-zinc-800 relative overflow-hidden">
              <div
                className="absolute inset-0 h-full"
                style={{
                  background: "linear-gradient(90deg, transparent, #C1FF2F, transparent)",
                  animation: "slide-line 2s linear infinite",
                }}
              />
            </div>
            <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center float" style={{ animationDelay: "-1s" }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right: OAuth consent card */}
        <div
          className="glass-card rounded-[40px] p-8 md:p-10 relative overflow-hidden shadow-2xl"
          style={{ transform: `rotateX(${mouse.y * 0.3}deg) rotateY(${-mouse.x * 0.3}deg)` }}
        >
          {/* Card header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative mb-6">
              <img src="https://i.pravatar.cc/150?u=blockvault_user" className="w-20 h-20 rounded-full border-4 border-black" alt="User Avatar" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-4 border-black flex items-center justify-center overflow-hidden">
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-white">Authorize BlockVault</h3>
            <p className="text-zinc-500 text-sm mt-1">student@university.ac.in</p>
          </div>

          {/* Permission items */}
          <div className="space-y-4 mb-10">
            <label
              className={`block glass-card p-5 rounded-3xl border-l-4 transition-all duration-300 cursor-pointer ${
                credAccess ? "border-l-[#C1FF2F]" : "border-l-zinc-800 opacity-60"
              }`}
              onClick={() => setCredAccess(!credAccess)}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-sm text-white">Credential Passport</h4>
                  <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">Read and write access to manage verified credentials</p>
                </div>
                <div className={`w-4 h-4 rounded border mt-1 flex items-center justify-center transition-all ${credAccess ? "border-transparent" : "border-zinc-700"}`}
                  style={{ background: credAccess ? "#C1FF2F" : "transparent" }}>
                  {credAccess && <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
              </div>
            </label>
          </div>

          {/* Action button */}
          <button
            onClick={handleAuth}
            disabled={isAuthorizing || !credAccess}
            className="magnetic-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="magnetic-btn-inner w-full justify-center text-white">
              {!isAuthorizing ? (
                <div className="flex items-center justify-center w-full gap-2">
                  <span>Allow Access</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full gap-3">
                  <svg className="animate-spin h-5 w-5 text-[#C1FF2F]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="tracking-widest uppercase text-xs font-black">Encrypting...</span>
                </div>
              )}
            </div>
          </button>

          {/* Success overlay */}
          {step === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center rounded-[40px]"
              style={{ background: "#0A0A0B" }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: "#C1FF2F", boxShadow: "0 0 50px rgba(193,255,47,0.4)" }}
              >
                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" strokeWidth={4} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-black tracking-tighter mb-2 uppercase text-white">Access Granted</h3>
              <p className="text-zinc-500 text-sm max-w-[240px] leading-relaxed">
                BlockVault is now connected to your credential passport.
              </p>
              <div className="mt-8 flex justify-center gap-2">
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#C1FF2F", animationDelay: `${d}s` }} />
                ))}
              </div>
              <button
                onClick={() => setStep("auth")}
                className="mt-8 text-zinc-600 text-xs hover:text-white uppercase font-bold tracking-widest transition-colors border-b border-zinc-600 hover:border-white"
              >
                Reset Demo
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-line {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
}
