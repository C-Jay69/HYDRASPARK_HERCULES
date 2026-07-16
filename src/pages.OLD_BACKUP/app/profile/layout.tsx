import { Outlet, useNavigate } from "react-router-dom";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Flame, Heart, MessageCircle, User, Compass, Settings } from "lucide-react";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function AppNav() {
  const location = useLocation();
  const nav = [
    { icon: Compass, label: "Discover", path: "/app" },
    { icon: Heart, label: "Matches", path: "/app/matches" },
    { icon: MessageCircle, label: "Chat", path: "/app/chat" },
    { icon: User, label: "Profile", path: "/app/profile" },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-20 border-r border-white/5 bg-[#080810] items-center py-6 gap-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-2">
          <Flame className="w-5 h-5 text-white" />
        </div>
        {nav.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <a
              key={path}
              href={path}
              title={label}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all cursor-pointer ${
                active
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-white/30 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </a>
          );
        })}
        <div className="mt-auto">
          <a
            href="/app/settings"
            title="Settings"
            className="flex flex-col items-center gap-1 p-3 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/5 transition-all cursor-pointer"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </a>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t border-white/5 bg-[#080810]/95 backdrop-blur-xl md:hidden z-40 pb-safe">
        {nav.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <a
              key={path}
              href={path}
              className={`flex flex-col items-center gap-1 py-3 px-4 transition-all cursor-pointer ${
                active ? "text-purple-400" : "text-white/30"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{label}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const profile = useQuery(api.users.getMyProfile);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (profile === undefined) return; // still loading
    if (!profile || !profile.isOnboarded) {
      if (!location.pathname.startsWith("/app/onboarding")) {
        navigate("/app/onboarding");
      }
    }
  }, [profile, navigate, location.pathname]);

  if (profile === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-3 w-64">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AppLayout() {
  return (
    <>
      <AuthLoading>
        <div className="flex h-screen bg-[#080810] items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="flex h-screen bg-[#080810] items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Sign in to HydraSpark</h2>
              <p className="text-white/40 text-sm">Your spark is waiting.</p>
            </div>
            <SignInButton className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all cursor-pointer border-0" />
          </div>
        </div>
      </Unauthenticated>
      <Authenticated>
        <div className="flex h-screen bg-[#080810] text-white overflow-hidden">
          <AppNav />
          <main className="flex-1 overflow-auto pb-16 md:pb-0">
            <OnboardingGuard>
              <Outlet />
            </OnboardingGuard>
          </main>
        </div>
      </Authenticated>
    </>
  );
}