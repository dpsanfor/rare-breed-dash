export type StepType = "recap" | "exercise" | "completion";

export interface Step {
  key: string;
  type: StepType;
  title: string;
  prompt?: string;
  placeholder?: string;
  body?: string;
}

export interface Installation {
  id: string;
  number: number;
  name: string;
  goal: string;
  instruction: string;
  deliverables: string[];
  steps: Step[];
}

export const INSTALLATIONS: Installation[] = [
  {
    id: "envision",
    number: 1,
    name: "ENVISION",
    goal: "Install a vision larger than approval.",
    instruction:
      "See yourself as already there. Make every decision from that woman.",
    deliverables: ["Rare Breed Vision", "Future Identity Snapshot", "10X Goal"],
    steps: [
      {
        key: "recap",
        type: "recap",
        title: "Why We Envision First",
        body: `Most women build their business from where they are.\n\nThey price from their current bank account. They market to who's already following them. They offer what they think people can afford.\n\nThe Rare Breed Operating System starts somewhere different.\n\nIt starts with a vision so large that your current circumstances become irrelevant.\n\nYou are not building a business that fits your life.\n\nYou are installing a vision that expands your life to fit it.\n\nIn this installation, you will see — clearly and completely — who you are becoming and what you are building.\n\nLet's begin.`,
      },
      {
        key: "vision",
        type: "exercise",
        title: "Your Rare Breed Vision",
        prompt:
          "Describe your fully expanded life in present tense. Where are you? What does your business look like? What changed? Don't edit — just see it.",
        placeholder:
          "I am living in... My business generates... I work with women who... My days feel like...",
      },
      {
        key: "identity",
        type: "exercise",
        title: "Future Identity Snapshot",
        prompt:
          "Describe the woman you are becoming. Write as if you already are her. What does she believe? How does she operate? What does she refuse?",
        placeholder:
          "She knows her value without proving it. She charges what her work is actually worth. She doesn't explain herself...",
      },
      {
        key: "goal_10x",
        type: "exercise",
        title: "Your 10X Goal",
        prompt:
          "What is the number — revenue, clients, income, impact — that means you have fully said yes to your calling? Write it down. Make it specific.",
        placeholder: "$____ by ____. __ clients. $____ per month...",
      },
      {
        key: "completion",
        type: "completion",
        title: "Installation 1 Complete",
      },
    ],
  },
  {
    id: "filter",
    number: 2,
    name: "FILTER",
    goal: "Separate calling from capability.",
    instruction:
      "Before saying yes to anything today, ask: is this my calling, or just something I'm capable of?",
    deliverables: [
      "Calling Map",
      "Capability Map",
      "Conditioning Map",
      "Heat Map",
    ],
    steps: [
      {
        key: "recap",
        type: "recap",
        title: "Why Calling and Capability Are Not the Same",
        body: `There is a version of you that is very, very good at things that have nothing to do with your calling.\n\nYou are capable of working 80-hour weeks. That doesn't mean it's your calling.\n\nYou are capable of serving clients who drain you. That doesn't mean it's your calling.\n\nYou are capable of building a business that makes money but hollows you out. That is not your calling.\n\nIn this installation, we separate three things:\n\n• What you're called to do.\n• What you're capable of doing.\n• What you've been conditioned to do.\n\nThe magic lives in the overlap of calling and capability.\n\nEverything else — even if you're brilliant at it — belongs on someone else's list.`,
      },
      {
        key: "calling",
        type: "exercise",
        title: "Your Calling Map",
        prompt:
          "What do you do that feels like breathing? What flows through you without effort? What could you talk about, teach, or create for hours without getting tired?",
        placeholder:
          "When I'm in my calling, I... The thing I can't stop doing is... The work that never drains me is...",
      },
      {
        key: "capability",
        type: "exercise",
        title: "Your Capability Map",
        prompt:
          "What have you been trained, educated, or credentialed to do? What do people regularly hire or rely on you for?",
        placeholder:
          "I've been trained in... People come to me when they need... My proven skills include...",
      },
      {
        key: "conditioning",
        type: "exercise",
        title: "Your Conditioning Map",
        prompt:
          "What were you told you were good at growing up? What have you done to earn approval, fit a role, or meet expectations? What do you do out of obligation rather than desire?",
        placeholder:
          "I was told I was good at... I took the role of... I've been doing ___ because...",
      },
      {
        key: "heatmap",
        type: "exercise",
        title: "Your Heat Map",
        prompt:
          "Look at your calling map and your capability map. Where do they overlap? What shows up in BOTH lists? That overlap is your zone of genius — where you build from.",
        placeholder:
          "Both lists include... The intersection is... This is where I build from...",
      },
      {
        key: "completion",
        type: "completion",
        title: "Installation 2 Complete",
      },
    ],
  },
  {
    id: "release",
    number: 3,
    name: "RELEASE",
    goal: "Create space.",
    instruction:
      "Before you add anything today, ask: does this still belong to me?",
    deliverables: [
      "Release List",
      "Archive List",
      "Delegation List",
      "Identity Release",
    ],
    steps: [
      {
        key: "recap",
        type: "recap",
        title: "Why You Must Release Before You Build",
        body: `You cannot install a new operating system without clearing the old one.\n\nThe women who struggle to build what they want are usually holding too much of what they don't.\n\nClients that have outgrown you. Offers that were for a previous version of you. Beliefs that kept you safe when you were smaller. Roles that were never yours to play.\n\nRelease is not failure.\n\nRelease is the most sophisticated move a Rare Breed makes.\n\nIn this installation, you will create space — not by forcing yourself to let go, but by getting honest about what you've already outgrown.\n\nThe space you create here is exactly the size of the vision you installed yesterday.`,
      },
      {
        key: "release",
        type: "exercise",
        title: "Your Release List",
        prompt:
          "What is no longer yours to carry? List every client, offer, role, belief, relationship, or obligation you have outgrown. Don't negotiate. Just list.",
        placeholder: "I release...\nI release...\nI release...",
      },
      {
        key: "archive",
        type: "exercise",
        title: "Your Archive List",
        prompt:
          "What was true for a previous version of you, but is no longer true now? These aren't failures — they were right for who you were. Archive them with respect.",
        placeholder:
          "I archive the version of me who... I honor and close...",
      },
      {
        key: "delegation",
        type: "exercise",
        title: "Your Delegation List",
        prompt:
          "What does someone else need to do so you can stay in your genius? What tasks, roles, or responsibilities belong on another person's list?",
        placeholder:
          "I hand off... Someone else should be doing... I stop doing ___ so I can...",
      },
      {
        key: "identity_release",
        type: "exercise",
        title: "Identity Release",
        prompt:
          "Which version of yourself are you releasing today? Name her. Honor what she built. Then let her go.",
        placeholder:
          "I release the version of me who... She did what she had to do. She got me here. Now I become...",
      },
      {
        key: "completion",
        type: "completion",
        title: "Installation 3 Complete",
      },
    ],
  },
  {
    id: "build",
    number: 4,
    name: "BUILD",
    goal: "Design a business around genius.",
    instruction: "Only say yes to what requires your genius today.",
    deliverables: [
      "Rare Breed Blueprint",
      "Positioning",
      "Offer",
      "Movement",
      "Unique Genius Statement",
    ],
    steps: [
      {
        key: "recap",
        type: "recap",
        title: "Build From Genius, Not From Fear",
        body: `Most coaches build their business from what sold before.\n\nThey reverse-engineer their offer from what the market will tolerate. They position themselves based on what competitors are charging. They create content for the algorithm.\n\nThe Rare Breed builds differently.\n\nShe starts with her genius — the thing that is uniquely, irreplaceably hers — and she builds the business around it.\n\nThis is not a marketing exercise.\n\nThis is architecture.\n\nIn this installation, you will design the blueprint of a business that could not exist without you.\n\nNot a business that sounds like everyone else.\n\nYours. Specifically. Undeniably. Yours.`,
      },
      {
        key: "blueprint",
        type: "exercise",
        title: "Your Rare Breed Blueprint",
        prompt:
          "Describe your business in one sentence. Who you serve, how you serve them, and what actually changes for them.",
        placeholder: "I help ___ do/have/become ___ through ___.",
      },
      {
        key: "positioning",
        type: "exercise",
        title: "Your Positioning",
        prompt:
          "Who is this specifically for? What does she already believe? What has she already tried? What changes in her world when she works with you?",
        placeholder:
          "She is a woman who... She has already tried... When she works with me, she finally...",
      },
      {
        key: "offer",
        type: "exercise",
        title: "Your Offer",
        prompt:
          "What is the one thing you are selling? Not the features. Not the deliverables. The transformation. What does she walk away with that she couldn't access before?",
        placeholder:
          "She comes to me ___ and leaves ___. The core transformation is...",
      },
      {
        key: "movement",
        type: "exercise",
        title: "Your Movement",
        prompt:
          "What are you leading women AWAY from? And what are you leading them TOWARD? Your movement is the gap between those two things.",
        placeholder:
          "Away from: working for approval, staying small, building for the algorithm...\nToward: building from calling, the rare breed life, zone of genius...",
      },
      {
        key: "genius",
        type: "exercise",
        title: "Your Unique Genius Statement",
        prompt:
          "Complete this sentence with radical specificity: Only I can...",
        placeholder:
          "Only I can... because I am the only person who has...",
      },
      {
        key: "completion",
        type: "completion",
        title: "Installation 4 Complete",
      },
    ],
  },
  {
    id: "operate",
    number: 5,
    name: "OPERATE",
    goal: "Install the operating system.",
    instruction:
      "Run every decision through the filter. You are the operating system now.",
    deliverables: [
      "Personal Standards",
      "Decision Filter",
      "Weekly Operating Rhythm",
      "Operating Manual",
    ],
    steps: [
      {
        key: "recap",
        type: "recap",
        title: "The Operating System Is You",
        body: `You have done the work.\n\nYou have installed a vision larger than your current circumstances.\n\nYou have separated your calling from your conditioning.\n\nYou have released what was never yours.\n\nYou have built the architecture of a business that couldn't exist without you.\n\nNow we install the operating system.\n\nThe operating system is not a set of rules you follow.\n\nIt's a set of commitments you have made to yourself — permanently, unconditionally, without exception.\n\nAfter today, every decision you make runs through this filter.\n\nWelcome to the Rare Breed OS™.`,
      },
      {
        key: "standards",
        type: "exercise",
        title: "Your Personal Standards",
        prompt:
          "List 5–10 standards you now operate from. Complete these sentences: \"I do not...\" \"I only...\" \"I always...\" \"I refuse to...\" These are non-negotiable.",
        placeholder:
          "I do not discount my work.\nI only work with women who are ready to change.\nI always charge what my work is actually worth.\nI refuse to shrink my vision to fit someone else's comfort.",
      },
      {
        key: "filter",
        type: "exercise",
        title: "Your Decision Filter",
        prompt:
          "Describe how you will make every major decision from here. What is your first question? What does \"yes\" require? What disqualifies something immediately?",
        placeholder:
          "Every major decision must first pass this question: Does this expand my vision or contract it?\nIf the answer is contract — the answer is no.\nIf it requires someone else's approval — the answer is no.",
      },
      {
        key: "rhythm",
        type: "exercise",
        title: "Your Weekly Operating Rhythm",
        prompt:
          "What does your operating week look like? When do you create? When do you sell? When do you rest? When do you serve? Design it with intention.",
        placeholder:
          "Monday: Deep work / creation\nTuesday–Wednesday: Client work\nThursday: Sales and outreach\nFriday: Review + weekly audit + rest",
      },
      {
        key: "manual",
        type: "exercise",
        title: "Your Operating Manual",
        prompt:
          "Write the rules of your Rare Breed life. This is your constitution — the document your future self returns to when clarity breaks down.",
        placeholder:
          "I am a Rare Breed. This is how I operate:\n\n1. I make decisions from vision, not fear.\n2. I build from genius, not capability alone.\n3. I price from value, not apology.",
      },
      {
        key: "completion",
        type: "completion",
        title: "Operating System Active",
      },
    ],
  },
];

export const DECISION_FILTER_QUESTIONS = [
  {
    key: "q1_expands_vision",
    question: "Does this expand your vision?",
    subtext:
      "Does saying yes take you closer to the woman you described in Installation 1?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "unsure", label: "Unsure" },
      { value: "no", label: "No" },
    ],
  },
  {
    key: "q2_requires_genius",
    question: "Does this require your genius?",
    subtext:
      "Is this work that lives at the intersection of your calling and capability?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "partially", label: "Partially" },
      { value: "no", label: "No" },
    ],
  },
  {
    key: "q3_comfort_or_calling",
    question: "Am I choosing comfort or calling?",
    subtext: "Comfort feels safe. Calling feels alive. Which one is this?",
    options: [
      { value: "calling", label: "Calling" },
      { value: "both", label: "Both" },
      { value: "comfort", label: "Comfort" },
    ],
  },
  {
    key: "q4_self_abandonment",
    question: "Am I abandoning myself?",
    subtext:
      "Would saying yes require you to shrink, edit, or betray what you know to be true?",
    options: [
      { value: "no", label: "No" },
      { value: "maybe", label: "Maybe" },
      { value: "yes", label: "Yes" },
    ],
  },
  {
    key: "q5_future_self",
    question: "Would my future self choose this?",
    subtext:
      "The woman you envisioned in Installation 1 — would she say yes to this?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "unsure", label: "Unsure" },
      { value: "no", label: "No" },
    ],
  },
];

export type FilterAnswer = Record<string, string>;

export function calculateFilterOutput(
  answers: FilterAnswer
): "proceed" | "pause" | "not_yours" {
  const score = [
    answers.q1_expands_vision === "yes"
      ? 2
      : answers.q1_expands_vision === "unsure"
        ? 1
        : 0,
    answers.q2_requires_genius === "yes"
      ? 2
      : answers.q2_requires_genius === "partially"
        ? 1
        : 0,
    answers.q3_comfort_or_calling === "calling"
      ? 2
      : answers.q3_comfort_or_calling === "both"
        ? 1
        : 0,
    answers.q4_self_abandonment === "no"
      ? 2
      : answers.q4_self_abandonment === "maybe"
        ? 1
        : 0,
    answers.q5_future_self === "yes"
      ? 2
      : answers.q5_future_self === "unsure"
        ? 1
        : 0,
  ].reduce((a, b) => a + b, 0);

  if (score >= 8) return "proceed";
  if (score >= 4) return "pause";
  return "not_yours";
}

export const WEEKLY_AUDIT_DIMENSIONS = [
  {
    key: "alignment_score",
    label: "Alignment",
    question: "How aligned were my actions with my vision this week?",
    low: "Scattered",
    high: "Fully aligned",
  },
  {
    key: "energy_score",
    label: "Energy",
    question: "How did my energy feel this week?",
    low: "Depleted",
    high: "Expansive",
  },
  {
    key: "calling_score",
    label: "Calling",
    question:
      "How much of my work this week came from calling rather than obligation?",
    low: "All obligation",
    high: "Pure calling",
  },
  {
    key: "expansion_score",
    label: "Expansion",
    question: "Did I choose expansion or comfort this week?",
    low: "Full comfort",
    high: "Full expansion",
  },
  {
    key: "self_abandonment_score",
    label: "Self-Fidelity",
    question: "How faithful was I to myself this week?",
    low: "Self-abandoned",
    high: "Fully faithful",
  },
];

export const OS_UPDATES = [
  {
    version: "1.2",
    title: "Leadership Update",
    date: "2026-07-01",
    items: [
      "Leadership Update — Decision Filter calibration for scale",
      "Identity Calibration — The woman who leads from the front",
      "Content Challenge — 7 days of calling-first content",
    ],
  },
  {
    version: "1.1",
    title: "Expansion Protocol",
    date: "2026-06-01",
    items: [
      "Pricing Update — Charging from value, not apology",
      "Client Filter — Who gets access to your genius",
      "Offer Architecture — One offer, infinite expansion",
    ],
  },
];
