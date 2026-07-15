import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const countSeedProfiles = internalQuery({
  args: {},
  handler: async (ctx) => {
    const seeds = await ctx.db
      .query("profiles")
      .withIndex("by_seed", (q) => q.eq("isSeed", true))
      .collect();
    return seeds.length;
  },
});

// Photo base URLs (Unsplash cropped portraits)
const WOMEN_PHOTOS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1562337404-3044c84ac061?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1567516364473-233c4b6fcfbe?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1630939687530-241d630735df?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1623717217554-72ca676de535?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1512503680075-3d32d864212a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1578933301026-3e5e901126dc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1665560924350-29cbc22df634?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1662850886700-4ec19bd30d11?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1564564295391-7f24f26f568b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1783701329145-8d60ba4a55b2?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1723189038268-3ef8fd518ad9?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1723189037170-eb482b4b86a9?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1758600587815-b654d1405e83?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
];

const MEN_PHOTOS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1528892952291-009c663ce843?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1525457136159-8878648a7ad0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1600603406200-5b2a104684ac?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1561688961-7588856fe6ee?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1450133064473-71024230f91b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1609228579945-4067c8186939?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1583123810408-23e7b5d1af9f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1504473114289-43f5e302d6bb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1564564244660-5d73c057f2d2?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1715029005043-e88d219a3c48?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1679486038087-40723e5bbf6b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1757744705465-ea08b0ddc38a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
  "https://images.unsplash.com/photo-1758523672156-7a7b62d701f1?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=600&q=80",
];

const CITIES = [
  "New York", "London", "Tokyo", "Paris", "Los Angeles", "Sydney",
  "Toronto", "Berlin", "Barcelona", "Amsterdam", "Seoul", "Melbourne",
  "Chicago", "Miami", "San Francisco", "Austin", "Portland", "Denver",
  "Bangkok", "Bali", "Cape Town", "Lisbon", "Dublin", "Stockholm",
];

const BIOS_WOMEN = [
  "Lover of good coffee, bad puns, and spontaneous road trips. Here to find my co-pilot.",
  "Yoga in the morning, tacos at midnight. Looking for someone who can keep up.",
  "Professional overthinker, amateur chef. Will talk about books for hours.",
  "Dog mom, plant killer, ocean lover. Seeking someone who laughs at themselves.",
  "I'm the person who stops to pet every dog. Unapologetically so.",
  "Traveling solo through life, looking for a companion. Can cook, will share.",
  "Scientist by day, dreamer by night. You should know I will beat you at trivia.",
  "Sun-chaser who never turns down a spontaneous adventure. ENTP, if that helps.",
  "Fluent in sarcasm and three languages. Passionate about art, travel, and good wine.",
  "Raising my standards like sourdough. Big heart, stronger opinions.",
  "Making memories out of ordinary Tuesdays. Let's grab coffee and talk for hours.",
  "I like long hikes and longer conversations. Mountains > beaches.",
  "Obsessed with learning new things. Currently: ceramics, hot yoga, and you.",
  "Looking for someone who appreciates early mornings and late-night adventures.",
  "Hopeless romantic with a realistic worldview. Big on authenticity.",
  "Film nerd, city wanderer, relentless optimist. Swipe right if you cry at movies.",
];

const BIOS_MEN = [
  "Amateur chef with a signature dish, looking for someone to taste test my life.",
  "Equal parts adventurous and homebody. I make great playlists and even better pancakes.",
  "Climber, runner, overthinker. Looking for someone to keep me grounded.",
  "I read more than I talk but when I talk, it matters. Coffee first, always.",
  "Taking life one board game at a time. Fair warning: I play to win.",
  "Photographer who finds beauty in overlooked moments. Let me show you mine.",
  "Tech guy with a heart for the outdoors. Can explain WiFi and identify constellations.",
  "Musician after hours, problem-solver by day. Searching for a muse and a partner.",
  "Will absolutely judge a restaurant by its bread basket. High standards, low ego.",
  "Serial starter of passion projects. Looking for someone to join the chaos.",
  "Gym at 6am, sunset walks at 7pm. Extremely fluent in silence — it's golden.",
  "Traveler with 27 passport stamps and counting. Next destination: your heart. (Cheesy? Yes.)",
  "Professional data analyst, amateur comedian. I'll make you laugh within 5 minutes.",
  "Part architect, part storyteller. I build things with my hands and my words.",
  "Eternal optimist who has not given up on love. Or sourdough. Both still rising.",
  "Philosophy grad, startup founder. Life is short — let's make it interesting.",
];

function seedVibeAnswers(index: number): number[] {
  return Array.from({ length: 12 }, (_, i) => (index + i * 3) % 4);
}

type SeedProfile = {
  userId: string;
  name: string;
  age: number;
  gender: "man" | "woman" | "nonbinary";
  location: string;
  bio: string;
  photos: string[];
  vibeAnswers: number[];
  interestedIn: string[];
  ageMin: number;
  ageMax: number;
  isOnboarded: boolean;
  isPremium: boolean;
  isVerified: boolean;
  isAdmin: boolean;
  isSeed: boolean;
  lastActive: string;
};

function generateSeedProfiles(): SeedProfile[] {
  const profiles: SeedProfile[] = [];

  // 35 women
  const womenNames = [
    "Sofia", "Aria", "Mia", "Luna", "Emma", "Chloe", "Zoe", "Lily", "Nora", "Ava",
    "Maya", "Aisha", "Priya", "Yuki", "Mei", "Fatima", "Isabella", "Valentina", "Elena", "Sara",
    "Jade", "Amara", "Keiko", "Nadia", "Leila", "Ingrid", "Amelia", "Camille", "Zara", "Ana",
    "Hana", "Rosa", "Nina", "Bianca", "Layla",
  ];
  womenNames.forEach((name, i) => {
    const age = 21 + (i % 18);
    profiles.push({
      userId: `seed_w${i}`,
      name,
      age,
      gender: "woman",
      location: CITIES[i % CITIES.length],
      bio: BIOS_WOMEN[i % BIOS_WOMEN.length],
      photos: [
        WOMEN_PHOTOS[i % WOMEN_PHOTOS.length],
        WOMEN_PHOTOS[(i + 3) % WOMEN_PHOTOS.length],
        WOMEN_PHOTOS[(i + 7) % WOMEN_PHOTOS.length],
        WOMEN_PHOTOS[(i + 11) % WOMEN_PHOTOS.length],
      ],
      vibeAnswers: seedVibeAnswers(i),
      interestedIn: ["man"],
      ageMin: 22,
      ageMax: 38,
      isOnboarded: true,
      isPremium: i % 5 === 0,
      isVerified: i % 3 === 0,
      isAdmin: false,
      isSeed: true,
      lastActive: new Date(Date.now() - i * 3600000).toISOString(),
    });
  });

  // 30 men
  const menNames = [
    "Marcus", "Luca", "Kai", "Noah", "Ethan", "James", "Leo", "Elijah", "Oliver", "Jack",
    "Alex", "Ryan", "Daniel", "Tyler", "Blake", "Jordan", "Andre", "Dmitri", "Yusuf", "Hiroshi",
    "Carlos", "Matteo", "Finn", "Sebastian", "Omar", "Rafi", "Theo", "Soren", "Nico", "Julian",
  ];
  menNames.forEach((name, i) => {
    const age = 22 + (i % 17);
    profiles.push({
      userId: `seed_m${i}`,
      name,
      age,
      gender: "man",
      location: CITIES[(i + 7) % CITIES.length],
      bio: BIOS_MEN[i % BIOS_MEN.length],
      photos: [
        MEN_PHOTOS[i % MEN_PHOTOS.length],
        MEN_PHOTOS[(i + 4) % MEN_PHOTOS.length],
        MEN_PHOTOS[(i + 9) % MEN_PHOTOS.length],
      ],
      vibeAnswers: seedVibeAnswers(i + 35),
      interestedIn: ["woman"],
      ageMin: 21,
      ageMax: 36,
      isOnboarded: true,
      isPremium: i % 6 === 0,
      isVerified: i % 4 === 0,
      isAdmin: false,
      isSeed: true,
      lastActive: new Date(Date.now() - (i + 1) * 7200000).toISOString(),
    });
  });

  // 2 nonbinary
  ["River", "Sage"].forEach((name, i) => {
    profiles.push({
      userId: `seed_nb${i}`,
      name,
      age: 26 + i,
      gender: "nonbinary",
      location: CITIES[(i + 15) % CITIES.length],
      bio: "Living life outside the lines. Into music, philosophy, and long conversations over good food.",
      photos: [WOMEN_PHOTOS[(i + 5) % WOMEN_PHOTOS.length]],
      vibeAnswers: seedVibeAnswers(i + 65),
      interestedIn: ["man", "woman", "nonbinary"],
      ageMin: 22,
      ageMax: 35,
      isOnboarded: true,
      isPremium: false,
      isVerified: true,
      isAdmin: false,
      isSeed: true,
      lastActive: new Date(Date.now() - 3600000).toISOString(),
    });
  });

  return profiles;
}

export const insertSeedProfiles = internalMutation({
  args: {},
  handler: async (ctx) => {
    const profiles = generateSeedProfiles();
    for (const p of profiles) {
      await ctx.db.insert("profiles", p);
    }
  },
});