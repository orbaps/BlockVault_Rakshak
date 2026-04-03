import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Search, ExternalLink, XCircle, CheckCircle2, FileUp, Hash, Link2, FileCheck, Database, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { hashFile } from "@/lib/crypto";
import { recordOnBlockchain, shortenHash, getPolygonScanUrl } from "@/lib/blockchain";
import { useToast } from "@/hooks/use-toast";

interface Student { id: string; full_name: string; student_id: string; }
interface Certificate {
  id: string; cert_id: string; title: string; tx_hash: string | null;
  status: string; issued_at: string; file_hash: string | null;
  students: { full_name: string; student_id: string } | null;
}

const issuanceSteps = [
  { label: "Document Uploaded", icon: FileUp },
  { label: "Hash Generated", icon: Hash },
  { label: "Blockchain Submitted", icon: Link2 },
  { label: "Certificate Registered", icon: FileCheck },
];

export default function CertificatesPage() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [txHash, setTxHash] = useState("");
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [certTitle, setCertTitle] = useState("");
  const [certType, setCertType] = useState("certificate");
  const [issueDate, setIssueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchCerts = async () => {
    if (!workspace) return;
    const { data } = await supabase
      .from("certificates")
      .select("*, students(full_name, student_id)")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false });
    setCerts((data as any[]) || []);
  };

  const fetchStudents = async () => {
    if (!workspace) return;
    const { data } = await supabase
      .from("students")
      .select("id, full_name, student_id")
      .eq("workspace_id", workspace.id);
    setStudents((data as Student[]) || []);
  };

  useEffect(() => { fetchCerts(); fetchStudents(); }, [workspace]);

  const handleIssuance = async () => {
    if (!workspace || !selectedStudent || !certTitle || !file) {
      toast({ title: "Missing fields", description: "Please fill all fields and upload a file.", variant: "destructive" });
      return;
    }

    // Step 1: Upload
    setCurrentStep(0);
    const filePath = `${workspace.id}/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("certificates").upload(filePath, file);
    if (uploadErr) { toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" }); setCurrentStep(-1); return; }

    const { data: urlData } = supabase.storage.from("certificates").getPublicUrl(filePath);

    // Step 2: Hash
    setCurrentStep(1);
    const fileHash = await hashFile(file);
    await new Promise((r) => setTimeout(r, 600));

    // Step 3: Blockchain
    setCurrentStep(2);
    const student = students.find((s) => s.id === selectedStudent);
    const certId = `CERT-${Date.now().toString(36).toUpperCase()}`;
    const tx = await recordOnBlockchain(fileHash, {
      certId,
      studentId: student?.student_id || "",
      issuer: workspace.name,
    });

    // Step 4: Register in DB
    setCurrentStep(3);
    const { error: insertErr } = await supabase.from("certificates").insert({
      workspace_id: workspace.id,
      student_id: selectedStudent,
      cert_id: certId,
      title: certTitle,
      certificate_type: certType,
      file_hash: fileHash,
      file_url: urlData.publicUrl,
      tx_hash: tx.txHash,
      status: "verified",
      issued_at: issueDate || new Date().toISOString(),
    });

    if (insertErr) {
      toast({ title: "Error", description: insertErr.message, variant: "destructive" });
    } else {
      setTxHash(tx.txHash);
      // Fire notification (non-blocking)
      const certRecord = await supabase
        .from("certificates")
        .select("id")
        .eq("cert_id", certId)
        .single();
      if (certRecord.data) {
        supabase.functions.invoke("notify-certificate", {
          body: { type: "issued", certificate_id: certRecord.data.id },
        }).catch(console.error);
      }
      await new Promise((r) => setTimeout(r, 1500));
      toast({ title: "Certificate issued!", description: `Tx: ${shortenHash(tx.txHash)}` });
      fetchCerts();
    }

    setCurrentStep(-1);
    setTxHash("");
    setDialogOpen(false);
    setCertTitle("");
    setSelectedStudent("");
    setFile(null);
  };

  const filtered = certs.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.cert_id.toLowerCase().includes(search.toLowerCase()) ||
      (c.students?.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Certificates</h1>
          <p className="text-sm text-muted-foreground mt-1">Issue and manage blockchain-verified certificates.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) { setCurrentStep(-1); setTxHash(""); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Issue Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle className="text-base">Issue New Certificate</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Student</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Certificate Type</Label>
                  <Select value={certType} onValueChange={setCertType}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="degree">Degree</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="transcript">Transcript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Certificate Title</Label>
                <Input placeholder="e.g., BSc Computer Science" className="text-sm" value={certTitle} onChange={(e) => setCertTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Issue Date</Label>
                <Input type="date" className="text-sm" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Upload Certificate File</Label>
                <input type="file" ref={fileRef} className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <div
                  className="border-2 border-dashed border-border rounded-lg p-5 text-center hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-4 w-4 text-muted-foreground mx-auto mb-1.5" />
                  <p className="text-xs text-muted-foreground">{file ? file.name : "Drop file or click to upload"}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">PDF, PNG, JPG up to 10MB</p>
                </div>
              </div>

              {currentStep >= 0 && (
                <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Issuance Progress</p>
                  {issuanceSteps.map((step, i) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        i < currentStep ? "bg-success/10" : i === currentStep ? "bg-primary/10 ring-2 ring-primary/30" : "bg-muted"
                      }`}>
                        {i < currentStep ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : i === currentStep ? <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <step.icon className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <span className={`text-xs ${i <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {txHash && (
                <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    <span className="text-xs font-semibold text-success">Certificate Registered</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Database className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Tx Hash:</span>
                    <span className="text-[10px] font-mono text-primary">{shortenHash(txHash, 10)}</span>
                  </div>
                </div>
              )}

              <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleIssuance} disabled={currentStep >= 0}>
                {currentStep >= 0 ? "Processing…" : "Issue & Record on Blockchain"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search certificates…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
      </div>

      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Cert ID", "Title", "Student", "Tx Hash", "Issued", "Status"].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-sm text-muted-foreground">No certificates yet. Issue your first one!</td></tr>
              )}
              {filtered.map((cert, i) => (
                <motion.tr key={cert.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3"><span className="text-xs font-mono text-primary">{cert.cert_id}</span></td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{cert.title}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">{cert.students?.full_name}</span>
                    <span className="text-[10px] text-muted-foreground ml-1.5">({cert.students?.student_id})</span>
                  </td>
                  <td className="px-4 py-3">
                    {cert.tx_hash ? (
                      <a href={getPolygonScanUrl(cert.tx_hash)} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1">
                        {shortenHash(cert.tx_hash)} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(cert.issued_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      cert.status === "verified" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}>
                      {cert.status === "verified" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {cert.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
