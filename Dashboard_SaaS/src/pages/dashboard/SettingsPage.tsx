import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Users, Plus, Trash2 } from "lucide-react";

const mockAdmins = [
  { name: "Dr. Sarah Chen", email: "s.chen@stanford.edu", role: "Owner" },
  { name: "Prof. James Miller", email: "j.miller@stanford.edu", role: "Admin" },
  { name: "Maria Garcia", email: "m.garcia@stanford.edu", role: "Member" },
];

export default function SettingsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage workspace settings and permissions.</p>
      </div>

      <div className="space-y-6">
        {/* Workspace Settings */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Workspace Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Institution Name</Label>
                  <Input defaultValue="Stanford University" className="text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Workspace Type</Label>
                  <Select defaultValue="university">
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Admin Wallet Address</Label>
                <Input defaultValue="0x7a3bf8e2d9c14b6a8e5f3d2c1b0a9e8f7d6c5b4a" className="text-xs font-mono" />
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90">Save Changes</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Settings */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Security Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Blockchain Verification</p>
                  <p className="text-xs text-muted-foreground">Record certificate hashes on Polygon blockchain</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">QR Code Verification</p>
                  <p className="text-xs text-muted-foreground">Generate QR codes for quick credential verification</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Public Credential Passports</p>
                  <p className="text-xs text-muted-foreground">Allow students to share credential passports publicly</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Send email when certificates are issued or verified</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Management */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">User Management</CardTitle>
                </div>
                <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                  <Plus className="h-3 w-3" />
                  Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAdmins.map((admin) => (
                  <div key={admin.email} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{admin.name}</p>
                        <p className="text-[10px] text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          admin.role === "Owner"
                            ? "bg-primary/10 text-primary"
                            : admin.role === "Admin"
                            ? "bg-accent/10 text-accent"
                            : ""
                        }`}
                      >
                        {admin.role}
                      </Badge>
                      {admin.role !== "Owner" && (
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      )}
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
