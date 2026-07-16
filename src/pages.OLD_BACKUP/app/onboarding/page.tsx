import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useNavigate } from "react-router-dom";
import { VIBE_QUESTIONS } from "@/lib/vibeQuestions.ts";
import { Button } from "@/components/ui/button.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Input } from "@/components/ui/input.tsx";
import { toast } from "sonner";
import {
  Flame, ArrowRight, ArrowLeft, Camera, User, Heart, Sparkles, CheckCircle,
} from "lucide-react";

const TOTAL_STEPS = 5;

// Step 1: Name + age + gender
// Step 2: Location + bio
// Step 3: Photos
// Step 4: Vibe questions
// Step 5: Preferences

type FormData = {
  name: string;
  age: string;
  gender: "man" | "woman" | "nonbinary" | "";
  location: string;
  bio: string;
  photos: string[];
  vibeAnswers: number[];
  interestedIn: string[];
  ageMin: string;
  ageMax: string;
};

const SAMPLE_PHOTOS_W = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1562337404-3044c84ac061?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1567516364473-233c4b6fcfbe?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
];
const SAMPLE_PHOTOS_M = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1528892952291-009c663ce843?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormData>({
    name: "", age: "", gender: "",
    location: "", bio: "",
    photos: [],
    vibeAnswers: Array(12).fill(-1),
    interestedIn: [],
    ageMin: "18", ageMax: "40",
  });
  const [saving, setSaving] = useState(false);
  const saveProfile = useMutation(api.users.saveProfile);
  const navigate = useNavigate();

  function update(patch: Partial<FormData>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function next() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function back() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  async function finish() {
    if (!form.gender || !form.name || !form.age) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (form.interestedIn.length === 0) {
      toast.error("Please select who you're interested in");
      return;
    }
    setSaving(true);
    try {
      const photos =
        form.photos.length > 0
          ? form.photos
          : form.gender === "woman"
          ? SAMPLE_PHOTOS_W
          : form.gender === "man"
          ? SAMPLE_PHOTOS_M
          : SAMPLE_PHOTOS_W;

      await saveProfile({
        name: form.name,
        age: parseInt(form.age) || 25,
        gender: form.gender as "man" | "woman" | "nonbinary",
        location: form.location || "Earth",
        bio: form.bio || "Just here vibing.",
        photos,
        vibeAnswers: form.vibeAnswers.map((a) => (a === -1 ? 0 : a)),
        interestedIn: form.interestedIn,
        ageMin: parseInt(form.ageMin) || 18,
        ageMax: parseInt(form.ageMax) || 40,
      });
      navigate("/app");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const stepTitles = [
    "Who are you?",
    "Tell your story",
    "Your best photos",
    "What's your vibe?",
    "Who are you looking for?",
  ];
  const stepIcons = [User, Sparkles, Camera, Heart, Flame];
  const StepIcon = stepIcons[step - 1];

  const variants = {
    enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-cyan-600/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-lg bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            HYDRASPARK
          </span>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i < step ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/8 rounded-3xl p-8 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/10">
              <StepIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-white/40 uppercase tracking-widest">
                Step {step} of {TOTAL_STEPS}
              </div>
              <h2 className="text-xl font-black">{stepTitles[step - 1]}</h2>
            </div>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {step === 1 && <Step1 form={form} update={update} />}
              {step === 2 && <Step2 form={form} update={update} />}
              {step === 3 && <Step3 form={form} update={update} />}
              {step === 4 && <Step4 form={form} update={update} />}
              {step === 5 && <Step5 form={form} update={update} />}
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={back}
              disabled={step === 1}
              className="text-white/40 hover:text-white disabled:opacity-0 transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step < TOTAL_STEPS ? (
              <Button
                onClick={next}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold px-6 rounded-xl hover:opacity-90 border-0"
              >
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={finish}
                disabled={saving}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold px-6 rounded-xl hover:opacity-90 border-0"
              >
                {saving ? "Saving..." : (
                  <><CheckCircle className="w-4 h-4 mr-1" /> Let's Go!</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Step Components ---

function Step1({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  const genders: { label: string; value: "man" | "woman" | "nonbinary" }[] = [
    { label: "Man", value: "man" },
    { label: "Woman", value: "woman" },
    { label: "Non-binary", value: "nonbinary" },
  ];
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm text-white/60 mb-2 block">First name *</label>
        <Input
          placeholder="e.g. Sofia"
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50"
        />
      </div>
      <div>
        <label className="text-sm text-white/60 mb-2 block">Age *</label>
        <Input
          type="number"
          placeholder="e.g. 26"
          min={18}
          max={80}
          value={form.age}
          onChange={(e) => update({ age: e.target.value })}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50"
        />
      </div>
      <div>
        <label className="text-sm text-white/60 mb-2 block">I am a *</label>
        <div className="flex gap-3">
          {genders.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => update({ gender: g.value })}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                form.gender === g.value
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 border-transparent text-white"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80 bg-transparent"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm text-white/60 mb-2 block">Your city</label>
        <Input
          placeholder="e.g. New York, Tokyo, London"
          value={form.location}
          onChange={(e) => update({ location: e.target.value })}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50"
        />
      </div>
      <div>
        <label className="text-sm text-white/60 mb-2 block">
          Bio <span className="text-white/30">({form.bio.length}/200)</span>
        </label>
        <Textarea
          placeholder="Write something that captures who you are — be real, be you."
          value={form.bio}
          maxLength={200}
          rows={4}
          onChange={(e) => update({ bio: e.target.value })}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 resize-none"
        />
      </div>
    </div>
  );
}

function Step3({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  // In a real app, photos would be uploaded via Convex file storage.
  // For onboarding, we use URL inputs.
  const photoSlots = [0, 1, 2, 3, 4, 5];

  function setPhoto(index: number, url: string) {
    const next = [...form.photos];
    next[index] = url;
    // trim trailing empties
    update({ photos: next.filter((p, i) => p || i < index) });
  }

  return (
    <div className="space-y-4">
      <p className="text-white/50 text-sm">
        Add photo URLs (from your social media or Unsplash). At least 1 required.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {photoSlots.map((i) => {
          const url = form.photos[i];
          return (
            <div
              key={i}
              className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10 bg-white/5"
            >
              {url ? (
                <>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhoto(i, "")}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full text-white/70 text-xs flex items-center justify-center cursor-pointer"
                  >
                    ×
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-white/20">
                  <Camera className="w-5 h-5" />
                  <span className="text-[10px]">Photo {i + 1}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        {photoSlots.slice(0, 4).map((i) => (
          <Input
            key={i}
            placeholder={`Photo ${i + 1} URL (optional)`}
            value={form.photos[i] || ""}
            onChange={(e) => setPhoto(i, e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 text-xs"
          />
        ))}
      </div>
      <p className="text-white/25 text-xs">
        No photos? We'll pick some for you to get you started.
      </p>
    </div>
  );
}

function Step4({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  const [qIndex, setQIndex] = useState(0);
  const q = VIBE_QUESTIONS[qIndex];
  const answered = form.vibeAnswers.filter((a) => a !== -1).length;

  function answer(optionIndex: number) {
    const next = [...form.vibeAnswers];
    next[qIndex] = optionIndex;
    update({ vibeAnswers: next });
    if (qIndex < VIBE_QUESTIONS.length - 1) {
      setTimeout(() => setQIndex((i) => i + 1), 200);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">{answered}/12 answered</span>
        <div className="flex gap-1">
          {VIBE_QUESTIONS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQIndex(i)}
              className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                form.vibeAnswers[i] !== -1 ? "bg-purple-500" : i === qIndex ? "bg-white/40" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white/3 rounded-2xl p-5 border border-white/8">
        <p className="font-semibold text-base mb-4">{q.question}</p>
        <div className="grid grid-cols-2 gap-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => answer(i)}
              className={`py-3 px-3 rounded-xl text-sm text-left transition-all cursor-pointer border ${
                form.vibeAnswers[qIndex] === i
                  ? "bg-gradient-to-r from-purple-500/30 to-cyan-500/20 border-purple-500/50 text-white"
                  : "border-white/8 text-white/60 hover:border-white/20 hover:text-white bg-transparent"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setQIndex((i) => Math.max(0, i - 1))}
          disabled={qIndex === 0}
          className="text-xs text-white/30 hover:text-white/60 disabled:opacity-30 transition-all cursor-pointer"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={() => setQIndex((i) => Math.min(11, i + 1))}
          disabled={qIndex === 11}
          className="text-xs text-white/30 hover:text-white/60 disabled:opacity-30 transition-all cursor-pointer"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function Step5({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  const options = [
    { label: "Men", value: "man" },
    { label: "Women", value: "woman" },
    { label: "Non-binary", value: "nonbinary" },
  ];

  function toggleInterest(val: string) {
    const cur = form.interestedIn;
    if (cur.includes(val)) {
      update({ interestedIn: cur.filter((v) => v !== val) });
    } else {
      update({ interestedIn: [...cur, val] });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm text-white/60 mb-3 block">I'm interested in *</label>
        <div className="flex gap-3">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => toggleInterest(o.value)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                form.interestedIn.includes(o.value)
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 border-transparent text-white"
                  : "border-white/10 text-white/50 hover:border-white/20 bg-transparent"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm text-white/60 mb-3 block">Age range</label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={18}
            max={80}
            value={form.ageMin}
            onChange={(e) => update({ ageMin: e.target.value })}
            className="bg-white/5 border-white/10 text-white focus:border-purple-500/50"
          />
          <span className="text-white/30">to</span>
          <Input
            type="number"
            min={18}
            max={80}
            value={form.ageMax}
            onChange={(e) => update({ ageMax: e.target.value })}
            className="bg-white/5 border-white/10 text-white focus:border-purple-500/50"
          />
        </div>
      </div>
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl p-4 text-sm text-white/50">
        <Flame className="w-4 h-4 inline mr-2 text-purple-400" />
        You're all set! We'll show you people who match your preferences and vibe.
      </div>
    </div>
  );
}