import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "For Institutions", href: "/institutions" },
  { label: "Verify", href: "/verify" },
  { label: "Pricing", href: "/pricing" },
];

// BlockVault logo — exact match to reference
const BVLogo = () => (
  <div className="flex items-center gap-2">
    <div
      className="w-10 h-10 flex items-center justify-center rounded-xl"
      style={{ background: "#C1FF2F", boxShadow: "0 0 20px rgba(193,255,47,0.2)" }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="8" /><line x1="12" y1="16" x2="12" y2="19" />
        <line x1="5" y1="12" x2="8" y2="12" /><line x1="16" y1="12" x2="19" y2="12" />
        <line x1="7.05" y1="7.05" x2="9.17" y2="9.17" /><line x1="14.83" y1="14.83" x2="16.95" y2="16.95" />
        <line x1="7.05" y1="16.95" x2="9.17" y2="14.83" /><line x1="14.83" y1="9.17" x2="16.95" y2="7.05" />
      </svg>
    </div>
    <span className="font-black text-2xl tracking-tighter uppercase text-white">BlockVault</span>
  </div>
);

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-md border-b border-white/5" : ""
      }`}
    >
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/"><BVLogo /></Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest text-zinc-500">
          {navLinks.map((l) => (
            <Link key={l.href} to={l.href} className="hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-zinc-400 px-4 py-2 rounded-full font-bold text-sm hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center justify-center"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-black border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-4">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1 text-center py-2 border border-white/10 rounded-full text-sm font-bold text-zinc-400 hover:text-white">
                  Sign In
                </Link>
                <Link to="/signup" className="flex-1 text-center py-2 bg-white text-black rounded-full text-sm font-bold">
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
