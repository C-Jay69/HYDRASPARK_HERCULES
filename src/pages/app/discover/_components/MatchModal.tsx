import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { Heart, Sparkles } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import confetti from "canvas-confetti";

type Props = {
  profile: Doc<"profiles">;
  myProfile: Doc<"profiles">;
  onClose: () => void;
};

export default function MatchModal({ profile, myProfile, onClose }: Props) {
  useEffect(() => {
    const fire = () => {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#06b6d4", "#ec4899", "#f59e0b"],
      });
    };
    fire();
    const t = setTimeout(fire, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 280, damping: 22 } }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative flex flex-col items-center gap-6 p-8 text-center max-w-sm w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glowing bg */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-900/80 to-cyan-900/60 border border-white/10 backdrop-blur-xl" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Avatars */}
            <div className="flex items-center -space-x-4">
              <div className="w-24 h-24 rounded-full border-4 border-purple-500 overflow-hidden shadow-xl shadow-purple-500/30">
                <img
                  src={myProfile.photos[0]}
                  className="w-full h-full object-cover"
                  alt={myProfile.name}
                />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg"
              >
                <Heart className="w-5 h-5 text-white fill-white" />
              </motion.div>
              <div className="w-24 h-24 rounded-full border-4 border-cyan-500 overflow-hidden shadow-xl shadow-cyan-500/30">
                <img
                  src={profile.photos[0]}
                  className="w-full h-full object-cover"
                  alt={profile.name}
                />
              </div>
            </div>

            {/* Text */}
            <div>
              <div className="flex items-center gap-2 justify-center mb-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-sm uppercase tracking-widest">It's a Match!</span>
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">
                You & {profile.name}
              </h2>
              <p className="text-white/50 text-sm">
                You both liked each other. Start the conversation!
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full">
              <a
                href="/app/chat"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-center hover:opacity-90 transition-all cursor-pointer"
              >
                Send a message
              </a>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-medium hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Keep swiping
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}