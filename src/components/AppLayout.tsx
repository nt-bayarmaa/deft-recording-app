import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Home, Clock, Plus, CheckSquare, Users, Bell, User, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockNotifications } from "@/data/mock";

const bottomNavItems = [
  { to: "/", icon: Home, label: "Нүүр" },
  { to: "/history", icon: Clock, label: "Түүх" },
  { to: "__fab__", icon: Plus, label: "" },
  { to: "/approvals", icon: CheckSquare, label: "Хүсэлт" },
  { to: "/friends", icon: Users, label: "Найзууд" },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [fabOpen, setFabOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const fabActions = [
    { label: "Зээл өгөх", to: "/loan/give", color: "text-positive" },
    { label: "Зээл авах", to: "/loan/take", color: "text-negative" },
    { label: "Төлбөр төлөх", to: "/repayment/pay", color: "text-negative" },
    { label: "Төлбөр авах", to: "/repayment/receive", color: "text-positive" },
    { label: "QR уншуулах", to: "/scan", color: "text-muted-foreground" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex h-14 items-center justify-between px-4 md:px-8">
          <RouterNavLink to="/" className="text-lg font-bold tracking-tight">
            Өр<span className="text-muted-foreground font-normal">.mn</span>
          </RouterNavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {[
              { to: "/", label: "Нүүр" },
              { to: "/history", label: "Түүх" },
              { to: "/approvals", label: "Хүсэлт" },
              { to: "/friends", label: "Найзууд" },
            ].map((item) => (
              <RouterNavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "transition-colors hover:text-foreground",
                    isActive ? "text-foreground font-medium" : "text-muted-foreground"
                  )
                }
              >
                {item.label}
              </RouterNavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <RouterNavLink
              to="/notifications"
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-negative text-negative-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </RouterNavLink>
            <RouterNavLink
              to="/profile"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
            </RouterNavLink>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-6">{children}</main>

      {/* FAB overlay */}
      {fabOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setFabOpen(false)}
        >
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center">
            {fabActions.map((action) => (
              <button
                key={action.to}
                onClick={(e) => {
                  e.stopPropagation();
                  setFabOpen(false);
                  navigate(action.to);
                }}
                className={cn(
                  "px-5 py-3 bg-card border border-border rounded-2xl text-sm font-medium shadow-lg min-w-[180px] text-center transition-transform hover:scale-105",
                  action.color
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {bottomNavItems.map((item) => {
            if (item.to === "__fab__") {
              return (
                <button
                  key="fab"
                  onClick={() => setFabOpen(!fabOpen)}
                  className={cn(
                    "w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg -mt-4 transition-transform",
                    fabOpen && "rotate-45"
                  )}
                >
                  <Plus className="w-6 h-6" />
                </button>
              );
            }
            const isActive = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
            return (
              <RouterNavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 text-[10px] py-1 px-3 transition-colors min-w-[52px]",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </RouterNavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
