import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Unauthenticated, Authenticated } from "convex/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import React, { useEffect, useRef, useState } from "react";
import {
  Flame,
  Zap,
  MessageCircle,
  Video,
  Shield,
  Star,
  Heart,
  ChevronRight,
  Check,
  Users,
  Sparkles,
  MapPin,
  Clock,
  Trophy,
  AlertTriangle,
  Crown,
  Lock,
  Unlock,
  ArrowRight,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

// ─── Data ────────────────────────────────────────────────────────────────────

const HERO_PROFILES = [
  {
    name: "Sofia, 26",
    city: "New York",
    img: "https://images.unsplash.com/photo-1562337404-3044c84ac061?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
  },
  {
    name: "Marcus, 29",
    city: "London",
    img: "https://images.unsplash.com/photo-1561688961-7588856fe6ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
  },
  {
    name: "Aria, 24",
    city: "Tokyo",
    img: "https://images.unsplash.com/photo-1578933301026-3e5e901126dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
  },
];

type FeatureItem = { Icon: React.ElementType; title: string; desc: string; gradient: string };
const FEATURES: FeatureItem[] = [
  { Icon: Zap, title: "Vibe Matching", desc: "12 quirky questions power our algorithm. Match with people who genuinely get you — not just look like you.", gradient: "from-purple-500 to-pink-500" },
  { Icon: MessageCircle, title: "Real-time Chat", desc: "Instant messages with typing indicators, read receipts, and built-in icebreakers to kill awkward silences.", gradient: "from-cyan-500 to-blue-500" },
  { Icon: Video, title: "Spark Sessions", desc: "Live 3-minute video Vibe Checks every Thursday night. Real chemistry before you give out your number.", gradient: "from-pink-500 to-orange-500" },
  { Icon: Shield, title: "Zero Catfishes", desc: "Manual review + selfie verification. Real people only. Your safety is non-negotiable.", gradient: "from-green-500 to-cyan-500" },
  { Icon: Star, title: "Spotlight Swipes", desc: "Signal you're really into someone. Stand out from the crowd with one daily Spotlight.", gradient: "from-yellow-500 to-orange-500" },
  { Icon: Heart, title: "Icebreakers", desc: '"Two Truths, One Lie" built right in. Break the ice the moment you match.', gradient: "from-red-500 to-pink-500" },
];

const STATS = [
  { value: "2.4M+", label: "Active members" },
  { value: "847K", label: "Matches made" },
  { value: "94%", label: "Match accuracy" },
  { value: "4.9★", label: "App store rating" },
];

const TOTAL_SPOTS = 1000;

// ─── Animated counter ────────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(value - 20 < 0 ? 0 : value - 20);

  useEffect(() => {
    const controls = animate(motionVal, value, { duration: 1.5, ease: "easeOut" as const });
    const unsubscribe = motionVal.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v).toString();
    });
    return () => { controls.stop(); unsubscribe(); };
  }, [value, motionVal]);

  return <span ref={ref}>{value}</span>;
}

// ─── Waitlist form ────────────────────────────────────────────────────────────

function WaitlistForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const join = useMutation(api.waitlist.joinWaitlist);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !city) return;
    setLoading(true);
    try {
      await join({ email, city, zip: zip || undefined });
      onSuccess();
    } catch (err) {
      if (err instanceof ConvexError) {
        const data = err.data as { message: string };
        if (data.message === "already_on_waitlist") {
          toast.info("You're already on the waitlist!", { description: "We'll notify you when your city unlocks." });
        } else {
          toast.error("Something went wrong. Try again.");
        }
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full max-w-sm">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/30 text-sm outline-none focus:border-purple-500/60 transition-colors"
      />
      <div className="flex gap-2">
        <input
          type="text"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Your city (e.g. Austin)"
          className="flex-1 bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/30 text-sm outline-none focus:border-purple-500/60 transition-colors"
        />
        <input
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="ZIP"
          className="w-24 bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/30 text-sm outline-none focus:border-purple-500/60 transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !email || !city}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black text-sm hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-default disabled:hover:scale-100 cursor-pointer shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Crown className="w-4 h-4" />
            Claim My Lifetime Founder Spot
          </>
        )}
      </button>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Index() {
  const [waitlistDone, setWaitlistDone] = useState(false);
  const waitlistCount = useQuery(api.waitlist.getWaitlistCount);
  const cityLeaderboard = useQuery(api.waitlist.getCityLeaderboard);
  const count = waitlistCount ?? 842;
  const remaining = Math.max(0, TOTAL_SPOTS - count);
  const pct = Math.min(100, (count / TOTAL_SPOTS) * 100);

  return (
    <div className="min-h-screen bg-[#080810] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#080810]/80 backdrop-blur-xl border-b border-white/5">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">HYDRASPARK</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <a href="#manifesto" className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">Our Mission</a>
          <a href="#features" className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">Features</a>
          <a href="#founder" className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">Founder Drop</a>
          <Unauthenticated>
            <a href="#founder" className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 py-2 rounded-full hover:opacity-90 transition-all cursor-pointer">
              Claim Spot
            </a>
          </Unauthenticated>
          <Authenticated>
            <a href="/app" className="text-sm font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-all cursor-pointer">
              Enter App →
            </a>
          </Authenticated>
        </motion.div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-cyan-600/20 blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 rounded-full bg-pink-600/15 blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {/* Urgency pill */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-full px-4 py-2 text-sm text-red-300 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span><AnimatedNumber value={count} /> / {TOTAL_SPOTS} Lifetime Spots Claimed</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight text-balance">
                The dating app that's{" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  actually free.
                </span>
              </h1>
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-lg text-white/60 max-w-lg leading-relaxed">
              No paywalls to see who likes you. No hidden algorithm suppressing your profile. Independent. Honest. Built to actually help you connect.
            </motion.p>

            {/* Progress bar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-2">
              <div className="flex justify-between text-xs text-white/50">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Lifetime founder spots</span>
                <span className="text-yellow-400 font-bold">{remaining} remaining</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" as const, delay: 0.4 }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href="#founder"
                className="group flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black px-8 py-4 rounded-2xl text-base hover:opacity-90 transition-all hover:scale-105 cursor-pointer shadow-lg shadow-purple-500/25"
              >
                <Crown className="w-5 h-5" />
                Claim Free Lifetime Access
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#manifesto" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium cursor-pointer">
                Why free? <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-8 pt-2">
              {STATS.slice(0, 3).map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{s.value}</div>
                  <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Profile cards */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative h-[500px] hidden lg:block">
            {HERO_PROFILES.map((p, i) => (
              <motion.div
                key={p.name}
                className="absolute rounded-3xl overflow-hidden shadow-2xl"
                style={{ width: 260, height: 360, top: i * 24, left: i * 30, zIndex: HERO_PROFILES.length - i }}
                initial={{ rotate: (i - 1) * 6 }}
                animate={{ rotate: (i - 1) * 6 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-white font-bold text-lg">{p.name}</div>
                  <div className="text-white/60 text-sm">{p.city}</div>
                </div>
                {i === 0 && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    97% Vibe
                  </div>
                )}
              </motion.div>
            ))}
            <motion.div
              className="absolute bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30 cursor-pointer z-20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" as const }}
            >
              <Heart className="w-7 h-7 text-white fill-white" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section id="manifesto" className="py-28 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-0 w-96 h-96 rounded-full bg-red-600/8 blur-[140px]" />
        </div>
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 text-sm text-red-300 mb-6">
              <AlertTriangle className="w-3.5 h-3.5" />
              The HydraSpark Master Plan
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6">
              Why we are{" "}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">100% free</span>
              {" "}(for now)
            </h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto">
              Let's be honest: modern dating apps are broken. They're owned by massive monopolies that <span className="text-white font-semibold">profit off keeping you single</span>. They hide your likes, throttle your matches, and charge you $40 a month just to be seen.
            </p>
          </motion.div>

          {/* Comparison */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid md:grid-cols-2 gap-4 mb-16">
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <div className="text-red-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Other Apps
              </div>
              <ul className="space-y-3">
                {["$40/month to see who liked you", "Intentionally addictive — no matches = more subscriptions", "Your likes are hidden behind a paywall", "Corporate-owned. Your data is the product.", "Ghosted after paying $40"].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-white/50">
                    <span className="text-red-400 mt-0.5">✗</span> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-purple-500/5 border border-purple-500/30 rounded-2xl p-6">
              <div className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Unlock className="w-4 h-4" /> HydraSpark
              </div>
              <ul className="space-y-3">
                {["See everyone who likes you — free", "No hidden algorithm. No throttling.", "Built by one indie dev who wants you to find love", "City-by-city launch for real density, no ghost towns", "Early adopters get lifetime premium, forever"].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-emerald-400 mt-0.5">✓</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* 3-phase roadmap */}
          <div className="space-y-6">
            {[
              {
                phase: "Phase 1",
                icon: Crown,
                color: "from-yellow-500 to-orange-500",
                border: "border-yellow-500/30",
                bg: "bg-yellow-500/5",
                badge: "Happening Now",
                badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
                title: 'The "Lifetime Founder" Drop',
                body: `The first 1,000 people to verify their profile in our launch city get "Hydra Elite" ($40/mo value) completely free — for life. No paywalls. See everyone who likes you. Never pay a subscription fee. Ever. Why? Because early adopters are the lifeblood of this app. You help us build the network, and we reward you with lifetime premium access.`,
                bullets: ["Unlimited swipes", "See everyone who likes you", "Advanced vibe filters", "Profile boost weekly", "Lifetime — never expires"],
              },
              {
                phase: "Phase 2",
                icon: MapPin,
                color: "from-cyan-500 to-blue-500",
                border: "border-cyan-500/20",
                bg: "bg-cyan-500/5",
                badge: "Coming Soon",
                badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
                title: "City-by-City Unlocks",
                body: "We are NOT launching globally. If you download an app and there's nobody in your area, it sucks. Instead, we use a Demand Waitlist. We will unlock the app one city (or college campus) at a time — whichever city gets the most people on the waitlist unlocks first.",
                bullets: ["Your city rises when friends join", "Invite 3 friends to jump the queue", "Guaranteed density before launch", "No ghost towns. Ever."],
              },
              {
                phase: "Phase 3",
                icon: Video,
                color: "from-pink-500 to-purple-500",
                border: "border-pink-500/20",
                bg: "bg-pink-500/5",
                badge: "The Endgame",
                badgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/20",
                title: '"Spark Sessions" — The End of Endless Swiping',
                body: "Once a city is unlocked, we introduce our flagship feature: Live Video Speed Dating. Instead of swiping for hours every day, HydraSpark comes alive on Thursday nights at 8 PM. Log in, jump into secure 3-minute video Vibe Checks with locals, and instantly see if there's chemistry.",
                bullets: ["Live every Thursday at 8PM", "3-minute video Vibe Checks", "See chemistry before giving your number", "No catfishes. No dead-end convos."],
              },
            ].map((p, i) => (
              <motion.div
                key={p.phase}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${p.bg} border ${p.border} rounded-2xl p-7 flex gap-5`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center flex-shrink-0 mt-1`}>
                  <p.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-white/30 text-xs font-bold uppercase tracking-widest">{p.phase}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${p.badgeColor}`}>{p.badge}</span>
                  </div>
                  <h3 className="text-white font-black text-xl mb-2">{p.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed mb-4">{p.body}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {p.bullets.map((b) => (
                      <div key={b} className="flex items-center gap-1.5 text-xs text-white/60">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDER CLAIM CTA ── */}
      <section id="founder" className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[140px]" />
        </div>
        <div className="max-w-2xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-900/60 to-cyan-900/40 border border-white/10 rounded-3xl p-10 text-center"
          >
            {/* Animated spots counter */}
            <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-full px-5 py-2 text-sm text-red-300 mb-6">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
              <span><AnimatedNumber value={count} /> / {TOTAL_SPOTS} Lifetime Spots Claimed</span>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut" as const }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                </motion.div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/30">0 spots</span>
                <span className="text-yellow-400 font-bold">{remaining} of {TOTAL_SPOTS} remaining</span>
                <span className="text-white/30">{TOTAL_SPOTS} spots</span>
              </div>
            </div>

            <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-3xl lg:text-4xl font-black mb-3">
              Claim Your Lifetime<br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Founder Spot</span>
            </h2>
            <p className="text-white/50 text-sm mb-2 max-w-md mx-auto">
              Join now and get <strong className="text-white">Hydra Elite ($40/mo value) free forever</strong>. Once the 1,000 slots are gone, new users will pay. Founders never do.
            </p>
            <p className="text-white/30 text-xs mb-8">Your ZIP/city tells us where to launch next — it's crucial.</p>

            {waitlistDone ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex flex-col items-center gap-3 py-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-white font-black text-xl">You're in the queue!</p>
                <p className="text-white/50 text-sm max-w-xs text-center">
                  We'll email you when your city unlocks. Share with 3 friends to move your city to the top.
                </p>
                <Unauthenticated>
                  <div className="mt-2">
                    <p className="text-white/40 text-xs mb-2">Already have an account?</p>
                    <SignInButton className="text-sm font-bold bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-all cursor-pointer border-0" />
                  </div>
                </Unauthenticated>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <WaitlistForm onSuccess={() => { setWaitlistDone(true); toast.success("You're on the waitlist!", { description: "We'll notify you when your city unlocks." }); }} />
                <div className="flex items-center gap-1 text-white/25 text-xs">
                  <Mail className="w-3 h-3" /> No spam. Unsubscribe anytime.
                </div>
                <div className="w-full border-t border-white/5 pt-4">
                  <p className="text-white/30 text-xs mb-3">Already using HydraSpark?</p>
                  <Unauthenticated>
                    <SignInButton className="text-sm font-semibold bg-white/8 border border-white/15 text-white/70 px-6 py-2.5 rounded-xl hover:bg-white/12 transition-all cursor-pointer" />
                  </Unauthenticated>
                  <Authenticated>
                    <a href="/app" className="text-sm font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer">
                      Enter the App →
                    </a>
                  </Authenticated>
                </div>
              </div>
            )}
          </motion.div>

          {/* City leaderboard */}
          {cityLeaderboard && cityLeaderboard.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6 bg-white/3 border border-white/8 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white/60 text-sm font-bold">Cities with most waitlist signups</span>
              </div>
              <div className="space-y-2">
                {cityLeaderboard.map((c, i) => (
                  <div key={c.city} className="flex items-center gap-3">
                    <span className={`text-xs font-black w-5 ${i === 0 ? "text-yellow-400" : "text-white/30"}`}>#{i + 1}</span>
                    <span className="text-white/70 text-sm capitalize flex-1">{c.city}</span>
                    <span className="text-purple-400 text-xs font-bold">{c.count} {c.count === 1 ? "person" : "people"}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-purple-600/10 blur-[140px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-4">Why HydraSpark</p>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Dating, but actually{" "}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">fun</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-white/5 border border-white/8 rounded-2xl p-6 hover:bg-white/8 transition-all hover:border-white/15"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${f.gradient} flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                  <f.Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 bg-white/2">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-4">How it works</p>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Three steps to your{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">match</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Build your vibe", desc: "Answer 12 personality questions. Tell us your non-negotiables. Upload your best photos.", gradient: "from-purple-500 to-pink-500" },
              { num: "02", title: "Spark connections", desc: "Our algorithm serves you people with ≥65% vibe compatibility. Swipe, spotlight, connect.", gradient: "from-cyan-500 to-blue-500" },
              { num: "03", title: "Go on a date", desc: "Chat, break the ice, then hop on a live Spark Session — or meet IRL. We make it easy.", gradient: "from-pink-500 to-orange-500" },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className={`text-6xl font-black bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent mb-4`}>{step.num}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-white/50 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{s.value}</div>
                <div className="text-white/40 text-sm mt-2">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-28 bg-white/2">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl font-black">Real people.{" "}<span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Real sparks.</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "I matched with my boyfriend within 3 days. The vibe questions actually work — we had so much to talk about instantly.", name: "Priya M.", city: "San Francisco", img: "https://images.unsplash.com/photo-1567516364473-233c4b6fcfbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100&q=80" },
              { quote: "The Spark Session video date was genius. We had a 3-minute video call first. No awkward first meeting at all.", name: "Jake T.", city: "London", img: "https://images.unsplash.com/photo-1450133064473-71024230f91b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100&q=80" },
              { quote: "Finally a dating app that isn't just looks. The Two Truths One Lie icebreaker had us laughing for an hour.", name: "Yuki S.", city: "Tokyo", img: "https://images.unsplash.com/photo-1665560924350-29cbc22df634?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100&q=80" },
            ].map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/8 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}</div>
                <p className="text-white/70 text-sm leading-relaxed mb-5">{'"'}{t.quote}{'"'}</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-white/40 text-xs">{t.city}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT'S THE CATCH ── */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white/3 border border-white/8 rounded-2xl p-8">
            <h3 className="text-2xl font-black mb-3">What's the catch?</h3>
            <p className="text-white/55 leading-relaxed mb-6">
              There isn't one. Eventually, once the app has thousands of active users, we will charge new users a small weekly fee. But if you join now during Phase 1, you will be <strong className="text-white">grandfathered in with Lifetime Premium Access</strong>.
            </p>
            <p className="text-purple-300 font-semibold text-sm">The era of paying $40/month to get ghosted is over.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-white/30">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Limited to 1,000 people</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> No credit card required</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> Grandfathered forever</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-white/10 rounded-3xl p-14">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                <Flame className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight">
              Your spark is out there.
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Go find it.</span>
            </h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">Join {count.toLocaleString()} people on the waitlist. Get lifetime access. Never pay.</p>
            <a href="#founder" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black px-10 py-4 rounded-2xl text-lg hover:opacity-90 transition-all hover:scale-105 cursor-pointer shadow-xl shadow-purple-500/25">
              <Crown className="w-5 h-5" />
              Claim My Spot ({remaining} left)
            </a>
            <div className="mt-6 flex items-center justify-center gap-6 text-white/30 text-xs flex-wrap">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> No credit card</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Verified profiles only</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> Grandfathered forever</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Flame className="w-3 h-3 text-white" />
            </div>
            <span className="font-black text-sm bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">HYDRASPARK</span>
          </div>
          <p className="text-white/20 text-sm">© {new Date().getFullYear()} HydraSpark. Made with fire. Built by one indie dev.</p>
          <div className="flex gap-6 text-white/30 text-xs">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}