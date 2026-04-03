import { useEffect } from "react";
import BlockVaultChatbot from "@/components/BlockVaultChatbot";

const Index = () => {
  useEffect(() => {
    // Redirect to the BlockVault landing page
    window.location.href = "/landing___value_prop.html";
  }, []);

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "#0A0A0B", color: "#C1FF2F", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="text-center">
        <div className="w-12 h-12 bg-[#C1FF2F] flex items-center justify-center rounded-sm mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">BlockVault</h1>
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
      <BlockVaultChatbot />
    </div>
  );
};

export default Index;
