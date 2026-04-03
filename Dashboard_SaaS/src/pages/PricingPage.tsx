import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-[#C1FF2F]">BlockVault</Link>
          <div className="space-x-4">
            <Link to="/how-it-works" className="text-sm hover:text-[#C1FF2F]">How It Works</Link>
            <Link to="/help" className="text-sm hover:text-[#C1FF2F]">Help</Link>
            <Link to="/login">
              <Button className="bg-[#C1FF2F] text-black hover:bg-[#B0E829]">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 text-center">Pricing Plans</h1>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { name: "Starter", price: "$99", features: ["Up to 100 students", "Basic certificate issuance", "Email support"] },
              { name: "Professional", price: "$299", features: ["Up to 1000 students", "Advanced features", "Priority support"], recommended: true },
              { name: "Enterprise", price: "Custom", features: ["Unlimited students", "Custom integration", "24/7 support"] },
            ].map((plan) => (
              <div key={plan.name} className={`border rounded-lg p-8 ${plan.recommended ? 'ring-2 ring-[#C1FF2F]' : ''}`}>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-[#C1FF2F] mb-6">{plan.price}/mo</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <span className="text-[#C1FF2F] mr-2">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.recommended ? "default" : "outline"}>
                  Choose Plan
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-400 mb-4">All plans include blockchain verification and secure credential storage</p>
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
