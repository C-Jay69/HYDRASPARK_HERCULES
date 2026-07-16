import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated, Unauthenticated } from "convex/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty.tsx";
import { Heart, Shield, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { calcVibeScore } from "@/lib/vibeQuestions.ts";
import { toast } from "sonner";

function MatchesInner() {
  const matches = useQuery(api.matches.getMyMatches);
  const myProfile = useQuery(api.users.getMyProfile);

  if (matches === undefined || myProfile === undefined) {
    return (
      <div className="p-5 space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#080810]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
          <Heart className="w-4 h-4 text-white fill-white" />
        </div>
        <div>
          <h1 className="font-black text-xl text-white">Matches</h1>
          {matches.length > 0 && (
            <p className="text-white/40 text-xs">{matches.length} connection{matches.length !== 1 ? "s" : ""}</p>
          )}
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Heart />
              </EmptyMedia>
              <EmptyTitle>No matches yet</EmptyTitle>
              <EmptyDescription>
                Start swiping on Discover to find your spark!
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <a
                href="/app"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm hover:opacity-90 transition-all cursor-pointer"
              >
                Go to Discover
              </a>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="flex-1 overflow-auto px-4 pb-20 md:pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {matches.map(({ matchId, profile, lastMessageAt }, idx) => {
              const vibeScore = calcVibeScore(myProfile?.vibeAnswers ?? [], profile.vibeAnswers);
              return (
                <motion.div
                  key={matchId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => toast("Chat coming soon!", { description: `Milestone 4 will unlock messaging with ${profile.name}` })}
                >
                  <img
                    src={profile.photos[0]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    alt={profile.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {profile.isVerified && (
                      <div className="w-6 h-6 rounded-full bg-cyan-500/80 flex items-center justify-center">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {vibeScore >= 65 && (
                      <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-purple-500/80 text-white text-[10px] font-bold">
                        <Sparkles className="w-2.5 h-2.5" />
                        {vibeScore}%
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="font-bold text-white text-sm">
                      {profile.name}, {profile.age}
                    </div>
                    <div className="text-white/50 text-xs truncate">
                      {lastMessageAt
                        ? `Last active ${new Date(lastMessageAt).toLocaleDateString()}`
                        : profile.location}
                    </div>
                  </div>

                  {/* Unread dot for new matches */}
                  {!lastMessageAt && (
                    <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 border-2 border-[#080810]" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MatchesPage() {
  return (
    <>
      <Unauthenticated>
        <div className="flex items-center justify-center h-full">
          <p className="text-white/40">Please sign in.</p>
        </div>
      </Unauthenticated>
      <Authenticated>
        <MatchesInner />
      </Authenticated>
    </>
  );
}