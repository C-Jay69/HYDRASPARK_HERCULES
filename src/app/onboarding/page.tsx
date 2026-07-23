'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { ArrowRight, ArrowLeft, Upload, X, Heart, Users, Sparkles, Coffee } from 'lucide-react'

type Interest = { id: string; name: string; category: string; icon: string }
type Intent = 'dating' | 'friendship' | 'networking' | 'activity_partner'

const INTENT_OPTIONS: { value: Intent; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'dating', label: 'Dating', icon: <Heart className="w-6 h-6" />, desc: 'Looking for romance' },
  { value: 'friendship', label: 'Friendship', icon: <Users className="w-6 h-6" />, desc: 'New friends' },
  { value: 'activity_partner', label: 'Activity Partner', icon: <Sparkles className="w-6 h-6" />, desc: 'Hiking, gym, etc.' },
  { value: 'networking', label: 'Networking', icon: <Coffee className="w-6 h-6" />, desc: 'Professional connections' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const totalSteps = 5

  // Form data
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [city, setCity] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [selectedIntents, setSelectedIntents] = useState<Intent[]>([])
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [loading, setLoading] = useState(false)

    useEffect(() => {
    if (!supabase) return
    const loadInterests = async () => {
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .order('category')

      if (error) {
        console.error('Failed to load interests:', error)
        toast.error('Could not load interests')
        return
      }
      setAvailableInterests(data || [])
    }
    loadInterests()
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const toggleIntent = (intent: Intent) => {
    setSelectedIntents(prev =>
      prev.includes(intent) ? prev.filter(i => i !== intent) : [...prev, intent]
    )
  }

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(prev => prev.filter(i => i !== id))
    } else if (selectedInterests.length < 10) {
      setSelectedInterests(prev => [...prev, id])
    } else {
      toast.error('Max 10 interests')
    }
  }

  const canGoNext = () => {
    if (step === 1) return username.length >= 3 && dateOfBirth && city
    if (step === 2) return bio.length >= 20
    if (step === 3) return !!photoFile
    if (step === 4) return selectedIntents.length > 0 && selectedInterests.length >= 3
    if (step === 5) return emergencyName && emergencyPhone
    return false
  }

  const handleFinish = async () => {
    if (!supabase) {
      toast.error('Supabase not configured')
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Not signed in')
      router.push('/login')
      return
    }

    // Upload photo
    let avatarUrl = ''
    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('user-photos')
        .upload(filePath, photoFile, { upsert: true })

      if (uploadError) {
        toast.error('Photo upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('user-photos')
        .getPublicUrl(filePath)
      avatarUrl = publicUrl

      // Save to user_photos table
      await supabase.from('user_photos').insert({
        user_id: user.id,
        storage_path: filePath,
        is_primary: true,
      })
    }

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        username,
        bio,
        date_of_birth: dateOfBirth,
        location_city: city,
        avatar_url: avatarUrl,
        intent: selectedIntents,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    if (profileError) {
      toast.error('Profile update failed: ' + profileError.message)
      setLoading(false)
      return
    }

    // Save interests
    const interestRows = selectedInterests.map(interest_id => ({
      user_id: user.id,
      interest_id,
    }))
    await supabase.from('user_interests').insert(interestRows)

    toast.success('🎉 Profile complete! Welcome to Hydraspark!')
    router.push('/discover')
  }

  return (
    <main className="min-h-screen bg-black p-6">
      <div className="fixed inset-0 pointer-events-none"><div className="absolute top-[-30%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/15 blur-[100px]" /><div className="absolute bottom-[-30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[100px]" /></div>
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8 pt-8">
          <div className="flex justify-between items-center mb-2 text-white/80 text-sm">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-2" />
        </div>

        <Card className="relative p-8 bg-[#1a1a2e]/80 border border-purple-500/20 backdrop-blur-xl">
          {step === 1 && (
            <>
              <h2 className="text-3xl font-bold text-white mb-2">Let&apos;s start with basics</h2>
              <p className="text-white/60 mb-6">Tell us about yourself</p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
                    placeholder="jane_doe"
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                  <p className="text-white/40 text-xs mt-1">This will be your @handle</p>
                </div>

                <div>
                  <Label htmlFor="dob" className="text-white">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="city" className="text-white">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-3xl font-bold text-white mb-2">About you</h2>
              <p className="text-white/60 mb-6">Write a short bio (min 20 chars)</p>

              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="I love hiking, coffee, and meeting new people..."
                rows={6}
                maxLength={500}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-white/40 text-xs mt-2 text-right">{bio.length}/500</p>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-3xl font-bold text-white mb-2">Add a photo</h2>
              <p className="text-white/60 mb-6">Show your best smile!</p>

              <div className="flex flex-col items-center">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-48 h-48 rounded-full object-cover border-4 border-white/20"
                    />
                    <button
                      onClick={() => { setPhotoFile(null); setPhotoPreview('') }}
                      className="absolute top-0 right-0 bg-red-500 rounded-full p-1"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="w-48 h-48 rounded-full border-4 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-white/40 transition">
                    <Upload className="w-12 h-12 text-white/40 mb-2" />
                    <span className="text-white/60">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-3xl font-bold text-white mb-2">What are you here for?</h2>
              <p className="text-white/60 mb-4">Select all that apply</p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {INTENT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleIntent(opt.value)}
                    className={`p-4 rounded-xl border-2 transition text-left ${
                      selectedIntents.includes(opt.value)
                        ? 'border-purple-400 bg-purple-400/10'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <div className="text-purple-400 mb-2">{opt.icon}</div>
                    <div className="text-white font-semibold">{opt.label}</div>
                    <div className="text-white/60 text-xs">{opt.desc}</div>
                  </button>
                ))}
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Pick your interests</h3>
              <p className="text-white/60 mb-4">Choose 3-10 things you love</p>

              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {availableInterests.map(int => (
                  <Badge
                    key={int.id}
                    onClick={() => toggleInterest(int.id)}
                    className={`cursor-pointer text-sm px-3 py-1.5 ${
                      selectedInterests.includes(int.id)
                        ? 'bg-purple-500 text-white hover:bg-purple-400'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {int.icon} {int.name}
                  </Badge>
                ))}
              </div>
              <p className="text-white/40 text-xs mt-2">{selectedInterests.length}/10 selected</p>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-3xl font-bold text-white mb-2">🛡️ Safety first</h2>
              <p className="text-white/60 mb-6">
                Add an emergency contact. They&apos;ll be alerted if you miss a safety check-in during a meetup.
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="emergencyName" className="text-white">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Best friend, family member..."
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyPhone" className="text-white">Phone Number</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+1 555 123 4567"
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                </div>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="border-white/20 text-white bg-transparent hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : <div />}

            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canGoNext()}
                className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white disabled:opacity-30"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!canGoNext() || loading}
                className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold"
              >
                {loading ? 'Setting up...' : '🚀 Complete Profile'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </main>
  )
}