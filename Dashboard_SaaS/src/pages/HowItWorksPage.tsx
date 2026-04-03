import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-[#C1FF2F]">BlockVault</Link>
          <div className="space-x-4">
            <Link to="/pricing" className="text-sm hover:text-[#C1FF2F]">Pricing</Link>
            <Link to="/help" className="text-sm hover:text-[#C1FF2F]">Help</Link>
            <Link to="/login">
              <Button className="bg-[#C1FF2F] text-black hover:bg-[#B0E829]">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 text-center">How BlockVault Works</h1>
          
          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Institution Signs Up",
                description: "Educational institutions verify their identity and sign up on BlockVault with their credentials."
              },
              {
                step: "2",
                title: "Add Students",
                description: "Institutions add students to their dashboard and manage their academic records."
              },
              {
                step: "3",
                title: "Issue Credentials",
                description: "Generate and issue digital certificates linked to the blockchain network for each student."
              },
              {
                step: "4",
                title: "Student Access",
                description: "Students receive a unique credential passport and can share verified credentials instantly."
              },
              {
                step: "5",
                title: "Blockchain Verification",
                description: "Employers and institutions can verify credentials in real-time using blockchain technology."
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#C1FF2F] text-black font-bold">
                    {item.step}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
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
    </div>
  );
}
