import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated, Unauthenticated } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import ChatList from "./_components/ChatList.tsx";
import ChatThread from "./_components/ChatThread.tsx";
import { MessageCircle } from "lucide-react";

function ChatPageInner() {
  const [selectedMatchId, setSelectedMatchId] = useState<Id<"matches"> | null>(null);
  const matches = useQuery(api.matches.getMyMatches);
  const myProfile = useQuery(api.users.getMyProfile);

  const selectedMatch = matches?.find((m) => m.matchId === selectedMatchId);
  const otherProfile = selectedMatch?.profile ?? null;

  const showThread = selectedMatchId !== null && otherProfile !== null && myProfile;

  return (
    <div className="flex h-full bg-[#080810]">
      {/* Sidebar list — always visible on md+, hidden on mobile when thread is open */}
      <div className={`flex flex-col border-r border-white/5 ${showThread ? "hidden md:flex md:w-80" : "flex w-full md:w-80"}`}>
        {/* Header */}
        <div className="flex items-center gap-2 px-5 pt-5 pb-4 border-b border-white/5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-black text-xl text-white">Messages</h1>
        </div>
        <ChatList selectedMatchId={selectedMatchId} onSelect={setSelectedMatchId} />
      </div>

      {/* Thread panel */}
      {showThread ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatThread
            matchId={selectedMatchId}
            otherProfile={otherProfile}
            myProfile={myProfile}
            onBack={() => setSelectedMatchId(null)}
          />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-center px-8">
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
              <MessageCircle className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/30 text-sm">Select a match to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <>
      <Unauthenticated>
        <div className="flex items-center justify-center h-full">
          <p className="text-white/40">Please sign in.</p>
        </div>
      </Unauthenticated>
      <Authenticated>
        <ChatPageInner />
      </Authenticated>
    </>
  );
}