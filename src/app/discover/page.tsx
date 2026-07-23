'use client'

import { useEffect, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Crown } from 'lucide-react'

type Profile = {
  username: string
  full_name: string
  bio: string
  avatar_url: string
  membership_tier: string
  is_founder: boolean
  location_city: string
}

export default function DiscoverPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      if (!supabase) {
        router.push('/login')
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data && !data.onboarding_completed) {
        router.push('/onboarding')
        return
      }

      setProfile(data)
      setLoading(false)
    }
    load()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black p-6">
      <div className="max-w-2xl mx-auto pt-8">
        <Card className="p-8 bg-[#1a1a2e]/80 border border-purple-500/20 backdrop-blur-xl text-center">
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-purple-500"
            />
          )}
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-white">{profile?.full_name}</h1>
            {profile?.is_founder && (
              <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
                <Crown className="w-3 h-3 mr-1" /> FOUNDER
              </Badge>
            )}
          </div>
          <p className="text-white/60 mb-1">@{profile?.username}</p>
          <p className="text-white/40 text-sm mb-4">📍 {profile?.location_city}</p>
          <p className="text-white/80 mb-6 max-w-md mx-auto">{profile?.bio}</p>

          <div className="border-t border-white/10 pt-6">
            <p className="text-white/60 mb-4">🃏 Swipe UI coming next!</p>
            <Button onClick={handleLogout} variant="outline" className="border-white/20 text-white bg-transparent hover:bg-white/10">
              Sign out
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}