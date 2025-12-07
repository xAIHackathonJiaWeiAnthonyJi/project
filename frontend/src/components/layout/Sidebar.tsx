import { NavLink } from "react-router-dom";
import { 
  Briefcase, 
  Users, 
  Activity, 
  Settings,
  Terminal,
  Bot,
  BarChart3,
  ClipboardCheck,
  Brain,
  UsersRound
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Agents", href: "/agents", icon: Bot },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Teams", href: "/teams", icon: UsersRound },
  { name: "Interviews", href: "/interviews", icon: ClipboardCheck },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Learning", href: "/learning", icon: Brain, badge: "AI" },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <img 
              src="/grok-logo.svg" 
              alt="Grok Logo" 
              className="h-5 w-5 brightness-0 invert"
            />
          </div>
          <span className="text-base font-semibold text-foreground tracking-tight">
            Grok<span className="text-primary">Reach</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-3">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-md bg-accent/50 px-3 py-2">
            <div className="flex h-2 w-2 items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Agent running</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
