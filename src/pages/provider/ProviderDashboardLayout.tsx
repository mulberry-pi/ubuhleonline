import { useEffect, useState } from "react";
import { Outlet, useNavigate, NavLink, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  Bookmark,
  Image
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const menuItems = [
  { title: "Dashboard", url: "/provider/dashboard", icon: LayoutDashboard },
  { title: "Appointments", url: "/provider/appointments", icon: Calendar },
  { title: "Availability", url: "/provider/availability", icon: Calendar },
  { title: "Clients", url: "/provider/clients", icon: Users },
  { title: "Services & Pricing", url: "/provider/services", icon: DollarSign },
  { title: "Analytics", url: "/provider/analytics", icon: TrendingUp },
  { title: "Market Trends", url: "/provider/trends", icon: TrendingUp },
  { title: "Saved Trends", url: "/provider/saved-trends", icon: Bookmark },
  { title: "Portfolio", url: "/provider/portfolio", icon: Image },
  { title: "Messages", url: "/provider/messages", icon: MessageSquare },
  { title: "Settings", url: "/provider/settings", icon: Settings },
];

function ProviderSidebar({ user }: { user: User | null }) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    if (user?.id) {
      loadUserName();
    }
  }, [user?.id]);

  const loadUserName = async () => {
    if (!user?.id) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    
    if (data?.full_name) {
      setUserName(data.full_name);
    } else if (user.email) {
      const emailName = user.email.split('@')[0];
      setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
      return;
    }
    navigate("/");
  };

  const getNavClass = (path: string) => {
    return location.pathname === path
      ? "bg-primary/10 text-primary font-medium"
      : "hover:bg-muted/50";
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-background">
        <div className="p-4 border-b flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-white">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{userName || "Provider"}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </span>
              </div>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClass(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function ProviderDashboardLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ProviderSidebar user={user} />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 bg-background border-b p-4 flex items-center gap-4">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="text-xl font-semibold">Ubuhle Provider Dashboard</h1>
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
