'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <Card className="max-w-md p-8 bg-white/5 backdrop-blur-xl border-white/10 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">🎉 Welcome!</h1>
        <p className="text-white/70 mb-6">
          Your account is created. Onboarding wizard coming next.
        </p>
        <Link href="/discover">
          <Button className="bg-gradient-to-r from-pink-500 to-purple-600">
            Skip to Discover
          </Button>
        </Link>
      </Card>
    </main>
  )
}
