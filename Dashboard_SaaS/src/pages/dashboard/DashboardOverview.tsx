import { motion } from "framer-motion";
import { FileCheck, Users, BarChart3, CreditCard, ArrowUpRight, Clock, CheckCircle2, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";

const chartData = [
  { month:"Jan", certificates:65,  verifications:180 },
  { month:"Feb", certificates:78,  verifications:210 },
  { month:"Mar", certificates:92,  verifications:340 },
  { month:"Apr", certificates:110, verifications:420 },
  { month:"May", certificates:134, verifications:510 },
  { month:"Jun", certificates:156, verifications:620 },
  { month:"Jul", certificates:178, verifications:740 },
];

const recentVerifications = [
  { cert:"BSc Computer Science", verifier:"Google HR", time:"10 min ago" },
  { cert:"Data Analytics Certificate", verifier:"Microsoft", time:"45 min ago" },
  { cert:"MBA Finance", verifier:"JP Morgan", time:"2 hours ago" },
];

const activityFeed = [
  { action:"Certificate issued", detail:"BSc CS for Sarah Johnson", time:"2h ago", type:"issue" },
  { action:"Student enrolled", detail:"Carlos Rivera (BV-2026-ABCD1234)", time:"5h ago", type:"enroll" },
  { action:"Verification request", detail:"CERT-001 verified by Google HR", time:"6h ago", type:"verify" },
  { action:"Certificate revoked", detail:"Cybersecurity Diploma — James Wilson", time:"1d ago", type:"revoke" },
];

export default function DashboardOverview() {
  const { workspace } = useWorkspace();
  const [counts, setCounts] = useState({ students:0, certificates:0, passports:0, verifications:3621 });

  useEffect(() => {
    if (!workspace) return;
    const fetchCounts = async () => {
      const [{ count: stu }, { count: crt }] = await Promise.all([
        supabase.from("students").select("*", { count:"exact", head:true }).eq("workspace_id", workspace.id),
        supabase.from("certificates").select("*", { count:"exact", head:true }).eq("workspace_id", workspace.id),
      ]);
      setCounts(c => ({ ...c, students: stu||0, certificates: crt||0, passports: Math.floor((stu||0)*0.95) }));
    };
    fetchCounts();
  }, [workspace]);

  const stats = [
    { label:"Total Students",       value: counts.students.toLocaleString(),       change:"+8%",  icon:Users,     color:"text-primary" },
    { label:"Certificates Issued",  value: counts.certificates.toLocaleString(),   change:"+12%", icon:FileCheck, color:"text-primary" },
    { label:"Active Passports",     value: counts.passports.toLocaleString(),      change:"+6%",  icon:CreditCard, color:"text-emerald-400" },
    { label:"Verification Requests",value: counts.verifications.toLocaleString(), change:"+24%", icon:BarChart3, color:"text-violet-400" },
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Institution Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Live overview of your workspace activity.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat,i)=>(
          <motion.div key={stat.label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
            <Card className="border-border hover:border-border/80 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <stat.icon className={`h-4 w-4 ${stat.color}`}/>
                  </div>
                  <span className="text-[10px] font-medium text-success flex items-center gap-0.5 bg-success/10 px-1.5 py-0.5 rounded-full">
                    <ArrowUpRight className="h-3 w-3"/>{stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts + Recent */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Activity Overview</CardTitle>
              <div className="flex items-center gap-1.5">
                <Activity className="h-3 w-3" style={{color:"#C1FF2F"}}/>
                <span className="text-[10px] font-mono" style={{color:"#C1FF2F"}}>Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C1FF2F" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#C1FF2F" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                <XAxis dataKey="month" tick={{fontSize:11}} stroke="hsl(var(--muted-foreground))"/>
                <YAxis tick={{fontSize:11}} stroke="hsl(var(--muted-foreground))"/>
                <Tooltip contentStyle={{backgroundColor:"hsl(var(--card))",border:"1px solid hsl(var(--border))",borderRadius:"8px",fontSize:"12px"}}/>
                <Area type="monotone" dataKey="certificates" stroke="#C1FF2F" fill="url(#cGrad)" strokeWidth={2} name="Certificates"/>
                <Area type="monotone" dataKey="verifications" stroke="#a78bfa" fill="url(#vGrad)" strokeWidth={2} name="Verifications"/>
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 mt-3 px-2">
              {[{color:"#C1FF2F",label:"Certificates"},{color:"#a78bfa",label:"Verifications"}].map(l=>(
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{backgroundColor:l.color}}/>
                  <span className="text-xs text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Issuances */}
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Recent Issuances</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { student:"Sarah Johnson", cert:"BSc Computer Science", date:"2h ago", status:"verified" },
                { student:"Michael Chen", cert:"Data Analytics Certificate", date:"5h ago", status:"verified" },
                { student:"Emily Davis", cert:"MBA Finance", date:"1d ago", status:"verified" },
                { student:"James Wilson", cert:"Cybersecurity Diploma", date:"2d ago", status:"pending" },
              ].map((c)=>(
                <div key={c.student+c.cert} className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-medium text-primary mt-0.5">
                    {c.student.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{c.student}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.cert}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{c.date}</p>
                  </div>
                  <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${c.status==="verified" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                    {c.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Recent Verification Requests</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentVerifications.map((v,i)=>(
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-success"/>
                    </div>
                    <div>
                      <p className="text-sm text-foreground">{v.cert}</p>
                      <p className="text-[10px] text-muted-foreground">by {v.verifier}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{v.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Institution Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityFeed.map((item,i)=>(
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <div className={`h-6 w-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${item.type==="issue"?"bg-primary/10":item.type==="verify"?"bg-emerald-400/10":item.type==="revoke"?"bg-red-400/10":"bg-muted"}`}>
                    <Clock className={`h-3 w-3 ${item.type==="issue"?"text-primary":item.type==="verify"?"text-emerald-400":item.type==="revoke"?"text-red-400":"text-muted-foreground"}`}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{item.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
