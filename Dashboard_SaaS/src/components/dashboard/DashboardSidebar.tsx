import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  BarChart3,
  FolderLock,
  Settings,
  LogOut,
  CreditCard,
  Globe,
  Search,
  Activity,
  GraduationCap,
  Building2,
  Wallet,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// Institution sidebar items
const institutionMainItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard, end: true },
  { title: "Students", url: "/dashboard/students", icon: Users },
  { title: "Certificates", url: "/dashboard/certificates", icon: FileCheck },
  { title: "Passports", url: "/dashboard/passports", icon: CreditCard },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
];

const institutionToolItems = [
  { title: "Explorer", url: "/explorer", icon: Search },
  { title: "Verify Portal", url: "/verify", icon: Globe },
];

const institutionUtilItems = [
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

// Student sidebar items
const studentMainItems = [
  { title: "My Passport", url: "/student", icon: GraduationCap, end: true },
  { title: "Document Vault", url: "/vault", icon: FolderLock },
  { title: "Explorer", url: "/explorer", icon: Search },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, signOut, userType, studentProfile } = useAuth();

  const isStudent = userType === "student";

  const isActive = (url: string, end = false) => {
    if (end) return location.pathname === url;
    return location.pathname.startsWith(url);
  };

  const mainItems = isStudent ? studentMainItems : institutionMainItems;
  const toolItems = isStudent ? [] : institutionToolItems;
  const utilItems = isStudent ? [] : institutionUtilItems;

  const accentColor = isStudent ? "#a78bfa" : "#C1FF2F";
  const accentBg = isStudent ? "rgba(139,92,246,0.15)" : "#C1FF2F";
  const accentText = isStudent ? "text-violet-400" : "text-black";

  const renderNavItem = (item: { title: string; url: string; icon: React.ElementType; end?: boolean }) => {
    const active = isActive(item.url, item.end);
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            end={item.end}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all mx-1 ${
              active ? `font-bold ${accentText}` : "text-white/35 hover:text-white/70 hover:bg-white/4"
            }`}
            style={active ? { background: accentBg } : {}}
            activeClassName=""
          >
            <item.icon className={`h-4 w-4 flex-shrink-0 ${active ? accentText : ""}`} />
            {!collapsed && <span className="text-xs font-medium">{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-white/6 bg-[#070710]">
      <SidebarContent>
        {/* Logo Header */}
        <div className={`px-4 py-5 border-b border-white/5 ${collapsed ? "px-3" : ""}`}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0">
              <img src="/favicon.png" alt="BlockVault" className="h-full w-full object-contain drop-shadow-[0_0_8px_rgba(193,255,47,0.5)]" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-sm font-black text-white tracking-tight">BlockVault</span>
                <p
                  className="text-[9px] font-mono tracking-wider"
                  style={{ color: isStudent ? "#a78bfa" : "rgba(255,255,255,0.25)" }}
                >
                  {isStudent ? "STUDENT PORTAL" : "INSTITUTION"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Blockchain Status Indicator */}
        {!collapsed && (
          <div
            className="mx-3 mt-3 mb-1 px-3 py-2.5 rounded-xl border flex items-center gap-2"
            style={{ background: isStudent ? "rgba(139,92,246,0.05)" : "rgba(193,255,47,0.05)", borderColor: isStudent ? "rgba(139,92,246,0.15)" : "rgba(193,255,47,0.15)" }}
          >
            <Activity className="h-3 w-3 flex-shrink-0" style={{ color: accentColor }} />
            <div className="min-w-0">
              <p className="text-[10px] font-mono" style={{ color: accentColor }}>Network Active</p>
              <p className="text-[9px] text-white/25">Blockchain synced</p>
            </div>
          </div>
        )}

        {/* Student profile badge (collapsed: just icon) */}
        {isStudent && !collapsed && studentProfile && (
          <div className="mx-3 mt-2 px-3 py-2.5 rounded-xl border flex items-center gap-2" style={{ background: "rgba(139,92,246,0.05)", borderColor: "rgba(139,92,246,0.15)" }}>
            <Wallet className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{studentProfile.name}</p>
              <p className="text-[9px] font-mono text-violet-400/70 truncate">{studentProfile.passportId}</p>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.2em] text-white/20 px-4 font-mono">
            {collapsed ? "" : isStudent ? "My Space" : "Workspace"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools — institution only */}
        {toolItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.2em] text-white/20 px-4 font-mono">
              {collapsed ? "" : "Tools"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {toolItems.map(renderNavItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings — institution only */}
        {utilItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {utilItems.map(renderNavItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-white/5 p-3">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border"
            style={isStudent ? { background: "rgba(139,92,246,0.15)", color: "#a78bfa", borderColor: "rgba(139,92,246,0.25)" } : { background: "rgba(193,255,47,0.1)", color: "#C1FF2F", borderColor: "rgba(193,255,47,0.2)" }}
          >
            {isStudent ? (studentProfile?.name?.charAt(0)?.toUpperCase() || "S") : (user?.email?.charAt(0).toUpperCase() || "I")}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {isStudent ? studentProfile?.name || "Student" : user?.user_metadata?.full_name || "Institution"}
              </p>
              <p className="text-[9px] text-white/25 font-mono truncate">
                {isStudent ? studentProfile?.passportId : user?.email}
              </p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0 text-white/25 hover:text-white hover:bg-white/5"
              onClick={signOut}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
