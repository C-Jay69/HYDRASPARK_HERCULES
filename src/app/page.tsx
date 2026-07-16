'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
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
} from 'lucide-react'

export default function LandingPage() {
  const [founderCount, setFounderCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const spotsLeft = 1000 - founderCount
  const progress = (founderCount / 1000) * 100

  useEffect(() => {
    const supabase = createClient()
    const fetchCount = async () => {
      const { count } = await supabase
        .from('founder_members')
        .select('*', { count: 'exact', head: true })
      setFounderCount(count || 0)
      setLoading(false)
    }
    fetchCount()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Nav */}
      <nav className="container mx-auto flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-400">
            HYDRASPARK
          </span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90">
              Join Free
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-white/10">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-sm text-white/80">Safety-First Social Platform</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-pink-300 to-purple-400">
            HYDRASPARK
          </span>
          <br />
          <span className="text-white/90 text-4xl md:text-6xl">HERCULES</span>
        </h1>

        <p className="text-xl md:text-2xl mb-12 text-white/70 max-w-3xl mx-auto leading-relaxed">
          Meet people for <span className="text-yellow-300 font-semibold">dating</span>,{' '}
          <span className="text-pink-300 font-semibold">friendship</span>, or{' '}
          <span className="text-purple-300 font-semibold">activities</span> —
          <br />with safety built into every interaction.
        </p>

        {/* Founder Counter Card */}
        <Card className="max-w-lg mx-auto p-8 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 backdrop-blur-xl">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="text-sm uppercase tracking-widest text-yellow-400 font-semibold">
              Founder Membership
            </span>
          </div>

          {loading ? (
            <div className="text-3xl text-white/60 my-4">Loading...</div>
          ) : (
            <>
              <div className="text-5xl md:text-6xl font-bold text-white mb-1">
                {spotsLeft.toLocaleString()}
              </div>
              <div className="text-white/60 mb-4">spots remaining</div>

              <div className="bg-white/10 rounded-full h-3 overflow-hidden mb-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="text-xs text-white/50 mb-6">
                {founderCount.toLocaleString()} / 1,000 claimed
              </div>

              <div className="flex items-center justify-center gap-2 text-yellow-300 font-semibold">
                <Check className="w-4 h-4" />
                <span>FREE FOR LIFE</span>
              </div>
            </>
          )}
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold hover:opacity-90 text-lg px-8 py-6 shadow-2xl shadow-yellow-500/20"
            >
              Claim Founder Spot
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="#features">
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Safety <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">First</span>. Always.
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Every feature is designed to keep you safe while you connect authentically.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-green-400" />}
            title="Safety Check-Ins"
            desc="Automatic check-ins during meetups. Emergency contacts alerted if you miss one."
            color="from-green-500/10 to-emerald-500/10 border-green-500/20"
          />
          <FeatureCard
            icon={<Check className="w-8 h-8 text-blue-400" />}
            title="Verified Profiles"
            desc="Photo verification and ID checks keep bad actors out of the community."
            color="from-blue-500/10 to-cyan-500/10 border-blue-500/20"
          />
          <FeatureCard
            icon={<MapPin className="w-8 h-8 text-purple-400" />}
            title="Safe Meetup Spots"
            desc="Curated public venues with live location sharing to your trusted contacts."
            color="from-purple-500/10 to-pink-500/10 border-purple-500/20"
          />
          <FeatureCard
            icon={<Heart className="w-8 h-8 text-pink-400" />}
            title="Multiple Intents"
            desc="Whether dating, friendship, or activity partners — set your intent clearly."
            color="from-pink-500/10 to-rose-500/10 border-pink-500/20"
          />
          <FeatureCard
            icon={<AlertTriangle className="w-8 h-8 text-red-400" />}
            title="One-Tap SOS"
            desc="Emergency button instantly alerts contacts with your live location."
            color="from-red-500/10 to-orange-500/10 border-red-500/20"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-yellow-400" />}
            title="Quality Matches"
            desc="Curated matches based on shared interests. No endless swiping."
            color="from-yellow-500/10 to-orange-500/10 border-yellow-500/20"
          />
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-6 py-20">
        <Card className="p-12 text-center bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-white/10 backdrop-blur-xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Meet Safely?</h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Join the founding community. Free for life — just {spotsLeft.toLocaleString()} spots left.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold hover:opacity-90 text-lg px-10 py-6"
            >
              Join Hydraspark Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </Card>
      </section>

      <footer className="container mx-auto px-6 py-8 text-center text-white/40 border-t border-white/5">
        <p>© 2025 Hydraspark Hercules. Built with safety at the core.</p>
      </footer>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  color: string
}) {
  return (
    <Card className={`p-6 bg-gradient-to-br ${color} backdrop-blur-sm hover:scale-105 transition-transform`}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
    </Card>
  )
}