'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Crown } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    if (!supabase) {
      toast.error('Supabase not configured. Add your env vars to .env.local')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      toast.success("🎉 Welcome! You're now a founder!")
      router.push('/onboarding')
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none"><div className="absolute top-[-30%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/15 blur-[100px]" /><div className="absolute bottom-[-30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[100px]" /></div>
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>

        <Card className="relative p-8 bg-[#1a1a2e]/80 border border-purple-500/20 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold text-white">Claim Founder Spot</span>
          </div>
          <p className="text-white/60 text-sm mb-6">
            Free for life. Priority features. Founder badge.
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-white">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 mt-1"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 mt-1"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 mt-1"
                placeholder="At least 6 characters"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold"
            >
              {loading ? 'Creating account...' : '🚀 Claim My Spot'}
            </Button>
          </form>

          <p className="text-white/50 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-300 hover:text-purple-200 hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </main>
  )
}