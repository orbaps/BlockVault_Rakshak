import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, Wallet, Shield, ExternalLink, CheckCircle2, XCircle, Download, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { shortenHash, getPolygonScanUrl } from "@/lib/blockchain";
import { QRCodeSVG } from "qrcode.react";

interface StudentData {
  id: string; full_name: string; student_id: string; passport_id: string;
  wallet_address: string | null; email: string | null; status: string;
}

interface CertData {
  id: string; cert_id: string; title: string; certificate_type: string;
  tx_hash: string | null; file_hash: string | null; status: string;
  issued_at: string; file_url: string | null;
}

export default function CredentialPassportPage() {
  const { passportId } = useParams();
  const { workspace } = useWorkspace();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [certs, setCerts] = useState<CertData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!workspace) return;
      let query = supabase.from("students").select("*").eq("workspace_id", workspace.id);
      if (passportId) query = query.eq("passport_id", passportId);
      else query = query.limit(1);

      const { data: students } = await query;
      if (students && students.length > 0) {
        const s = students[0] as StudentData;
        setStudent(s);
        const { data: certData } = await supabase
          .from("certificates")
          .select("id, cert_id, title, certificate_type, tx_hash, file_hash, status, issued_at, file_url")
          .eq("student_id", s.id)
          .order("issued_at", { ascending: false });
        setCerts((certData as CertData[]) || []);
      }
      setLoading(false);
    };
    fetch();
  }, [workspace, passportId]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!student) {
    return <div className="text-center py-20 text-muted-foreground">No student found. Add students first.</div>;
  }

  const publicUrl = `${window.location.origin}/credentials/${student.student_id}`;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Credential Passport</h1>
        <p className="text-sm text-muted-foreground mt-1">Student credential identity and certificate timeline.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {student.full_name.charAt(0)}
                </div>
                <div className="bg-card border border-border rounded-lg p-2">
                  <QRCodeSVG value={publicUrl} size={96} level="M" />
                </div>
                <p className="text-[10px] text-muted-foreground">Scan to verify</p>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{student.full_name}</h2>
                  <p className="text-sm text-muted-foreground">{workspace?.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Passport ID</p>
                    <p className="text-sm font-mono text-primary flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" />{student.passport_id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Student ID</p>
                    <p className="text-sm font-mono text-foreground">{student.student_id}</p>
                  </div>
                  {student.wallet_address && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Wallet Address</p>
                      <p className="text-xs font-mono text-muted-foreground flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" />{student.wallet_address}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10 text-[10px]"><Shield className="h-3 w-3 mr-1" /> Active Passport</Badge>
                  <Badge variant="secondary" className="text-[10px]">{certs.filter((c) => c.status === "verified").length} Verified Credentials</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <h3 className="text-sm font-semibold text-foreground mb-4">Credential Timeline</h3>

      {certs.length === 0 ? (
        <Card className="border-border"><CardContent className="p-8 text-center text-sm text-muted-foreground">No certificates issued yet.</CardContent></Card>
      ) : (
        <div className="relative">
          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {certs.map((cert, i) => (
              <motion.div key={cert.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="relative pl-10">
                <div className={`absolute left-2.5 top-5 h-3 w-3 rounded-full border-2 ${cert.status === "verified" ? "border-success bg-success/20" : "border-destructive bg-destructive/20"}`} />
                <Card className="border-border">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-foreground">{cert.title}</h4>
                          <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cert.status === "verified" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                            {cert.status === "verified" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {cert.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">{cert.certificate_type}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">Issued {new Date(cert.issued_at).toLocaleDateString()}</p>
                        {cert.tx_hash && (
                          <a href={getPolygonScanUrl(cert.tx_hash)} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-primary hover:underline inline-flex items-center gap-1 mt-3">
                            Tx: {shortenHash(cert.tx_hash)} <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {cert.file_url && (
                        <a href={cert.file_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Download className="h-3 w-3" /> Download</Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
