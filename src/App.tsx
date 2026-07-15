import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AppLayout from "./pages/app/layout.tsx";
import DiscoverPage from "./pages/app/discover/page.tsx";
import ProfilePage from "./pages/app/profile/page.tsx";
import OnboardingPage from "./pages/app/onboarding/page.tsx";
import MatchesPage from "./pages/app/matches/page.tsx";
import ChatPage from "./pages/app/chat/page.tsx";

export default function App() {
  return (
    <DefaultProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* App routes */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DiscoverPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="premium" element={<ComingSoon label="Premium" />} />
            <Route path="settings" element={<ComingSoon label="Settings" />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col h-full items-center justify-center p-6 text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
        🔥
      </div>
      <h2 className="text-xl font-black">{label}</h2>
      <p className="text-white/40 text-sm max-w-xs">Coming in the next milestone!</p>
    </div>
  );
}