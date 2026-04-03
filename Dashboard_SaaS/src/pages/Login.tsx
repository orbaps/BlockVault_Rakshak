import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Building2, GraduationCap, Eye, EyeOff, QrCode, Hash, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import jsQR from "jsqr";

const BVLogo = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0">
      <img src="/favicon.png" alt="BlockVault" className="h-full w-full object-contain drop-shadow-[0_0_24px_rgba(193,255,47,0.35)]" />
    </div>
    <span className="font-black text-xl tracking-tighter text-white">BlockVault</span>
  </div>
);

type Role = "institution" | "student";
type StudentMode = "passport" | "qr";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { loginAsStudent } = useAuth();

  const [role, setRole] = useState<Role>("institution");

  // Institution
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");

  // Student
  const [studentMode, setStudentMode] = useState<StudentMode>("passport");
  const [passportId, setPassportId] = useState("");
  const [loading, setLoading] = useState(false);

  // QR scanner
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState("");
  const [qrDetected, setQrDetected] = useState("");

  // ── Auto-fill passport from ?passport= URL param (QR code on another device) ──
  useEffect(() => {
    const qpPassport = searchParams.get("passport");
    if (qpPassport) {
      setRole("student");
      setStudentMode("passport");
      setPassportId(qpPassport.toUpperCase());
      // auto-submit after small delay so component is ready
      setTimeout(() => handleStudentLoginWithId(qpPassport.toUpperCase()), 300);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── QR scan loop ─────────────────────────────────────────────────────────
  const scanLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) { rafRef.current = requestAnimationFrame(scanLoop); return; }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
    if (code?.data) {
      // Extract BV-YEAR-XXXXXXXX from URL or raw
      const match = code.data.match(/BV-\d{4}-[A-Z0-9]{8}/i);
      const extracted = match ? match[0].toUpperCase() : code.data.trim().toUpperCase();
      stopCamera();
      setQrDetected(extracted);
      return;
    }
    rafRef.current = requestAnimationFrame(scanLoop);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startCamera = async () => {
    setCamError(""); setQrDetected("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setScanning(true);
      rafRef.current = requestAnimationFrame(scanLoop);
    } catch { setCamError("Camera access denied. Enter your Passport ID manually."); }
  };

  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  };

  useEffect(() => () => stopCamera(), []);

  // Auto-login when QR detected
  useEffect(() => {
    if (qrDetected) handleStudentLoginWithId(qrDetected);
  }, [qrDetected]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Institution auth ──────────────────────────────────────────────────────
  const handleInstitutionAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, user_type: "institution" }, emailRedirectTo: window.location.origin } });
      setLoading(false);
      if (error) toast({ title: "Sign-up failed", description: error.message, variant: "destructive" });
      else { toast({ title: "Account created! ✅" }); navigate("/dashboard"); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) toast({ title: "Login failed", description: error.message, variant: "destructive" });
      else navigate("/dashboard");
    }
  };

  // ── Student login — mutates context state directly ────────────────────────
  const handleStudentLoginWithId = async (id: string) => {
    const pid = id.trim().toUpperCase();
    if (!pid) { toast({ title: "Enter your Passport ID", variant: "destructive" }); return; }
    setLoading(true);

    const { data: student, error } = await supabase
      .from("students")
      .select("id, full_name, email, passport_id")
      .eq("passport_id", pid)
      .maybeSingle();

    setLoading(false);
    if (error) { toast({ title: "Lookup error", description: error.message, variant: "destructive" }); return; }
    if (!student) { toast({ title: "Passport not found", description: "Check your ID and try again.", variant: "destructive" }); return; }

    // Mutate context state immediately — no page refresh needed
    loginAsStudent({ id: student.id, passportId: student.passport_id, name: student.full_name });
    toast({ title: `Welcome, ${student.full_name}! 🎓` });
    navigate("/student");
  };

  const handleStudentLogin = (e: React.FormEvent) => { e.preventDefault(); handleStudentLoginWithId(passportId); };

  const G = "#C1FF2F";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#0A0A0B" }}>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.04] animate-pulse" style={{ background: G }}/>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px] opacity-[0.04] bg-violet-500 animate-pulse" style={{ animationDelay:"2s" }}/>
      </div>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        className="w-full max-w-[980px] flex rounded-[36px] overflow-hidden shadow-2xl relative z-10"
        style={{ minHeight:600, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>

        {/* Left panel */}
        <div className="hidden lg:flex w-[42%] relative overflow-hidden flex-col" style={{ background:"#070710" }}>
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage:"linear-gradient(rgba(193,255,47,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(193,255,47,0.5) 1px,transparent 1px)", backgroundSize:"40px 40px" }}/>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ background:G }}/>
          <div className="relative z-10 flex flex-col h-full p-10">
            <BVLogo />
            <div className="flex-1 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 w-fit" style={{ background:"rgba(193,255,47,0.08)", border:"1px solid rgba(193,255,47,0.2)" }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:G }}/>
                <span className="text-[10px] font-mono tracking-widest" style={{ color:G }}>BLOCKCHAIN ACTIVE</span>
              </div>
              <h2 className="text-4xl font-black leading-tight tracking-tighter text-white mb-4">Your credentials.<br/><span style={{ color:G }}>Immutable.</span><br/>Verified.</h2>
              <p className="text-white/35 text-sm leading-relaxed max-w-xs">BlockVault links academic institutions and students on a tamper-proof credential ledger.</p>
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-mono text-white/20 tracking-widest uppercase mb-3">TWO SECURE PORTALS</p>
              {[{ icon:Building2,label:"Institutions",desc:"Issue & manage credentials" },{ icon:GraduationCap,label:"Students",desc:"Access via Passport ID or QR" }].map(({ icon:Icon, label, desc })=>(
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:"rgba(193,255,47,0.1)" }}><Icon className="h-4 w-4" style={{ color:G }}/></div>
                  <div><p className="text-xs font-bold text-white">{label}</p><p className="text-[10px] text-white/30">{desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
          <div className="flex lg:hidden mb-8"><BVLogo /></div>

          {/* Role tabs */}
          <div className="flex p-1 rounded-2xl mb-8" style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)" }}>
            {([{ value:"institution",label:"Institution",icon:Building2 },{ value:"student",label:"Student",icon:GraduationCap }] as {value:Role;label:string;icon:React.ElementType}[]).map(({ value,label,icon:Icon })=>(
              <button key={value} id={`role-tab-${value}`} type="button" onClick={()=>{ setRole(value as Role); stopCamera(); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
                style={role===value ? { background:G, color:"black" } : { color:"rgba(255,255,255,0.3)" }}>
                <Icon className="h-4 w-4"/>{label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── INSTITUTION ── */}
            {role==="institution" && (
              <motion.div key="institution" initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-20 }}>
                <div className="mb-7">
                  <h1 className="text-2xl font-black tracking-tighter text-white mb-1">{isSignup?"Create Institution Account":"Institution Portal"}</h1>
                  <p className="text-white/35 text-sm">{isSignup?"Start issuing verifiable credentials":"Sign in with your institution email"}</p>
                </div>
                <form onSubmit={handleInstitutionAuth} className="space-y-5">
                  {isSignup && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Institution Name</label>
                      <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl" style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)" }}>
                        <Building2 className="h-4 w-4 text-white/25 flex-shrink-0"/>
                        <input id="institution-name" type="text" placeholder="e.g., IIT Bombay" value={fullName} onChange={e=>setFullName(e.target.value)} className="bg-transparent border-none outline-none w-full text-sm font-bold text-white placeholder:text-white/20" required/>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Email Address</label>
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl" style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)" }}>
                      <svg className="h-4 w-4 text-white/25 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" strokeWidth="2" strokeLinecap="round"/></svg>
                      <input id="institution-email" type="email" placeholder="admin@university.edu" value={email} onChange={e=>setEmail(e.target.value)} className="bg-transparent border-none outline-none w-full text-sm font-bold text-white placeholder:text-white/20" required/>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Password</label>
                      {!isSignup && <button type="button" className="text-[10px] font-bold hover:underline" style={{ color:G }}>Forgot?</button>}
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl" style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)" }}>
                      <svg className="h-4 w-4 text-white/25 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2" strokeLinecap="round"/></svg>
                      <input id="institution-password" type={showPass?"text":"password"} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} className="bg-transparent border-none outline-none w-full text-sm font-bold text-white placeholder:text-white/20" required minLength={6}/>
                      <button type="button" onClick={()=>setShowPass(!showPass)} className="text-white/25 hover:text-white/60">{showPass?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>
                    </div>
                  </div>
                  <button id="institution-submit" type="submit" disabled={loading} className="w-full py-4 flex items-center justify-center gap-3 group disabled:opacity-50 rounded-xl font-bold text-sm" style={{ background:G, color:"black" }}>
                    {loading?<><Loader2 className="h-4 w-4 animate-spin"/>Authenticating…</>:<>{isSignup?"Create Institution":"Sign In to Dashboard"}<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform"/></>}
                  </button>
                </form>
                <p className="text-center mt-5 text-xs text-white/25">
                  {isSignup?"Already registered?":"New institution?"}{" "}
                  <button type="button" onClick={()=>setIsSignup(!isSignup)} className="font-black hover:underline" style={{ color:G }}>{isSignup?"Sign In":"Create Account"}</button>
                </p>
              </motion.div>
            )}

            {/* ── STUDENT ── */}
            {role==="student" && (
              <motion.div key="student" initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-20 }}>
                <div className="mb-7">
                  <h1 className="text-2xl font-black tracking-tighter text-white mb-1">Student Portal</h1>
                  <p className="text-white/35 text-sm">Enter your Passport ID or scan your QR code</p>
                </div>

                <div className="flex gap-2 mb-5">
                  {([{ value:"passport",label:"Passport ID",icon:Hash },{ value:"qr",label:"Scan QR",icon:QrCode }] as {value:StudentMode;label:string;icon:React.ElementType}[]).map(({ value,label,icon:Icon })=>(
                    <button key={value} id={`student-mode-${value}`} type="button" onClick={()=>{ setStudentMode(value as StudentMode); stopCamera(); setQrDetected(""); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      style={studentMode===value ? { background:"rgba(193,255,47,0.12)",color:G,border:"1px solid rgba(193,255,47,0.3)" } : { background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.3)",border:"1px solid rgba(255,255,255,0.07)" }}>
                      <Icon className="h-3.5 w-3.5"/>{label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {studentMode==="passport" && (
                    <motion.form key="passport" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onSubmit={handleStudentLogin} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Passport ID</label>
                        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl" style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)" }}>
                          <Hash className="h-4 w-4 text-white/25 flex-shrink-0"/>
                          <input id="student-passport-id" type="text" placeholder="BV-2026-XXXXXXXX" value={passportId} onChange={e=>setPassportId(e.target.value.toUpperCase())}
                            className="bg-transparent border-none outline-none w-full text-sm font-mono font-bold text-white placeholder:text-white/20 uppercase" required/>
                        </div>
                        <p className="text-[10px] text-white/20 ml-1">Your Passport ID was given by your institution on enrolment.</p>
                      </div>
                      <button id="student-login-submit" type="submit" disabled={loading} className="w-full py-4 flex items-center justify-center gap-3 group disabled:opacity-50 rounded-xl font-bold text-sm" style={{ background:G, color:"black" }}>
                        {loading?<><Loader2 className="h-4 w-4 animate-spin"/>Verifying…</>:<>Access My Passport<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform"/></>}
                      </button>
                    </motion.form>
                  )}

                  {studentMode==="qr" && (
                    <motion.div key="qr" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-4">
                      {/* QR detected state */}
                      {qrDetected ? (
                        <div className="p-5 rounded-2xl flex flex-col items-center gap-3 text-center" style={{ background:"rgba(193,255,47,0.06)",border:"1px solid rgba(193,255,47,0.3)" }}>
                          <CheckCircle2 className="h-8 w-8" style={{ color:G }}/>
                          <div>
                            <p className="text-sm font-bold text-white">QR Code Detected!</p>
                            <p className="text-xs font-mono mt-1" style={{ color:G }}>{qrDetected}</p>
                          </div>
                          {loading && <div className="flex items-center gap-2 text-xs text-white/40"><Loader2 className="h-3.5 w-3.5 animate-spin"/>Verifying passport…</div>}
                        </div>
                      ) : (
                        /* Camera viewfinder */
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden flex items-center justify-center" style={{ background:"rgba(0,0,0,0.8)",border:"1px solid rgba(193,255,47,0.2)" }}>
                          <video ref={videoRef} className={`absolute inset-0 w-full h-full object-cover ${scanning?"block":"hidden"}`} autoPlay playsInline muted/>
                          <canvas ref={canvasRef} className="hidden"/>
                          {scanning && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-48 h-48 relative">
                                {["top-0 left-0 border-t-2 border-l-2","top-0 right-0 border-t-2 border-r-2","bottom-0 left-0 border-b-2 border-l-2","bottom-0 right-0 border-b-2 border-r-2"].map((cls,i)=>(
                                  <div key={i} className={`absolute w-7 h-7 ${cls}`} style={{ borderColor:G }}/>
                                ))}
                                <motion.div className="absolute inset-x-2 h-0.5" style={{ background:`linear-gradient(90deg,transparent,${G},transparent)` }} animate={{ y:[0,176,0] }} transition={{ duration:2.5,repeat:Infinity,ease:"linear" }}/>
                              </div>
                              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                <div className="px-3 py-1.5 rounded-full text-[10px] font-mono" style={{ background:"rgba(0,0,0,0.6)",color:G }}>Point your BlockVault QR at the camera</div>
                              </div>
                            </div>
                          )}
                          {!scanning && (
                            <div className="text-center space-y-2"><QrCode className="h-10 w-10 mx-auto text-white/10"/><p className="text-xs text-white/25">Camera not active</p></div>
                          )}
                        </div>
                      )}

                      {camError && <p className="text-xs text-red-400 text-center bg-red-400/10 px-4 py-2 rounded-xl border border-red-400/20">{camError}</p>}

                      {!scanning && !qrDetected && (
                        <button id="start-camera-scan" type="button" onClick={startCamera} className="w-full py-4 flex items-center justify-center gap-3 rounded-xl font-bold text-sm" style={{ background:G,color:"black" }}>
                          <QrCode className="h-4 w-4"/>Start Camera & Scan QR
                        </button>
                      )}
                      {scanning && !qrDetected && (
                        <button type="button" onClick={stopCamera} className="w-full py-3 flex items-center justify-center text-sm text-white/40 hover:text-white/60 rounded-xl transition-colors" style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)" }}>
                          Cancel Scan
                        </button>
                      )}
                      {qrDetected && !loading && (
                        <button type="button" onClick={()=>{ setQrDetected(""); setPassportId(""); }} className="w-full py-2 text-xs text-white/25 hover:text-white/50 transition-colors">
                          ↩ Scan a different code
                        </button>
                      )}
                      <p className="text-center text-xs text-white/25">
                        Or <button type="button" onClick={()=>setStudentMode("passport")} className="font-bold hover:underline" style={{ color:G }}>enter Passport ID manually</button>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
