import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BlockVaultChatbot from "@/components/BlockVaultChatbot";

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-[#C1FF2F]">BlockVault</Link>
          <div className="space-x-4">
            <Link to="/pricing" className="text-sm hover:text-[#C1FF2F]">Pricing</Link>
            <Link to="/how-it-works" className="text-sm hover:text-[#C1FF2F]">How It Works</Link>
            <Link to="/login">
              <Button className="bg-[#C1FF2F] text-black hover:bg-[#B0E829]">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 text-center">Help & Support</h1>
          
          <div className="space-y-8">
            {[
              {
                question: "How do I sign up?",
                answer: "Click on 'Get Started' and follow the signup process. You'll need to verify your institution identity."
              },
              {
                question: "How does blockchain verification work?",
                answer: "Each credential is cryptographically signed and stored on the blockchain, ensuring immutability and real-time verification."
              },
              {
                question: "Can students verify their credentials?",
                answer: "Yes! Students receive a unique credential passport and can share their credentials with anyone for instant blockchain verification."
              },
              {
                question: "Is my data secure?",
                answer: "Yes. We use industry-standard encryption and blockchain technology to ensure maximum security and privacy."
              },
            ].map((item) => (
              <div key={item.question} className="border-b pb-6">
                <h3 className="text-xl font-bold mb-3 text-[#C1FF2F]">{item.question}</h3>
                <p className="text-gray-400">{item.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-[#18181B] rounded-lg text-center">
            <p className="mb-4">Have more questions?</p>
            <p className="text-gray-400">Check out the chatbot widget for instant answers!</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          <div className="space-x-4 mb-4">
            <Link to="/terms" className="hover:text-gray-300">Terms</Link>
            <Link to="/refund-policy" className="hover:text-gray-300">Refund Policy</Link>
          </div>
          <p>&copy; 2026 BlockVault. All rights reserved.</p>
        </div>
      </footer>

      <BlockVaultChatbot />
    </div>
  );
}
