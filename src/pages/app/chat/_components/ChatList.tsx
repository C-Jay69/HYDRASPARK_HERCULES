import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated, Unauthenticated } from "convex/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty.tsx";
import { MessageCircle, Shield, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { calcVibeScore } from "@/lib/vibeQuestions.ts";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { formatDistanceToNow } from "date-fns";

type Props = {
  selectedMatchId: Id<"matches"> | null;
  onSelect: (id: Id<"matches">) => void;
};

function ChatListInner({ selectedMatchId, onSelect }: Props) {
  const matches = useQuery(api.matches.getMyMatches);
  const myProfile = useQuery(api.users.getMyProfile);

  if (matches === undefined || myProfile === undefined) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><MessageCircle /></EmptyMedia>
            <EmptyTitle>No matches yet</EmptyTitle>
            <EmptyDescription>Swipe on Discover to start chatting!</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <a href="/app" className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm cursor-pointer">
              Discover
            </a>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="overflow-auto flex-1">
      {matches.map(({ matchId, profile, lastMessage, lastMessageAt, unreadCount }, idx) => {
        const isSelected = matchId === selectedMatchId;
        const vibeScore = calcVibeScore(myProfile?.vibeAnswers ?? [], profile.vibeAnswers);

        return (
          <motion.button
            key={matchId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            onClick={() => onSelect(matchId)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all cursor-pointer text-left ${
              isSelected ? "bg-purple-500/10 border-r-2 border-purple-500" : "hover:bg-white/5"
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10">
                <img src={profile.photos[0]} className="w-full h-full object-cover" alt={profile.name} />
              </div>
              {profile.isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-cyan-500 border-2 border-[#080810] flex items-center justify-center">
                  <Shield className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 border-2 border-[#080810] flex items-center justify-center text-[10px] text-white font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`font-bold text-sm truncate ${unreadCount > 0 ? "text-white" : "text-white/80"}`}>
                  {profile.name}, {profile.age}
                </span>
                {lastMessageAt && (
                  <span className="text-white/30 text-xs flex-shrink-0">
                    {formatDistanceToNow(new Date(lastMessageAt), { addSuffix: false })}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {lastMessage ? (
                  <p className={`text-xs truncate ${unreadCount > 0 ? "text-white/70" : "text-white/40"}`}>
                    {lastMessage}
                  </p>
                ) : (
                  <p className="text-xs text-purple-400/70 truncate">New match — say hi!</p>
                )}
                {vibeScore >= 65 && (
                  <span className="flex items-center gap-0.5 text-purple-400 text-[10px] font-bold flex-shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />{vibeScore}%
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

export default function ChatList({ selectedMatchId, onSelect }: Props) {
  return (
    <Authenticated>
      <ChatListInner selectedMatchId={selectedMatchId} onSelect={onSelect} />
    </Authenticated>
  );
}