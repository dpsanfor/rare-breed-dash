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
  futureUse?: string;
  openingQuestion?: string;
  mission?: string[];
  beginCta?: string;
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
    name: "Good Girl Prison Break",
    tagline: "Discover the outdated operating system that has been running your life.",
    modules: [
      {
        id: "x-vs-y",
        number: 1,
        name: "Discover Why Your Calling Still Feels Out of Reach",
        tagline: "See exactly where comfort has been quietly outperforming your deeper vision—and why it isn't your fault or your destiny.",
        purpose:
          "2x comfort is the business you became exceptional at. 10x calling is the business you're genuinely here to build. Most women never see this distinction clearly—which is why they keep pouring their best energy into work that leaves them capable and depleted at the same time. This module helps you see the gap. Not to shame the life you've built, but to clearly name the one you actually want.",
        danasPrinciple:
          "The biggest risk isn't staying stuck. It's spending another decade becoming exceptional at work you were never meant to build.",
        type: "conversation",
        outputName: "Zone of Genius Blueprint™",
        outputKey: "x_vs_y",
        futureUse: "You'll leave this module with a clear picture of the 20% that's uniquely yours to build. This blueprint becomes the foundation for your Bigger Vision, your Rare Breed Operating Manual™, and every business you create from this point forward.",
        openingQuestion: "Let's start here. Tell me about your current business — what do you sell, and roughly what does each income stream earn? What are you most known for right now?",
        mission: [
          "the work you've become known for vs. the work you were made for",
          "where your Zone of Excellence has been keeping your Zone of Genius trapped",
          "the specific business you're being called to build instead",
        ],
        beginCta: "Begin the Discovery",
        nextDecision: "Am I ready to stop investing in the business I'm good at, and start building the one I'm here for?",
        generatePrompt:
          "I'm ready. Generate my Zone of Genius Blueprint™ based on everything we've discussed.",
      },
      {
        id: "wanted-vs-needed",
        number: 2,
        name: "Find Out What Your Business Has Really Been Built to Protect",
        tagline: "Discover whether your business has been optimized for freedom... or for staying safe.",
        purpose:
          "Wanted Money is the revenue that feels like freedom. Needed Money is the revenue you accept to feel safe. Both are real. Neither is wrong. But building a business primarily from Needed Money trains you to stay smaller than you're here to be. This module helps you see exactly where you've been building from fear instead of desire—and what changes when you start choosing from expansion instead.",
        danasPrinciple:
          "Wanted Money expands your future. Needed Money protects your past.",
        type: "conversation",
        outputName: "Revenue Integrity Report",
        outputKey: "revenue_integrity",
        futureUse: "This report becomes your pricing foundation inside Rare Breed Club™—every offer you build is filtered through Wanted Money first.",
        openingQuestion: "Let's map your revenue. Walk me through every way you currently make money — each income stream, roughly what it earns annually, and what percentage of your total it represents.",
        mission: [
          "which income streams are funding your future vs. keeping your old life in place",
          "which revenue requires your time indefinitely and which doesn't",
          "the gap between what you're earning and what your model is actually capable of",
        ],
        beginCta: "Map My Revenue",
        nextDecision: "What changes when I start pricing from expansion instead of protection?",
        generatePrompt:
          "I'm ready. Generate my Revenue Integrity Report based on everything we've discussed.",
      },
      {
        id: "dead-weight",
        number: 3,
        name: "Identify What Your Future Self Has Already Outgrown",
        tagline: "See what you're still carrying simply because it's familiar—not because it belongs in the life you're trying to build.",
        purpose:
          "Most women believe growth means adding more. Rare Breed teaches something different: the life and business you want are already underneath the weight of what you've been carrying. This module names what's yours to release—not because it was wrong to carry, but because it's no longer yours. Releasing it with intention, instead of guilt, creates the space your next chapter actually needs.",
        danasPrinciple:
          "The life and business you want aren't built by adding more. They're uncovered by removing everything that isn't truly yours.",
        type: "conversation",
        outputName: "Release Plan",
        outputKey: "dead_weight",
        futureUse: "Your Release Plan feeds The 10X Leap™ release engine and tells Rare Breed OS™ exactly what you've left behind so nothing from your old system follows you in.",
        openingQuestion: "Let's audit what you're carrying. Start with your clients — who do you serve right now, and which ones would you stop working with tomorrow if money weren't a factor?",
        mission: [
          "which clients you'd stop working with tomorrow if money weren't a factor",
          "which services and obligations were never truly yours to carry",
          "what to release first so your Zone of Genius has room to grow",
        ],
        beginCta: "Audit the Weight",
        nextDecision: "What am I releasing this week—not eventually?",
        generatePrompt:
          "I'm ready. Generate my Release Plan based on everything we've discussed.",
      },
      {
        id: "comfort-cage",
        number: 4,
        name: "Discover Where Comfort Has Been Making Your Decisions",
        tagline: "Pinpoint the places where comfort has quietly become your strategy—and what it's actually costing you.",
        purpose:
          "Comfort doesn't force you to stay. You choose it—repeatedly. And the most sophisticated trap isn't the one that hurts. It's the one that's warm enough to stay in. This module surfaces exactly where comfort has been making your business decisions in place of your calling. Not to make you feel stuck, but to help you clearly see the pattern so you can interrupt it—and start making decisions from where you're going instead of where you've been.",
        danasPrinciple:
          "Every quarter you choose comfort over calling, you become more capable... and less alive.",
        type: "conversation",
        outputName: "Authority Reclaim Map",
        outputKey: "comfort_map",
        futureUse: "Your Authority Reclaim Map informs your Rare Breed Constitution in The 10X Leap™—defining the decision filters your new operating system runs from.",
        openingQuestion: "There's a decision you've been sitting with — probably longer than you'd like to admit. You know what it is. What is it?",
        mission: [
          "the specific decision you've been avoiding and why you haven't made it",
          "what comfort has actually been costing you in this season of your business",
          "what becomes available the moment you choose calling over safety",
        ],
        beginCta: "Name What I'm Avoiding",
        nextDecision: "Where am I ready to choose calling over comfort starting now?",
        generatePrompt:
          "I'm ready. Generate my Authority Reclaim Map based on everything we've discussed.",
      },
      {
        id: "approval-map",
        number: 5,
        name: "Discover Who You've Been Building Your Life to Please",
        tagline: "Identify the voices, expectations, and approval you've been unconsciously prioritizing over your own truth.",
        purpose:
          "Good girl programming is fundamentally about keeping others comfortable at the expense of your own truth. And it runs so quietly you often can't hear it. This module brings it into the light—not to blame anyone, including yourself—but to reclaim the business decisions you've been outsourcing to other people's comfort. The most powerful version of your business was never going to come from their permission.",
        danasPrinciple:
          "The business you're here to build was never going to get made with someone else's permission.",
        type: "conversation",
        outputName: "Permission Reclaim Map",
        outputKey: "approval_map",
        futureUse: "Your Permission Reclaim Map flows into your Rare Breed Constitution—defining the voices you've stopped outsourcing decisions to before Phase Two begins.",
        openingQuestion: "Before you make a big decision in your business, whose face comes to mind? Who are you — consciously or not — asking permission from?",
        mission: [
          "whose opinion has been running your business without your conscious awareness",
          "the specific permission you've been unconsciously waiting to receive",
          "what opens up when you stop outsourcing decisions to other people's comfort",
        ],
        beginCta: "Find the Permission",
        nextDecision: "Where do I stop asking for permission and start trusting myself?",
        generatePrompt:
          "I'm ready. Generate my Permission Reclaim Map based on everything we've discussed.",
      },
      {
        id: "language-detection",
        number: 6,
        name: "Discover the Story Your Words Have Been Telling",
        tagline: "The language you repeat every day reveals the operating system underneath. Learn to hear what you've been unconsciously reinforcing.",
        purpose:
          "Language is the fingerprint of the operating system. The words you choose—should, need to, can't, responsible, enough—reveal what you believe is true about what's available to you. This module reads everything you've shared across Phase One and surfaces the patterns. Not to make you self-conscious, but to clearly show you which beliefs have been most load-bearing in your current system—and which ones you're ready to replace.",
        type: "synthesis",
        outputName: "Language Pattern Report",
        outputKey: "language_report",
        nextDecision: "Which belief am I most ready to release first?",
      },
      {
        id: "good-girl-os",
        number: 7,
        name: "See the Complete Operating System You've Been Living From",
        tagline: "Every pattern, belief, approval loop, and comfort strategy brought together into one complete map—so you can finally choose a different future.",
        purpose:
          "This is the culmination of Phase One. Every pattern from every module synthesized into one clear, personalized document. Your Good Girl Operating System isn't a diagnosis—it's a map. A record of exactly what you've been navigating, and proof that you were never broken. You were just running a system that was never designed to take you where you actually want to go. And now you know exactly what you're releasing before you walk into Phase Two.",
        type: "synthesis",
        outputName: "Good Girl Operating System",
        outputKey: "good_girl_os",
        nextDecision: "I've seen the system. I'm ready to choose a new one.",
      },
    ],
  },
  {
    id: "ten-x-leap",
    number: 2,
    name: "The 10X Leap",
    tagline: "Install the operating system your calling has been waiting for.",
    modules: [
      {
        id: "bigger-vision",
        number: 1,
        name: "Finally Know Where You're Going",
        tagline: "Build a Bigger Vision™ so clear every business decision becomes easier.",
        purpose:
          "The Rare Breed OS starts with a vision so large your current circumstances become irrelevant. Not a goal. A declaration of who you are becoming. So that every decision you make from this point forward is made from where you're going, not from where you currently are.",
        type: "conversation",
        outputName: "Vision Document",
        outputKey: "bigger_vision",
        futureUse: "Your Vision Document is the north star every Rare Breed Club™ Studio reads before generating anything—messaging, offers, content, and launches all point back to where you're going.",
        openingQuestion: "Imagine a specific Tuesday five years from now — an ordinary one, not a highlight reel. Where do you wake up? Who are you with? What does your morning look like?",
        mission: [
          "what your ideal ordinary Tuesday looks like five years from now",
          "the gap between what you say you want and what your current calendar proves",
          "the specific vision that pulls you forward when motivation isn't enough",
        ],
        beginCta: "Build My Vision",
        nextDecision:
          "Am I making decisions from where I am? Or from where I'm going?",
        generatePrompt:
          "I'm ready. Generate my Vision Document based on everything we've discussed.",
      },
      {
        id: "release-80",
        number: 2,
        name: "Make Space For The Business You Actually Want",
        tagline: "Turn your Dead Weight Audit into the release plan that makes room for what's next.",
        purpose:
          "Phase One identified what you've outgrown. This module decides. Using your Dead Weight Audit, you build a Release Plan and commit to it. So that you enter Phase Two unburdened by what was never yours to carry, and your new operating system has actual room to run.",
        type: "synthesis",
        outputName: "Release Plan",
        outputKey: "release_plan",
        nextDecision: "What am I releasing this week. Not eventually.",
      },
      {
        id: "constitution",
        number: 3,
        name: "Become The Founder Your Bigger Vision Requires",
        tagline: "Develop your Rare Breed Constitution™—the operating system your future business will be built from.",
        purpose:
          "This is the interview. The AI interviews you exactly like Dana Hayes, reflecting patterns, challenging comfort, digging beneath surface answers. So that you leave with your Rare Breed Constitution: a clear, documented operating system you can make decisions from. Starting immediately.",
        type: "context",
        outputName: "Rare Breed Constitution",
        outputKey: "constitution",
        nextDecision: "Am I making decisions from my old OS or my new one?",
      },
      {
        id: "magic-gumdrop",
        number: 4,
        name: "Create The Work People Couldn't Get Anywhere Else",
        tagline: "Define your Magic Gumdrop™—the body of work only you could create.",
        purpose:
          "This module happens after the Constitution because you answer from your new identity, not your conditioned one. The Magic Gumdrop is your unique body of work: why it matters, who it's for, why it can't be copied. So that you can build from that place and stop explaining why your work doesn't look like everyone else's.",
        type: "conversation",
        outputName: "Magic Gumdrop",
        outputKey: "magic_gumdrop",
        futureUse: "Rare Breed OS™ reads your Magic Gumdrop before generating any messaging, offer, or content. It is the central idea every Studio builds from.",
        openingQuestion: "I'm going to find the thread that's been following you your entire life. Start here: what topic could you study forever? What conversation never gets old, no matter how many times you've had it?",
        mission: [
          "the single thread that has been running through your life since the beginning",
          "the intersection of obsession, calling, and irreplaceable perspective that is yours alone",
          "the body of work that belongs only to you and no one else could replicate",
        ],
        beginCta: "Find My Thread",
        nextDecision: "What is the one thing I keep trying to build around?",
        generatePrompt: "I'm ready. Generate my Magic Gumdrop based on everything we've discussed.",
      },
      {
        id: "zone-of-genius",
        number: 5,
        name: "Build The Business You'll Still Love Ten Years From Now",
        tagline: "Find the intersection of your Zone of Genius, fulfillment, transformation, and sustainable growth.",
        purpose:
          "Your Zone of Genius is not what you're capable of. It's the work that expands you while creating the greatest transformation for others. This engine finds where your energy, your calling, and your irreplaceable perspective converge. So that you stop underpricing your capability and start selling from what actually makes you irreplaceable.",
        danasPrinciple:
          "Your Zone of Genius isn't what you're capable of. It's the work that expands you while creating the greatest transformation for others.",
        type: "conversation",
        outputName: "Zone of Genius Report",
        outputKey: "zone_of_genius",
        futureUse: "Your Zone of Genius Report informs your Offer Suite, Curriculum, Framework, and every Rare Breed Club™ Studio—it's the filter that keeps everything you build aligned with your highest leverage.",
        openingQuestion: "Think about the last time you were doing work that felt completely effortless — like you were built for exactly this. What were you doing, and what made it feel that way?",
        mission: [
          "the work that feels completely effortless while producing your most powerful results",
          "the exact difference between your Zone of Excellence and your Zone of Genius",
          "where your energy and your clients' transformation multiply at the same time",
        ],
        beginCta: "Reveal My Genius",
        nextDecision:
          "What would I build if I fully committed to my zone of genius?",
        generatePrompt:
          "I'm ready. Generate my Zone of Genius Report based on everything we've discussed.",
      },
      {
        id: "category-of-one",
        number: 6,
        name: "Become Impossible To Compare",
        tagline: "Create your Category of One™ so people stop comparing you to everyone else.",
        purpose:
          "Category of One is not a niche. It's a movement. An industry position so specifically yours that no one else could fill it. So that you stop competing on price and comparison, and start leading a market that didn't fully exist until you named it.",
        type: "conversation",
        outputName: "Category of One",
        outputKey: "category_one",
        futureUse: "Your Category of One becomes the positioning layer Rare Breed OS™ applies to every sales page, email sequence, and launch strategy—making your work unmistakable before a single word is written.",
        openingQuestion: "Tell me the industry you believe you're changing — then tell me what frustrates you most about how everyone else in it operates.",
        mission: [
          "the industry you're actually changing and what frustrates you most about how others operate in it",
          "what makes your approach fundamentally different from everyone else in your space",
          "the category you're creating rather than competing inside of",
        ],
        beginCta: "Define My Category",
        nextDecision:
          "What would I be building if I stopped competing and started leading?",
        generatePrompt: "I'm ready. Generate my Category of One based on everything we've discussed.",
      },
      {
        id: "operating-manual",
        number: 7,
        name: "Walk Away Knowing Exactly What You're Building",
        tagline: "Bring everything you've created together into your Rare Breed Operating Manual™—the blueprint you'll plug into Rare Breed OS™ to bring your business to life in Phase Three.",
        purpose:
          "Bring everything you've created together into one living blueprint — your Rare Breed Operating Manual™. This becomes the intelligence Rare Breed OS™ uses to generate your messaging, offers, content, launches, and business when you activate it inside Rare Breed Club. So that you only have to think deeply once. After that, Rare Breed OS™ brings your business to life from your unique genius — not a blank page.",
        type: "synthesis",
        outputName: "Rare Breed Operating Manual",
        outputKey: "operating_manual",
        nextDecision:
          "What is the first move I make from this operating manual this week?",
      },
    ],
  },
  {
    id: "rare-breed-club",
    number: 3,
    name: "Rare Breed Club",
    tagline: "Your Operating Manual becomes your business.",
    modules: [
      {
        id: "dream-client",
        number: 1,
        name: "Create messaging that makes your dream client think, 'She's in my head.'",
        tagline: "Build a complete psychological profile of the woman you exist to serve—so every piece of content, every offer, and every sales page feels like it was written just for her.",
        purpose:
          "Rare Breed OS™ reads your Operating Manual before asking a single question. Then it extracts the identity, psychology, buying triggers, emotional language, and transformation desires of your dream client—so that every offer, email, and sales page you build from here speaks directly to the woman who is already looking for exactly what you do. So that you stop trying to write for everyone and start writing for her.",
        type: "conversation",
        outputName: "Dream Client Playbook",
        outputKey: "dream_client",
        nextDecision: "Does everything I'm building speak directly to this woman?",
        generatePrompt: "I'm ready. Generate my Dream Client Playbook based on everything we've discussed.",
      },
      {
        id: "messaging",
        number: 2,
        name: "Become the only obvious choice for the clients you actually want.",
        tagline: "Turn your philosophy into messaging that stops the scroll, builds instant trust, and makes your dream clients feel like they've finally found the person who gets them.",
        purpose:
          "Built from your Operating Manual and Dream Client Playbook—not from copywriting formulas. Core messaging, positioning statement, messaging pillars, website copy, and bio. So that your dream client reads one sentence from you and thinks: she's talking directly to me. And your competitors become irrelevant before she finishes reading.",
        type: "conversation",
        outputName: "Messaging Playbook",
        outputKey: "messaging_blueprint",
        nextDecision: "What is the one message I lead with everywhere?",
        generatePrompt: "I'm ready. Generate my Messaging Playbook.",
      },
      {
        id: "offer-suite",
        number: 3,
        name: "Create premium offers your dream clients want before you ever pitch them.",
        tagline: "Design an offer suite built from your Zone of Genius—so selling feels like an invitation instead of a performance.",
        purpose:
          "Not isolated offers. An offer journey built from your Magic Gumdrop, Zone of Genius, and Dream Client. Priced from Wanted Money. Sequenced for natural ascension. So that your offer suite creates a clear path from where your client is to where she most wants to go—and every price point reflects the transformation, not the hours.",
        type: "conversation",
        outputName: "Offer Playbook",
        outputKey: "offer_suite",
        nextDecision: "What is the first offer I'm building? Or rebuilding?",
        generatePrompt: "I'm ready. Generate my Offer Playbook.",
      },
      {
        id: "curriculum",
        number: 4,
        name: "Turn what you know into transformations your clients can't stop talking about.",
        tagline: "Transform your lived experience into a clear, repeatable methodology that creates lasting results instead of information overload.",
        purpose:
          "Not information organized into modules. A transformation arc built from your lived teaching and Zone of Genius. Frameworks, milestones, exercises, and identity shifts sequenced to create real capability—not just awareness. So that your clients don't just learn from you. They are changed by you. And you can articulate exactly how.",
        type: "conversation",
        outputName: "Curriculum Playbook",
        outputKey: "signature_curriculum",
        nextDecision: "What is the core transformation my curriculum produces?",
        generatePrompt: "I'm ready. Generate my Curriculum Playbook.",
      },
      {
        id: "framework",
        number: 5,
        name: "Become known for work that couldn't belong to anyone else.",
        tagline: "Name, organize, and protect the ideas, methods, and frameworks that make your business impossible to commoditize.",
        purpose:
          "Named frameworks, methods, visual models, metaphors, and teaching tools extracted from your Operating Manual and everything you've built. So that your clients remember how you teach—not just what you taught—and your approach becomes something they refer others to by name. Your IP becomes your competitive moat.",
        type: "conversation",
        outputName: "Framework Playbook",
        outputKey: "framework_library",
        nextDecision: "What is the framework that defines my teaching?",
        generatePrompt: "I'm ready. Generate my Framework Playbook.",
      },
      {
        id: "gumdrop-test-kitchen",
        number: 6,
        name: "Know your positioning is working before you bet your business on it.",
        tagline: "Use Gumdrop Trails™ to test your messaging, positioning, and offers in the real world—so you build from evidence instead of endless guessing.",
        purpose:
          "Every launch should produce two equally valuable outcomes: Revenue and Intelligence. The Gumdrop Test Kitchen is your market intelligence engine. You design intentional experiments from your existing Zone of Genius, run them, and conduct a Post-Gumdrop Intelligence Review after each one. So that every campaign sharpens your Dream Client, Messaging, Offer, and Content Playbooks—and your next launch is always smarter than your last.",
        type: "conversation",
        outputName: "Gumdrop Intelligence Report",
        outputKey: "gumdrop_kitchen",
        nextDecision: "What did this Gumdrop teach me about what my market actually wants?",
        generatePrompt: "I'm ready. Generate my Gumdrop Intelligence Report.",
      },
      {
        id: "sales-page",
        number: 7,
        name: "Write a sales page that makes buying feel like the obvious next step.",
        tagline: "Built from your dream client's language, your philosophy, and the belief shifts that naturally lead to a confident yes.",
        purpose:
          "Sales page copy built from your Operating Manual, Dream Client Playbook, Messaging Playbook, and Offer. Not from templates. Not from formulas. So that your sales page doesn't read like every other coach's—because it doesn't come from the same place as every other coach's. It comes from you. And buying feels like the only logical next step.",
        type: "conversation",
        outputName: "Sales Playbook",
        outputKey: "sales_page",
        nextDecision: "Which offer gets its sales page built first?",
        generatePrompt: "I'm ready. Generate my Sales Playbook.",
      },
      {
        id: "email",
        number: 8,
        name: "Write emails your dream clients actually look forward to opening.",
        tagline: "Welcome, nurture, launch, and sales sequences built from the conversations already happening inside your dream client's mind.",
        purpose:
          "Complete email sequences built from your Dream Client's exact language and your Messaging Playbook's belief-shift architecture. Welcome. Nurture. Sales. Launch. Re-engagement. Story. So that every email you send makes your reader feel understood before she ever clicks a link—and your inbox becomes one of the most trusted places in her week.",
        type: "conversation",
        outputName: "Email Playbook",
        outputKey: "email_playbook",
        nextDecision: "Which sequence do I build and send first?",
        generatePrompt: "I'm ready. Generate my Email Playbook.",
      },
      {
        id: "content-engine",
        number: 9,
        name: "Never wonder what to post again.",
        tagline: "Generate months of strategic content from your Operating Manual™ so every post attracts the right people, builds demand, and eliminates the blank page.",
        purpose:
          "Powered by Paid to Post™. Built from your Brand Voice, Operating Manual, Dream Client Playbook, and Messaging Playbook. Content pillars, hook library, 90-day calendar, daily mode protocol, and a weekly evolution process. So that you never sit down to create content without knowing exactly what to say, why it matters, and who it's for—and every post builds toward your next offer.",
        type: "conversation",
        outputName: "Content Playbook",
        outputKey: "content_strategy",
        nextDecision: "What is the one piece of content I create this week?",
        generatePrompt: "I'm ready. Generate my Content Playbook.",
      },
      {
        id: "brand",
        number: 10,
        name: "Create a brand that feels as unforgettable as the work you do.",
        tagline: "Translate your philosophy, positioning, and personality into a visual identity your dream clients instantly recognize and remember.",
        purpose:
          "Brand playbook, visual direction, photography brief, brand experience, and brand personality. All derived from your Category of One and Operating Manual. So that your visual identity communicates your positioning before a single word is read—and attracts the exact woman you built your offers for.",
        type: "conversation",
        outputName: "Brand Playbook",
        outputKey: "brand_blueprint",
        nextDecision: "What is the one brand decision I make this month?",
        generatePrompt: "I'm ready. Generate my Brand Playbook.",
      },
      {
        id: "launch-planner",
        number: 11,
        name: "Create demand before you ever open your cart.",
        tagline: "Generate your complete launch strategy, emails, content, timeline, and promotions from your Operating Manual™ so people are already waiting to buy before enrollment begins.",
        purpose:
          "Complete launch playbook, sequencing, messaging calendar, and content plan—all derived from your offer, your dream client, and your messaging. So that your launch builds belief and demand in the weeks before you sell, your dream client is already sold before cart opens, and you spend launch week showing up instead of scrambling.",
        type: "conversation",
        outputName: "Launch Playbook",
        outputKey: "launch_blueprint",
        nextDecision: "What is the first launch I'm building toward?",
        generatePrompt: "I'm ready. Generate my Launch Playbook.",
      },
      {
        id: "rare-breed-hq",
        number: 12,
        name: "Run your entire business from one living Operating Manual.",
        tagline: "Every strategy, playbook, asset, launch, and business decision connected in one evolving system that grows alongside you—so you never start from scratch again.",
        purpose:
          "Every Playbook from every Studio, combined with your Operating Manual, unified into one complete Rare Breed Business Playbook. Identity, business, marketing, brand, and growth. So that you have one source of truth to hand to a new team member, reference before a major decision, or use as the foundation for your next evolution. You only think deeply once. Everything after builds on it.",
        type: "synthesis",
        outputName: "Rare Breed Business Playbook",
        outputKey: "business_blueprint",
        nextDecision: "What is the first move I make from this playbook?",
      },
    ],
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
