import { Outlet, Navigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Search, Bell, ChevronDown, Plus, Building2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Institution-only routes that should redirect students away
const INSTITUTION_ONLY_PATHS = [
  "/dashboard/students",
  "/dashboard/certificates",
  "/dashboard/analytics",
  "/dashboard/passports",
  "/dashboard/settings",
  "/dashboard",
];

export default function DashboardLayout() {
  const { user, loading, signOut, userType, studentProfile } = useAuth();
  const { workspace, workspaces, switchWorkspace } = useWorkspace();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Students authenticate via localStorage (no Supabase user object) — allow them through
  const isAuthenticated = !!user || userType === "student";
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If student tries to access institution routes, redirect to student dashboard
  if (userType === "student" && INSTITUTION_ONLY_PATHS.some((p) => location.pathname === p || (p !== "/dashboard" && location.pathname.startsWith(p)))) {
    return <Navigate to="/student" replace />;
  }

  const isStudent = userType === "student";
  const displayName = isStudent
    ? studentProfile?.name || "Student"
    : user?.user_metadata?.full_name || "Institution";

  const displayEmail = isStudent
    ? studentProfile?.passportId || ""
    : user?.email || "";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navbar */}
          <header className="h-14 flex items-center justify-between border-b border-border px-4 gap-4 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-7 w-7" />

              {/* Role badge */}
              <div
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider"
                style={
                  isStudent
                    ? { borderColor: "rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.08)", color: "#a78bfa" }
                    : { borderColor: "rgba(193,255,47,0.2)", background: "rgba(193,255,47,0.05)", color: "#C1FF2F" }
                }
              >
                {isStudent ? <GraduationCap className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                {isStudent ? "Student" : "Institution"}
              </div>

              {/* Workspace Selector — institution only */}
              {!isStudent && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-medium h-8 px-2.5">
                      <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {workspace?.name?.charAt(0)?.toUpperCase() || "W"}
                      </div>
                      {workspace?.name || "Select workspace"}
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {workspaces.map((ws) => (
                      <DropdownMenuItem key={ws.id} className="text-xs" onClick={() => switchWorkspace(ws.id)}>
                        <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary mr-2">
                          {ws.name.charAt(0).toUpperCase()}
                        </div>
                        {ws.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-xs text-muted-foreground gap-1.5">
                      <Plus className="h-3 w-3" /> Create workspace…
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-sm mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={isStudent ? "Search your transactions, certificates…" : "Search students, certificates…"}
                  className="pl-9 h-8 text-xs bg-muted/50 border-transparent focus:border-border"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
              </Button>

              {/* Network Status */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border" style={{ borderColor: "rgba(193,255,47,0.2)", background: "rgba(193,255,47,0.05)" }}>
                <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#C1FF2F" }} />
                <span className="text-[10px] font-mono" style={{ color: "#C1FF2F" }}>Network Active</span>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium"
                      style={isStudent ? { background: "rgba(139,92,246,0.15)", color: "#a78bfa" } : { background: "rgba(193,255,47,0.1)", color: "#C1FF2F" }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-xs font-medium text-foreground">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate font-mono">{displayEmail}</p>
                    <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                      style={isStudent ? { background: "rgba(139,92,246,0.1)", color: "#a78bfa" } : { background: "rgba(193,255,47,0.08)", color: "#C1FF2F" }}
                    >
                      {isStudent ? <GraduationCap className="h-2.5 w-2.5" /> : <Building2 className="h-2.5 w-2.5" />}
                      {isStudent ? "Student" : "Institution"}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {!isStudent && <DropdownMenuItem className="text-xs">Settings</DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs text-destructive" onClick={signOut}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
