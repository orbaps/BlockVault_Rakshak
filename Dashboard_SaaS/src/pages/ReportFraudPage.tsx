import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ReportFraudPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-[#C1FF2F]">BlockVault</Link>
          <Link to="/login">
            <Button className="bg-[#C1FF2F] text-black hover:bg-[#B0E829]">Sign In</Button>
          </Link>
        </div>
      </nav>

      <div className="flex-1 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Report Fraudulent Credentials</h1>
          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-[#C1FF2F]">Found Suspicious Activity?</h2>
              <p className="text-gray-400 mb-6">
                BlockVault is committed to maintaining the integrity of digital credentials. If you've encountered a fraudulent credential or suspicious activity, please report it to our fraud investigation team.
              </p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Credential ID or Link</label>
                  <input 
                    type="text" 
                    placeholder="Enter the credential ID"
                    className="w-full border rounded px-3 py-2 bg-[#0A0A0B] text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description of Issue</label>
                  <textarea 
                    placeholder="Describe what you observed"
                    rows={4}
                    className="w-full border rounded px-3 py-2 bg-[#0A0A0B] text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Email</label>
                  <input 
                    type="email"
                    placeholder="your@email.com"
                    className="w-full border rounded px-3 py-2 bg-[#0A0A0B] text-white"
                  />
                </div>
              </div>

              <Button className="w-full bg-[#C1FF2F] text-black hover:bg-[#B0E829]">
                Submit Report
              </Button>
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="font-bold mb-3">What Happens Next?</h3>
              <ol className="list-decimal pl-6 space-y-2 text-gray-400">
                <li>Our fraud investigation team will review your report</li>
                <li>We'll verify the credential using blockchain records</li>
                <li>Appropriate action will be taken if fraud is confirmed</li>
                <li>You'll be notified of the outcome</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          <p>Fraud Report Email: fraud@blockvault.io</p>
          <p>&copy; 2026 BlockVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
