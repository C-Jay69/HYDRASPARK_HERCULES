import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useRef, useState } from "react";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { Shield, Sparkles, MapPin, ChevronLeft, ChevronRight, X, Heart, Star } from "lucide-react";
import { calcVibeScore } from "@/lib/vibeQuestions.ts";

type Props = {
  profile: Doc<"profiles">;
  myVibeAnswers: number[];
  onSwipe: (dir: "like" | "pass" | "spotlight") => void;
  isTop: boolean;
};

export default function SwipeCard({ profile, myVibeAnswers, onSwipe, isTop }: Props) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);
  const cardOpacity = useTransform(x, [-250, 0, 250], [0.5, 1, 0.5]);
  const dragRef = useRef(false);

  const vibeScore = calcVibeScore(myVibeAnswers, profile.vibeAnswers);
  const photo = profile.photos[photoIdx] ?? profile.photos[0];

  function prevPhoto(e: React.MouseEvent) {
    e.stopPropagation();
    setPhotoIdx((i) => Math.max(0, i - 1));
  }

  function nextPhoto(e: React.MouseEvent) {
    e.stopPropagation();
    setPhotoIdx((i) => Math.min(profile.photos.length - 1, i + 1));
  }

  async function flyOut(dir: "like" | "pass") {
    await animate(x, dir === "like" ? 500 : -500, { duration: 0.3, ease: "easeOut" as const });
    onSwipe(dir);
  }

  if (!isTop) {
    return (
      <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl scale-[0.95] translate-y-4 pointer-events-none">
        <img src={profile.photos[0]} className="w-full h-full object-cover" alt={profile.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      style={{ x, rotate, opacity: cardOpacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragStart={() => { dragRef.current = true; }}
      onDragEnd={(_, info) => {
        dragRef.current = false;
        if (info.offset.x > 80) onSwipe("like");
        else if (info.offset.x < -80) onSwipe("pass");
        else animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
      }}
      className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing select-none touch-none"
    >
      {/* Background photo */}
      <img
        src={photo}
        className="w-full h-full object-cover pointer-events-none"
        alt={profile.name}
        draggable={false}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

      {/* Photo nav strips */}
      {profile.photos.length > 1 && (
        <>
          <div
            className="absolute left-0 top-0 w-1/3 h-full z-10"
            onClick={prevPhoto}
          />
          <div
            className="absolute right-0 top-0 w-1/3 h-full z-10"
            onClick={nextPhoto}
          />

          {/* Photo dots */}
          <div className="absolute top-3 left-0 right-0 flex gap-1 justify-center px-4 pointer-events-none z-20">
            {profile.photos.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full transition-all ${
                  i === photoIdx ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* LIKE stamp */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-10 left-6 rotate-[-20deg] border-4 border-emerald-400 text-emerald-400 font-black text-3xl px-4 py-2 rounded-xl uppercase tracking-widest z-30 pointer-events-none"
      >
        Like
      </motion.div>

      {/* PASS stamp */}
      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute top-10 right-6 rotate-[20deg] border-4 border-red-400 text-red-400 font-black text-3xl px-4 py-2 rounded-xl uppercase tracking-widest z-30 pointer-events-none"
      >
        Nope
      </motion.div>

      {/* Profile info */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-20 pointer-events-none">
        <div className="flex items-end gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-black text-3xl">{profile.name}</h2>
              <span className="text-white/70 text-2xl font-light">{profile.age}</span>
              {profile.isVerified && (
                <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 text-white/60 text-sm mt-0.5">
              <MapPin className="w-3 h-3" />
              {profile.location}
            </div>
          </div>
          <div className="ml-auto">
            {/* Vibe score badge */}
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm ${
              vibeScore >= 65
                ? "bg-purple-500/80 text-white"
                : "bg-white/10 text-white/60"
            }`}>
              <Sparkles className="w-3 h-3" />
              {vibeScore}% vibe
            </div>
          </div>
        </div>
        {profile.bio && (
          <p className="text-white/80 text-sm leading-relaxed line-clamp-2">{profile.bio}</p>
        )}
      </div>

      {/* Photo nav arrows (shown subtly on non-touch) */}
      {profile.photos.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/50 transition-all z-20 pointer-events-auto"
            onClick={prevPhoto}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/50 transition-all z-20 pointer-events-auto"
            onClick={nextPhoto}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Action buttons overlay (tap-based) */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-5 pb-24 pt-4 z-30 pointer-events-auto">
        <button
          onClick={(e) => { e.stopPropagation(); flyOut("pass"); }}
          className="w-14 h-14 rounded-full bg-black/50 border border-red-400/50 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all cursor-pointer shadow-lg"
        >
          <X className="w-7 h-7" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onSwipe("spotlight"); }}
          className="w-12 h-12 rounded-full bg-black/50 border border-yellow-400/50 flex items-center justify-center text-yellow-400 hover:bg-yellow-500/20 transition-all cursor-pointer shadow-lg self-end mb-1"
        >
          <Star className="w-6 h-6" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); flyOut("like"); }}
          className="w-14 h-14 rounded-full bg-black/50 border border-emerald-400/50 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer shadow-lg"
        >
          <Heart className="w-7 h-7" />
        </button>
      </div>
    </motion.div>
  );
}