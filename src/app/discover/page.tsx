'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function DiscoverPage() {
  const [email, setEmail] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? '')
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <Card className="max-w-md p-8 bg-white/5 backdrop-blur-xl border-white/10 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">🃏 Discover</h1>
        <p className="text-white/70 mb-2">Signed in as:</p>
        <p className="text-yellow-400 font-mono text-sm mb-6">{email}</p>
        <p className="text-white/60 mb-6">Swipe UI coming next!</p>
        <Button onClick={handleLogout} variant="outline" className="border-white/20 text-white">
          Sign out
        </Button>
      </Card>
    </main>
  )
}
