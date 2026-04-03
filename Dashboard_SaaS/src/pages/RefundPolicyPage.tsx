import { Link } from "react-router-dom";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="text-2xl font-bold text-[#C1FF2F]">BlockVault</Link>
        </div>
      </nav>

      <div className="flex-1 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
          <div className="prose prose-invert max-w-none space-y-4">
            <h2>30-Day Money-Back Guarantee</h2>
            <p>We offer a 30-day money-back guarantee on all subscription plans. If you're not satisfied with BlockVault, you can request a full refund within 30 days of your initial purchase.</p>
            
            <h2>How to Request a Refund</h2>
            <p>To request a refund, please contact our support team at support@blockvault.io with your account details and reason for refund.</p>
            
            <h2>Refund Eligibility</h2>
            <ul className="list-disc pl-6">
              <li>Refund requests must be made within 30 days of purchase</li>
              <li>Only for subscription charges, not for issued credentials or stored data</li>
              <li>One refund per customer per subscription tier</li>
            </ul>
            
            <h2>Processing Time</h2>
            <p>Approved refunds are processed within 5-7 business days and returned to your original payment method.</p>
            
            <h2>Exceptions</h2>
            <p>Refunds may not be issued for accounts that have violated our Terms of Service or engaged in fraudulent activity.</p>
          </div>
        </div>
      </div>

      <footer className="border-t py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          <p>&copy; 2026 BlockVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
