import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, QrCode, MoreHorizontal, Eye, FileCheck, Wallet, Download, X, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useToast } from "@/hooks/use-toast";
import { generatePassportId } from "@/lib/crypto";

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string | null;
  wallet_address: string | null;
  passport_id: string;
  status: string;
  created_at: string;
}

export default function StudentsPage() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrDialogStudent, setQrDialogStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [walletAddr, setWalletAddr] = useState("");
  const [saving, setSaving] = useState(false);
  const [newlyAddedPassport, setNewlyAddedPassport] = useState<string | null>(null);

  const fetchStudents = async () => {
    if (!workspace) return;
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false });
    setStudents((data as Student[]) || []);
  };

  useEffect(() => { fetchStudents(); }, [workspace]);

  const handleAdd = async () => {
    if (!workspace || !name || !studentId) {
      toast({ title: "Missing fields", description: "Name and Student ID are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const passportId = generatePassportId();
    const { error } = await supabase.from("students").insert({
      workspace_id: workspace.id,
      full_name: name,
      student_id: studentId,
      email: email || null,
      wallet_address: walletAddr || null,
      passport_id: passportId,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setDialogOpen(false);
      setName(""); setStudentId(""); setEmail(""); setWalletAddr("");
      setNewlyAddedPassport(passportId);
      fetchStudents();
      toast({ title: "✅ Student Added", description: `Passport ID: ${passportId}` });
    }
  };

  const downloadQR = (student: Student) => {
    const canvas = document.getElementById(`qr-canvas-${student.id}`) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${student.full_name.replace(/\s+/g, "_")}_QR.png`;
    a.click();
  };

  const copyPassportId = (passportId: string) => {
    navigator.clipboard.writeText(passportId);
    toast({ title: "Copied!", description: "Passport ID copied to clipboard." });
  };

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      s.passport_id.toLowerCase().includes(search.toLowerCase())
  );

  const qrValue = (student: Student) =>
    `${window.location.origin}/login?passport=${student.passport_id}`;

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage enrolled students. Adding a student auto-generates a unique Passport ID and QR code.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Add New Student</DialogTitle>
              <p className="text-xs text-muted-foreground">A unique Passport ID and QR code will be generated automatically.</p>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name *</Label>
                <Input id="add-student-name" placeholder="e.g., Arjun Sharma" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Student ID *</Label>
                <Input id="add-student-id" placeholder="e.g., STU-2026-007" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email (Optional)</Label>
                <Input placeholder="student@university.edu" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Wallet Address (Optional)</Label>
                <Input placeholder="0x…" className="font-mono text-xs" value={walletAddr} onChange={(e) => setWalletAddr(e.target.value)} />
              </div>
              <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: "rgba(193,255,47,0.05)", border: "1px solid rgba(193,255,47,0.15)" }}>
                <QrCode className="h-4 w-4 flex-shrink-0" style={{ color: "#C1FF2F" }} />
                <p className="text-[10px] text-white/50">A Passport ID (e.g., BV-2026-XXXXXXXX) and matching QR code will be auto-generated and stored securely.</p>
              </div>
              <Button
                id="submit-add-student"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleAdd}
                disabled={saving}
              >
                {saving ? "Adding…" : "Add Student & Generate QR"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Newly added passport banner */}
      {newlyAddedPassport && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl flex items-center justify-between gap-4"
          style={{ background: "rgba(193,255,47,0.06)", border: "1px solid rgba(193,255,47,0.25)" }}
        >
          <div className="flex items-center gap-3">
            <QrCode className="h-5 w-5 flex-shrink-0" style={{ color: "#C1FF2F" }} />
            <div>
              <p className="text-sm font-bold text-white">Passport ID Generated!</p>
              <p className="text-xs font-mono" style={{ color: "#C1FF2F" }}>{newlyAddedPassport}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => copyPassportId(newlyAddedPassport)}>
              <Copy className="h-3 w-3 mr-1.5" /> Copy ID
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-white/30" onClick={() => setNewlyAddedPassport(null)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search students…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Student ID", "Name", "Passport ID", "Wallet", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-muted-foreground">
                    No students yet. Add your first one!
                  </td>
                </tr>
              )}
              {filtered.map((student, i) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-primary">{student.student_id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                        {student.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{student.full_name}</p>
                        {student.email && <p className="text-[10px] text-muted-foreground">{student.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Link to={`/dashboard/passports/${student.passport_id}`} className="text-xs font-mono text-primary hover:underline">
                        {student.passport_id}
                      </Link>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-white" onClick={() => copyPassportId(student.passport_id)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                      <Wallet className="h-3 w-3" />
                      {student.wallet_address ? `${student.wallet_address.slice(0, 6)}…${student.wallet_address.slice(-4)}` : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={`text-[10px] ${student.status === "active"
                        ? "bg-success/10 text-success border-success/20 hover:bg-success/10"
                        : "bg-muted text-muted-foreground"}`}
                    >
                      {student.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-xs gap-2" asChild>
                          <Link to={`/dashboard/passports/${student.passport_id}`}>
                            <Eye className="h-3 w-3" /> View Passport
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs gap-2">
                          <FileCheck className="h-3 w-3" /> Issue Certificate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs gap-2" onClick={() => setQrDialogStudent(student)}>
                          <QrCode className="h-3 w-3" /> Show QR Code
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={!!qrDialogStudent} onOpenChange={(o) => { if (!o) setQrDialogStudent(null); }}>
        <DialogContent className="max-w-sm text-center">
          {qrDialogStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Passport QR Code</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-black text-primary">
                  {qrDialogStudent.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white">{qrDialogStudent.full_name}</p>
                  <p className="text-xs text-muted-foreground">{qrDialogStudent.student_id}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white shadow-lg">
                  <QRCodeCanvas
                    id={`qr-canvas-${qrDialogStudent.id}`}
                    value={qrValue(qrDialogStudent)}
                    size={180}
                    bgColor="white"
                    fgColor="#0A0A0B"
                    level="H"
                    includeMargin
                  />
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Passport ID</p>
                  <p className="text-sm font-mono font-bold" style={{ color: "#C1FF2F" }}>{qrDialogStudent.passport_id}</p>
                </div>
                <div className="flex gap-2 w-full">
                  <Button
                    className="flex-1 h-9 bg-primary hover:bg-primary/90 text-black text-xs font-bold"
                    onClick={() => downloadQR(qrDialogStudent)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" /> Download QR
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-9 text-xs"
                    onClick={() => copyPassportId(qrDialogStudent.passport_id)}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy ID
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
