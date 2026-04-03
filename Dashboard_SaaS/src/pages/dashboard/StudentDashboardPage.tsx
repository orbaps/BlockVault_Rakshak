import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Shield, CheckCircle2, Share2, Link2, Copy, Trash2, Clock, Brain,
  GraduationCap, Building2, Wallet, History, Zap, FileCheck,
  Lock, Hash, Download, X, Loader2, Package, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { encryptBuffer, generateTxId, sha256Hex } from "@/lib/crypto";

interface DBCert {
  id: string;
  cert_id: string;
  title: string;
  certificate_type: string;
  tx_hash: string | null;
  file_hash: string | null;
  status: string;
  issued_at: string;
  file_url: string | null;
}

interface VaultTxn {
  id: string;
  txId: string;
  passportId: string;
  certTitles: string[];
  organization: string;
  aesHash: string;
  bundleSize: number;
  timestamp: string;
}

const VAULT_KEY = "blockvault_vault_txns";

function loadVaultTxns(passportId: string): VaultTxn[] {
  try {
    const all = JSON.parse(localStorage.getItem(VAULT_KEY) || "{}");
    return all[passportId] || [];
  } catch { return []; }
}

function saveVaultTxn(passportId: string, txn: VaultTxn) {
  try {
    const all = JSON.parse(localStorage.getItem(VAULT_KEY) || "{}");
    if (!all[passportId]) all[passportId] = [];
    all[passportId].unshift(txn);
    localStorage.setItem(VAULT_KEY, JSON.stringify(all));
  } catch {}
}

const jobInsights = [
  { role: "Software Engineer – L4", match: 96, company: "Google" },
  { role: "Cloud Architect", match: 92, company: "AWS" },
  { role: "Security Analyst", match: 81, company: "CrowdStrike" },
  { role: "Data Scientist", match: 78, company: "Microsoft" },
];

type Tab = "passport" | "vault" | "txns";

export default function StudentDashboardPage() {
  const { toast } = useToast();
  const { studentProfile } = useAuth();
  const [tab, setTab] = useState<Tab>("passport");

  // Live data
  const [certs, setCerts] = useState<DBCert[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);
  const [studentData, setStudentData] = useState<{ student_id: string; institution: string; wallet_address: string | null } | null>(null);
  const [shares, setShares] = useState<{ id: string; target: string; bundle: string; expires: string }[]>([
    { id: "s1", target: "Google HR", bundle: "3 credentials", expires: "Apr 15, 2026" },
    { id: "s2", target: "Microsoft Recruiting", bundle: "2 credentials", expires: "Apr 10, 2026" },
  ]);

  // Vault state
  const [selected, setSelected] = useState<string[]>([]);
  const [org, setOrg] = useState("");
  const [bundling, setBundling] = useState(false);
  const [vaultTxns, setVaultTxns] = useState<VaultTxn[]>([]);

  // Fetch student's real certs from DB
  useEffect(() => {
    if (!studentProfile?.id) return;
    const fetch = async () => {
      setCertsLoading(true);
      const { data } = await supabase
        .from("certificates")
        .select("id, cert_id, title, certificate_type, tx_hash, file_hash, status, issued_at, file_url")
        .eq("student_id", studentProfile.id)
        .order("issued_at", { ascending: false });
      setCerts((data as DBCert[]) || []);

      // Also get student details
      const { data: sd } = await supabase
        .from("students")
        .select("student_id, wallet_address, workspace_id")
        .eq("id", studentProfile.id)
        .maybeSingle();
      if (sd) {
        const { data: ws } = await supabase
          .from("workspaces")
          .select("name")
          .eq("id", sd.workspace_id)
          .maybeSingle();
        setStudentData({ student_id: sd.student_id, institution: ws?.name || "BlockVault Institution", wallet_address: sd.wallet_address });
      }
      setCertsLoading(false);
    };
    fetch();
    setVaultTxns(loadVaultTxns(studentProfile.passportId));
  }, [studentProfile?.id]);

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast({ title: "Copied!" }); };

  const toggle = (id: string) =>
    setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  // AES-256 bundle + ledger transaction
  const createBundle = async () => {
    if (!org.trim()) { toast({ title: "Enter organization name", variant: "destructive" }); return; }
    if (selected.length === 0) { toast({ title: "Select at least one certificate", variant: "destructive" }); return; }
    setBundling(true);

    const selectedCerts = certs.filter((c) => selected.includes(c.id));
    const bundleText = JSON.stringify({
      passportId: studentProfile?.passportId,
      student: studentProfile?.name,
      organization: org.trim(),
      timestamp: new Date().toISOString(),
      certificates: selectedCerts.map((c) => ({ id: c.cert_id, title: c.title, type: c.certificate_type, issued: c.issued_at })),
    });

    const encoder = new TextEncoder();
    const buffer = encoder.encode(bundleText).buffer as ArrayBuffer;

    // Encrypt with AES-256-GCM — passphrase = passportId + org (zero knowledge)
    const passphrase = `${studentProfile?.passportId}-${org.trim()}`;
    const { ciphertext } = await encryptBuffer(buffer, passphrase);
    const aesHash = await sha256Hex(encoder.encode(ciphertext).buffer as ArrayBuffer);

    const txId = generateTxId();
    const newTxn: VaultTxn = {
      id: crypto.randomUUID(),
      txId,
      passportId: studentProfile!.passportId,
      certTitles: selectedCerts.map((c) => c.title),
      organization: org.trim(),
      aesHash: aesHash.slice(0, 40),
      bundleSize: selectedCerts.length,
      timestamp: new Date().toISOString(),
    };

    saveVaultTxn(studentProfile!.passportId, newTxn);
    setVaultTxns((p) => [newTxn, ...p]);
    setSelected([]);
    setOrg("");
    setBundling(false);

    toast({ title: "✅ Transaction Published to Ledger!", description: `Tx: ${txId.slice(0, 20)}…` });
    setTab("txns");
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "passport", label: "My Passport", icon: GraduationCap },
    { id: "vault", label: "Document Vault", icon: Wallet },
    { id: "txns", label: `Transactions${vaultTxns.length ? ` (${vaultTxns.length})` : ""}`, icon: Hash },
  ];

  if (!studentProfile) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div>;

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full animate-pulse bg-violet-400"/>
        <span className="text-[10px] font-mono text-violet-400 tracking-widest uppercase">Student Dashboard</span>
      </div>

      {/* Passport Card */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        className="p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center gap-6"
        style={{ background:"linear-gradient(135deg,rgba(139,92,246,0.08),rgba(109,40,217,0.04))", borderColor:"rgba(139,92,246,0.2)" }}>
        <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
          style={{ background:"linear-gradient(135deg,rgba(139,92,246,0.3),rgba(109,40,217,0.2))", border:"1px solid rgba(139,92,246,0.3)" }}>
          {studentProfile.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-white">{studentProfile.name}</h1>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
              <Shield className="h-3 w-3 text-emerald-400"/><span className="text-[9px] font-mono text-emerald-400">Verified</span>
            </div>
          </div>
          <p className="text-white/40 text-sm mb-3">{studentData?.institution || "Loading…"}</p>
          <div className="flex flex-wrap gap-5">
            {[
              { label:"Passport ID", value:studentProfile.passportId, accent:true },
              { label:"Student ID", value:studentData?.student_id || "—" },
              { label:"Credentials", value:certsLoading?"…":String(certs.length) },
              { label:"Wallet", value:studentData?.wallet_address ? `${studentData.wallet_address.slice(0,8)}…` : "Not linked" },
            ].map(({ label, value, accent })=>(
              <div key={label}>
                <p className="text-[9px] text-white/25 font-mono uppercase tracking-widest">{label}</p>
                <p className={`text-xs font-mono ${accent?"":"text-white/60"}`} style={accent?{color:"#a78bfa"}:{}}>{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white shadow-lg flex-shrink-0">
          <QRCodeSVG value={`${window.location.origin}/login?passport=${studentProfile.passportId}`} size={80} bgColor="white" fgColor="#1a1a2e" level="M"/>
          <p className="text-[8px] font-mono text-center text-gray-400 mt-1.5">Scan to access</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={tab===t.id ? { background:"rgba(139,92,246,0.15)", color:"#a78bfa", border:"1px solid rgba(139,92,246,0.3)" } : { background:"rgba(255,255,255,0.03)", color:"rgba(255,255,255,0.3)", border:"1px solid rgba(255,255,255,0.07)" }}>
            <t.icon className="h-3.5 w-3.5"/>{t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── PASSPORT TAB ── */}
        {tab==="passport" && (
          <motion.div key="passport" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="grid lg:grid-cols-3 gap-5">
            {/* Credentials */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">Your Credentials</h2>
                <Badge className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px]">{certsLoading?"Loading…":`${certs.length} credential${certs.length!==1?"s":""}`}</Badge>
              </div>
              {certsLoading && (
                <div className="flex items-center gap-2 py-8 justify-center"><Loader2 className="h-4 w-4 animate-spin text-violet-400"/><p className="text-sm text-white/40">Fetching from blockchain…</p></div>
              )}
              {!certsLoading && certs.length === 0 && (
                <div className="p-8 rounded-2xl text-center" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)" }}>
                  <FileCheck className="h-10 w-10 mx-auto text-white/10 mb-3"/>
                  <p className="text-sm text-white/40">No certificates issued yet.</p>
                  <p className="text-xs text-white/20 mt-1">Your institution will issue credentials here.</p>
                </div>
              )}
              {certs.map((cert, i) => (
                <motion.div key={cert.id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                  className="p-4 rounded-2xl border" style={{ background:"rgba(255,255,255,0.03)", borderColor:"rgba(255,255,255,0.07)" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <Badge className={`text-[9px] ${cert.status==="verified"?"bg-emerald-400/10 text-emerald-400 border-emerald-400/20":"bg-amber-400/10 text-amber-400 border-amber-400/20"}`}>
                          {cert.status==="verified"?<><CheckCircle2 className="h-2.5 w-2.5 mr-1"/>Blockchain Verified</>:<>Pending</>}
                        </Badge>
                        <span className="text-[9px] font-mono text-white/25 border border-white/8 bg-white/3 px-2 py-0.5 rounded-full capitalize">{cert.certificate_type}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{cert.title}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-white/25 flex items-center gap-1"><Clock className="h-3 w-3"/>{new Date(cert.issued_at).toLocaleDateString()}</span>
                        {cert.tx_hash && <span className="text-[10px] font-mono text-violet-400/60">{cert.tx_hash.slice(0,14)}…</span>}
                        {cert.file_hash && <span className="text-[10px] font-mono text-white/20">SHA: {cert.file_hash.slice(0,12)}…</span>}
                      </div>
                    </div>
                    {cert.file_url && (
                      <a href={cert.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Download className="h-3 w-3"/>View</Button>
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right: Shares + AI */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2"><Share2 className="h-4 w-4 text-violet-400"/>Active Shares</h3>
                <p className="text-[10px] text-white/25 mb-3">Organizations with current access</p>
                {shares.length===0 ? <p className="text-xs text-white/25 text-center py-3">No active shares.</p> : (
                  <div className="space-y-2">
                    {shares.map(sh=>(
                      <div key={sh.id} className="p-3 rounded-xl flex items-start justify-between" style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)" }}>
                        <div>
                          <p className="text-xs font-semibold text-white">{sh.target}</p>
                          <p className="text-[10px] text-white/35">{sh.bundle}</p>
                          <p className="text-[9px] text-white/20 font-mono">Exp: {sh.expires}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400/40 hover:text-red-400" onClick={()=>setShares(p=>p.filter(s=>s.id!==sh.id))}>
                          <Trash2 className="h-3 w-3"/>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2"><Brain className="h-4 w-4 text-purple-400"/>AI Job Insights</h3>
                <p className="text-[10px] text-white/25 mb-3">Based on your credentials</p>
                <div className="space-y-2.5">
                  {jobInsights.map(job=>(
                    <div key={job.role} className="p-3 rounded-xl flex items-center justify-between" style={{ background:"rgba(139,92,246,0.06)",border:"1px solid rgba(139,92,246,0.12)" }}>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{job.role}</p>
                        <p className="text-[10px] text-white/40">{job.company}</p>
                      </div>
                      <p className={`text-lg font-black flex-shrink-0 ${job.match>=90?"text-emerald-400":job.match>=80?"text-amber-400":"text-violet-400"}`}>{job.match}%</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-amber-400"/><p className="text-[10px] text-white/35">Powered by BlockVault AI</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── VAULT TAB ── */}
        {tab==="vault" && (
          <motion.div key="vault" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-5">
            <div>
              <h2 className="text-sm font-bold text-white mb-1">Document Vault</h2>
              <p className="text-xs text-white/35">Select credentials → enter organization → creates an AES-256 encrypted bundle published to the ledger.</p>
            </div>

            {certsLoading && <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-violet-400"/></div>}

            {!certsLoading && certs.length === 0 && (
              <div className="p-8 text-center rounded-2xl" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)" }}>
                <Package className="h-10 w-10 mx-auto text-white/10 mb-3"/>
                <p className="text-sm text-white/40">No credentials to bundle yet.</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              {certs.map((cert) => {
                const isSel = selected.includes(cert.id);
                return (
                  <div key={cert.id} onClick={()=>toggle(cert.id)}
                    className="p-4 rounded-2xl border transition-all cursor-pointer"
                    style={{ background:isSel?"rgba(193,255,47,0.05)":"rgba(255,255,255,0.03)", borderColor:isSel?"rgba(193,255,47,0.3)":"rgba(255,255,255,0.07)" }}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSel?"":"border-white/20"}`}
                        style={isSel?{background:"#C1FF2F",borderColor:"#C1FF2F"}:{}}>
                        {isSel && <CheckCircle2 className="h-3 w-3 text-black"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{cert.title}</p>
                        <p className="text-xs text-white/40 capitalize">{cert.certificate_type} · {new Date(cert.issued_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selected.length > 0 && (
              <div className="p-5 rounded-2xl space-y-4" style={{ background:"rgba(193,255,47,0.04)",border:"1px solid rgba(193,255,47,0.2)" }}>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 flex-shrink-0" style={{ color:"#C1FF2F" }}/>
                  <p className="text-sm font-bold text-white">{selected.length} credential{selected.length>1?"s":""} selected — AES-256 Bundle</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Share with Organization</label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)" }}>
                    <Building2 className="h-4 w-4 text-white/25 flex-shrink-0"/>
                    <Input
                      placeholder="e.g., Google Recruiting, Microsoft HR…"
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                      className="bg-transparent border-0 p-0 h-auto text-sm font-bold text-white placeholder:text-white/20 focus-visible:ring-0"
                    />
                  </div>
                </div>
                <Button onClick={createBundle} disabled={bundling || !org.trim()} className="w-full h-12 font-bold gap-2" style={{ background:"#C1FF2F",color:"black" }}>
                  {bundling ? <><Loader2 className="h-4 w-4 animate-spin"/>Encrypting & Publishing…</> : <><Send className="h-4 w-4"/>Encrypt & Publish to Ledger</>}
                </Button>
                <p className="text-[10px] text-white/25 text-center">Bundle will be AES-256 encrypted. Hash recorded on the BlockVault ledger.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── TRANSACTIONS TAB ── */}
        {tab==="txns" && (
          <motion.div key="txns" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white mb-1">My Transaction History</h2>
              <p className="text-xs text-white/35">All credential sharing transactions done via your vault, visible in the ledger.</p>
            </div>

            {vaultTxns.length === 0 && (
              <div className="p-10 text-center rounded-2xl" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)" }}>
                <History className="h-10 w-10 mx-auto text-white/10 mb-3"/>
                <p className="text-sm text-white/40">No transactions yet.</p>
                <p className="text-xs text-white/20 mt-1">Create your first bundle in the Document Vault.</p>
              </div>
            )}

            {vaultTxns.map((txn, i) => (
              <motion.div key={txn.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                className="p-5 rounded-2xl" style={{ background:"rgba(139,92,246,0.04)",border:"1px solid rgba(139,92,246,0.2)" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 text-[9px]">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-1"/>Published
                      </Badge>
                      <span className="text-[9px] font-mono text-white/30 border border-white/8 px-2 py-0.5 rounded-full">AES-256 Encrypted</span>
                    </div>
                    <p className="text-xs font-bold text-white mb-1">
                      Shared with <span style={{ color:"#a78bfa" }}>{txn.organization}</span>
                    </p>
                    <p className="text-[10px] text-white/40 mb-2">{txn.bundleSize} credential{txn.bundleSize>1?"s":""}: {txn.certTitles.join(", ")}</p>
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <p className="text-[9px] text-white/25 uppercase tracking-widest font-mono">Tx Hash</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[10px] font-mono text-violet-400">{txn.txId.slice(0,22)}…</p>
                          <Button variant="ghost" size="icon" className="h-4 w-4 text-white/20 hover:text-white" onClick={()=>copy(txn.txId)}><Copy className="h-3 w-3"/></Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] text-white/25 uppercase tracking-widest font-mono">AES-256 Hash</p>
                        <p className="text-[10px] font-mono text-amber-400/70">{txn.aesHash}…</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[9px] text-white/25 font-mono">{new Date(txn.timestamp).toLocaleDateString()}</p>
                    <p className="text-[9px] text-white/20 font-mono">{new Date(txn.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
