import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="p-8 border-t border-zinc-900 bg-black">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white flex items-center justify-center rounded-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <span className="font-black tracking-tighter uppercase text-white">BlockVault © 2026</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-600">
          <Link to="/help" className="hover:text-[#C1FF2F] transition-colors mt-1">Help</Link>
          <Link to="/report-fraud" className="bg-red-500/10 text-red-400 px-3 py-1 rounded border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors">
            Report Fraud
          </Link>
          <Link to="/terms" className="hover:text-[#C1FF2F] transition-colors mt-1">Terms</Link>
          <Link to="/refund-policy" className="hover:text-[#C1FF2F] transition-colors mt-1">Refund Policy</Link>
        </div>

        {/* Status */}
        <div className="text-xs font-mono animate-pulse" style={{ color: "#C1FF2F" }}>
          LEDGER_ONLINE // CREDENTIALS_VERIFIED
        </div>
      </div>
    </footer>
  );
}
