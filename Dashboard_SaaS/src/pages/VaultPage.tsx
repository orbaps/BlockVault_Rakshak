import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Trash2, Share2, Hash, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const mockDocs = [
  { id: 1, name: "Passport.pdf", hash: "a3f2c8...e1b4", uploaded: "Jan 10, 2024", size: "2.4 MB" },
  { id: 2, name: "BSc_Degree.pdf", hash: "7d9e1a...f3c2", uploaded: "Feb 15, 2024", size: "1.8 MB" },
  { id: 3, name: "Driver_License.jpg", hash: "b5c4d2...a8e6", uploaded: "Mar 20, 2024", size: "3.1 MB" },
  { id: 4, name: "Professional_Cert.pdf", hash: "e2f1b9...c7d3", uploaded: "Apr 5, 2024", size: "1.2 MB" },
];

export default function VaultPage() {
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);

  const toggleDoc = (id: number) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-foreground">Document Vault</h1>
          <p className="text-sm text-muted-foreground mt-1">Securely store and share verified documents.</p>
        </div>
        <div className="flex gap-2">
          {selectedDocs.length > 0 && (
            <Button size="sm" variant="outline">
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              Create Bundle ({selectedDocs.length})
            </Button>
          )}
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Upload
          </Button>
        </div>
      </div>

      <div className="mb-6 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer bg-card">
        <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-foreground font-medium">Drop documents here or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">Files will be hashed and stored securely. PDF, PNG, JPG up to 20MB.</p>
      </div>

      <div className="space-y-3">
        {mockDocs.map((doc, i) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className={`border-border cursor-pointer transition-all ${
                selectedDocs.includes(doc.id) ? "ring-1 ring-primary border-primary/30" : ""
              }`}
              onClick={() => toggleDoc(doc.id)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-9 w-9 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{doc.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {doc.hash}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{doc.size}</span>
                    <span className="text-[10px] text-muted-foreground">{doc.uploaded}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-success/10 text-success flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Verified
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
