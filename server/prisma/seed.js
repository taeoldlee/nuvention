const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Locale v2 seed script starting ---\n');

  // ─── CLEAN SLATE ───────────────────────────────────────────────
  console.log('Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.projectDraft.deleteMany();
  await prisma.project.deleteMany();
  await prisma.application.deleteMany();
  await prisma.brief.deleteMany();
  await prisma.campaignData.deleteMany();
  await prisma.brandProfile.deleteMany();
  await prisma.user.deleteMany();
  console.log('  All tables cleared.\n');

  // ─── USERS ─────────────────────────────────────────────────────
  console.log('Creating users...');

  const josh = await prisma.user.create({
    data: {
      id: 'demo-operator-josh',
      email: 'josh@todoroki.com',
      name: 'Josh Rivera',
      role: 'OPERATOR',
      isDemo: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });
  console.log('  Created operator: Josh Rivera (Todoroki Ramen)');

  const marie = await prisma.user.create({
    data: {
      id: 'demo-operator-marie',
      email: 'marie@coralie.com',
      name: 'Marie Laurent',
      role: 'OPERATOR',
      isDemo: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });
  console.log('  Created operator: Marie Laurent (Patisserie Coralie)');

  const ellen = await prisma.user.create({
    data: {
      id: 'demo-operator-ellen',
      email: 'ellen@hewn.com',
      name: 'Ellen King',
      role: 'OPERATOR',
      isDemo: true,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    },
  });
  console.log('  Created operator: Ellen King (Hewn Bread)');

  const newUser = await prisma.user.create({
    data: {
      id: 'demo-operator-new',
      email: 'newoperator@locale.app',
      name: '',
      role: 'OPERATOR',
      isDemo: true,
    },
  });
  console.log('  Created operator: New Operator (no name, no profile)');
  console.log(`  Total users: 4\n`);

  // ─── BRAND PROFILES ────────────────────────────────────────────
  console.log('Creating brand profiles...');

  const todorokiBrand = await prisma.brandProfile.create({
    data: {
      userId: josh.id,
      businessName: 'Todoroki Ramen',
      neighborhood: 'Evanston',
      city: 'Evanston',
      state: 'IL',
      vibe: ['Cozy & Warm', 'Energetic & Bold'],
      values: ['Community-first', 'Quality-obsessed'],
      contentComfortZones: ['Food & Drink Close-ups', 'Ambiance / Interior', 'Behind the Scenes'],
      budgetMin: 15000,
      budgetMax: 25000,
      cuisineTypes: ['Japanese'],
      subscriptionTier: 'PRO',
      subscriptionStatus: 'ACTIVE',
      vibeAnalysis: {
        primaryVibe: 'Warm Neighborhood Spot',
        aestheticTags: ['steam-clouds', 'warm-wood', 'neon-glow', 'rich-broth', 'handmade-noodles'],
        contentRecommendations: [
          'Steaming bowl close-ups',
          'Chef pulling noodles',
          'Cozy booth moments',
          'Seasonal specials showcase',
        ],
        avoidTags: ['fast-food', 'corporate', 'sterile'],
      },
    },
  });
  console.log('  Created brand: Todoroki Ramen (Evanston)');

  const coralieBrand = await prisma.brandProfile.create({
    data: {
      userId: marie.id,
      businessName: 'Patisserie Coralie',
      neighborhood: 'Evanston',
      city: 'Evanston',
      state: 'IL',
      vibe: ['Polished & Editorial', 'Minimalist & Clean'],
      values: ['Quality-obsessed', 'Design-forward'],
      contentComfortZones: ['Food & Drink Close-ups', 'Ambiance / Interior'],
      budgetMin: 18000,
      budgetMax: 30000,
      cuisineTypes: ['French', 'Bakery & Pastry'],
      subscriptionTier: 'PRO',
      subscriptionStatus: 'ACTIVE',
      vibeAnalysis: {
        primaryVibe: 'Refined European Elegance',
        aestheticTags: ['clean-lines', 'pastel-palette', 'artisan-detail', 'natural-light', 'curated-displays'],
        contentRecommendations: [
          'Close-up pastry artistry',
          'Morning light through windows',
          'Plating details',
          'Seasonal specialties',
        ],
        avoidTags: ['casual', 'rustic', 'dark-moody'],
      },
    },
  });
  console.log('  Created brand: Patisserie Coralie (Evanston)');

  const hewnBrand = await prisma.brandProfile.create({
    data: {
      userId: ellen.id,
      businessName: 'Hewn Bread',
      neighborhood: 'Evanston',
      city: 'Evanston',
      state: 'IL',
      vibe: ['Rustic & Raw', 'Cozy & Warm'],
      values: ['Quality-obsessed', 'Community-first', 'Sustainability'],
      contentComfortZones: ['Food & Drink Close-ups', 'Behind the Scenes'],
      budgetMin: 12000,
      budgetMax: 20000,
      cuisineTypes: ['Bakery & Pastry'],
      subscriptionTier: 'BASIC',
      subscriptionStatus: 'TRIAL',
      vibeAnalysis: {
        primaryVibe: 'Artisan Craft Story',
        aestheticTags: ['flour-dusted', 'golden-crusts', 'wood-fired', 'hands-at-work', 'morning-light'],
        contentRecommendations: [
          'Dough-to-loaf process',
          'Golden hour bread shots',
          "Baker's hands close-ups",
          'Fresh-from-oven moments',
        ],
        avoidTags: ['mass-produced', 'sterile', 'corporate'],
      },
    },
  });
  console.log('  Created brand: Hewn Bread (Evanston)');
  console.log('  (New Operator has no brand profile)\n');

  // ─── BRIEFS ────────────────────────────────────────────────────
  console.log('Creating briefs...');

  const brief1 = await prisma.brief.create({
    data: {
      id: 'demo-brief-todoroki-reel',
      brandProfileId: todorokiBrand.id,
      title: 'Summer Ramen Launch - Reels Package',
      campaignGoal: 'MENU_LAUNCH',
      contentTypes: ['REEL', 'PHOTO_SET'],
      numberOfDeliverables: 4,
      creativeDirection: 'Capture the steam, the pull of fresh noodles, and the first satisfying slurp. We want viewers to feel the warmth and craft behind our new summer tonkotsu. Think close-up textures, natural restaurant lighting, and authentic moments.',
      dos: 'Show the noodle pull, capture steam rising, include at least one shot of the full bowl from above',
      donts: 'No competitor logos visible, no flash photography, avoid staging that looks artificial',
      deadline: new Date('2026-03-15'),
      compensationType: 'FLAT_FEE',
      compensationAmount: 20000, // $200
      usageRights: 'ORGANIC_SOCIAL',
      locationRequirement: 'IN_PERSON',
      additionalNotes: 'We can accommodate shoots during off-peak hours (2-5pm). Ask for Josh when you arrive.',
      revisionsIncluded: 1,
      status: 'OPEN',
    },
  });
  console.log('  Brief 1: Todoroki - Summer Ramen Launch (OPEN)');

  const brief2 = await prisma.brief.create({
    data: {
      id: 'demo-brief-coralie-pastry',
      brandProfileId: coralieBrand.id,
      title: 'Spring Pastry Collection Showcase',
      campaignGoal: 'SEASONAL_SPECIAL',
      contentTypes: ['CAROUSEL', 'STORY', 'PHOTO_SET'],
      numberOfDeliverables: 6,
      creativeDirection: 'Photograph our new spring pastry line with a clean, editorial eye. Focus on the croissant layers, seasonal tart details, and the morning display case. Natural light is essential — think soft, bright, airy.',
      dos: 'Capture the flaky layers, show plating details, include at least one lifestyle shot of someone enjoying a pastry',
      donts: 'No dark/moody edits, avoid cluttered compositions, nothing too casual',
      deadline: new Date('2026-03-20'),
      compensationType: 'HYBRID',
      compensationAmount: 25000, // $250 cash
      compensationDetails: { description: '$250 + complimentary pastry tasting for two' },
      usageRights: 'ALL',
      locationRequirement: 'IN_PERSON',
      additionalNotes: 'Best light is 8-10am. We can reserve a table by the window.',
      revisionsIncluded: 2,
      status: 'OPEN',
    },
  });
  console.log('  Brief 2: Patisserie Coralie - Spring Pastry Collection (OPEN)');

  const brief3 = await prisma.brief.create({
    data: {
      id: 'demo-brief-hewn-bts',
      brandProfileId: hewnBrand.id,
      title: 'Behind the Scenes: Morning Bake',
      campaignGoal: 'GENERAL_CONTENT',
      contentTypes: ['REEL', 'PHOTO_SET'],
      numberOfDeliverables: 3,
      creativeDirection: 'Document the early morning baking process at Hewn. Arrive by 5 AM. Capture the flour-dusted surfaces, hands shaping loaves, the wood-fired oven glow, and the moment the first loaves come out golden.',
      dos: 'Capture the process from raw dough to finished loaf, use warm tones, show the baker at work',
      donts: 'No overly polished edits, avoid making it look mass-produced',
      deadline: null,
      compensationType: 'FREE_PRODUCT',
      compensationAmount: null,
      compensationDetails: { description: 'Weekly bread subscription for 3 months + $50 store credit' },
      usageRights: 'ORGANIC_SOCIAL',
      locationRequirement: 'IN_PERSON',
      revisionsIncluded: 1,
      status: 'OPEN',
    },
  });
  console.log('  Brief 3: Hewn Bread - Behind the Scenes (OPEN)');

  // Draft brief (Todoroki second brief, not yet published)
  const brief4 = await prisma.brief.create({
    data: {
      id: 'demo-brief-todoroki-draft',
      brandProfileId: todorokiBrand.id,
      title: 'Late Night Ramen Vibes - TikTok Series',
      campaignGoal: 'SLOW_PERIOD_FILL',
      contentTypes: ['TIKTOK'],
      numberOfDeliverables: 3,
      creativeDirection: 'Capture the late-night energy at Todoroki. Neon lights, steam, regulars at the bar.',
      compensationType: 'FLAT_FEE',
      compensationAmount: 15000,
      usageRights: 'ORGANIC_SOCIAL',
      locationRequirement: 'IN_PERSON',
      revisionsIncluded: 1,
      status: 'DRAFT',
    },
  });
  console.log('  Brief 4: Todoroki - Late Night TikTok (DRAFT)\n');

  // ─── APPLICATIONS ──────────────────────────────────────────────
  console.log('Creating applications...');

  // --- Brief 1 applications (Todoroki Ramen Launch) ---
  const app1a = await prisma.application.create({
    data: {
      briefId: brief1.id,
      applicantType: 'INDIVIDUAL',
      creatorName: 'Shaurya Garg',
      creatorHandle: 'shauryaeats',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 8200,
      engagementRate: 5.4,
      topPostUrls: [
        'https://instagram.com/p/example1',
        'https://instagram.com/p/example2',
      ],
      portfolioUrls: ['https://shauryagarg.com/portfolio'],
      contentStyleTags: ['Warm', 'Editorial', 'Clean'],
      pitch: "I specialize in warm, editorial food photography with a focus on ramen and Japanese cuisine. I've shot at 6 ramen shops in the Chicago area and understand how to capture steam, noodle texture, and the cozy atmosphere that makes a bowl of ramen feel special.",
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'shaurya@locale.app',
      aiMatchScore: 92,
      aiMatchRationale: 'Strong food photography portfolio with Japanese cuisine focus. Evanston-based with warm editorial style that aligns perfectly with Todoroki\'s cozy vibe.',
      status: 'SELECTED',
      selectedAt: new Date('2026-02-18'),
    },
  });
  console.log('  App 1a: Shaurya x Todoroki Ramen (score 92, SELECTED)');

  const app1b = await prisma.application.create({
    data: {
      briefId: brief1.id,
      applicantType: 'INDIVIDUAL',
      creatorName: 'Katelyn Liu',
      creatorHandle: 'kk.ameliu',
      creatorPlatform: 'TIKTOK',
      followerCount: 24500,
      engagementRate: 7.2,
      topPostUrls: [
        'https://tiktok.com/@kk.ameliu/video1',
        'https://tiktok.com/@kk.ameliu/video2',
        'https://tiktok.com/@kk.ameliu/video3',
      ],
      contentStyleTags: ['Bold', 'Energetic', 'Candid'],
      pitch: 'I create viral food content on TikTok! My ramen video at Ramen-San got 450K views. I know how to make food content pop with trending audio and fast-paced editing that stops the scroll.',
      compensationAsk: '$250',
      availabilityConfirmed: true,
      contactEmail: 'katelyn@locale.app',
      aiMatchScore: 78,
      aiMatchRationale: 'High engagement TikTok creator with proven food content virality. Style leans more energetic than Todoroki\'s warm vibe, but strong short-form skills.',
      status: 'PENDING',
    },
  });
  console.log('  App 1b: Katelyn x Todoroki Ramen (score 78, PENDING)');

  const app1c = await prisma.application.create({
    data: {
      briefId: brief1.id,
      applicantType: 'INDIVIDUAL',
      creatorName: 'Dani Reyes',
      creatorHandle: 'dani.creates',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 3100,
      engagementRate: 8.1,
      topPostUrls: [
        'https://instagram.com/p/example3',
        'https://instagram.com/p/example4',
      ],
      contentStyleTags: ['Documentary', 'Raw', 'Candid'],
      pitch: 'Evanston local and weekly regular at Todoroki! I do documentary-style food photography and already have a great relationship with the staff. My photos have an authentic, unstaged quality that resonates with local audiences.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'dani@gmail.com',
      aiMatchScore: 85,
      aiMatchRationale: 'Local Evanston regular with documentary style. High engagement rate despite smaller following. Strong neighborhood connection and authentic aesthetic.',
      status: 'PENDING',
    },
  });
  console.log('  App 1c: Dani x Todoroki Ramen (score 85, PENDING)');

  const app1d = await prisma.application.create({
    data: {
      briefId: brief1.id,
      applicantType: 'AGENCY',
      agencyName: 'North Shore Creators',
      creatorName: 'Mike Chen',
      creatorHandle: 'mikechen.photo',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 45000,
      engagementRate: 3.2,
      topPostUrls: [
        'https://instagram.com/p/example5',
        'https://instagram.com/p/example6',
      ],
      contentStyleTags: ['Clean', 'Minimalist', 'Editorial'],
      pitch: 'Our agency has worked with 30+ restaurants in the North Shore area. Mike specializes in high-end food photography with a minimalist approach that elevates any dish.',
      compensationAsk: '$400 for full package',
      availabilityConfirmed: true,
      contactEmail: 'bookings@northshorecreators.com',
      aiMatchScore: 65,
      aiMatchRationale: 'Experienced but style is more minimalist/corporate than Todoroki\'s warm, cozy brand. Higher ask may not align with budget.',
      status: 'REJECTED',
    },
  });
  console.log('  App 1d: Mike (agency) x Todoroki Ramen (score 65, REJECTED)');

  // --- Brief 2 applications (Patisserie Coralie) ---
  const app2a = await prisma.application.create({
    data: {
      briefId: brief2.id,
      applicantType: 'INDIVIDUAL',
      creatorName: 'Emma Nakamura',
      creatorHandle: 'emma.bakes',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 15800,
      engagementRate: 6.3,
      topPostUrls: [
        'https://instagram.com/p/example7',
        'https://instagram.com/p/example8',
        'https://instagram.com/p/example9',
      ],
      portfolioUrls: ['https://emmanakamura.com'],
      contentStyleTags: ['Clean', 'Minimalist', 'Bright'],
      pitch: 'I specialize in bakery and pastry content with a clean, bright editorial style. My work has been featured in Eater Chicago and I regularly shoot for artisan bakeries. I understand how to capture flaky textures and delicate details in natural light.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'emma@locale.app',
      aiMatchScore: 94,
      aiMatchRationale: 'Perfect style match for Coralie\'s refined aesthetic. Clean, bright editorial approach with proven bakery content experience. Featured in food media.',
      status: 'PENDING',
    },
  });
  console.log('  App 2a: Emma x Coralie (score 94, PENDING)');

  const app2b = await prisma.application.create({
    data: {
      briefId: brief2.id,
      applicantType: 'INDIVIDUAL',
      creatorName: 'Shaurya Garg',
      creatorHandle: 'shauryaeats',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 8200,
      engagementRate: 5.4,
      topPostUrls: [
        'https://instagram.com/p/example1',
        'https://instagram.com/p/example2',
      ],
      contentStyleTags: ['Warm', 'Editorial'],
      pitch: 'I have a warm editorial approach that could bring a cozy, inviting angle to your pastry showcase. I recently shot a series on artisan bakeries in the North Shore area.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'shaurya@locale.app',
      aiMatchScore: 81,
      aiMatchRationale: 'Strong editorial portfolio with food focus. Warm style is slightly different from Coralie\'s clean minimalist preference but brings inviting quality.',
      status: 'PENDING',
    },
  });
  console.log('  App 2b: Shaurya x Coralie (score 81, PENDING)');

  const app2c = await prisma.application.create({
    data: {
      briefId: brief2.id,
      applicantType: 'INDIVIDUAL',
      creatorName: 'Katelyn Liu',
      creatorHandle: 'kk.ameliu',
      creatorPlatform: 'TIKTOK',
      followerCount: 24500,
      engagementRate: 7.2,
      topPostUrls: [
        'https://tiktok.com/@kk.ameliu/video1',
      ],
      contentStyleTags: ['Bold', 'Energetic', 'Lifestyle'],
      pitch: 'I do lifestyle content that makes people want to visit! My last bakery collab got 200K views on TikTok. I can create Story and Carousel content alongside short-form video.',
      compensationAsk: '$300',
      availabilityConfirmed: true,
      contactEmail: 'katelyn@locale.app',
      aiMatchScore: 68,
      aiMatchRationale: 'High-reach creator but bold, energetic style doesn\'t match Coralie\'s refined, minimalist brand. Better suited for casual F&B brands.',
      status: 'PENDING',
    },
  });
  console.log('  App 2c: Katelyn x Coralie (score 68, PENDING)');

  const app2d = await prisma.application.create({
    data: {
      briefId: brief2.id,
      applicantType: 'INDIVIDUAL',
      creatorName: 'Priya Desai',
      creatorHandle: 'priya.tableview',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 5600,
      engagementRate: 9.1,
      topPostUrls: [
        'https://instagram.com/p/example10',
        'https://instagram.com/p/example11',
      ],
      contentStyleTags: ['Editorial', 'Bright', 'Lifestyle'],
      pitch: 'I focus on elevated food and lifestyle content in the North Shore area. My clean, bright style and attention to plating details would be a great match for Patisserie Coralie\'s refined aesthetic.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'priya@gmail.com',
      aiMatchScore: 88,
      aiMatchRationale: 'Excellent editorial style with North Shore focus. Very high engagement rate signals authentic audience. Clean, bright aesthetic aligns with Coralie brand.',
      status: 'PENDING',
    },
  });
  console.log('  App 2d: Priya x Coralie (score 88, PENDING)');

  // --- Brief 3 applications (Hewn Bread BTS) ---
  const app3a = await prisma.application.create({
    data: {
      briefId: brief3.id,
      applicantType: 'INDIVIDUAL',
      creatorName: 'Dani Reyes',
      creatorHandle: 'dani.creates',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 3100,
      engagementRate: 8.1,
      topPostUrls: [
        'https://instagram.com/p/example3',
        'https://instagram.com/p/example4',
      ],
      contentStyleTags: ['Documentary', 'Raw', 'Candid'],
      pitch: 'Documentary-style behind-the-scenes content is my specialty. I love capturing craft processes and I\'m an early riser. The morning bake at Hewn is exactly the kind of story I want to tell.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'dani@gmail.com',
      aiMatchScore: 90,
      aiMatchRationale: 'Documentary style is perfect for BTS content. Early riser, local, and specializes in craft process storytelling. Ideal for Hewn\'s artisan narrative.',
      status: 'PENDING',
    },
  });
  console.log('  App 3a: Dani x Hewn BTS (score 90, PENDING)');

  const app3b = await prisma.application.create({
    data: {
      briefId: brief3.id,
      applicantType: 'INDIVIDUAL',
      creatorName: 'Shaurya Garg',
      creatorHandle: 'shauryaeats',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 8200,
      engagementRate: 5.4,
      topPostUrls: [
        'https://instagram.com/p/example1',
      ],
      contentStyleTags: ['Warm', 'Editorial'],
      pitch: 'My warm editorial style would capture the golden-hour feel of an early morning bake beautifully. I\'ve shot similar BTS content for cafes and I know how to work in low-light kitchen environments.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'shaurya@locale.app',
      aiMatchScore: 82,
      aiMatchRationale: 'Warm editorial style suits Hewn\'s rustic aesthetic. Experience with cafe BTS content. Morning light expertise is a good fit for early bake schedule.',
      status: 'PENDING',
    },
  });
  console.log('  App 3b: Shaurya x Hewn BTS (score 82, PENDING)\n');

  // ─── PROJECTS (from selected applications) ─────────────────────
  console.log('Creating projects...');

  // Project 1: Todoroki x Shaurya (from app1a - SELECTED)
  const project1Token = crypto.randomUUID();
  const project1 = await prisma.project.create({
    data: {
      applicationId: app1a.id,
      brandProfileId: todorokiBrand.id,
      creatorName: 'Shaurya Garg',
      creatorEmail: 'shaurya@locale.app',
      creatorAccessToken: project1Token,
      status: 'DRAFT_SUBMITTED',
      briefText: 'Summer Ramen Launch - Reels Package\n\nCapture the steam, the pull of fresh noodles, and the first satisfying slurp. We want viewers to feel the warmth and craft behind our new summer tonkotsu.',
      deliverables: '4 REEL, PHOTO_SET',
      price: 20000,
      compensationType: 'FLAT_FEE',
      usageRights: 'ORGANIC_SOCIAL',
      revisionsIncluded: 1,
      revisionsUsed: 0,
      creatorAcceptedAt: new Date('2026-02-19'),
      contentDueAt: new Date('2026-03-15'),
    },
  });
  console.log('  Project 1: Todoroki x Shaurya (DRAFT_SUBMITTED)');

  // ─── PROJECT DRAFTS ────────────────────────────────────────────
  console.log('Creating project drafts...');

  await prisma.projectDraft.create({
    data: {
      projectId: project1.id,
      version: 1,
      fileUrls: [
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
        'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800',
        'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=800',
      ],
      notes: 'First draft! Captured the noodle pull and steam during the 3pm soft lighting. Included 2 close-ups and 1 wide atmospheric shot. Reel edit uses trending audio.',
      status: 'SUBMITTED',
    },
  });
  console.log('  Draft v1 for Project 1 (Todoroki x Shaurya) - SUBMITTED\n');

  // ─── TRANSACTIONS ──────────────────────────────────────────────
  console.log('Creating transactions...');

  await prisma.transaction.create({
    data: {
      projectId: project1.id,
      amount: 20000,
      platformFee: 2000, // 10%
      creatorPayout: 18000, // 90%
      status: 'ESCROW_HELD',
      escrowStatus: 'HELD',
      demoMode: true,
    },
  });
  console.log('  Transaction for Project 1: $200.00 (ESCROW_HELD)\n');

  // ─── MESSAGES ──────────────────────────────────────────────────
  console.log('Creating messages...');
  await prisma.message.createMany({
    data: [
      {
        projectId: project1.id,
        senderType: 'BRAND',
        senderName: 'Josh Rivera',
        text: 'Hey Shaurya! Excited to have you on this project. Best time to shoot is 2-5pm when it\'s quieter. Ask for me when you arrive!',
        createdAt: new Date('2026-02-19T10:00:00Z'),
      },
      {
        projectId: project1.id,
        senderType: 'CREATOR',
        senderName: 'Shaurya Garg',
        text: 'Thanks Josh! I\'m planning to come Thursday around 3pm. I\'ll bring my 50mm for the close-ups. Should I shoot at the bar or a booth?',
        createdAt: new Date('2026-02-19T10:30:00Z'),
      },
      {
        projectId: project1.id,
        senderType: 'BRAND',
        senderName: 'Josh Rivera',
        text: 'Both! The bar has great steam shots from the open kitchen, and booth 3 by the window gets amazing afternoon light. I\'ll have our signature tonkotsu ready for you.',
        createdAt: new Date('2026-02-19T11:00:00Z'),
      },
      {
        projectId: project1.id,
        senderType: 'CREATOR',
        senderName: 'Shaurya Garg',
        text: 'Just uploaded my first draft! Got some great steam shots and the noodle pull turned out really well. Let me know what you think.',
        createdAt: new Date('2026-02-21T16:00:00Z'),
      },
    ],
  });
  console.log('  Created 4 messages for Project 1\n');

  // ─── NOTIFICATIONS ─────────────────────────────────────────────
  console.log('Creating notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: josh.id,
        type: 'DRAFT_SUBMITTED',
        title: 'New draft submitted',
        body: 'Shaurya submitted a draft for your Summer Ramen Launch project.',
        linkUrl: `/operator/project/${project1.id}`,
        read: false,
        createdAt: new Date('2026-02-21T16:00:00Z'),
      },
      {
        userId: josh.id,
        type: 'NEW_APPLICATION',
        title: 'New application received',
        body: 'Katelyn Liu applied to your Summer Ramen Launch brief.',
        linkUrl: `/operator/brief/${brief1.id}`,
        read: false,
        createdAt: new Date('2026-02-17T12:00:00Z'),
      },
      {
        userId: josh.id,
        type: 'NEW_APPLICATION',
        title: 'New application received',
        body: 'Dani Reyes applied to your Summer Ramen Launch brief.',
        linkUrl: `/operator/brief/${brief1.id}`,
        read: true,
        createdAt: new Date('2026-02-16T09:00:00Z'),
      },
      {
        userId: marie.id,
        type: 'NEW_APPLICATION',
        title: 'New application received',
        body: 'Emma Nakamura applied to your Spring Pastry Collection brief.',
        linkUrl: `/operator/brief/${brief2.id}`,
        read: false,
        createdAt: new Date('2026-02-20T14:00:00Z'),
      },
      {
        userId: marie.id,
        type: 'NEW_APPLICATION',
        title: 'New application received',
        body: 'Priya Desai applied to your Spring Pastry Collection brief.',
        linkUrl: `/operator/brief/${brief2.id}`,
        read: false,
        createdAt: new Date('2026-02-21T08:00:00Z'),
      },
      {
        userId: ellen.id,
        type: 'NEW_APPLICATION',
        title: 'New application received',
        body: 'Dani Reyes applied to your Behind the Scenes brief.',
        linkUrl: `/operator/brief/${brief3.id}`,
        read: false,
        createdAt: new Date('2026-02-22T10:00:00Z'),
      },
    ],
  });
  console.log('  Created 6 notifications\n');

  // ─── SUMMARY ───────────────────────────────────────────────────
  console.log('=== Seed complete ===');
  console.log('  4 users (4 operators, 0 creators — creators apply via portal)');
  console.log('  3 brand profiles');
  console.log('  4 briefs (3 OPEN, 1 DRAFT)');
  console.log('  10 applications across 3 briefs');
  console.log('  1 project (with draft, transaction, and messages)');
  console.log('  1 project draft');
  console.log('  1 transaction');
  console.log('  4 messages');
  console.log('  6 notifications');
  console.log('\nDemo accounts:');
  console.log('  Operators: josh@todoroki.com, marie@coralie.com, ellen@hewn.com, newoperator@locale.app');
  console.log('  Public portal: /portal/briefs (no login required)');
}

// Export main for use by the admin reseed API route
module.exports = { main };

// Run directly when called as a script (npx prisma db seed)
if (require.main === module) {
  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error('\nSeed failed:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
