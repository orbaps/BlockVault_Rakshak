import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, TrendingUp } from "lucide-react";

const AY_DATA: Record<string, { enrolled: number; passed: number; certsIssued: number }> = {
  "2021-22": { enrolled: 420, passed: 395, certsIssued: 310 },
  "2022-23": { enrolled: 510, passed: 488, certsIssued: 402 },
  "2023-24": { enrolled: 638, passed: 614, certsIssued: 572 },
  "2024-25": { enrolled: 842, passed: 790, certsIssued: 724 },
};

const monthlyData = [
  { month:"Jan", issued:45, verified:120 },
  { month:"Feb", issued:62, verified:190 },
  { month:"Mar", issued:78, verified:280 },
  { month:"Apr", issued:95, verified:350 },
  { month:"May", issued:110, verified:420 },
  { month:"Jun", issued:134, verified:510 },
  { month:"Jul", issued:156, verified:620 },
  { month:"Aug", issued:171, verified:710 },
  { month:"Sep", issued:188, verified:820 },
];

const typeData = [
  { name:"Degrees", value:45, color:"#C1FF2F" },
  { name:"Diplomas", value:25, color:"#a78bfa" },
  { name:"Certificates", value:20, color:"#34d399" },
  { name:"Courses", value:10, color:"rgba(255,255,255,0.25)" },
];

const topIssuers = [
  { name:"Google", verifications:342, delta:"+18%" },
  { name:"Microsoft", verifications:289, delta:"+12%" },
  { name:"Infosys", verifications:256, delta:"+9%" },
  { name:"TCS", verifications:198, delta:"+5%" },
  { name:"JP Morgan", verifications:145, delta:"+22%" },
];

const TIP = (props: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!props.active || !props.payload) return null;
  return (
    <div className="p-3 rounded-xl text-xs" style={{ background:"hsl(var(--card))", border:"1px solid hsl(var(--border))" }}>
      <p className="font-mono text-white/40 mb-1.5">{props.label}</p>
      {props.payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>)}
    </div>
  );
};

export default function AnalyticsPage() {
  const [ay, setAy] = useState("2024-25");
  const ayStats = AY_DATA[ay];

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Credential insights by Academic Year</p>
        </div>
        <Select value={ay} onValueChange={setAy}>
          <SelectTrigger className="w-36 h-9 text-xs bg-muted/50 border-border">
            <SelectValue placeholder="Select AY" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(AY_DATA).map(y => <SelectItem key={y} value={y} className="text-xs">AY {y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* AY summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label:"Students Enrolled", value:ayStats.enrolled, color:"text-primary", pct: Math.round((ayStats.enrolled/1000)*100) },
          { label:"Students Passed", value:ayStats.passed, color:"text-emerald-400", pct: Math.round((ayStats.passed/ayStats.enrolled)*100) },
          { label:"Certificates Issued", value:ayStats.certsIssued, color:"text-violet-400", pct: Math.round((ayStats.certsIssued/ayStats.passed)*100) },
        ].map((s,i)=>(
          <motion.div key={s.label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}>
            <Card className="border-border">
              <CardContent className="p-5">
                <p className={`text-3xl font-black ${s.color}`}>{s.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{width:`${s.pct}%`,background:s.color.includes("emerald")?"#34d399":s.color.includes("violet")?"#a78bfa":"#C1FF2F"}}/>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{s.pct}%</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Certificates Issued Per Month</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                  <XAxis dataKey="month" tick={{fontSize:11}} stroke="hsl(var(--muted-foreground))"/>
                  <YAxis tick={{fontSize:11}} stroke="hsl(var(--muted-foreground))"/>
                  <Tooltip content={<TIP/>}/>
                  <Line type="monotone" dataKey="issued" stroke="#C1FF2F" strokeWidth={2.5} dot={{fill:"#C1FF2F",r:3}} name="Issued"/>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.15}}>
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Verification Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                  <XAxis dataKey="month" tick={{fontSize:11}} stroke="hsl(var(--muted-foreground))"/>
                  <YAxis tick={{fontSize:11}} stroke="hsl(var(--muted-foreground))"/>
                  <Tooltip content={<TIP/>}/>
                  <Area type="monotone" dataKey="verified" stroke="#a78bfa" fill="url(#vGrad)" strokeWidth={2} name="Verifications"/>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Certificate Types</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {typeData.map(e=><Cell key={e.name} fill={e.color}/>)}
                  </Pie>
                  <Tooltip content={<TIP/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1 w-full">
                {typeData.map(t=>(
                  <div key={t.name} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full flex-shrink-0" style={{backgroundColor:t.color}}/>
                    <span className="text-xs text-muted-foreground">{t.name} ({t.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="lg:col-span-2">
          <Card className="border-border h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Top Issuers / Verifiers</CardTitle>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <TrendingUp className="h-3 w-3"/>Companies who verified most passports
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topIssuers.map((inst,i)=>(
                  <div key={inst.name} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-4 flex-shrink-0">{i+1}</span>
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-3.5 w-3.5 text-primary"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground">{inst.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-400 font-bold">{inst.delta}</span>
                          <span className="text-sm font-medium text-foreground">{inst.verifications}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{width:`${(inst.verifications/topIssuers[0].verifications)*100}%`,background:"#C1FF2F"}}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
