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
  feedsInto?: string;
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
        name: "What You Actually Want",
        tagline: "Name the work you're good at, the work that lights you up, and the sentences your mind uses to keep you from choosing it. You walk away with your 10X Gap Map.",
        purpose:
          "2x comfort is the business you became exceptional at. 10x calling is the business you're genuinely here to build. Most women never see this distinction clearly—which is why they keep pouring their best energy into work that leaves them capable and depleted at the same time. This module helps you see the gap. Not to shame the life you've built, but to clearly name the one you actually want.",
        danasPrinciple:
          "The biggest risk isn't staying stuck. It's spending another decade becoming exceptional at work you were never meant to build.",
        type: "conversation",
        outputName: "10X Gap Map",
        outputKey: "x_vs_y",
        futureUse: "You'll leave this module seeing the exact gap between the business you're exceptional at and the one you're called to build. The 10X Leap™ reads this report before building your Zone of Genius, so your new operating system knows exactly where the old one stopped.",
        openingQuestion: "Let's start here. Tell me about your current business — what do you sell, and roughly what does each income stream earn? What are you most known for right now?",
        mission: [
          "the work you've become known for vs. the work you were made for",
          "where your Zone of Excellence has been keeping your Zone of Genius trapped",
          "the specific business you're being called to build instead",
        ],
        beginCta: "Begin the Discovery",
        nextDecision: "Am I ready to stop investing in the business I'm good at, and start building the one I'm here for?",
        generatePrompt:
          "I'm ready. Generate my 10X Gap Map based on everything we've discussed.",
        feedsInto: "Module 2 reads your 10X Gap Map to see exactly which revenue streams are funding your freedom, and which ones have been keeping your old life in place.",
      },
      {
        id: "wanted-vs-needed",
        number: 2,
        name: "Wanted vs Needed Money",
        tagline: "See which dollars feel like freedom and which ones cost you yourself. You walk away with your Revenue Integrity Report.",
        purpose:
          "Wanted Money is the revenue that feels like freedom. Needed Money is the revenue you accept to feel safe. Both are real. Neither is wrong. But building a business primarily from Needed Money trains you to stay smaller than you're here to be. This module helps you see exactly where you've been building from fear instead of desire—and what changes when you start choosing from expansion instead.",
        danasPrinciple:
          "Wanted Money expands your future. Needed Money protects your past.",
        type: "conversation",
        outputName: "Revenue Integrity Report",
        outputKey: "revenue_integrity",
        futureUse: "This report becomes your pricing foundation inside Delivered™—every offer you build is filtered through Wanted Money first.",
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
        feedsInto: "Your Revenue Integrity Report flows directly into Module 3, where we audit everything you're still carrying that was never truly yours — so your new business actually has room to run.",
      },
      {
        id: "dead-weight",
        number: 3,
        name: "Everything You're Carrying",
        tagline: "Name the clients, offers, and responsibilities that drain you (and were never fully yours to carry). You walk away with your Dead Weight Audit.",
        purpose:
          "Most women believe growth means adding more. Rare Breed teaches something different: the life and business you want are already underneath the weight of what you've been carrying. This module names what's yours to release—not because it was wrong to carry, but because it's no longer yours. Releasing it with intention, instead of guilt, creates the space your next chapter actually needs.",
        danasPrinciple:
          "The life and business you want aren't built by adding more. They're uncovered by removing everything that isn't truly yours.",
        type: "conversation",
        outputName: "Dead Weight Audit",
        outputKey: "dead_weight",
        futureUse: "Your Dead Weight Audit feeds The 10X Leap™ release engine, where the actual release decisions get made, so nothing from your old system follows you into the new one.",
        openingQuestion: "Let's audit what you're carrying. Start with your clients — who do you serve right now, and which ones would you stop working with tomorrow if money weren't a factor?",
        mission: [
          "which clients you'd stop working with tomorrow if money weren't a factor",
          "which services and obligations were never truly yours to carry",
          "what to release first so your Zone of Genius has room to grow",
        ],
        beginCta: "Audit the Weight",
        nextDecision: "What am I releasing this week—not eventually?",
        generatePrompt:
          "I'm ready. Generate my Dead Weight Audit based on everything we've discussed.",
        feedsInto: "Your Dead Weight Audit feeds Module 4, where we surface exactly where comfort has been quietly making your decisions, and what it's been costing you.",
      },
      {
        id: "comfort-cage",
        number: 4,
        name: "The Comfort Cage",
        tagline: "Find where comfort has been making your decisions, and what it's costing you. You walk away with your Comfort Code.",
        purpose:
          "Comfort doesn't force you to stay. You choose it—repeatedly. And the most sophisticated trap isn't the one that hurts. It's the one that's warm enough to stay in. This module surfaces exactly where comfort has been making your business decisions in place of your calling. Not to make you feel stuck, but to help you clearly see the pattern so you can interrupt it—and start making decisions from where you're going instead of where you've been.",
        danasPrinciple:
          "Every quarter you choose comfort over calling, you become more capable... and less alive.",
        type: "conversation",
        outputName: "Comfort Code",
        outputKey: "comfort_map",
        futureUse: "Your Comfort Code informs your Rare Breed Constitution in The 10X Leap™. It defines the decision filters your new operating system runs from.",
        openingQuestion: "There's a decision you've been sitting with — probably longer than you'd like to admit. You know what it is. What is it?",
        mission: [
          "the specific decision you've been avoiding and why you haven't made it",
          "what comfort has actually been costing you in this season of your business",
          "what becomes available the moment you choose calling over safety",
        ],
        beginCta: "Name What I'm Avoiding",
        nextDecision: "Where am I ready to choose calling over comfort starting now?",
        generatePrompt:
          "I'm ready. Generate my Comfort Code based on everything we've discussed.",
        feedsInto: "Your Comfort Code goes into Module 5, where we name the specific voices you've been unconsciously building your business to please.",
      },
      {
        id: "approval-map",
        number: 5,
        name: "Who You're Being Good For",
        tagline: "Name whose comfort you've been managing, and whose face you see right before you shrink. You walk away with your Approval Code.",
        purpose:
          "Good girl programming is fundamentally about keeping others comfortable at the expense of your own truth. And it runs so quietly you often can't hear it. This module brings it into the light—not to blame anyone, including yourself—but to reclaim the business decisions you've been outsourcing to other people's comfort. The most powerful version of your business was never going to come from their permission.",
        danasPrinciple:
          "The business you're here to build was never going to get made with someone else's permission.",
        type: "conversation",
        outputName: "Approval Code",
        outputKey: "approval_map",
        futureUse: "Your Approval Code flows into your Rare Breed Constitution. It defines the voices you've stopped outsourcing decisions to before Phase Two begins.",
        openingQuestion: "Before you make a big decision in your business, whose face comes to mind? Who are you — consciously or not — asking permission from?",
        mission: [
          "whose opinion has been running your business without your conscious awareness",
          "the specific permission you've been unconsciously waiting to receive",
          "what opens up when you stop outsourcing decisions to other people's comfort",
        ],
        beginCta: "Find the Permission",
        nextDecision: "Where do I stop asking for permission and start trusting myself?",
        generatePrompt:
          "I'm ready. Generate my Approval Code based on everything we've discussed.",
        feedsInto: "Module 6 goes to the deepest layer of the system: your concept of something bigger, and where spirituality itself has been wearing the cage.",
      },
      {
        id: "source-code",
        number: 6,
        name: "Source Code",
        tagline: "Meet the God you've actually been living under, and where spirituality has been wearing the cage. You walk away with your Source Code.",
        purpose:
          "Your self-concept is a direct reflection of the concept you hold of something bigger. A judging, punishing God hands you a judging, punishing inner voice, and the codependent behaviors don't stop with people: you start managing what the bigger thing thinks of you too. Then there's the trickiest part of the trap: fear and codependency dressed up as spirituality. Being righteous. Following other spiritualists' rules. Confusing obedience with alignment. This module brings the deepest layer into the light, because the lock was never in what you're doing. It's in what you've been believing.",
        danasPrinciple:
          "Your concept of God instills your concept of yourself. A judging God hands you a judging inner voice. An observing God creates space for choice.",
        type: "conversation",
        outputName: "Source Code",
        outputKey: "source_code",
        futureUse: "Your Source Code feeds your Good Girl Operating System and your Rare Breed Constitution™. When the deepest layer updates, everything built on top of it updates too.",
        openingQuestion: "Describe the God you've actually been living under. Not the one you believe in on paper. The one your behavior answers to. Judge or observer? Punisher or witness?",
        mission: [
          "the concept of something bigger that's been making your business decisions",
          "where trying to be spiritually good has kept you small, and whose rules you've been following",
          "where you've confused obedience with alignment, and what changes when you trust your own relationship with the divine",
        ],
        beginCta: "Read My Source Code",
        nextDecision: "Which God runs my business from now on?",
        generatePrompt:
          "I'm ready. Generate my Source Code based on everything we've discussed.",
        feedsInto: "Module 7 reads every word you've shared across all six modules to surface the language patterns revealing exactly what you've been believing about what's possible for you.",
      },
      {
        id: "language-detection",
        number: 7,
        name: "The Story You Tell Yourself",
        tagline: "The AI reads every word you've shared and surfaces the beliefs underneath: the shoulds, the needs, the not-yets. You walk away with your Language Pattern Report.",
        purpose:
          "Language is the fingerprint of the operating system. The words you choose—should, need to, can't, responsible, enough—reveal what you believe is true about what's available to you. This module reads everything you've shared across Phase One and surfaces the patterns. Not to make you self-conscious, but to clearly show you which beliefs have been most load-bearing in your current system—and which ones you're ready to replace.",
        type: "synthesis",
        outputName: "Language Pattern Report",
        outputKey: "language_report",
        nextDecision: "Which belief am I most ready to release first?",
        feedsInto: "Your Language Pattern Report feeds the final synthesis in Module 7 — where everything from Phase One comes together into your complete Good Girl Operating System.",
      },
      {
        id: "good-girl-os",
        number: 8,
        name: "Your Good Girl OS",
        tagline: "Every pattern, belief, and approval loop synthesized into one map of the system that's been running you. You walk away with your Good Girl Operating System.",
        purpose:
          "This is the culmination of Phase One. Every pattern from every module synthesized into one clear, personalized document. Your Good Girl Operating System isn't a diagnosis—it's a map. A record of exactly what you've been navigating, and proof that you were never broken. You were just running a system that was never designed to take you where you actually want to go. And now you know exactly what you're releasing before you walk into Phase Two.",
        type: "synthesis",
        outputName: "Good Girl Operating System",
        outputKey: "good_girl_os",
        nextDecision: "I've seen the system. I'm ready to choose a new one.",
        feedsInto: "You've seen the system you're escaping. Module 8 turns the escape into a direction: your 10X goal, the one path that runs through your Zone of Genius, and your Zone of Genius Code™.",
      },
      {
        id: "the-escape",
        number: 9,
        name: "The Escape",
        tagline: "Set the 10X goal only your genius can reach, find the one path to it, and name what you're handing off. You walk away with your Zone of Genius Code™.",
        purpose:
          "A 2x goal has infinite paths, which is why everyone's competing. A 10X goal has only a few, and they all run straight through your Zone of Genius. This module helps you set the goal you're not yet capable of reaching, find the one path that requires your genius, and name what you're handing off so you can stay in your lane. Because staying in your lane is abundance: other unicorns carry the 80% you CAN do, so you can master the work only you can do.",
        danasPrinciple:
          "Confidence is comfort, and comfort is the cage. Courage builds the capabilities as you go.",
        type: "conversation",
        outputName: "Zone of Genius Code™",
        outputKey: "zog_code",
        futureUse: "Your Zone of Genius Code™ is the first thing The 10X Leap™ reads. The Leap designs your complete business around this Code, so you stop recreating the wheel every six months and build the one thing that's actually yours.",
        openingQuestion: "You've seen the system you're escaping. Now let's aim. Where in your business are you choosing confidence over courage right now? Name the decision where you've been waiting to feel ready.",
        mission: [
          "where you've been choosing the proven path over the one that makes you feel most alive",
          "the 10X goal that only your Zone of Genius can reach, and the one path to it",
          "the 80% you're handing off so you can finally stay in your lane",
        ],
        beginCta: "Set My 10X Goal",
        nextDecision: "What would courage choose here?",
        generatePrompt:
          "I'm ready. Generate my Zone of Genius Code™ based on everything we've discussed.",
        feedsInto: "Your Zone of Genius Code™ feeds the final module, where you write your Prison Break Declaration and close for business on everything you've outgrown.",
      },
      {
        id: "declaration",
        number: 10,
        name: "Choose Yourself",
        tagline: "Close for business on being the good girl. Open for what you actually want, no guilt, no apology. You walk away with your Prison Break Declaration, written to be said out loud.",
        purpose:
          "This is the escape made permanent. Everything from Phase One synthesized into one declaration: what you're closed for business on (the dead weight, the codependency, the 2x lane) and what you're now open for (your Zone of Genius, your 10X people, your collaborative edge). Then a statement of who you came here to be. Say it out loud. Hearing your own voice declare it is the point.",
        type: "synthesis",
        outputName: "Prison Break Declaration",
        outputKey: "declaration",
        nextDecision: "Say it out loud. Hear your own voice declare it.",
        feedsInto: "Your Declaration and your Zone of Genius Code™ walk with you into Phase Two, where The 10X Leap™ designs the complete business around who you just declared yourself to be.",
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
        name: "10X Vision",
        tagline: "Define the vision so big the 80% has nowhere to hide. You walk away with your 10X Vision.",
        purpose:
          "The Rare Breed OS starts with a vision so large your current circumstances become irrelevant. Not a goal. A declaration of who you are becoming. So that every decision you make from this point forward is made from where you're going, not from where you currently are.",
        type: "conversation",
        outputName: "10X Vision",
        outputKey: "bigger_vision",
        futureUse: "Your 10X Vision is the north star every Delivered™ Studio reads before generating anything—messaging, offers, content, and launches all point back to where you're going.",
        openingQuestion: "Imagine a specific Tuesday five years from now — an ordinary one, not a highlight reel. Where do you wake up? Who are you with? What does your morning look like?",
        mission: [
          "what your ideal ordinary Tuesday looks like five years from now",
          "the gap between what you say you want and what your current calendar proves",
          "the specific vision that pulls you forward when motivation isn't enough",
        ],
        beginCta: "Build My 10X Vision",
        nextDecision:
          "Am I making decisions from where I am? Or from where I'm going?",
        generatePrompt:
          "I'm ready. Generate my 10X Vision based on everything we've discussed.",
        feedsInto: "Your 10X Vision becomes the north star Module 2 uses to build your Release Plan — identifying everything that has to go to make room for the business you just claimed.",
      },
      {
        id: "release-80",
        number: 2,
        name: "Dead Weight Release Plan",
        tagline: "Every release named, dated, and marked delegate or eliminate. You walk away with your Dead Weight Release Plan.",
        purpose:
          "Phase One identified what you've outgrown. This module decides. Using your Dead Weight Audit, you build a Release Plan and commit to it. So that you enter Phase Two unburdened by what was never yours to carry, and your new operating system has actual room to run.",
        type: "synthesis",
        outputName: "Dead Weight Release Plan",
        outputKey: "release_plan",
        nextDecision: "What am I releasing this week. Not eventually.",
        feedsInto: "With the dead weight cleared, Module 3 builds the operating system you'll make every future decision from: your Rare Breed Constitution™.",
      },
      {
        id: "constitution",
        number: 3,
        name: "Rare Breed Constitution™",
        tagline: "The AI interviews you like Dana would and extracts your principles, standards, and decision filters. You walk away with your Rare Breed Constitution™: the decision filter that makes every hard business call obvious, so you stop second-guessing yourself and run the whole business on your standards instead of everyone else's.",
        purpose:
          "This is the interview. The AI interviews you exactly like Dana Hayes, reflecting patterns, challenging comfort, digging beneath surface answers. So that you leave with your Rare Breed Constitution: a clear, documented operating system you can make decisions from. Starting immediately.",
        type: "context",
        outputName: "Rare Breed Constitution™",
        outputKey: "constitution",
        nextDecision: "Am I making decisions from my old OS or my new one?",
        feedsInto: "Your Constitution is the identity your genius grows from. Module 4 uses it to define your Zone of Genius: the work only you can own.",
      },
      {
        id: "zone-of-genius",
        number: 4,
        name: "Zone of Genius",
        tagline: "The work only you can own, decided once at full depth. You walk away with your Zone of Genius Report.",
        purpose:
          "Your Zone of Genius is the work that expands you while creating the greatest transformation for others: the 2 to 3 activities that are truly yours. With mastery, those activities become a body of work no one could copy, and that work claims a market position no one else could fill. Same decision, full depth, made once, so nothing downstream ever blurs.",
        danasPrinciple:
          "Your Zone of Genius isn't what you're capable of. It's the work that expands you while creating the greatest transformation for others.",
        type: "conversation",
        outputName: "Zone of Genius Report",
        outputKey: "zone_of_genius",
        futureUse: "This report is the DNA of everything Rare Breed OS™ generates: your Dream Client, your Offer Map, and every Studio in the Club reads it before building anything.",
        openingQuestion: "Think about the last time you were doing work that felt completely effortless — like you were built for exactly this. What were you doing, and what made it feel that way?",
        mission: [
          "the 2 to 3 activities that are truly yours (out of ten you think are, seven belong to someone else)",
          "the body of work those activities become: the thread that's been running through your whole life",
          "the position that work claims: a market that didn't exist until you named it",
        ],
        beginCta: "Reveal My Genius",
        nextDecision:
          "What would I build if I fully committed to the work only I can own?",
        generatePrompt:
          "I'm ready. Generate my Zone of Genius Report based on everything we've discussed.",
        feedsInto: "Module 5 turns your genius into the actual business you're here to build: the core concept, the transformation, and the signature mechanism only you run.",
      },
      {
        id: "ten-x-business",
        number: 5,
        name: "10X Business Concept",
        tagline: "Turn your Zone of Genius into the actual business only you could build: the core idea, the transformation, and the mechanism only you run. You walk away with your 10X Business Concept.",
        purpose:
          "Your genius is decided. Now you name the business it's here to build. This is the connective idea between who you are and what you sell: the one clear concept of the business, the transformation it creates and for whom, and the signature mechanism only you run. This is where the real ideation happens, so Delivered has a fully-formed business to bring to life instead of inferring it from pieces.",
        danasPrinciple:
          "You are not here to build a business you're capable of. You are here to build the one only you could.",
        type: "conversation",
        outputName: "10X Business Concept",
        outputKey: "ten_x_business",
        futureUse: "Your 10X Business Concept is the idea every downstream decision serves. Your Dream Client, your Offer Map, and every Studio in Delivered build the business you name here.",
        openingQuestion: "Now that you've named the work only you can do, let's name what it's here to build. In one sentence, if you weren't allowed to be modest: what is the business you're actually here to create?",
        mission: [
          "the core concept of the business, in one clear idea only your genius could produce",
          "the transformation it creates, and the exact person it creates it for",
          "your signature mechanism: the how only you run, that no one could copy",
          "the raw ideation Delivered needs to build it: the ideas, angles, and pieces you can already see",
        ],
        beginCta: "Name the Business",
        nextDecision: "Is this the business only I could build, or one anyone could?",
        generatePrompt:
          "I'm ready. Generate my 10X Business Concept based on everything we've discussed.",
        feedsInto: "Module 6 turns your lived experience into proof: the evidence that makes the business you just named worth premium money.",
      },
      {
        id: "living-proof",
        number: 6,
        name: "Living Proof",
        tagline: "See that your lived experience IS the credential, then capture the evidence that makes your offers worth premium money. You walk away with your Proof.",
        purpose:
          "You don't need permission to charge for what you've walked through. This element does two things at once: it gets you to believe that your experience, your story, and your results are exactly what makes your offers valuable, and it captures the actual evidence so it's ready to sell from. Not fabricated hype. Real proof: the transformation you lived, the results you've created, the receipts. Your walking testimony, on the page.",
        danasPrinciple:
          "You are the proof. Your experience isn't the backstory to the offer. It's the reason the offer is worth paying for.",
        type: "conversation",
        outputName: "Living Proof",
        outputKey: "living_proof",
        futureUse: "Your Proof is what every sales Studio in Delivered reads before it writes: your Sales Page, your Emails, and your Content all build belief from your real evidence, never invented wins.",
        openingQuestion: "Before we gather the evidence, let's name the belief. What have you personally walked through, or figured out, that your dream client is still stuck inside of right now?",
        mission: [
          "the belief that your experience is the credential: that you are the proof your work works",
          "your origin and transformation story: what you walked through and came out holding",
          "your real results and client wins, captured as receipts you can actually sell from",
          "the moments and evidence that make your offers undeniable, saved for every sales asset",
        ],
        beginCta: "Claim My Proof",
        nextDecision: "Do I believe my experience is worth paying for? (It is.)",
        generatePrompt:
          "I'm ready. Generate my Proof based on everything we've discussed.",
        feedsInto: "Module 7 designs the container your business runs inside: the week, the day types, and the calendar your 10X life requires, before any offer gets designed.",
      },
      {
        id: "ten-x-time",
        number: 7,
        name: "10X Time",
        tagline: "Name your day types, design your ideal week, choose your cycle sync. You walk away with your 10X Calendar and the capacity number every offer must obey.",
        purpose:
          "You cannot think 10X thoughts in a 2x schedule. This is where your 10X life physically enters the business design: your days of total disconnect get calendared first, your genius days get protected, and the connective days catch everything else. The week you design here produces one ruthless number, your delivery capacity, and every offer you map next has to fit inside it. Design offers before time and you get the workhorse trap wearing a 10X costume.",
        danasPrinciple: "The space IS the strategy.",
        type: "conversation",
        outputName: "10X Calendar",
        outputKey: "ten_x_calendar",
        futureUse: "Your 10X Calendar governs the Offer Map and every launch the Club ever plans. If a promise doesn't fit the calendar, the promise changes. Never the calendar.",
        openingQuestion: "Before we start — pull up your actual calendar. You'll want it open as we go through this so everything we design is based on reality, not memory. Once you have it in front of you, tell me: how many TRUE free days did you take last quarter? Days with no work of any kind. No email, no voice memos, no 'just one quick thing.'",
        mission: [
          "your three day types, named in YOUR words (this is identity architecture, not time management)",
          "the ideal week that makes 10X possible (not the week you currently have)",
          "whether you want your calendar cycle-synced, so launches ride your power phase instead of fighting it",
          "your delivery capacity: the honest number every offer must fit inside",
        ],
        beginCta: "Design My Week",
        nextDecision: "What gets calendared FIRST from now on?",
        generatePrompt:
          "I'm ready. Generate my 10X Calendar based on everything we've discussed.",
        feedsInto: "With the container built, Module 8 decides exactly who the business serves: your Dream Client Decision.",
      },
      {
        id: "dream-client-decision",
        number: 8,
        name: "Dream Client Decision",
        tagline: "The one woman this business exists to serve, decided once. You walk away with your Dream Client Decision, the page every Club asset gets written to.",
        purpose:
          "This is the decision, not the deep profile (the Club's Dream Client Studio builds that FROM this page). Here you decide, cleanly and finally: the one woman this business exists to serve. She's a 10X unicorn in desire, never a workhorse in need. You'll name who she is, what she already knows, what she's hungry for, and what she'd pay premium money to receive from exactly your genius.",
        type: "conversation",
        outputName: "Dream Client Decision",
        outputKey: "dream_client_decision",
        futureUse: "The Club's Dream Client Studio expands this decision into the full psychological playbook. Every sales page, email, and post gets written to the woman on this page.",
        openingQuestion: "Picture the client who made your work feel effortless. The one you'd clone. Who was she, and what did she come to you already knowing about herself?",
        mission: [
          "the ONE woman this business exists to serve, decided",
          "what she already knows, so you never write to the workhorse again",
          "what she desires and would pay premium for, in her own words",
        ],
        beginCta: "Decide My Dream Client",
        nextDecision: "Does everything I build from here speak to her?",
        generatePrompt:
          "I'm ready. Generate my Dream Client Decision based on everything we've discussed.",
        feedsInto: "Module 9 maps the offers she ascends through: your gumdrop trail, your flagship, and the logic that connects them.",
      },
      {
        id: "offer-map",
        number: 9,
        name: "Offer Ecosystem Map",
        tagline: "Your flagship and your gumdrop trail: names, promises, prices, capacity-checked. You walk away with your Offer Ecosystem Map.",
        purpose:
          "The shape, not the copy (the Club's Studios build every offer out completely). Your flagship gets built from your Zone of Genius, priced from Wanted Money, and checked against your 10X Calendar's capacity number. Your gumdrop trail leads unicorns to it. And the ascension logic makes upgrading structural: each step hands her the exact thing the next step requires.",
        type: "conversation",
        outputName: "Offer Ecosystem Map",
        outputKey: "offer_map",
        futureUse: "The Club's Offer Studio, Sales Page Studio, and Launch Planner all build from this map. You decided the shape once. They build the rooms.",
        openingQuestion: "If your calendar only allowed you to deliver from your Zone of Genius, inside the week you just designed, what's the premium flagship offer you'd anchor this entire business on?",
        mission: [
          "the flagship your genius anchors, priced from Wanted Money and proven to fit your calendar",
          "the gumdrop trail that leads your dream client to it",
          "the ascension logic that makes every next step the obvious one",
        ],
        beginCta: "Map My Offers",
        nextDecision: "Which offer gets designed first, and which gets released?",
        generatePrompt:
          "I'm ready. Generate my Offer Ecosystem Map based on everything we've discussed.",
        feedsInto: "Module 10 captures what no AI can derive: your name, your taste, and your actual voice. The raw material every Studio needs before it writes a word as you.",
      },
      {
        id: "brand-direction",
        number: 10,
        name: "Brand Direction",
        tagline: "The three things no AI can invent: your name, your taste, and your voice. You walk away with your Brand Direction, used by every Studio that writes as you.",
        purpose:
          "The Club's Brand Studio can derive a visual identity from your Zone of Genius. It cannot derive your taste, guess your name decision, or fake your voice. This module captures the raw material: the name call (you or a named brand), the taste map (what you're drawn to, what you refuse), and your real voice (actual samples of how you write and talk). One page each, decided once. Your proof already lives in your Living Proof, so no Studio ever invents a win.",
        type: "conversation",
        outputName: "Brand Direction",
        outputKey: "brand_direction",
        futureUse: "The Brand Studio builds your visual identity from your taste map. Every Studio that writes copy uses your voice markers, and pulls proof only from your Living Proof. Nothing generic, nothing invented.",
        openingQuestion: "First decision: are YOU the brand, or does the brand have its own name? Tell me what already exists (handles, podcast, list, named offers) and which of it feels like you versus a costume you've outgrown.",
        mission: [
          "the name decision, plus what existing brand equity you're keeping, renaming, or releasing",
          "your taste map: what you're drawn to, what you refuse (this is a decision, not a mood board)",
          "your real voice, captured in your own samples so no Studio ever writes generic",
        ],
        beginCta: "Capture My Brand Direction",
        nextDecision: "Would I post what this machine writes without editing it?",
        generatePrompt:
          "I'm ready. Generate my Brand Direction based on everything we've discussed.",
        feedsInto: "Module 11 brings every decision together: your 10X Vision, Rare Breed Constitution, Zone of Genius, the business you're here to build, your Proof, your Calendar, Dream Client, Offer Map, and Brand Direction, synthesized into your X Factor Operating Manual™.",
      },
      {
        id: "operating-manual",
        number: 11,
        name: "X Factor Operating Manual™",
        tagline: "Every decision synthesized into one document. You walk away with your X Factor Operating Manual™: the complete design of your business, ready to plug into the Club.",
        purpose:
          "Bring everything you've created together into one living blueprint — your X Factor Operating Manual™. This becomes the intelligence Rare Breed OS™ uses to generate your messaging, offers, content, launches, and business when you activate it inside Delivered. So that you only have to think deeply once. After that, Rare Breed OS™ brings your business to life from your unique genius — not a blank page.",
        type: "synthesis",
        outputName: "X Factor Operating Manual",
        outputKey: "operating_manual",
        nextDecision:
          "What is the first move I make from this operating manual this week?",
        feedsInto: "Your Operating Manual is the intelligence that powers every Studio in Delivered™. Every builder reads it before generating anything — so you never start from scratch again.",
      },
    ],
  },
  {
    id: "rare-breed-club",
    number: 3,
    name: "Delivered",
    tagline: "Your Operating Manual becomes your business.",
    modules: [
      {
        id: "dream-client",
        number: 1,
        name: "Dream Client + Messaging Studio",
        tagline: "Walk away with her complete psychological playbook AND the messaging built straight from it: her buying triggers, her exact words, your core message, positioning, hooks, and CTAs. Everything you write from here sounds like you're in her head.",
        purpose:
          "Rare Breed OS™ reads your Operating Manual first, then builds your dream client's identity, psychology, buying triggers, and real-world language, and turns that same language into your messaging in one place: core message, problem and desire language in her words, belief shifts, positioning, hooks, and CTAs. So every offer, email, and sales page you build from here speaks directly to the woman already looking for exactly what you do, in words she'd actually use.",
        type: "conversation",
        outputName: "Dream Client + Messaging Playbook",
        outputKey: "dream_client",
        nextDecision: "Does everything I'm building speak directly to this woman, in her words?",
        generatePrompt: "I'm ready. Generate my Dream Client + Messaging Playbook based on everything we've discussed.",
      },
      {
        id: "offer-suite",
        number: 2,
        name: "Offer Studio",
        tagline: "Walk away with every offer on your map fully built: promise, structure, deliverables, and pricing. Priced from Wanted Money, sequenced for ascension.",
        purpose:
          "Not isolated offers. An offer path built from your Zone of Genius and your Dream Client. Priced from Wanted Money. Sequenced for natural ascension. So that your offer suite creates a clear path from where your client is to where she most wants to go—and every price point reflects the transformation, not the hours.",
        type: "conversation",
        outputName: "Offer Playbook",
        outputKey: "offer_suite",
        nextDecision: "What is the first offer I'm building? Or rebuilding?",
        generatePrompt: "I'm ready. Generate my Offer Playbook.",
      },
      {
        id: "framework",
        number: 3,
        name: "Framework Studio",
        tagline: "Walk away with your named IP: the frameworks, models, and methods that make your work impossible to copy and easy to refer by name.",
        purpose:
          "Named frameworks, methods, visual models, metaphors, and teaching tools extracted from your Operating Manual and everything you've built. So that your clients remember how you teach—not just what you taught—and your approach becomes something they refer others to by name. Your IP becomes your competitive moat, and the language your sales pages and content pull from.",
        type: "conversation",
        outputName: "Framework Playbook",
        outputKey: "framework_library",
        nextDecision: "What is the framework that defines my teaching?",
        generatePrompt: "I'm ready. Generate my Framework Playbook.",
      },
      {
        id: "brand",
        number: 4,
        name: "Brand Studio",
        tagline: "Walk away with your complete visual direction: brand playbook, photography brief, and the aesthetic your dream client recognizes in three seconds. Built from your taste map.",
        purpose:
          "Brand playbook, visual direction, photography brief, brand experience, and brand personality. All derived from your Zone of Genius and Operating Manual. So that your visual identity communicates your positioning before a single word is read—and attracts the exact woman you built your offers for. Your brand comes before your sales page on purpose: the page is built from your brand's world, not just your words.",
        type: "conversation",
        outputName: "Brand Playbook",
        outputKey: "brand_blueprint",
        nextDecision: "What is the one brand decision I make this month?",
        generatePrompt: "I'm ready. Generate my Brand Playbook.",
      },
      {
        id: "sales-page",
        number: 5,
        name: "Sales Page Studio",
        tagline: "Walk away with a complete sales page in your voice, built from your dream client's own words and your brand's world. Buying becomes the obvious next step.",
        purpose:
          "Sales page copy built from your Operating Manual, your Dream Client + Messaging Playbook, your Offer, and your Brand. Not from templates. Not from formulas. So that your sales page doesn't read like every other coach's—because it doesn't come from the same place as every other coach's. It comes from you, in your dream client's exact words and your brand's world. And buying feels like the only logical next step.",
        type: "conversation",
        outputName: "Sales Playbook",
        outputKey: "sales_page",
        nextDecision: "Which offer gets its sales page built first?",
        generatePrompt: "I'm ready. Generate my Sales Playbook.",
      },
      {
        id: "website",
        number: 6,
        name: "Website Studio",
        tagline: "Walk away with your complete homepage: every section, all the copy in your voice, and a layout matched to the exact aesthetic you built in your Brand Studio. Ready to hand to a builder or drop into your site.",
        purpose:
          "Your homepage built from your Dream Client + Messaging Playbook, your Offers, and your Brand mood board. Section-by-section structure, full copy in your voice, and visual and layout direction matched to your palette, type, and imagery. So that the second your dream client lands, the words sound like you and the whole page looks like your world—and she knows she's in the right place before she scrolls.",
        type: "conversation",
        outputName: "Homepage Playbook",
        outputKey: "website_blueprint",
        nextDecision: "What is the one thing my homepage makes obvious in three seconds?",
        generatePrompt: "I'm ready. Generate my Homepage Playbook.",
      },
      {
        id: "content-engine",
        number: 7,
        name: "Content + Email Studio",
        tagline: "Walk away with your content pillars, hook library, and 90-day calendar PLUS every email sequence written: welcome, nurture, sales, launch, and re-engagement. You never wonder what to post or send again.",
        purpose:
          "Powered by Paid to Post™. Built from your Brand, Operating Manual, and Dream Client + Messaging Playbook. Content pillars, hook library, 90-day calendar, daily mode protocol, and a weekly evolution process—plus complete email sequences (welcome, nurture, sales, launch, re-engagement) written in her exact language and your belief-shift architecture. So that you never sit down to create content or email without knowing exactly what to say, why it matters, and who it's for—and every post and every send builds toward your next offer.",
        type: "conversation",
        outputName: "Content + Email Playbook",
        outputKey: "content_strategy",
        nextDecision: "What is the one piece of content or email I create this week?",
        generatePrompt: "I'm ready. Generate my Content + Email Playbook.",
      },
      {
        id: "launch-planner",
        number: 8,
        name: "Launch Studio",
        tagline: "Walk away with your complete launch plan: timeline, emails, content, and promotion, sequenced so demand builds before the cart ever opens.",
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
        number: 9,
        name: "Delivered HQ",
        tagline: "Every playbook unified into one living Business Playbook: one source of truth for every decision, hire, and next evolution. You think deeply once.",
        purpose:
          "Every Playbook from every Studio, combined with your Operating Manual, unified into one complete Delivered Business Playbook. Identity, business, marketing, brand, and growth. So that you have one source of truth to hand to a new team member, reference before a major decision, or use as the foundation for your next evolution. You only think deeply once. Everything after builds on it.",
        type: "synthesis",
        outputName: "Delivered Business Playbook",
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
