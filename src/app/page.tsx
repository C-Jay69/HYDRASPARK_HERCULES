'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Shield,
  Heart,
  MapPin,
  Sparkles,
  Users,
  AlertTriangle,
  Crown,
  ArrowRight,
  Check,
  Zap,
  Globe,
  Timer,
  Fingerprint,
  CalendarCheck,
} from 'lucide-react'

export default function LandingPage() {
  const [founderCount, setFounderCount] = useState<number>(0)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const spotsLeft = 1000 - founderCount
  const progress = (founderCount / 1000) * 100

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    const fetchCount = async () => {
      try {
        const { count } = await supabase
          .from('founder_members')
          .select('*', { count: 'exact', head: true })
        setFounderCount(count || 0)
      } catch {
        // Silently fail — show default state
      } finally {
        setLoading(false)
      }
    }
    fetchCount()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/15 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 container mx-auto flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            HYDRASPARK
          </span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold">
              Join Free
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 container mx-auto px-6 pt-16 pb-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-white/10">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-white/70">Safety-First Social Ecosystem</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold mb-6 leading-tight tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400">
            HYDRASPARK
          </span>
          <br />
          <span className="text-3xl sm:text-4xl md:text-5xl text-white/90 font-bold">
            HERCULES
          </span>
        </h1>

        <p className="text-lg md:text-2xl mb-4 text-white/60 max-w-3xl mx-auto leading-relaxed">
          Beyond swipe culture. A{' '}
          <span className="text-purple-300 font-semibold">Country Club</span> model for social
          connection — where{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 font-semibold">
            verification is premium
          </span>{' '}
          and meetups are professionally managed.
        </p>

        <p className="text-base md:text-lg mb-12 text-white/40 max-w-2xl mx-auto">
          Dating, friendship, or activity partners — with real-world safety built into every single interaction.
        </p>

        {/* Founder Counter Card */}
        <Card className="relative max-w-lg mx-auto p-8 bg-[#1a1a2e]/80 border border-purple-500/30 backdrop-blur-xl overflow-hidden">
          {/* Glowing border effect for "Gold Spark" premium feel */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-purple-400" />
              <span className="text-sm uppercase tracking-[0.2em] text-purple-300 font-semibold">
                Founder Membership
              </span>
            </div>

            {loading ? (
              <div className="text-3xl text-white/40 my-4">Loading...</div>
            ) : (
              <>
                <div className="text-5xl md:text-6xl font-extrabold text-white mb-1">
                  {spotsLeft.toLocaleString()}
                </div>
                <div className="text-white/50 mb-4 text-sm">founding spots remaining</div>

                <div className="bg-white/10 rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full transition-all duration-1000 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="text-xs text-white/40 mb-6">
                  {founderCount.toLocaleString()} / 1,000 claimed
                </div>

                <div className="flex items-center justify-center gap-2 text-cyan-300 font-semibold text-sm">
                  <Check className="w-4 h-4" />
                  <span>FREE FOR LIFE — FOUNDER TIER</span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-lg px-8 py-6 shadow-2xl shadow-purple-500/20 transition-all hover:shadow-purple-500/40"
            >
              Claim Founder Spot
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="#features">
            <Button
              size="lg"
              variant="outline"
              className="border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white text-lg px-8 py-6"
            >
              Explore Features
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            The{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Country Club
            </span>{' '}
            of Social Apps
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Every feature designed around accountability, verification, and real-world safety.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Shield className="w-7 h-7 text-cyan-400" />}
            title="Guardian Spark"
            desc="Proprietary safety timer for real-world dates. Miss a check-in and your emergency contacts are automatically alerted with your live location."
            color="border-cyan-500/20"
            glow="from-cyan-500/5"
          />
          <FeatureCard
            icon={<Fingerprint className="w-7 h-7 text-purple-400" />}
            title="Gold Spark Verification"
            desc="Photo + ID verification earns you the Gold Spark badge — premium status in the Country Club. Verified users get priority visibility and trust."
            color="border-purple-500/20"
            glow="from-purple-500/5"
          />
          <FeatureCard
            icon={<Zap className="w-7 h-7 text-fuchsia-400" />}
            title="Vibe Score Matching"
            desc="Our 12-question matching algorithm goes beyond looks. Match on values, humor, and lifestyle — the Discovery Engine that actually works."
            color="border-fuchsia-500/20"
            glow="from-fuchsia-500/5"
          />
          <FeatureCard
            icon={<CalendarCheck className="w-7 h-7 text-green-400" />}
            title="Community Meetups"
            desc="Professionally managed group events with curated public venues. Premium members get 2-hour priority access to limited-seat bookings."
            color="border-green-500/20"
            glow="from-green-500/5"
          />
          <FeatureCard
            icon={<Timer className="w-7 h-7 text-amber-400" />}
            title="Response Score"
            desc="Your Response Score reflects chat activity and reliability. High scores get boosted visibility — accountability baked into the social graph."
            color="border-amber-500/20"
            glow="from-amber-500/5"
          />
          <FeatureCard
            icon={<AlertTriangle className="w-7 h-7 text-red-400" />}
            title="One-Tap SOS"
            desc="Emergency button instantly shares your live GPS with trusted contacts. High-visibility red interface for instant access when it matters most."
            color="border-red-500/20"
            glow="from-red-500/5"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            How{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              HYDRASPARK
            </span>{' '}
            Works
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Five steps to a safer, more accountable social life.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {[
            { step: '01', title: 'Sign Up', desc: 'Claim your free founder spot' },
            { step: '02', title: 'Verify', desc: 'Photo + ID for Gold Spark badge' },
            { step: '03', title: 'Set Intent', desc: 'Dating, friends, or activities' },
            { step: '04', title: 'Discover', desc: 'Vibe Score matches your energy' },
            { step: '05', title: 'Meet Safe', desc: 'Guardian Spark watches over you' },
          ].map((item, i) => (
            <div key={i} className="text-center group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-500/20 border border-white/10 flex items-center justify-center mx-auto mb-3 group-hover:border-purple-500/40 transition-colors">
                <span className="text-sm font-mono font-bold text-purple-300">{item.step}</span>
              </div>
              <h3 className="text-white font-bold mb-1">{item.title}</h3>
              <p className="text-white/40 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Multi-Language / Global */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-white/10 p-10 text-center backdrop-blur-sm">
          <Globe className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Built for{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">Everyone, Everywhere</span>
          </h3>
          <p className="text-white/50 max-w-xl mx-auto mb-6">
            Full multi-language support — English, Spanish, Chinese, French, and Hindi. Real connections transcend borders.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['English', 'Español', '中文', 'Français', 'हिन्दी'].map(lang => (
              <span
                key={lang}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <Card className="p-12 text-center bg-gradient-to-br from-purple-950/60 to-cyan-950/40 border border-purple-500/20 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Ready to Join the{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                Country Club
              </span>
              ?
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              {isSupabaseConfigured
                ? `Just ${spotsLeft.toLocaleString()} founder spots left. Free for life.`
                : 'Founding membership — free for life. Be among the first 1,000.'
              }
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-lg px-10 py-6 shadow-2xl shadow-purple-500/20"
              >
                Join Hydraspark
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-8 text-center text-white/30 border-t border-white/5">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-400/50" />
          <span className="font-semibold text-white/40">HYDRASPARK HERCULES</span>
        </div>
        <p className="text-sm">Safety-first social ecosystem. Built with accountability at the core.</p>
      </footer>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
  color,
  glow,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  color: string
  glow: string
}) {
  return (
    <Card className={`relative p-6 bg-[#1a1a2e]/60 ${color} backdrop-blur-sm hover:scale-[1.03] transition-all duration-300 overflow-hidden group`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="relative z-10">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
      </div>
    </Card>
  )
}
