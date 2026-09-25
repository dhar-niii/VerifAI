import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  User,
  Mail,
  Globe,
  MapPin,
  LogOut,
  Save,
  Loader2,
  Shield,
  Heart,
  Settings,
} from "lucide-react";

const languages = ["English", "Spanish", "French", "German", "Italian", "Japanese", "Hindi", "Arabic", "Portuguese", "Chinese"];

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const profile = useQuery(api.profile.get);
  const updateProfile = useMutation(api.profile.update);
  const stats = useQuery(api.profile.stats);

  const [name, setName] = useState("");
  const [language, setLanguage] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Initialize form when profile loads
  if (profile && !initialized) {
    setName(profile.name || "");
    setLanguage(profile.language || "English");
    setInitialized(true);
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ name: name.trim(), language });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const userInitials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Profile & Settings</h1>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 border-4 border-accent">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-foreground">{profile?.name || "Traveler"}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3.5 w-3.5" /> {profile?.email || "No email"}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{profile?.language || "English"}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-accent">{stats?.totalTrips ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Trips</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-accent">${(stats?.totalSpent ?? 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Edit Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email || ""} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      language === lang
                        ? "bg-accent text-white border-accent"
                        : "bg-card text-foreground border-border hover:border-accent/50"
                    }`}
                    onClick={() => setLanguage(lang)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-white" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="text-sm font-medium text-foreground">Default Trip Visibility</p>
                <p className="text-xs text-muted-foreground">New trips are created as private</p>
              </div>
              <Badge variant="outline">Private</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => setShowDeleteDialog(true)}>
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* Delete Account Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Account?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. All your trips, data, and account information will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDeleteDialog(false);
                  toast.error("Account deletion is not available in this demo");
                }}
              >
                Delete Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
