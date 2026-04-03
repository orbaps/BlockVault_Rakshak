import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Workspace {
  id: string;
  name: string;
  workspace_type: string;
  admin_wallet: string | null;
  blockchain_verification: boolean;
  qr_verification: boolean;
  public_passports: boolean;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  switchWorkspace: (id: string) => void;
  refetch: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspace: null,
  workspaces: [],
  loading: true,
  switchWorkspace: () => {},
  refetch: async () => {},
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    if (!user) { setWorkspaces([]); setLoading(false); return; }
    
    const { data } = await supabase
      .from("workspaces")
      .select("*")
      .order("created_at", { ascending: true });

    const ws = (data as Workspace[]) || [];
    setWorkspaces(ws);

    if (ws.length === 0) {
      // Auto-create default workspace
      const { data: newWs, error: wsErr } = await supabase
        .from("workspaces")
        .insert({ name: "My Institution", owner_id: user.id })
        .select()
        .single();
      
      if (wsErr) {
        console.error("Workspace creation error:", wsErr);
      }
      
      if (newWs) {
        const created = newWs as Workspace;
        setWorkspaces([created]);
        setActiveId(created.id);
        // Also add as workspace member
        const { error: memberErr } = await supabase.from("workspace_members").insert({
          workspace_id: created.id,
          user_id: user.id,
          role: "owner",
        });
        if (memberErr) console.error("Member creation error:", memberErr);
      }
    } else if (!activeId || !ws.find((w) => w.id === activeId)) {
      setActiveId(ws[0].id);
    }
    setLoading(false);
  };

  useEffect(() => { fetchWorkspaces(); }, [user]);

  const workspace = workspaces.find((w) => w.id === activeId) || null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        workspaces,
        loading,
        switchWorkspace: setActiveId,
        refetch: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
