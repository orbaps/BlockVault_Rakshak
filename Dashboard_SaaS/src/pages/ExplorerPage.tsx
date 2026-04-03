import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Hash, CheckCircle2, XCircle, ChevronRight, Shield, Clock, Building2, FileCheck, X, Copy, Layers, ExternalLink, Filter, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateTxId } from "@/lib/crypto";

interface Validator { name: string; role: string; signedAt: string; }
interface TxRecord {
  id: string; txId: string; studentName: string; studentId: string; passportId: string;
  certificates: string[]; issuedTo: string; block: string; blockTime: string; timestamp: Date;
  status: "valid" | "revoked"; signatureId: string; duration: string;
  validators: Validator[]; hash: string; type: "issue" | "share";
}

const short = (tx: string) => `${tx.slice(0,12)}…${tx.slice(-8)}`;

export default function ExplorerPage() {
  const { userType, studentProfile } = useAuth();
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState<TxRecord|null>(null);
  const [txs, setTxs] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const isStudent = userType === "student";

  useEffect(() => {
    const fetchTxs = async () => {
      setLoading(true);
      let query = supabase.from("certificates").select("*, students(full_name, student_id, passport_id, workspace_id)");
      
      // If student, filter certificates to their id
      if (isStudent && studentProfile) {
        query = query.eq("student_id", studentProfile.id);
      } else if (!isStudent && workspace) {
        query = query.eq("workspace_id", workspace.id);
      }

      const { data: dbCerts } = await query;
      
      const parsedDbTxs: TxRecord[] = (dbCerts || []).map((c: any) => ({
        id: c.id,
        txId: c.tx_hash || generateTxId(),
        studentName: c.students?.full_name || "Unknown",
        studentId: c.students?.student_id || "Unknown",
        passportId: c.students?.passport_id || "Unknown",
        certificates: [c.title],
        issuedTo: "Institution Direct Issue",
        block: (Math.floor(Math.random() * 50000) + 19800000).toString(),
        blockTime: new Date(c.issued_at).toLocaleString(),
        timestamp: new Date(c.issued_at),
        status: c.status as "valid" | "revoked",
        signatureId: `SIG-${c.id.split("-")[0].toUpperCase()}`,
        duration: "Permanent",
        validators: [{ name: "Institution Node", role: "Issuer", signedAt: new Date(c.issued_at).toISOString().split("T")[0] }],
        hash: c.file_hash || "hash_pending",
        type: "issue"
      }));

      // Load local Vault Txns
      const vaultKey = "blockvault_vault_txns";
      const allVaultTxns = JSON.parse(localStorage.getItem(vaultKey) || "{}");
      
      let vaultRecords: TxRecord[] = [];
      
      if (isStudent && studentProfile) {
        // Only load this student's vault shares
        const myVaults = allVaultTxns[studentProfile.passportId] || [];
        vaultRecords = myVaults.map((v: any) => ({
          id: v.id,
          txId: v.txId,
          studentName: studentProfile.name,
          studentId: "Private",
          passportId: v.passportId,
          certificates: v.certTitles,
          issuedTo: v.organization, // Shared securely with org
          block: (Math.floor(Math.random() * 50000) + 19800000).toString(),
          blockTime: new Date(v.timestamp).toLocaleString(),
          timestamp: new Date(v.timestamp),
          status: "valid",
          signatureId: "AES-256-BUNDLE",
          duration: "Valid while shared",
          validators: [{ name: "Student Protocol", role: "AES-256 Hasher", signedAt: new Date(v.timestamp).toISOString().split("T")[0] }],
          hash: v.aesHash,
          type: "share"
        }));
      } else {
        // Institution views all mock vault txns for their students? Since localStorage is browser scoped, they only see what is here.
        // For hackathon completeness, we can just aggregate all keys in the browser map
        Object.keys(allVaultTxns).forEach(passport => {
          const arr = allVaultTxns[passport] || [];
          const converted = arr.map((v: any) => ({
             id: v.id, txId: v.txId, studentName: "Student Profile", studentId: "Hidden", passportId: v.passportId,
             certificates: v.certTitles, issuedTo: v.organization,
             block: "19800000", blockTime: new Date(v.timestamp).toLocaleString(), timestamp: new Date(v.timestamp),
             status: "valid", signatureId: "AES-256-BUNDLE", duration: "Active Share",
             validators: [{ name: "Network Hash", role: "Verifier", signedAt: new Date(v.timestamp).toISOString().split("T")[0] }], hash: v.aesHash, type: "share"
          }));
          vaultRecords.push(...converted);
        });
      }

      // Merge and sort
      const merged = [...parsedDbTxs, ...vaultRecords].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
      setTxs(merged);
      setLoading(false);
    };

    fetchTxs();
  }, [isStudent, studentProfile, workspace]);

  const filtered = txs.filter(t =>
    [t.txId,t.studentName,t.studentId,t.passportId,...t.certificates,t.issuedTo].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const copy = (text: string, label = "Copied") => { navigator.clipboard.writeText(text); toast({ title: label }); };

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="p-3 rounded-xl space-y-1.5" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
      <p className="text-[9px] font-mono text-white/25 uppercase tracking-widest">{label}</p>
      {children}
    </div>
  );

  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase">Live Blockchain Ledger</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">{isStudent ? "My Transactions" : "BlockVault Explorer"}</h1>
        <p className="text-sm text-white/35 mt-0.5">{isStudent ? "Credential transactions and AES-256 Vault Shares linked to your passport." : "Inspect and audit all issuance and sharing transactions on the ledger."}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label:"Total Transactions", val:txs.length, color:"text-violet-400", b:"rgba(139,92,246,0.2)" },
          { label:"Credentials Issued", val:txs.filter(t=>t.type==="issue").length, color:"text-emerald-400", b:"rgba(52,211,153,0.2)" },
          { label:"Vault Bundles Shared", val:txs.filter(t=>t.type==="share").length, color:"text-amber-400", b:"rgba(251,191,36,0.2)" },
        ].map(s=>(
          <div key={s.label} className="p-4 rounded-xl" style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${s.b}` }}>
            <p className={`text-2xl font-black ${s.color}`}>{loading ? "…" : s.val}</p>
            <p className="text-[10px] text-white/30 font-mono mt-0.5 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25"/>
          <Input id="explorer-search" placeholder="Search by Tx ID, Passport ID, Organization or Certificate…" value={search} onChange={e=>setSearch(e.target.value)} className="pl-10 h-11 bg-white/4 border-white/8 text-white placeholder:text-white/25 rounded-xl text-sm"/>
        </div>
        <Button variant="outline" className="h-11 px-4 border-white/8 bg-white/3 text-white/50 hover:bg-white/6 rounded-xl gap-2">
          <Filter className="h-4 w-4"/>Filter
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white/2 border border-white/6 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2fr_1.5fr_2fr_1.3fr_1fr_0.8fr_36px] gap-3 px-5 py-3 border-b border-white/5 bg-white/2">
          {["Tx ID","Student / Passport","Action / Certs","Target Org","Block","Status",""].map(h=>(
            <div key={h} className="text-[9px] font-mono text-white/25 uppercase tracking-widest">{h}</div>
          ))}
        </div>
        <div className="divide-y divide-white/4">
           {loading && <div className="py-16 text-center text-white/50 text-sm font-mono flex items-center justify-center gap-2"><Lock className="h-4 w-4 animate-pulse"/> Syncing Ledger…</div>}
          {!loading && filtered.length === 0 && <div className="py-16 text-center text-white/25 text-sm font-mono">No transactions found.</div>}
          {!loading && filtered.map((tx,i)=>(
            <motion.div key={tx.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.03}}
              onClick={()=>setSel(tx)}
              className="grid grid-cols-[2fr_1.5fr_2fr_1.3fr_1fr_0.8fr_36px] gap-3 px-5 py-4 hover:bg-white/3 transition-colors cursor-pointer group items-center"
            >
              <div className="flex items-center gap-2 min-w-0">
                {tx.type==="share"?<Lock className="h-3 w-3 text-amber-400 flex-shrink-0"/>:<Hash className="h-3 w-3 text-white/20 flex-shrink-0"/>}
                <span className={`text-xs font-mono truncate ${tx.type==="share"?"text-amber-400":"text-violet-400"}`}>{short(tx.txId)}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-white truncate font-medium">{tx.studentName}</p>
                <p className="text-[10px] text-white/30 font-mono truncate">{tx.passportId}</p>
              </div>
              <div className="min-w-0">
                {tx.type === "share" ? (
                  <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 text-[9px] px-1.5 mb-1">AES-256 Vault Bundle</Badge>
                ) : (
                  <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 text-[9px] px-1.5 mb-1">Mint Issued</Badge>
                )}
                <p className="text-xs text-white/60 truncate">{tx.certificates[0]}</p>
                {tx.certificates.length>1 && <p className="text-[10px] text-white/30">+{tx.certificates.length-1} more</p>}
              </div>
              <div className="text-xs text-white/40 truncate font-semibold" style={tx.type==="share"?{color:"#a78bfa"}:{}}>{tx.issuedTo}</div>
              <div>
                <p className="text-[10px] font-mono text-white/30">#{tx.block}</p>
                <p className="text-[9px] text-white/15 font-mono">{tx.blockTime.split(" ")[0]}</p>
              </div>
              <div>
                <Badge className={`text-[9px] font-mono px-2 py-0.5 border ${tx.status==="valid" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" : "bg-red-400/10 text-red-400 border-red-400/20"}`}>
                  {tx.status==="valid" ? <span className="flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5"/>Valid</span> : <span className="flex items-center gap-1"><XCircle className="h-2.5 w-2.5"/>Revoked</span>}
                </Badge>
              </div>
              <div className="flex items-center justify-center">
                <ChevronRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50 transition-colors"/>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {sel && (
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:16}} className="mt-6 rounded-2xl overflow-hidden" style={{border:sel.type==="share"?"1px solid rgba(251,191,36,0.3)":"1px solid rgba(139,92,246,0.25)",background:sel.type==="share"?"rgba(251,191,36,0.04)":"rgba(139,92,246,0.04)"}}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${sel.type==="share"?"bg-amber-400/10":"bg-violet-500/10"}`}>
                  <Layers className={`h-4 w-4 ${sel.type==="share"?"text-amber-400":"text-violet-400"}`}/>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{sel.type==="share"?"Vault Bundle Signature":"Issuance Transaction"}</h3>
                  <p className="text-[10px] font-mono text-white/30">Block #{sel.block}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] px-2.5 py-1 ${sel.status==="valid" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" : "bg-red-400/10 text-red-400 border-red-400/20"}`}>
                  {sel.status==="valid" ? "✓ Active & Valid" : "✗ Revoked"}
                </Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-white/30 hover:text-white" onClick={()=>setSel(null)}><X className="h-4 w-4"/></Button>
              </div>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Row label="Transaction Hash">
                  <div className="flex items-center gap-2">
                    <p className={`text-[11px] font-mono break-all flex-1 ${sel.type==="share"?"text-amber-300":"text-violet-300"}`}>{sel.txId}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-white/25 hover:text-white flex-shrink-0" onClick={()=>copy(sel.txId,"Tx Hash copied")}><Copy className="h-3 w-3"/></Button>
                  </div>
                </Row>
                <Row label={sel.type==="share"?"AES-256 Bundle Signature":"Signature ID (Institution)"}>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-emerald-300 flex-1">{sel.signatureId}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-white/25 hover:text-white flex-shrink-0" onClick={()=>copy(sel.signatureId,"Sig ID copied")}><Copy className="h-3 w-3"/></Button>
                  </div>
                </Row>
                <Row label={sel.type==="share"?"AES-256 Cipher Hash":"SHA-256 Fingerprint"}>
                  <p className="text-[11px] font-mono text-white/50 break-all">{sel.hash}</p>
                </Row>
                <Row label="Student">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">{sel.studentName.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-bold text-white">{sel.studentName}</p>
                      <p className="text-[10px] font-mono text-white/35">{sel.studentId} · {sel.passportId}</p>
                    </div>
                  </div>
                </Row>
                <Row label="Duration / Validity">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-white/30"/>
                    <p className="text-sm text-white/70">{sel.duration}</p>
                  </div>
                </Row>
              </div>
              <div className="space-y-3">
                <Row label={sel.type==="share"?`Bundled Credentials (${sel.certificates.length})`:`Certificates Minted (${sel.certificates.length})`}>
                  <div className="space-y-2">
                    {sel.certificates.map((c,i)=>(
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{background:sel.type==="share"?"rgba(251,191,36,0.08)":"rgba(193,255,47,0.05)"}}>
                        <FileCheck className="h-3.5 w-3.5 flex-shrink-0" style={{color:sel.type==="share"?"#fbbf24":"#C1FF2F"}}/>
                        <p className="text-xs text-white/70">{c}</p>
                      </div>
                    ))}
                  </div>
                </Row>
                <Row label={sel.type==="share"?"Shared With Organization":"Issued By"}>
                  <div className="flex items-center gap-2">
                    <Building2 className={`h-3.5 w-3.5 ${sel.type==="share"?"text-amber-400":"text-violet-400"}`}/>
                    <p className="text-sm font-semibold text-white">{sel.issuedTo}</p>
                  </div>
                </Row>
                <Row label="Block Time">
                  <p className="text-sm font-mono text-white/60">{sel.blockTime}</p>
                </Row>
                <Row label={`Validators (${sel.validators.length})`}>
                  <div className="space-y-2">
                    {sel.validators.map((v,i)=>(
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-emerald-400/10 flex items-center justify-center flex-shrink-0">
                          <Shield className="h-3 w-3 text-emerald-400"/>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{v.name}</p>
                          <p className="text-[9px] text-white/30 font-mono">{v.role} · {v.signedAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Row>
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-2">
              <Button size="sm" className="h-8 px-4 text-xs rounded-lg font-mono gap-1.5" style={{background:"rgba(139,92,246,0.15)",border:"1px solid rgba(139,92,246,0.3)",color:"#c4b5fd"}} onClick={()=>copy(sel.txId,"Tx Hash copied")}>
                <Copy className="h-3 w-3"/>Copy Tx Hash
              </Button>
              <Button size="sm" variant="outline" className="h-8 px-4 text-xs rounded-lg font-mono border-white/10 text-white/40 hover:text-white gap-1.5">
                <ExternalLink className="h-3 w-3"/>View on Chain
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
