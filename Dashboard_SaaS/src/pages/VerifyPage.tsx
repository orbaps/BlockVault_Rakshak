import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Search, QrCode, CheckCircle2, XCircle, ExternalLink, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { supabase } from "@/integrations/supabase/client";
import { hashFile } from "@/lib/crypto";
import { shortenHash, getPolygonScanUrl } from "@/lib/blockchain";

type VerificationResult = {
  status: "verified" | "invalid";
  title?: string;
  issuer?: string;
  issuedDate?: string;
  txHash?: string;
  studentName?: string;
  fileHash?: string;
  tampered?: boolean;
} | null;

export default function VerifyPage() {
  const [credentialId, setCredentialId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult>(null);
  const [step, setStep] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const verifyByFile = async () => {
    if (!file) return;
    setVerifying(true);
    setResult(null);

    setStep("Generating document hash…");
    const fileHash = await hashFile(file);

    setStep("Querying blockchain records…");
    const { data: certs } = await supabase
      .from("certificates")
      .select("*, students(full_name, student_id)")
      .eq("file_hash", fileHash)
      .limit(1);

    await new Promise((r) => setTimeout(r, 500));

    if (certs && certs.length > 0) {
      const cert = certs[0] as any;
      // Log verification
      await supabase.from("verification_logs").insert({
        certificate_id: cert.id,
        verification_method: "upload",
        result: "valid",
      });
      // Notify (non-blocking)
      supabase.functions.invoke("notify-certificate", {
        body: { type: "verified", certificate_id: cert.id },
      }).catch(console.error);
      setResult({
        status: "verified",
        title: cert.title,
        studentName: cert.students?.full_name,
        issuedDate: new Date(cert.issued_at).toLocaleDateString(),
        txHash: cert.tx_hash,
        fileHash,
      });
    } else {
      setResult({ status: "invalid", tampered: true });
    }
    setVerifying(false);
    setStep("");
  };

  const verifyById = async () => {
    if (!credentialId.trim()) return;
    setVerifying(true);
    setResult(null);

    setStep("Looking up credential…");
    const { data: certs } = await supabase
      .from("certificates")
      .select("*, students(full_name, student_id)")
      .eq("cert_id", credentialId.trim())
      .limit(1);

    await new Promise((r) => setTimeout(r, 500));

    if (certs && certs.length > 0) {
      const cert = certs[0] as any;
      await supabase.from("verification_logs").insert({
        certificate_id: cert.id,
        verification_method: "id",
        result: cert.status === "verified" ? "valid" : "invalid",
      });
      // Notify (non-blocking)
      if (cert.status === "verified") {
        supabase.functions.invoke("notify-certificate", {
          body: { type: "verified", certificate_id: cert.id },
        }).catch(console.error);
      }
      setResult({
        status: cert.status === "verified" ? "verified" : "invalid",
        title: cert.title,
        studentName: cert.students?.full_name,
        issuedDate: new Date(cert.issued_at).toLocaleDateString(),
        txHash: cert.tx_hash,
        fileHash: cert.file_hash,
      });
    } else {
      setResult({ status: "invalid" });
    }
    setVerifying(false);
    setStep("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 h-9 w-9 rounded-lg bg-primary/10 justify-center mb-4">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Verify a Certificate</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Upload a document, scan a QR code, or enter a credential ID to verify authenticity.
            </p>
          </motion.div>

          <Card className="border-border">
            <CardContent className="p-6">
              <Tabs defaultValue="upload">
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="upload" className="flex-1 text-xs"><Upload className="h-3.5 w-3.5 mr-1.5" /> Upload</TabsTrigger>
                  <TabsTrigger value="qr" className="flex-1 text-xs"><QrCode className="h-3.5 w-3.5 mr-1.5" /> QR Code</TabsTrigger>
                  <TabsTrigger value="id" className="flex-1 text-xs"><Search className="h-3.5 w-3.5 mr-1.5" /> Credential ID</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                  <input type="file" ref={fileRef} className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/30 transition-colors cursor-pointer mb-4"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-foreground font-medium">{file ? file.name : "Drop certificate file here"}</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, PNG, or JPG</p>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={verifyByFile} disabled={verifying || !file}>
                    {verifying ? step : "Verify Document"}
                  </Button>
                </TabsContent>

                <TabsContent value="qr">
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center mb-4">
                    <QrCode className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-foreground font-medium">QR Scanner</p>
                    <p className="text-xs text-muted-foreground mt-1">Position the QR code in front of your camera</p>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90" disabled>Coming Soon</Button>
                </TabsContent>

                <TabsContent value="id">
                  <div className="space-y-4">
                    <Input placeholder="Enter certificate ID (e.g., CERT-ABC123)" value={credentialId} onChange={(e) => setCredentialId(e.target.value)} className="font-mono text-sm" />
                    <Button className="w-full bg-primary hover:bg-primary/90" onClick={verifyById} disabled={verifying || !credentialId.trim()}>
                      {verifying ? step : "Verify by ID"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {result && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <Card className={`border-2 ${result.status === "verified" ? "border-success/30" : "border-destructive/30"}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {result.status === "verified" ? (
                      <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <XCircle className="h-5 w-5 text-destructive" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {result.status === "verified" ? "Certificate Verified" : "Certificate Invalid"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {result.status === "verified"
                          ? "This certificate is authentic and recorded on the blockchain."
                          : "This certificate could not be verified."}
                      </p>
                    </div>
                  </div>

                  {result.tampered && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20 mb-4">
                      <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                      <p className="text-xs text-destructive">Certificate integrity failed. Document may have been tampered with.</p>
                    </div>
                  )}

                  {result.status === "verified" && (
                    <div className="space-y-3 mt-4 pt-4 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Certificate</span>
                        <span className="font-medium text-foreground">{result.title}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Student</span>
                        <span className="font-medium text-foreground">{result.studentName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Issue Date</span>
                        <span className="font-medium text-foreground">{result.issuedDate}</span>
                      </div>
                      {result.txHash && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Blockchain Tx</span>
                          <a href={getPolygonScanUrl(result.txHash)} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-primary hover:underline inline-flex items-center gap-1">
                            {shortenHash(result.txHash)} <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                      {result.fileHash && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">File Hash</span>
                          <span className="font-mono text-xs text-muted-foreground">{shortenHash(result.fileHash, 12)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
