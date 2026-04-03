import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function HeroSection() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [synced, setSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);

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

  const handleVerify = () => {
    if (synced || syncing) return;
    setSyncing(true);
    setTimeout(() => { setSyncing(false); setSynced(true); }, 2500);
  };

  return (
    <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
      {/* Left */}
      <div className="relative z-10">
        <span className="inline-block border border-[rgba(193,255,47,0.3)] text-[#C1FF2F] px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6 bg-[rgba(193,255,47,0.05)]">
          Eliminate Credential Fraud
        </span>

        <h1
          className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8 text-white"
          style={{ transform: `translate3d(${mouse.x * 0.5}px, ${mouse.y * 0.5}px, 0)` }}
        >
          CREDENTIALS <br />ON <span className="text-[#C1FF2F] italic">BLOCKCHAIN.</span>
        </h1>

        <p className="text-xl text-zinc-400 max-w-md mb-10 leading-relaxed">
          BlockVault doesn't just store credentials. It cryptographically verifies them on a blockchain
          ledger with <span className="text-white font-bold">SHA-256 Hashing</span>. If it's not on-chain, it can't be trusted.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Magnetic CTA button */}
          <button
            onClick={handleVerify}
            className={`magnetic-btn group ${synced ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div className="magnetic-btn-inner text-white">
              {!syncing && !synced && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#C1FF2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Verify a Credential
                </div>
              )}
              {syncing && (
                <div className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-[#C1FF2F]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Querying Ledger...
                </div>
              )}
              {synced && (
                <div className="flex items-center gap-3 text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Credential Verified
                </div>
              )}
            </div>
          </button>

          {/* Social proof avatars */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((u) => (
                <img key={u} src={`https://i.pravatar.cc/100?u=${u}`} className="w-10 h-10 rounded-full border-2 border-black" alt="user" />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white">+5k</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Interactive Phone Card */}
      <div className="relative flex justify-center lg:justify-end">
        <div
          className="glass-card w-[320px] h-[580px] rounded-[40px] p-6 relative overflow-hidden float"
          style={{ transform: `rotateX(${mouse.y}deg) rotateY(${-mouse.x}deg)` }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Credential</p>
              <h3 className="text-2xl font-black italic text-white">VERIFIED</h3>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#C1FF2F" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
          </div>

          {/* Credentials list */}
          <div className="space-y-4 mb-8">
            <div className="glass-card p-4 rounded-2xl flex items-center justify-between border-l-4 border-l-[#C1FF2F]">
              <div>
                <h4 className="font-bold text-sm text-white">B.Tech Computer Science</h4>
                <p className="text-[10px] text-zinc-500">IIT Demo University — 2024</p>
              </div>
              <div className="w-5 h-5 rounded-full border border-zinc-700" />
            </div>
            <div className="glass-card p-4 rounded-2xl flex items-center justify-between opacity-50">
              <div>
                <h4 className="font-bold text-sm text-white">AWS Cloud Practitioner</h4>
                <p className="text-[10px] text-zinc-500">Amazon Web Services — 2023</p>
              </div>
              <svg className="w-5 h-5" fill="#C1FF2F" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Blockchain ledger panel */}
          <div className="absolute bottom-6 left-6 right-6 h-48 glass-card rounded-2xl p-4 overflow-hidden border-t border-[rgba(193,255,47,0.2)]">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-3 h-3 text-[#C1FF2F]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">Blockchain Ledger</span>
            </div>
            <div className="grid grid-cols-7 gap-1 h-full">
              {Array.from({ length: 21 }).map((_, i) => (
                <div key={i} className="aspect-square rounded bg-white/[0.03] flex items-center justify-center text-[8px] text-zinc-700">
                  {i + 1}
                </div>
              ))}
              {synced && (
                <>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    className="col-span-2 rounded px-1 text-[9px] font-black text-black flex items-center"
                    style={{ background: "#C1FF2F" }}
                  >
                    SHA-256 ✓
                  </motion.div>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.1 }}
                    className="col-span-2 rounded px-1 text-[9px] font-black text-black flex items-center"
                    style={{ background: "#d4d4d4" }}
                  >
                    AI: 94%
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Decorative glows */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full mix-blend-screen blur-[80px] opacity-20" style={{ background: "#C1FF2F" }} />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-600 rounded-full mix-blend-screen blur-[100px] opacity-10" />
      </div>
    </section>
  );
}
