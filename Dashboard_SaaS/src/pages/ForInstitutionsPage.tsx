import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ForInstitutionsPage() {
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">For Educational Institutions</h1>
          
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-[#C1FF2F]">Modernize Your Credential System</h2>
              <p className="text-gray-400 mb-4">
                BlockVault provides educational institutions with a secure, blockchain-based platform to issue and manage digital credentials at scale.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Secure Issuance", description: "Issue credentials that cannot be forged or altered" },
                { title: "Easy Integration", description: "Seamlessly integrate with existing systems" },
                { title: "Student Control", description: "Students control who can verify their credentials" },
                { title: "Real-time Verification", description: "Employers can verify credentials instantly" },
              ].map((item) => (
                <div key={item.title} className="border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-3 text-[#C1FF2F]">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link to="/login">
                <Button size="lg" className="bg-[#C1FF2F] text-black hover:bg-[#B0E829]">
                  Start Your Free Trial
                </Button>
              </Link>
            </div>
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
