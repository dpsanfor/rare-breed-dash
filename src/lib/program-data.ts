export type ModuleType = "context" | "conversation" | "synthesis" | "anchor";

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
        id: "zog-anchor",
        number: 1,
        name: "Zone of Genius Code",
        tagline: "Your Zone of Genius Code from Good Girl Prison Break — the lens every element of the 10X Leap is built through.",
        purpose:
          "Before you design anything, your Zone of Genius Code gets installed as the filter. Every answer you give in the 10X Leap runs through it. This is not a conversation — it is the anchor. Your AI has already read your Code. It will use it to catch you any time you drift back toward your Zone of Excellence, and to confirm when your answers are coming from your genius instead of your capability.",
        type: "anchor",
        nextDecision: "Am I building from my genius or from what I'm capable of?",
        feedsInto: "Your Zone of Genius Code is the lens every element is built through. Element 2 begins your 10X Vision — the destination your genius is here to reach.",
      },
      {
        id: "bigger-vision",
        number: 2,
        name: "10X Vision",
        tagline: "The vision so large you are not yet capable of achieving it — and that is exactly the point. You walk away with your 10X Vision.",
        purpose:
          "A 10X Vision is not ten times more work. It is ten times bigger. If you feel like you could achieve it, it is not a 10X Vision — it is a 2X goal dressed up in big-vision language. The whole point of the 10X Vision is that it has only one path: your Zone of Genius path. You cannot hustle your way to a 10X Vision. You cannot manage your way to it. You can only grow into the person capable of it — and the only way to grow into that person is to commit fully to the work only you were made to do.",
        danasPrinciple:
          "If you can already see the path to your goal, it is not a 10X goal. A real 10X goal has one path — and that path runs straight through your Zone of Genius.",
        type: "conversation",
        outputName: "10X Vision",
        outputKey: "bigger_vision",
        futureUse: "Your 10X Vision is the north star every element of the 10X Leap is built toward. It is the destination that makes every release, every standard, and every offer decision obvious.",
        openingQuestion: "Before we build anything — I want to understand the vision. Not the goal you think is achievable. Not the number that feels safe. I want to know: what does your life look like if everything works? Give me the most specific version of that you can. What are you doing, where are you, who are you with, and what have you built?",
        mission: [
          "a vision so large it requires her to become someone she is not yet — that is the test",
          "measurable goals that are 10X bigger than what she thinks is possible (if she names $100k, push to $1M)",
          "the one path to this vision: her Zone of Genius, fully committed to, nothing else",
        ],
        beginCta: "Build My 10X Vision",
        nextDecision:
          "Is this vision big enough that I have no idea how I would achieve it? Good. That means it's the right one.",
        generatePrompt:
          "I'm ready. Generate my 10X Vision based on everything we've discussed.",
        feedsInto: "Your 10X Vision becomes the north star Element 3 uses to build your 10X Release Plan — identifying everything that has to go to make room for the business you're actually here to create.",
      },
      {
        id: "release-80",
        number: 3,
        name: "10X Release Plan",
        tagline: "Every release named, dated, and marked delegate or eliminate. You walk away with your 10X Release Plan.",
        purpose:
          "Phase One identified what you've outgrown. This element decides. Using your Dead Weight Audit and your 10X Vision, you build a Release Plan and commit to it — not eventually, now. So that you enter the business design phase unburdened by what was never yours to carry. And as you move through every element that follows, you will be reminded of what you committed to releasing, so it does not accidentally end up back on your plate as you design.",
        type: "synthesis",
        outputName: "10X Release Plan",
        outputKey: "release_plan",
        nextDecision: "What am I releasing this week. Not eventually.",
        feedsInto: "With the dead weight cleared, Element 4 builds the operating system you will make every future decision from: your 10X Constitution™.",
      },
      {
        id: "constitution",
        number: 4,
        name: "10X Constitution™",
        tagline: "The AI interviews you like Dana would and extracts your principles, standards, and decision filters. You walk away with your 10X Constitution™: the decision filter that makes every hard business call obvious.",
        purpose:
          "This is the interview. The AI interviews you exactly like Dana Hayes, reflecting patterns, challenging comfort, digging beneath surface answers. The 10X Constitution is not a list of nice values — it is the operating system you use to make every business decision from this point forward. It names who you are becoming in order to achieve your 10X Vision, and it draws the line on what you will and will not accept from yourself, your clients, and your business. Starting immediately.",
        type: "context",
        outputName: "10X Constitution™",
        outputKey: "constitution",
        nextDecision: "Am I making decisions from my old OS or my new one?",
        feedsInto: "Your 10X Constitution is the identity your genius grows from. Element 5 uses it to define your Zone of Genius: the work only you can own.",
      },
      {
        id: "zone-of-genius",
        number: 5,
        name: "10X Zone of Genius",
        tagline: "Identify the work that makes you feel most alive and that you could do all day without getting tired. You walk away with your 10X Zone of Genius Report.",
        purpose:
          "Your Zone of Genius is not what you are capable of. It is not your Zone of Excellence — the place where you are so good at something that you stay trapped in it. Your Zone of Genius is the work you were made for: the thing you could do for long stretches without getting tired or bored, the work that produces enormous value almost effortlessly, the unique ability that — when fully realized — changes everything for you and everyone you serve. This element helps you find it, name it, and commit to it. Clarity comes over time, as long as you stay dedicated to dropping the 80% that no longer serves you and reflecting on where your unique abilities truly lie.",
        danasPrinciple:
          "Your Zone of Genius isn't what you're capable of. It's the work that expands you while creating the greatest transformation for others — and you could do it all day without ever getting tired.",
        type: "conversation",
        outputName: "10X Zone of Genius Report",
        outputKey: "zone_of_genius",
        futureUse: "Your Zone of Genius Report is the DNA of your entire business design. Every element that follows is built through this lens — your X Factor, your Dream Client, your offers, your brand. Nothing gets built outside of it.",
        openingQuestion: "Let me ask you this: if it weren't for [something in your life right now], you could be doing what you really want to do. What is that something? And more importantly — what is the thing you would actually be doing?",
        mission: [
          "the work she most loves to do — she can do it for long stretches without getting tired or bored",
          "the work that doesn't feel like work — she could do it all day and never feel depleted",
          "what produces the highest ratio of value and aliveness to time spent — even 10 minutes of it can lead to something enormous",
          "her unique ability — the specific gift that, fully realized, creates extraordinary value",
          "the completion: I'm at my best when [blank] / the exact thing I'm doing is [blank] / the thing I love most about it is [blank]",
        ],
        beginCta: "Reveal My Genius",
        nextDecision:
          "Am I building from my Zone of Genius, or from what I'm capable of?",
        generatePrompt:
          "I'm ready. Generate my 10X Zone of Genius Report based on everything we've discussed.",
        feedsInto: "Element 6 turns your Zone of Genius into your X Factor: the unique way you apply your genius to business that makes you impossible to compete with.",
      },
      {
        id: "ten-x-business",
        number: 6,
        name: "10X Business Concept",
        tagline: "Name your X Factor: how you uniquely apply your Zone of Genius to business. You walk away with your 10X Business Concept.",
        purpose:
          "Your Zone of Genius is what you could do all day — what you are here to do. Your X Factor is how you actually apply your Zone of Genius to business: what you do, how you do it, who you do it for, and why you do it. That combination — your genius applied in your specific way to a specific person for a specific reason — is what makes you impossible to compete with. Nobody else does it like this. This element names your X Factor precisely, so that every offer, every piece of content, and every client conversation comes from the clearest possible source.",
        danasPrinciple:
          "Your Zone of Genius is what you were made to do. Your X Factor is what happens when you apply it to the world in the way only you could.",
        type: "conversation",
        outputName: "10X Business Concept",
        outputKey: "ten_x_business",
        futureUse: "Your 10X Business Concept is the X Factor that every downstream decision serves. Your Dream Client, your Offer Ecosystem, your Brand Direction — everything builds from the unique way you named it here.",
        openingQuestion: "You have named the work only you can do. Now let's name what happens when you apply it. Your Zone of Genius is [reference her actual Zone of Genius from Element 5]. The question is: what does it look like when you apply that genius to business, for a specific type of person, in the specific way only you would do it? What is the business that comes from that?",
        mission: [
          "the distinction between Zone of Genius (what she does) and X Factor (how she applies it, who for, why)",
          "her X Factor: the unique application of her genius that makes her impossible to replicate",
          "the specific outcome she creates, for a specific person, through her specific approach",
          "the business concept that emerges from her X Factor — in one clear, uncommonly specific statement",
        ],
        beginCta: "Name My X Factor",
        nextDecision: "Is this the business only I could build — or one anyone could?",
        generatePrompt:
          "I'm ready. Generate my 10X Business Concept based on everything we've discussed.",
        feedsInto: "Element 7 decides who receives the most value from your X Factor right now — the person already ready to say yes.",
      },
      {
        id: "dream-client-decision",
        number: 7,
        name: "10X Dream Client",
        tagline: "The one person who finds your X Factor most valuable right now — not eventually. You walk away with your 10X Dream Client.",
        purpose:
          "This is about who is ready for your X Factor TODAY. Not the person who will eventually be ready. Not the person you would love to work with someday. The person who — right now — hears what you do and says: this is exactly what I have been looking for. She already has a 10X dream. She is already willing to invest in herself. She already knows that comfort is what has been keeping her stuck. She is not going to argue for her limitations or explain why it might not work. She is ready to drop the 2X delusion and commit to the one path that actually leads where she wants to go. Who is that person for you — and what does your X Factor do for her specifically?",
        danasPrinciple:
          "Your dream client is not the person who will eventually be ready. She is the person who looks at your X Factor right now and says: where do I sign.",
        type: "conversation",
        outputName: "10X Dream Client",
        outputKey: "dream_client_decision",
        futureUse: "Every element downstream is designed for this specific person. Your offers, your calendar, your brand — all of it gets built with her in mind.",
        openingQuestion: "I want you to think about the client who made your work feel completely right. The one where you thought — if I could clone her, I would. Who was she? What did she already believe when she came to you, and what was she willing to do that most of your other clients weren't?",
        mission: [
          "who finds her X Factor most valuable TODAY — not eventually, right now",
          "what this person already believes and is already willing to do (she has dropped the 2X delusion)",
          "what her 10X dream is, and why your genius is the one path she needs to get there",
          "the specific reason this person says yes immediately — the exact thing that makes her say this is for me",
        ],
        beginCta: "Decide My Dream Client",
        nextDecision: "Does everything I build from here speak to her — the one who is already ready?",
        generatePrompt:
          "I'm ready. Generate my 10X Dream Client based on everything we've discussed.",
        feedsInto: "Element 8 designs the calendar that gives your genius room to run — the 10X Timeline that makes everything sustainable.",
      },
      {
        id: "ten-x-time",
        number: 8,
        name: "10X Timeline",
        tagline: "Design the calendar that makes 10X sustainable. You walk away with your 10X Calendar and the capacity number every offer must obey.",
        purpose:
          "You cannot think 10X thoughts in a 2X schedule. This is where your 10X life physically enters the business design. Self-sustainability is the name of this entire game — because what is the point of a 10X business if it runs you into the ground? Your effectiveness comes from your recovery time. Recovery creates efficiency. Efficiency means it actually takes you less time to make enormous leaps. You work 10X smarter, not 10X harder — by focusing on the 20% Zone of Genius work and releasing the rest. Your day types get named in YOUR words. Disconnect days get calendared first. Genius days get protected. The week you design here produces one number — your delivery capacity — and every offer you map next has to fit inside it.",
        danasPrinciple: "The space IS the strategy. Recovery is not a reward for hard work. It is the source of it.",
        type: "conversation",
        outputName: "10X Calendar",
        outputKey: "ten_x_calendar",
        futureUse: "Your 10X Calendar governs every offer and every launch. If a promise doesn't fit the calendar, the promise changes. Never the calendar.",
        openingQuestion: "Before we start — pull up your actual calendar. You'll want it open as we go through this so everything we design is based on reality, not memory. Once you have it in front of you, tell me: how many TRUE free days did you take last quarter? Days with no work of any kind. No email, no voice memos, no 'just one quick thing.'",
        mission: [
          "her day types, named in HER words — full disconnect, genius/creation, performance/visibility, CEO/operations",
          "the ideal week that makes 10X sustainable (not the week she currently has)",
          "her cycle map (optional): four phase names, what each phase holds, the rule that high-output work rides her high-energy phase",
          "her delivery capacity: the honest number every offer must fit inside — working smarter, not harder",
        ],
        beginCta: "Design My Week",
        nextDecision: "What gets calendared FIRST from now on — and what never gets scheduled on a Genius Day again?",
        generatePrompt:
          "I'm ready. Generate my 10X Calendar based on everything we've discussed.",
        feedsInto: "With the container built, Element 9 maps the offers your Dream Client ascends through — designed to keep you in your Zone of Genius as much as possible.",
      },
      {
        id: "offer-map",
        number: 9,
        name: "10X Offer Ecosystem",
        tagline: "Design the offers that deliver your genius sustainably. You walk away with your 10X Offer Ecosystem.",
        purpose:
          "This is not about building the most impressive offer list. This is about designing a way of delivering your genius that is so sustainable, so aligned with your Zone of Genius, that you would actually want to hit your 10X goals using it. If your delivery method sounds overwhelming, you will unconsciously avoid the growth that requires it. So the central question here is not 'what should I sell?' — it is: what delivery method allows you to be in your Zone of Genius most of the time? From there, you design the offer ecosystem that serves your Dream Client, fits inside your 10X Calendar, and gives you a clear path from wherever she finds you to the deepest work you do.",
        danasPrinciple:
          "If the way you deliver your work runs you into the ground, you will never hit 10X. The delivery method has to come from your Zone of Genius — or you will always find a reason not to grow.",
        type: "conversation",
        outputName: "10X Offer Ecosystem",
        outputKey: "offer_map",
        futureUse: "The Club's Offer Studio, Sales Page Studio, and Launch Planner all build from this ecosystem. You decided the shape once. They build the rooms.",
        openingQuestion: "Let me ask you something first. If every contract with every client you currently have dissolved right now — how would you do it over? If you could start completely fresh, knowing what you know about your Zone of Genius and the clients who light you up — how would you deliver your work? What would the container look like? Who would be in it? How long? How close?",
        mission: [
          "the delivery method that keeps her in her Zone of Genius most: group, individual, tools, AI, blend, in-person, online, or something else entirely",
          "her premium-level offer: the deepest, most transformative work she does, priced from Wanted Money and verified to fit her 10X Calendar",
          "the entry-point offers and ascension path that lead her Dream Client to the premium level",
          "the sustainability check: if this delivery sounds overwhelming, it does not belong in a 10X business",
        ],
        beginCta: "Design My Offer Ecosystem",
        nextDecision: "Does every offer on this list keep me in my Zone of Genius — or am I designing from my Zone of Excellence again?",
        generatePrompt:
          "I'm ready. Generate my 10X Offer Ecosystem based on everything we've discussed.",
        feedsInto: "Element 10 captures how your genius expresses itself in the world: your 10X Brand Direction.",
      },
      {
        id: "brand-direction",
        number: 10,
        name: "10X Brand Direction",
        tagline: "Capture the mission, the feeling, and the visual world that expresses your X Factor. You walk away with your 10X Brand Direction.",
        purpose:
          "Your Zone of Genius is what you do. Your X Factor is how you apply it. Your brand is how the world experiences it. This element captures three things: the WHY behind your X Factor (the mission that drives you, the reason you care, what you want to change in the world), the FEELING you want people to have as they move through your work (the emotion, the energy, the experience), and the VISUAL WORLD that expresses all of it (the colors, the aesthetic, the metaphor, the vibe). A brand direction built from your genius is not a logo exercise — it is a translation of who you are into something your dream client recognizes before you say a single word.",
        danasPrinciple:
          "Your brand is not what it looks like. It is what it feels like. And that feeling comes directly from your Zone of Genius applied with intention.",
        type: "conversation",
        outputName: "10X Brand Direction",
        outputKey: "brand_direction",
        futureUse: "Every Studio in Delivered that writes or creates for her reads the Brand Direction first. Voice, visual, and messaging all build from what she captured here.",
        openingQuestion: "Let's start with the why. You have named your Zone of Genius and your X Factor — now I want to understand why it matters to you. Why are you applying your genius in this particular way, to this particular person? What do you want to change for her? What does it mean to you that she gets this outcome?",
        mission: [
          "the WHY behind her X Factor: the mission, the reason she cares, what she wants to change",
          "how she wants people to feel at the end of working with her — the emotion, the energy, the experience",
          "a metaphor for the transformation she creates or the energy she brings (what image, feeling, or idea captures it)",
          "the visual world: colors she loves, aesthetics she's drawn to, references that feel like her — connect the dots between her taste and her brand",
        ],
        beginCta: "Capture My Brand Direction",
        nextDecision: "Does this brand make my dream client feel something before I say a word?",
        generatePrompt:
          "I'm ready. Generate my 10X Brand Direction based on everything we've discussed.",
        feedsInto: "Element 11 synthesizes every decision you've made into your 1010X Factor Operating Manual™ — the complete design of your business, ready to build from.",
      },
      {
        id: "operating-manual",
        number: 11,
        name: "1010X Factor Operating Manual™",
        tagline: "Every decision synthesized into one document. You walk away with your 1010X Factor Operating Manual™: the complete design of your business, ready to plug into the Club.",
        purpose:
          "Bring everything you've created together into one living blueprint — your 1010X Factor Operating Manual™. This becomes the intelligence Rare Breed OS™ uses to generate your messaging, offers, content, launches, and business when you activate it inside Delivered. So that you only have to think deeply once. After that, Rare Breed OS™ brings your business to life from your unique genius — not a blank page.",
        type: "synthesis",
        outputName: "10X Factor Operating Manual",
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
