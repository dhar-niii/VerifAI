import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Map,
  PlusCircle,
  Globe,
  Compass,
  Wallet,
  CalendarDays,
  Share2,
  User,
  LogOut,
  Menu,
  Plane,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/trips", icon: Map, label: "My Trips" },
  { to: "/trips/new", icon: PlusCircle, label: "Create Trip" },
  { to: "/explore", icon: Globe, label: "Explore Cities" },
  { to: "/activities", icon: Compass, label: "Activities" },
  { to: "/calendar", icon: CalendarDays, label: "Calendar" },
  { to: "/budget", icon: Wallet, label: "Budget" },
  { to: "/shared", icon: Share2, label: "Shared Trips" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent text-white">
          <Plane className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">GlobeTrotter</h1>
          <p className="text-[11px] text-white/50">Plan your adventure</p>
        </div>
      </div>
      <Separator className="bg-white/10" />
      {/* Nav Links */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
              end={item.to === "/trips" ? false : true}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
      {/* User Section */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border-2 border-accent">
            <AvatarFallback className="bg-white/10 text-white text-xs font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || "Traveler"}</p>
            <p className="text-xs text-white/50 truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/50 hover:text-white hover:bg-white/10 h-8 w-8"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center gap-4 border-b border-border bg-card px-4 py-3 lg:hidden sticky top-0 z-30">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r-sidebar-border">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent text-white">
              <Plane className="h-4 w-4" />
            </div>
            <h1 className="text-base font-bold text-foreground">GlobeTrotter</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
