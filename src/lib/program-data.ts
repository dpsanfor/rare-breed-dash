export type ModuleType = "context" | "conversation" | "synthesis";

export interface ProgramModule {
  id: string;
  number: number;
  name: string;
  tagline: string;
  purpose: string;
  danasPrinciple?: string;
  type: ModuleType;
  outputName?: string;
  outputKey?: string;
  nextDecision?: string;
  generatePrompt?: string;
}

export interface Phase {
  id: string;
  number: number;
  name: string;
  tagline: string;
  modules: ProgramModule[];
}

export const PHASES: Phase[] = [
  {
    id: "prison-break",
    number: 1,
    name: "Good Girl Prison Break™",
    tagline: "Discover the operating system you've been living from.",
    modules: [
      {
        id: "welcome",
        number: 1,
        name: "Welcome",
        tagline: "Understand why you're here.",
        purpose:
          "Every person already has an operating system. You didn't choose it. It was built from family, culture, religion, praise, trauma, achievement, and survival. The goal of Phase One is to discover yours. Not fix it. Not heal it. Discover it.",
        type: "context",
      },
      {
        id: "x-vs-y",
        number: 2,
        name: "X vs Y™",
        tagline: "Identify the gap between capability and calling.",
        purpose:
          "Women are not stuck because they aren't capable. They're stuck because they're incredibly capable. X is the business you became exceptional at building. Y is the business you're truly called to build. Most women have never seen the gap between the two clearly.",
        danasPrinciple:
          "Women don't stay small because they aren't capable. They stay small because they're so capable they can't tell the difference between what they're good at and what they're here for.",
        type: "conversation",
        outputName: "X vs Y Report™",
        outputKey: "x_vs_y",
        nextDecision: "Do I continue building X — or begin building Y?",
        generatePrompt:
          "I'm ready. Generate my X vs Y Report based on everything we've discussed.",
      },
      {
        id: "wanted-vs-needed",
        number: 3,
        name: "Wanted vs Needed Money™",
        tagline: "Determine whether revenue has been built from expansion or survival.",
        purpose:
          "Not all money costs the same. Some money expands you. Some money contracts you. This engine uncovers where you've been building your business from fear instead of freedom.",
        danasPrinciple:
          "Wanted Money expands your future. Needed Money protects your past.",
        type: "conversation",
        outputName: "Revenue Integrity Report™",
        outputKey: "revenue_integrity",
        nextDecision:
          "What changes if I price from wanted money instead of needed money?",
        generatePrompt:
          "I'm ready. Generate my Revenue Integrity Report based on everything we've discussed.",
      },
      {
        id: "dead-weight",
        number: 4,
        name: "The 80% Audit™",
        tagline: "Identify the work you have outgrown.",
        purpose:
          "Most women believe growth comes from adding more. Rare Breed teaches that growth comes from carrying less. The 80% is not bad. It's simply no longer yours.",
        danasPrinciple:
          "The life and business you want aren't built by adding more. They're uncovered by removing everything that isn't truly yours.",
        type: "conversation",
        outputName: "Dead Weight Audit™",
        outputKey: "dead_weight",
        nextDecision: "What am I releasing this week — not eventually?",
        generatePrompt:
          "I'm ready. Generate my 80% Audit based on everything we've discussed.",
      },
      {
        id: "comfort-cage",
        number: 5,
        name: "Comfort Is the Cage™",
        tagline: "Reveal where comfort has become the decision maker.",
        purpose:
          "Comfort is the most sophisticated cage. It's not imposed from outside — it's chosen. Repeatedly. This module identifies exactly where comfort is running your business decisions instead of calling.",
        danasPrinciple:
          "Every quarter you choose comfort over calling, you become more capable... and less alive.",
        type: "conversation",
        outputName: "Comfort Map™",
        outputKey: "comfort_map",
        nextDecision: "Which comfort pattern is costing me the most right now?",
        generatePrompt:
          "I'm ready. Generate my Comfort Map based on everything we've discussed.",
      },
      {
        id: "approval-map",
        number: 6,
        name: "Who Are You Keeping Comfortable?™",
        tagline: "Reveal where external approval is driving decisions.",
        purpose:
          "Good girl programming is fundamentally about keeping others comfortable at the expense of your own truth. This module surfaces exactly whose approval is driving your business decisions.",
        danasPrinciple:
          "Every decision you make to keep someone else comfortable trains you to become less yourself.",
        type: "conversation",
        outputName: "Approval Map™",
        outputKey: "approval_map",
        nextDecision: "Who gets to be uncomfortable so I can be free?",
        generatePrompt:
          "I'm ready. Generate my Approval Map based on everything we've discussed.",
      },
      {
        id: "language-detection",
        number: 7,
        name: "Good Girl Language Detection™",
        tagline: "Analyze the language patterns embedded in your responses.",
        purpose:
          "Language is the fingerprint of the operating system. The words you choose — should, need to, can't, responsible, enough — reveal the programming underneath. This module reads everything you've shared and surfaces the patterns.",
        type: "synthesis",
        outputName: "Programming Report™",
        outputKey: "language_report",
        nextDecision: "Which belief is the most load-bearing part of my current OS?",
      },
      {
        id: "good-girl-os",
        number: 8,
        name: "Your Good Girl Operating System™",
        tagline: "The operating system you've been living from — fully revealed.",
        purpose:
          "This is the culmination of Phase One. The AI synthesizes every module into one personalized document. You leave knowing exactly why you keep recreating the same patterns in your business, your relationships, and your decisions.",
        type: "synthesis",
        outputName: "Good Girl Operating System™",
        outputKey: "good_girl_os",
        nextDecision: "Am I ready to install a new one?",
      },
    ],
  },
  {
    id: "ten-x-leap",
    number: 2,
    name: "The 10X Leap™",
    tagline: "Install the Rare Breed Operating System™.",
    modules: [
      {
        id: "bigger-vision",
        number: 1,
        name: "Bigger Vision™",
        tagline: "Install a vision larger than your current circumstances.",
        purpose:
          "The Rare Breed OS starts with a vision so large your current circumstances become irrelevant. Not a goal. A declaration of who you are becoming.",
        type: "conversation",
        outputName: "Vision Document™",
        outputKey: "bigger_vision",
        nextDecision:
          "Am I making decisions from where I am — or from where I'm going?",
        generatePrompt:
          "I'm ready. Generate my Vision Document based on everything we've discussed.",
      },
      {
        id: "release-80",
        number: 2,
        name: "Release the 80%™",
        tagline: "Intentionally release what no longer belongs.",
        purpose:
          "Phase One identified what you've outgrown. This module decides. Using your Dead Weight Audit, you build a Release Plan and commit to it.",
        type: "synthesis",
        outputName: "Release Plan™",
        outputKey: "release_plan",
        nextDecision: "What am I releasing this week — not eventually?",
      },
      {
        id: "constitution",
        number: 3,
        name: "Build Your Rare Breed Operating System™",
        tagline: "The deep AI interview that installs your new OS.",
        purpose:
          "This is the interview. The AI interviews you exactly like Dana Hayes — reflecting patterns, challenging comfort, digging beneath surface answers. You leave with your Rare Breed Constitution™.",
        type: "context",
        outputName: "Rare Breed Constitution™",
        outputKey: "constitution",
        nextDecision: "Am I making decisions from my old OS or my new one?",
      },
      {
        id: "magic-gumdrop",
        number: 4,
        name: "Magic Gumdrop™",
        tagline: "Uncover the work only you could create.",
        purpose:
          "This module happens after the Constitution because you answer from your new identity — not your conditioned one. The Magic Gumdrop is your unique body of work: why it matters, who it's for, why it can't be copied.",
        type: "conversation",
        outputName: "Magic Gumdrop™",
        outputKey: "magic_gumdrop",
        nextDecision: "What is the one thing I keep trying to build around?",
        generatePrompt: "I'm ready. Generate my Magic Gumdrop based on everything we've discussed.",
      },
      {
        id: "zone-of-genius",
        number: 5,
        name: "Zone of Genius™",
        tagline: "The conditions where your greatest contribution naturally emerges.",
        purpose:
          "Your Zone of Genius is not what you're capable of. It's the work that expands you while creating the greatest transformation for others. This engine finds where your energy, your calling, and your irreplaceable perspective converge.",
        danasPrinciple:
          "Your Zone of Genius isn't what you're capable of. It's the work that expands you while creating the greatest transformation for others.",
        type: "conversation",
        outputName: "Zone of Genius Report™",
        outputKey: "zone_of_genius",
        nextDecision:
          "What would I build if I fully committed to my zone of genius?",
        generatePrompt:
          "I'm ready. Generate my Zone of Genius Report based on everything we've discussed.",
      },
      {
        id: "category-of-one",
        number: 6,
        name: "Category of One™",
        tagline: "Define the movement only you could lead.",
        purpose:
          "Category of One is not a niche. It's a movement. An industry position so specifically yours that no one else could fill it.",
        type: "conversation",
        outputName: "Category of One™",
        outputKey: "category_of_one",
        nextDecision:
          "What would I be building if I stopped competing and started leading?",
        generatePrompt: "I'm ready. Generate my Category of One based on everything we've discussed.",
      },
      {
        id: "operating-manual",
        number: 7,
        name: "Your Rare Breed Operating Manual™",
        tagline: "The complete synthesis. Your permanent source of truth.",
        purpose:
          "Every artifact from Phase Two feeds into this final synthesis. The AI generates your Rare Breed Operating Manual™ — the comprehensive document that becomes the required input for every AI Builder inside Rare Breed Club™. Identity, beliefs, decision filters, standards, leadership philosophy, Magic Gumdrop, Zone of Genius, Category of One, core teachings, legacy, business philosophy — all in one place.",
        type: "synthesis",
        outputName: "Rare Breed Operating Manual™",
        outputKey: "operating_manual",
        nextDecision:
          "What is the first move I make from this operating manual this week?",
      },
    ],
  },
  {
    id: "rare-breed-club",
    number: 3,
    name: "Rare Breed Club™",
    tagline: "Your operating system evolves every month.",
    modules: [],
  },
];

export function getPhase(id: string): Phase | undefined {
  return PHASES.find((p) => p.id === id);
}

export function getModule(
  phaseId: string,
  moduleNumber: number
): ProgramModule | undefined {
  const phase = getPhase(phaseId);
  return phase?.modules.find((m) => m.number === moduleNumber);
}

export const PHASE1_MODULE_KEYS = PHASES[0].modules.map((m) => m.id);
export const PHASE2_MODULE_KEYS = PHASES[1].modules.map((m) => m.id);
