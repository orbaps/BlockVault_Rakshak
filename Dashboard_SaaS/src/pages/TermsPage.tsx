import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="text-2xl font-bold text-[#C1FF2F]">BlockVault</Link>
        </div>
      </nav>

      <div className="flex-1 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <div className="prose prose-invert max-w-none">
            <h2>1. Agreement to Terms</h2>
            <p>By accessing and using BlockVault, you accept and agree to be bound by the terms and provision of this agreement.</p>
            
            <h2>2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on BlockVault's website for personal, non-commercial transitory viewing only.</p>
            
            <h2>3. Disclaimer</h2>
            <p>The materials on BlockVault's website are provided on an 'as is' basis. BlockVault makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            
            <h2>4. Limitations</h2>
            <p>In no event shall BlockVault or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on BlockVault's website.</p>
            
            <h2>5. Accuracy of Materials</h2>
            <p>The materials appearing on BlockVault's website could include technical, typographical, or photographic errors. BlockVault does not warrant that any of the materials on its website are accurate, complete, or current.</p>
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
