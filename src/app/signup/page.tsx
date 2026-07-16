'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Sparkles, ArrowLeft, Crown } from 'lucide-react'

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
      // Create profile row (triggers auto-founder assignment)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, full_name: fullName })

      if (profileError && profileError.code !== '23505') {
        toast.error('Failed to create profile: ' + profileError.message)
        setLoading(false)
        return
      }

      toast.success('🎉 Welcome! Check your email to verify.')
      router.push('/onboarding')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>

        <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-yellow-400" />
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
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold hover:opacity-90"
            >
              {loading ? 'Creating account...' : '🚀 Claim My Spot'}
            </Button>
          </form>

          <p className="text-white/60 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-yellow-400 hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </main>
  )
}
