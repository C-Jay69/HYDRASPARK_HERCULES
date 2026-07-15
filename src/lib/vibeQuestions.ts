export type VibeQuestion = {
  question: string;
  options: [string, string, string, string];
};

export const VIBE_QUESTIONS: VibeQuestion[] = [
  {
    question: "Your ideal weekend is:",
    options: ["Hiking / outdoors", "Netflix marathon", "Out with friends", "Solo adventures"],
  },
  {
    question: "Your love language is:",
    options: ["Words of affirmation", "Quality time", "Physical touch", "Acts of service"],
  },
  {
    question: "Most attracted to someone who is:",
    options: ["Ambitious", "Hilarious", "Deeply kind", "Intellectually curious"],
  },
  {
    question: "Your texting style:",
    options: ["Always online", "Check in daily", "Respond when free", "Prefer calls"],
  },
  {
    question: "Perfect first date:",
    options: ["Coffee & a long walk", "Dinner & wine", "Fun activity", "Spontaneous adventure"],
  },
  {
    question: "Your relationship with social media:",
    options: ["Very active", "Selective poster", "Mostly a lurker", "Barely use it"],
  },
  {
    question: "Perfect evening in:",
    options: ["Cook a meal together", "Live music / concert", "Board games & snacks", "Movie marathon"],
  },
  {
    question: "When stressed, you:",
    options: ["Talk it through", "Need alone time", "Exercise it out", "Distract with fun"],
  },
  {
    question: "Your friends call you:",
    options: ["The funny one", "The loyal one", "The wild one", "The wise one"],
  },
  {
    question: "Biggest dealbreaker:",
    options: ["Dishonesty", "No ambition", "Disrespect", "Different life goals"],
  },
  {
    question: "You want a relationship that is:",
    options: ["Adventure-filled", "Cozy & intimate", "Goal-crushing together", "Independent but loving"],
  },
  {
    question: "You're a:",
    options: ["Early bird", "Night owl", "Somewhere in between", "Depends on the day"],
  },
];

export function calcVibeScore(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  const matches = a.filter((v, i) => v === b[i]).length;
  return Math.round((matches / a.length) * 100);
}