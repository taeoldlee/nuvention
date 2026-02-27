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

  // ─── USERS (2 only) ──────────────────────────────────────────
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

  await prisma.user.create({
    data: {
      id: 'demo-operator-new',
      email: 'newoperator@locale.app',
      name: '',
      role: 'OPERATOR',
      isDemo: true,
    },
  });
  console.log('  Created operator: New Operator (blank, for onboarding)\n');

  // ─── BRAND PROFILE (1 only — fully loaded) ───────────────────
  console.log('Creating brand profile...');

  const todorokiBrand = await prisma.brandProfile.create({
    data: {
      userId: josh.id,
      businessName: 'Todoroki Ramen',
      neighborhood: 'Downtown Evanston',
      city: 'Evanston',
      state: 'IL',
      googleMapsUrl: 'https://maps.google.com/?cid=todoroki_ramen_evanston',
      yelpUrl: 'https://yelp.com/biz/todoroki-ramen-evanston',
      vibe: ['Cozy & Warm', 'Energetic & Bold'],
      values: ['Community-first', 'Quality ingredients', 'Authenticity'],
      contentComfortZones: ['Food & Drink', 'Ambiance / Interior', 'Behind the Scenes', 'Events'],
      vibeScales: { cozyEnergetic: 65, quietBuzzy: 70, classicModern: 55, casualElevated: 40 },
      guestExperienceKeywords: ['warm', 'neighborhood', 'umami', 'cozy', 'date night'],
      contentNoGos: 'No competitor mentions. No shots of messy kitchen during service.',
      budgetMin: 15000, // $150
      budgetMax: 40000, // $400
      cuisineTypes: ['Japanese', 'Ramen', 'Asian Fusion'],
      profilePhotoUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
      subscriptionTier: 'PRO',
      subscriptionStatus: 'ACTIVE',
    },
  });
  console.log('  Created brand: Todoroki Ramen (Evanston, PRO/ACTIVE)\n');

  // ─── BRIEFS (12 total: 1 DRAFT, 5 OPEN, 4 CLOSED, 2 CANCELLED) ───
  console.log('Creating briefs...');

  // Brief 1: DRAFT
  const brief1 = await prisma.brief.create({
    data: {
      brandProfileId: todorokiBrand.id,
      title: 'Late Night Ramen TikTok Series',
      campaignGoal: 'SLOW_PERIOD_FILL',
      contentTypes: ['TIKTOK', 'REEL'],
      numberOfDeliverables: 4,
      creativeDirection: 'Moody, after-hours vibe. Steam rising from bowls under dim lighting. Capture the late-night ramen craving energy.',
      dos: 'Show the steam, the neon glow, the first-bite reaction. Use trending audio.',
      donts: 'No bright overhead lighting. No daytime shots.',
      compensationType: 'FLAT_FEE',
      compensationAmount: 25000, // $250
      usageRights: 'ALL',
      locationRequirement: 'IN_PERSON',
      revisionsIncluded: 1,
      status: 'DRAFT',
    },
  });
  console.log('  Brief 1: Late Night Ramen TikTok (DRAFT)');

  // Brief 2: OPEN — will have project P1 (AWAITING_CREATOR_ACCEPTANCE)
  const brief2 = await prisma.brief.create({
    data: {
      brandProfileId: todorokiBrand.id,
      title: 'Summer Ramen Launch',
      campaignGoal: 'MENU_LAUNCH',
      contentTypes: ['REEL', 'CAROUSEL', 'STORY'],
      numberOfDeliverables: 3,
      creativeDirection: 'Bright, summery energy. Show the new cold ramen and seasonal sides. Focus on refreshment and color.',
      dos: 'Capture the vibrant colors of the summer menu. Show texture close-ups.',
      donts: 'Avoid heavy/wintery vibes. No dark moody shots.',
      deadline: new Date('2026-03-15'),
      compensationType: 'FLAT_FEE',
      compensationAmount: 20000, // $200
      usageRights: 'ALL',
      locationRequirement: 'IN_PERSON',
      revisionsIncluded: 1,
      status: 'OPEN',
    },
  });
  console.log('  Brief 2: Summer Ramen Launch (OPEN)');

  // Brief 3: OPEN — will have project P2 (ACCEPTED)
  const brief3 = await prisma.brief.create({
    data: {
      brandProfileId: todorokiBrand.id,
      title: 'Lincoln Park Grand Opening',
      campaignGoal: 'GRAND_OPENING',
      contentTypes: ['REEL', 'TIKTOK', 'PHOTO_SET'],
      numberOfDeliverables: 5,
      creativeDirection: 'Capture the excitement of our second location opening! Line out the door, first bowls served, ribbon cutting, the new space.',
      dos: 'Show the crowd energy, the new interior, the first-bite reactions.',
      donts: 'Don\'t show half-finished construction. No competitor signage in background.',
      deadline: new Date('2026-04-15'),
      compensationType: 'FLAT_FEE',
      compensationAmount: 35000, // $350
      usageRights: 'ALL',
      locationRequirement: 'IN_PERSON',
      revisionsIncluded: 2,
      status: 'OPEN',
    },
  });
  console.log('  Brief 3: Lincoln Park Grand Opening (OPEN)');

  // Brief 4: OPEN — will have project P3 (IN_PROGRESS)
  const brief4 = await prisma.brief.create({
    data: {
      brandProfileId: todorokiBrand.id,
      title: 'Weeknight Happy Hour Promo',
      campaignGoal: 'SLOW_PERIOD_FILL',
      contentTypes: ['REEL', 'STORY'],
      numberOfDeliverables: 2,
      creativeDirection: 'Make Tuesday-Thursday nights look like the place to be. Focus on the drink specials, the vibe after work.',
      dos: 'Show groups of friends, drinks with ramen pairings, the cozy after-work feel.',
      donts: 'No empty restaurant shots. No overly posed content.',
      deadline: new Date('2026-03-30'),
      compensationType: 'HYBRID',
      compensationAmount: 18000, // $180
      compensationDetails: { description: '$180 cash + complimentary dinner for 2', cashAmount: 18000, productValue: 8000 },
      usageRights: 'ORGANIC_SOCIAL',
      locationRequirement: 'IN_PERSON',
      revisionsIncluded: 1,
      status: 'OPEN',
    },
  });
  console.log('  Brief 4: Weeknight Happy Hour (OPEN)');

  // Brief 5: OPEN — will have project P4 (DRAFT_SUBMITTED)
  const brief5 = await prisma.brief.create({
    data: {
      brandProfileId: todorokiBrand.id,
      title: 'Fall Menu Refresh',
      campaignGoal: 'SEASONAL_SPECIAL',
      contentTypes: ['CAROUSEL', 'PHOTO_SET'],
      numberOfDeliverables: 3,
      creativeDirection: 'Warm autumn tones. Show the new miso-based bowls and seasonal toppings. Cozy comfort food vibes.',
      dos: 'Golden hour lighting. Warm color palette. Show ingredients and finished bowls.',
      donts: 'No summer-coded imagery. No cold/clinical food photography.',
      deadline: new Date('2026-04-01'),
      compensationType: 'FLAT_FEE',
      compensationAmount: 25000, // $250
      usageRights: 'ALL',
      locationRequirement: 'FLEXIBLE',
      revisionsIncluded: 1,
      status: 'OPEN',
    },
  });
  console.log('  Brief 5: Fall Menu Refresh (OPEN)');

  // Brief 6: OPEN — will have project P5 (REVISION_REQUESTED)
  const brief6 = await prisma.brief.create({
    data: {
      brandProfileId: todorokiBrand.id,
      title: 'Behind the Counter Series',
      campaignGoal: 'GENERAL_CONTENT',
      contentTypes: ['REEL', 'TIKTOK'],
      numberOfDeliverables: 3,
      creativeDirection: 'Raw, documentary-style. Show the craft — noodle making, broth simmering, morning prep. Make people appreciate the work that goes into each bowl.',
      dos: 'Close-ups of hands working. Steam. The rhythm of the kitchen.',
      donts: 'No scripted dialogue. No health-code violations visible.',
      compensationType: 'FREE_PRODUCT',
      compensationDetails: { description: 'Complimentary ramen for 4 visits + feature on our social channels' },
      usageRights: 'ORGANIC_SOCIAL',
      locationRequirement: 'IN_PERSON',
      revisionsIncluded: 2,
      status: 'OPEN',
    },
  });
  console.log('  Brief 6: Behind the Counter Series (OPEN)');

  // Brief 7: CLOSED — will have project P6 (APPROVED)
  const brief7 = await prisma.brief.create({
    data: {
      brandProfileId: todorokiBrand.id,
      title: 'Ramen Festival Coverage',
      campaignGoal: 'EVENT_PROMO',
      contentTypes: ['REEL', 'STORY', 'PHOTO_SET'],
      numberOfDeliverables: 4,
      creativeDirection: 'Festival energy! Our booth at the Chicago Ramen Fest. Lines, bowls, happy faces, the whole scene.',
      dos: 'Capture the crowd, our booth setup, taste-test reactions.',
      donts: 'Don\'t focus on competitor booths.',
      deadline: new Date('2026-01-20'),
      compensationType: 'FLAT_FEE',
      compensationAmount: 27500, // $275
      usageRights: 'ALL',
      locationRequirement: 'IN_PERSON',
      revisionsIncluded: 1,
      status: 'CLOSED',
      closedAt: new Date('2026-01-22'),
    },
  });
  console.log('  Brief 7: Ramen Festival Coverage (CLOSED)');

  // Brief 8: CLOSED — will have project P7 (COMPLETED, multi-revision)
  const brief8 = await prisma.brief.create({
    data: {
      brandProfileId: todorokiBrand.id,
      title: 'Valentine\'s Special Set',
      campaignGoal: 'EVENT_PROMO',
      contentTypes: ['CAROUSEL', 'REEL'],
      numberOfDeliverables: 2,
      creativeDirection: 'Romantic, intimate. Our Valentine\'s couples ramen set — two bowls, shared sides, candlelight. Make it a date-night must.',
      dos: 'Warm candlelight tones. Show couples enjoying. Close-ups of the special presentation.',
      donts: 'Nothing cheesy or over-the-top. Keep it tasteful and warm.',
      deadline: new Date('2026-02-12'),
      compensationType: 'FLAT_FEE',
      compensationAmount: 30000, // $300
      usageRights: 'ALL',
      locationRequirement: 'IN_PERSON',
      revisionsIncluded: 2,
      status: 'CLOSED',
      closedAt: new Date('2026-02-14'),
    },
  });
  console.log('  Brief 8: Valentine\'s Special Set (CLOSED)');

  // Brief 9: CLOSED — will have project P8 (DISPUTED)
  const brief9 = await prisma.brief.create({
    data: {
      brandProfileId: todorokiBrand.id,
      title: 'Holiday Catering Push',
      campaignGoal: 'SEASONAL_SPECIAL',
      contentTypes: ['CAROUSEL', 'PHOTO_SET'],
      numberOfDeliverables: 3,
      creativeDirection: 'Show our catering trays and party packs. Holiday gatherings, office parties, family dinners with Todoroki ramen.',
      dos: 'Show variety — large trays, individual portions, garnished setups.',
      donts: 'No plastic containers. Show our eco-friendly packaging.',
      deadline: new Date('2025-12-15'),
      compensationType: 'HYBRID',
      compensationAmount: 22500, // $225
      compensationDetails: { description: '$225 cash + free catering tray ($150 value)', cashAmount: 22500, productValue: 15000 },
      usageRights: 'ALL',
      locationRequirement: 'FLEXIBLE',
      revisionsIncluded: 1,
      status: 'CLOSED',
      closedAt: new Date('2025-12-18'),
    },
  });
  console.log('  Brief 9: Holiday Catering Push (CLOSED)');

  // Brief 10: CLOSED — will have project P9 (COMPLETED, refunded)
  const brief10 = await prisma.brief.create({
    data: {
      brandProfileId: todorokiBrand.id,
      title: 'Staff Spotlight Series',
      campaignGoal: 'GENERAL_CONTENT',
      contentTypes: ['REEL', 'CAROUSEL'],
      numberOfDeliverables: 2,
      creativeDirection: 'Warm portraits and mini-interviews with our team. Show the people behind the bowls.',
      dos: 'Natural lighting. Genuine smiles. Quick personality moments.',
      donts: 'Nothing overly produced. Keep it real.',
      deadline: new Date('2025-11-30'),
      compensationType: 'FLAT_FEE',
      compensationAmount: 20000, // $200
      usageRights: 'ORGANIC_SOCIAL',
      locationRequirement: 'IN_PERSON',
      revisionsIncluded: 1,
      status: 'CLOSED',
      closedAt: new Date('2025-12-02'),
    },
  });
  console.log('  Brief 10: Staff Spotlight Series (CLOSED)');

  // Brief 11: CANCELLED
  const brief11 = await prisma.brief.create({
    data: {
      brandProfileId: todorokiBrand.id,
      title: 'New Year\'s Countdown',
      campaignGoal: 'EVENT_PROMO',
      contentTypes: ['REEL', 'TIKTOK', 'STORY'],
      numberOfDeliverables: 3,
      creativeDirection: 'NYE at Todoroki — countdown, special menu, festive energy.',
      dos: 'Confetti, clinking glasses, midnight ramen bowl reveal.',
      donts: 'No overly intoxicated guests. Keep it family-friendly.',
      deadline: new Date('2025-12-30'),
      compensationType: 'FLAT_FEE',
      compensationAmount: 35000, // $350
      usageRights: 'ALL',
      locationRequirement: 'IN_PERSON',
      revisionsIncluded: 1,
      status: 'CANCELLED',
    },
  });
  console.log('  Brief 11: New Year\'s Countdown (CANCELLED)');

  // Brief 12: CANCELLED (had a project with failed payment)
  const brief12 = await prisma.brief.create({
    data: {
      brandProfileId: todorokiBrand.id,
      title: 'Anniversary Celebration',
      campaignGoal: 'GRAND_OPENING',
      contentTypes: ['REEL', 'PHOTO_SET'],
      numberOfDeliverables: 3,
      creativeDirection: 'Our 3-year anniversary! Special menu, loyal customers, the journey so far.',
      dos: 'Show the community love. Returning customers, celebration cake.',
      donts: 'No sad or nostalgic tone — this is a celebration.',
      deadline: new Date('2025-10-15'),
      compensationType: 'FLAT_FEE',
      compensationAmount: 30000, // $300
      usageRights: 'ALL',
      locationRequirement: 'IN_PERSON',
      revisionsIncluded: 1,
      status: 'CANCELLED',
    },
  });
  console.log('  Brief 12: Anniversary Celebration (CANCELLED)\n');

  // ─── APPLICATIONS ─────────────────────────────────────────────
  console.log('Creating applications...');

  // --- Brief 2: Summer Ramen Launch (OPEN, 4 apps) ---
  const app2a = await prisma.application.create({
    data: {
      briefId: brief2.id,
      creatorName: 'Shaurya Garg',
      creatorHandle: 'shaurya.eats',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 8200,
      engagementRate: 6.2,
      topPostUrls: ['https://instagram.com/p/example1', 'https://instagram.com/p/example2'],
      contentStyleTags: ['Warm', 'Close-up', 'Storytelling'],
      pitch: 'Summer ramen is my dream shoot — bright colors, fresh ingredients, the whole vibe. I\'ve shot 5 restaurant seasonal launches and know how to make new menu items look irresistible.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'shaurya@gmail.com',
      aiMatchScore: 92,
      aiMatchRationale: 'Excellent warm style alignment with Todoroki brand. Close-up food photography experience. Strong seasonal content portfolio.',
      status: 'SELECTED',
      selectedAt: new Date('2026-02-20'),
    },
  });
  console.log('  App 2a: Shaurya x Summer Ramen (score 92, SELECTED)');

  await prisma.application.create({
    data: {
      briefId: brief2.id,
      creatorName: 'Katelyn Liu',
      creatorHandle: 'kk.ameliu',
      creatorPlatform: 'TIKTOK',
      followerCount: 24500,
      engagementRate: 7.2,
      topPostUrls: ['https://tiktok.com/@kk.ameliu/video1'],
      contentStyleTags: ['Bold', 'Energetic', 'Candid'],
      pitch: 'I make food look fun, not fancy. My TikTok style would bring a fresh, younger audience to your summer menu. I know how to capture energy and get engagement.',
      compensationAsk: '$250',
      availabilityConfirmed: true,
      contactEmail: 'katelyn.liu@gmail.com',
      aiMatchScore: 78,
      aiMatchRationale: 'High engagement TikTok creator with energetic style. Slight mismatch with warm/cozy brand but strong reach potential.',
      status: 'PENDING',
    },
  });
  console.log('  App 2b: Katelyn x Summer Ramen (score 78, PENDING)');

  await prisma.application.create({
    data: {
      briefId: brief2.id,
      creatorName: 'Jin Park',
      creatorHandle: 'jin.foodie',
      creatorPlatform: 'YOUTUBE',
      followerCount: 18500,
      engagementRate: 4.8,
      contentStyleTags: ['Vlog', 'Detailed', 'Long-form'],
      pitch: 'I review ramen shops across Chicago. Would love to feature your new summer menu in a dedicated episode.',
      compensationAsk: '$300',
      availabilityConfirmed: true,
      contactEmail: 'jin.park@gmail.com',
      aiMatchScore: 65,
      aiMatchRationale: 'YouTube long-form doesn\'t match brief\'s Reel/Carousel format. Good reach but wrong content type.',
      status: 'REJECTED',
    },
  });
  console.log('  App 2c: Jin x Summer Ramen (score 65, REJECTED)');

  await prisma.application.create({
    data: {
      briefId: brief2.id,
      creatorName: 'Ava Thompson',
      creatorHandle: 'ava.eats.local',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 9400,
      engagementRate: 7.5,
      contentStyleTags: ['Clean', 'Natural Light', 'Story-driven'],
      pitch: 'I\'d love to capture the summer menu launch! My style is all about natural light and making food look approachable.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'ava.thompson@gmail.com',
      aiMatchScore: 81,
      aiMatchRationale: 'Clean, natural-light style works well for summer content. Good local following.',
      status: 'WITHDRAWN',
    },
  });
  console.log('  App 2d: Ava x Summer Ramen (score 81, WITHDRAWN)');

  // --- Brief 3: Lincoln Park Grand Opening (OPEN, 3 apps) ---
  const app3a = await prisma.application.create({
    data: {
      briefId: brief3.id,
      creatorName: 'Katelyn Liu',
      creatorHandle: 'kk.ameliu',
      creatorPlatform: 'TIKTOK',
      followerCount: 24500,
      engagementRate: 7.2,
      topPostUrls: ['https://tiktok.com/@kk.ameliu/video1', 'https://tiktok.com/@kk.ameliu/video2'],
      contentStyleTags: ['Bold', 'Energetic', 'Candid'],
      pitch: 'Grand openings are my thing! I covered the Ramen-San Lincoln Park opening and got 800K views. I know how to capture the line energy and first-bite reactions.',
      compensationAsk: '$400',
      availabilityConfirmed: true,
      contactEmail: 'katelyn.liu@gmail.com',
      aiMatchScore: 91,
      aiMatchRationale: 'Proven grand opening content experience with viral results. Energetic style perfect for capturing opening-day buzz.',
      status: 'SELECTED',
      selectedAt: new Date('2026-02-25'),
    },
  });
  console.log('  App 3a: Katelyn x LP Grand Opening (score 91, SELECTED)');

  await prisma.application.create({
    data: {
      briefId: brief3.id,
      creatorName: 'Shaurya Garg',
      creatorHandle: 'shaurya.eats',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 8200,
      engagementRate: 6.2,
      contentStyleTags: ['Warm', 'Close-up', 'Storytelling'],
      pitch: 'I\'d love to capture the grand opening from a storytelling angle — the anticipation, the reveal, the first happy customers.',
      compensationAsk: '$350',
      availabilityConfirmed: true,
      contactEmail: 'shaurya@gmail.com',
      aiMatchScore: 88,
      aiMatchRationale: 'Strong brand-fit storytelling. Slightly lower reach than ideal for a grand opening event.',
      status: 'PENDING',
    },
  });
  console.log('  App 3b: Shaurya x LP Grand Opening (score 88, PENDING)');

  await prisma.application.create({
    data: {
      briefId: brief3.id,
      creatorName: 'Marcus Williams',
      creatorHandle: 'marcus.golden',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 11200,
      engagementRate: 6.7,
      contentStyleTags: ['Golden Hour', 'Warm', 'Editorial'],
      pitch: 'I specialize in golden-hour editorial photography. I\'d capture the daytime energy at the grand opening with warm, inviting tones.',
      compensationAsk: '$350',
      availabilityConfirmed: true,
      contactEmail: 'marcus@locale.app',
      aiMatchScore: 80,
      aiMatchRationale: 'Strong editorial photographer. Warm style complements the brand. Good for daytime coverage.',
      status: 'PENDING',
    },
  });
  console.log('  App 3c: Marcus x LP Grand Opening (score 80, PENDING)');

  // --- Brief 4: Weeknight Happy Hour (OPEN, 3 apps) ---
  const app4a = await prisma.application.create({
    data: {
      briefId: brief4.id,
      creatorName: 'Dani Reyes',
      creatorHandle: 'dani.creates',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 3100,
      engagementRate: 8.1,
      topPostUrls: ['https://instagram.com/p/example3'],
      contentStyleTags: ['Documentary', 'Raw', 'Candid'],
      pitch: 'I live around the corner and I\'m already a regular on Tuesday nights. My documentary style captures real moments — not staged ones.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'dani.reyes@gmail.com',
      aiMatchScore: 87,
      aiMatchRationale: 'Hyper-local creator who already knows the venue. Documentary style perfect for authentic after-work vibes.',
      status: 'SELECTED',
      selectedAt: new Date('2026-02-18'),
    },
  });
  console.log('  App 4a: Dani x Weeknight Happy Hour (score 87, SELECTED)');

  await prisma.application.create({
    data: {
      briefId: brief4.id,
      creatorName: 'Lucy Wang',
      creatorHandle: 'lucy.tastes',
      creatorPlatform: 'TIKTOK',
      followerCount: 32000,
      engagementRate: 5.1,
      contentStyleTags: ['Cinematic', 'Story-driven', 'Moody'],
      pitch: 'My cinematic style would make the happy hour feel like a scene from a movie. Moody lighting, close-ups, the whole after-work narrative.',
      compensationAsk: '$250',
      availabilityConfirmed: true,
      contactEmail: 'lucy.wang@gmail.com',
      aiMatchScore: 73,
      aiMatchRationale: 'Cinematic style is interesting but moody tone may not match the "fun weeknight" energy needed.',
      status: 'PENDING',
    },
  });
  console.log('  App 4b: Lucy x Weeknight Happy Hour (score 73, PENDING)');

  await prisma.application.create({
    data: {
      briefId: brief4.id,
      creatorName: 'Mike Chen',
      creatorHandle: 'mikechen.photo',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 45000,
      engagementRate: 3.2,
      contentStyleTags: ['Clean', 'Minimalist', 'Editorial'],
      pitch: 'I can provide polished editorial photography of the happy hour setup — drinks, small plates, the ambiance.',
      compensationAsk: '$400',
      availabilityConfirmed: true,
      contactEmail: 'mike.chen@gmail.com',
      aiMatchScore: 62,
      aiMatchRationale: 'Minimalist style doesn\'t match the warm, cozy Todoroki brand. Also over budget.',
      status: 'DECLINED',
    },
  });
  console.log('  App 4c: Mike x Weeknight Happy Hour (score 62, DECLINED)');

  // --- Brief 5: Fall Menu Refresh (OPEN, 3 apps) ---
  const app5a = await prisma.application.create({
    data: {
      briefId: brief5.id,
      creatorName: 'Emma Nakamura',
      creatorHandle: 'emma.bakes',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 15800,
      engagementRate: 5.4,
      topPostUrls: ['https://instagram.com/p/example7', 'https://instagram.com/p/example8'],
      contentStyleTags: ['Warm', 'Cozy', 'Styled'],
      pitch: 'Fall food content is my favorite — warm tones, steaming bowls, cozy vibes. I\'ve done seasonal shoots for 4 restaurants and know how to make autumn menus look irresistible.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'emma.nakamura@gmail.com',
      aiMatchScore: 94,
      aiMatchRationale: 'Perfect style alignment for fall seasonal content. Warm, cozy aesthetic matches Todoroki brand identity exactly.',
      status: 'SELECTED',
      selectedAt: new Date('2026-02-22'),
    },
  });
  console.log('  App 5a: Emma x Fall Menu (score 94, SELECTED)');

  await prisma.application.create({
    data: {
      briefId: brief5.id,
      creatorName: 'Priya Desai',
      creatorHandle: 'priya.tableview',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 5600,
      engagementRate: 9.1,
      topPostUrls: ['https://instagram.com/p/example10'],
      contentStyleTags: ['Editorial', 'Bright', 'Lifestyle'],
      pitch: 'I love creating styled table content. My editorial approach would make each bowl look like a magazine spread.',
      compensationAsk: '$275',
      availabilityConfirmed: true,
      contactEmail: 'priya@gmail.com',
      aiMatchScore: 82,
      aiMatchRationale: 'Strong editorial style with high engagement. Bright tone may be slightly off for fall theme but adaptable.',
      status: 'PENDING',
    },
  });
  console.log('  App 5b: Priya x Fall Menu (score 82, PENDING)');

  await prisma.application.create({
    data: {
      briefId: brief5.id,
      creatorName: 'Ria Mehra',
      creatorHandle: 'ria.bitesize',
      creatorPlatform: 'YOUTUBE',
      followerCount: 67000,
      engagementRate: 3.9,
      contentStyleTags: ['Editorial', 'Long-form', 'Polished'],
      pitch: 'I can create a full YouTube video showcasing the fall menu alongside Instagram carousel content. My editorial style matches the warm autumn vibe.',
      compensationAsk: '$400',
      availabilityConfirmed: true,
      contactEmail: 'ria.mehra@gmail.com',
      aiMatchScore: 76,
      aiMatchRationale: 'Strong reach and editorial quality. YouTube focus doesn\'t match brief\'s Carousel/Photo format preference.',
      status: 'PENDING',
    },
  });
  console.log('  App 5c: Ria x Fall Menu (score 76, PENDING)');

  // --- Brief 6: Behind the Counter (OPEN, 3 apps) ---
  const app6a = await prisma.application.create({
    data: {
      briefId: brief6.id,
      creatorName: 'Marcus Williams',
      creatorHandle: 'marcus.golden',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 11200,
      engagementRate: 6.7,
      topPostUrls: ['https://instagram.com/p/example_marcus1'],
      contentStyleTags: ['Golden Hour', 'Warm', 'Editorial'],
      pitch: 'I\'ve shot behind-the-scenes content for 3 restaurants. My warm editorial style captures the craft and passion. Early morning kitchen light is my favorite.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'marcus@locale.app',
      aiMatchScore: 90,
      aiMatchRationale: 'Warm editorial style ideal for behind-the-scenes content. Restaurant BTS experience is directly relevant.',
      status: 'SELECTED',
      selectedAt: new Date('2026-02-15'),
    },
  });
  console.log('  App 6a: Marcus x Behind the Counter (score 90, SELECTED)');

  await prisma.application.create({
    data: {
      briefId: brief6.id,
      creatorName: 'Dani Reyes',
      creatorHandle: 'dani.creates',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 3100,
      engagementRate: 8.1,
      contentStyleTags: ['Documentary', 'Raw', 'Candid'],
      pitch: 'Documentary-style BTS content is literally what I do best. I can make the kitchen look poetic.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'dani.reyes@gmail.com',
      aiMatchScore: 88,
      aiMatchRationale: 'Documentary style is a great fit for BTS content. Hyper-local presence adds authenticity.',
      status: 'PENDING',
    },
  });
  console.log('  App 6b: Dani x Behind the Counter (score 88, PENDING)');

  await prisma.application.create({
    data: {
      briefId: brief6.id,
      creatorName: 'Jin Park',
      creatorHandle: 'jin.foodie',
      creatorPlatform: 'YOUTUBE',
      followerCount: 18500,
      engagementRate: 4.8,
      contentStyleTags: ['Vlog', 'Detailed', 'Long-form'],
      pitch: 'A BTS episode about Todoroki\'s kitchen process would be incredible content for my ramen-focused YouTube channel.',
      compensationAsk: '$300',
      availabilityConfirmed: true,
      contactEmail: 'jin.park@gmail.com',
      aiMatchScore: 68,
      aiMatchRationale: 'YouTube long-form doesn\'t match brief\'s Reel/TikTok format. Content would be good but wrong platform.',
      status: 'DECLINED',
    },
  });
  console.log('  App 6c: Jin x Behind the Counter (score 68, DECLINED)');

  // --- Brief 7: Ramen Festival (CLOSED, 2 apps) ---
  const app7a = await prisma.application.create({
    data: {
      briefId: brief7.id,
      creatorName: 'Priya Desai',
      creatorHandle: 'priya.tableview',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 5600,
      engagementRate: 9.1,
      topPostUrls: ['https://instagram.com/p/example10'],
      contentStyleTags: ['Editorial', 'Bright', 'Lifestyle'],
      pitch: 'I covered 3 food festivals last year and know how to capture the energy, the lines, and the food all in one cohesive story.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'priya@gmail.com',
      aiMatchScore: 89,
      aiMatchRationale: 'Festival coverage experience. Bright editorial style captures event energy well.',
      status: 'SELECTED',
      selectedAt: new Date('2026-01-10'),
    },
  });
  console.log('  App 7a: Priya x Ramen Festival (score 89, SELECTED)');

  await prisma.application.create({
    data: {
      briefId: brief7.id,
      creatorName: 'Lucy Wang',
      creatorHandle: 'lucy.tastes',
      creatorPlatform: 'TIKTOK',
      followerCount: 32000,
      engagementRate: 5.1,
      contentStyleTags: ['Cinematic', 'Story-driven', 'Moody'],
      pitch: 'My cinematic style would create a beautiful festival mini-doc. I\'ve covered similar events with great engagement.',
      compensationAsk: '$350',
      availabilityConfirmed: true,
      contactEmail: 'lucy.wang@gmail.com',
      aiMatchScore: 74,
      aiMatchRationale: 'Cinematic approach could work but moody tone might not suit the bright festival atmosphere.',
      status: 'DECLINED',
    },
  });
  console.log('  App 7b: Lucy x Ramen Festival (score 74, DECLINED)');

  // --- Brief 8: Valentine's Special (CLOSED, 3 apps) ---
  const app8a = await prisma.application.create({
    data: {
      briefId: brief8.id,
      creatorName: 'Lucy Wang',
      creatorHandle: 'lucy.tastes',
      creatorPlatform: 'TIKTOK',
      followerCount: 32000,
      engagementRate: 5.1,
      contentStyleTags: ['Cinematic', 'Story-driven', 'Moody'],
      pitch: 'Valentine\'s content is perfect for my cinematic style. Candlelight, intimate close-ups, the romantic reveal of the special set — I\'ll make it feel like a movie.',
      compensationAsk: '$300',
      availabilityConfirmed: true,
      contactEmail: 'lucy.wang@gmail.com',
      aiMatchScore: 93,
      aiMatchRationale: 'Cinematic, moody style is ideal for romantic Valentine\'s content. Candlelight tone matches perfectly.',
      status: 'SELECTED',
      selectedAt: new Date('2026-02-03'),
    },
  });
  console.log('  App 8a: Lucy x Valentine\'s (score 93, SELECTED)');

  await prisma.application.create({
    data: {
      briefId: brief8.id,
      creatorName: 'Ava Thompson',
      creatorHandle: 'ava.eats.local',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 9400,
      engagementRate: 7.5,
      contentStyleTags: ['Clean', 'Natural Light', 'Story-driven'],
      pitch: 'I\'d love to capture the Valentine\'s set with natural, warm lighting. My style is intimate and approachable.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'ava.thompson@gmail.com',
      aiMatchScore: 79,
      aiMatchRationale: 'Good storytelling style but natural-light approach may not suit candlelit Valentine\'s setting.',
      status: 'DECLINED',
    },
  });
  console.log('  App 8b: Ava x Valentine\'s (score 79, DECLINED)');

  await prisma.application.create({
    data: {
      briefId: brief8.id,
      creatorName: 'Mike Chen',
      creatorHandle: 'mikechen.photo',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 45000,
      engagementRate: 3.2,
      contentStyleTags: ['Clean', 'Minimalist', 'Editorial'],
      pitch: 'I can provide clean, editorial-quality photos of the Valentine\'s set that would work for both social and print.',
      compensationAsk: '$500',
      availabilityConfirmed: true,
      contactEmail: 'mike.chen@gmail.com',
      aiMatchScore: 58,
      aiMatchRationale: 'Clean minimalist style doesn\'t match the warm, romantic brief. Significantly over budget.',
      status: 'REJECTED',
    },
  });
  console.log('  App 8c: Mike x Valentine\'s (score 58, REJECTED)');

  // --- Brief 9: Holiday Catering (CLOSED, 2 apps) ---
  const app9a = await prisma.application.create({
    data: {
      briefId: brief9.id,
      creatorName: 'Sam Okafor',
      creatorHandle: 'sam.eats.chi',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 21000,
      engagementRate: 4.7,
      topPostUrls: ['https://instagram.com/p/example_sam1'],
      contentStyleTags: ['Bright', 'Lifestyle', 'Community'],
      pitch: 'I specialize in group dining and event content. Holiday catering is all about the communal experience — I\'ll capture the warmth.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'sam.okafor@gmail.com',
      aiMatchScore: 85,
      aiMatchRationale: 'Community-focused creator with event coverage experience. Bright style suits holiday gathering atmosphere.',
      status: 'SELECTED',
      selectedAt: new Date('2025-12-01'),
    },
  });
  console.log('  App 9a: Sam x Holiday Catering (score 85, SELECTED)');

  await prisma.application.create({
    data: {
      briefId: brief9.id,
      creatorName: 'Ria Mehra',
      creatorHandle: 'ria.bitesize',
      creatorPlatform: 'YOUTUBE',
      followerCount: 67000,
      engagementRate: 3.9,
      contentStyleTags: ['Editorial', 'Long-form', 'Polished'],
      pitch: 'I can create a "Holiday Entertaining with Todoroki" YouTube video alongside the Instagram content. Full catering unboxing and setup.',
      compensationAsk: '$350',
      availabilityConfirmed: true,
      contactEmail: 'ria.mehra@gmail.com',
      aiMatchScore: 77,
      aiMatchRationale: 'Long-form YouTube content could expand reach. Polished style works for catering showcase.',
      status: 'PENDING',
    },
  });
  console.log('  App 9b: Ria x Holiday Catering (score 77, PENDING)');

  // --- Brief 10: Staff Spotlight (CLOSED, 2 apps) ---
  const app10a = await prisma.application.create({
    data: {
      briefId: brief10.id,
      creatorName: 'Ava Thompson',
      creatorHandle: 'ava.eats.local',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 9400,
      engagementRate: 7.5,
      contentStyleTags: ['Clean', 'Natural Light', 'Story-driven'],
      pitch: 'Portraits of real people are my favorite thing to shoot. I\'ll make each staff member look like the star they are.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'ava.thompson@gmail.com',
      aiMatchScore: 86,
      aiMatchRationale: 'Natural-light portrait style ideal for staff features. Story-driven approach adds personality.',
      status: 'SELECTED',
      selectedAt: new Date('2025-11-10'),
    },
  });
  console.log('  App 10a: Ava x Staff Spotlight (score 86, SELECTED)');

  await prisma.application.create({
    data: {
      briefId: brief10.id,
      creatorName: 'Dani Reyes',
      creatorHandle: 'dani.creates',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 3100,
      engagementRate: 8.1,
      contentStyleTags: ['Documentary', 'Raw', 'Candid'],
      pitch: 'I already know some of the staff from being a regular. My candid style would capture genuine personality moments.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'dani.reyes@gmail.com',
      aiMatchScore: 83,
      aiMatchRationale: 'Local connection adds authenticity. Documentary style good but might feel too raw for portrait-focused brief.',
      status: 'WITHDRAWN',
    },
  });
  console.log('  App 10b: Dani x Staff Spotlight (score 83, WITHDRAWN)');

  // --- Brief 11: New Year's Countdown (CANCELLED, 2 apps) ---
  await prisma.application.create({
    data: {
      briefId: brief11.id,
      creatorName: 'Lucy Wang',
      creatorHandle: 'lucy.tastes',
      creatorPlatform: 'TIKTOK',
      followerCount: 32000,
      engagementRate: 5.1,
      contentStyleTags: ['Cinematic', 'Story-driven', 'Moody'],
      pitch: 'NYE at a ramen shop? My cinematic style would make this iconic. Countdown, steam, cheers over bowls.',
      compensationAsk: '$350',
      availabilityConfirmed: true,
      contactEmail: 'lucy.wang@gmail.com',
      aiMatchScore: 82,
      aiMatchRationale: 'Cinematic style great for NYE atmosphere. Strong potential for viral moment.',
      status: 'PENDING',
    },
  });
  console.log('  App 11a: Lucy x New Year\'s (score 82, PENDING)');

  await prisma.application.create({
    data: {
      briefId: brief11.id,
      creatorName: 'Jin Park',
      creatorHandle: 'jin.foodie',
      creatorPlatform: 'YOUTUBE',
      followerCount: 18500,
      engagementRate: 4.8,
      contentStyleTags: ['Vlog', 'Detailed', 'Long-form'],
      pitch: 'A NYE vlog at Todoroki would be amazing content. The countdown, special menu reveal, the whole experience.',
      compensationAsk: '$350',
      availabilityConfirmed: true,
      contactEmail: 'jin.park@gmail.com',
      aiMatchScore: 70,
      aiMatchRationale: 'Vlog format could capture the experience well. YouTube format doesn\'t match brief\'s Reel/TikTok focus.',
      status: 'PENDING',
    },
  });
  console.log('  App 11b: Jin x New Year\'s (score 70, PENDING)');

  // --- Brief 12: Anniversary (CANCELLED, 2 apps — one was SELECTED before cancellation) ---
  const app12a = await prisma.application.create({
    data: {
      briefId: brief12.id,
      creatorName: 'Jin Park',
      creatorHandle: 'jin.foodie',
      creatorPlatform: 'YOUTUBE',
      followerCount: 18500,
      engagementRate: 4.8,
      contentStyleTags: ['Vlog', 'Detailed', 'Long-form'],
      pitch: 'I\'d love to document the anniversary celebration — the history, the loyal customers, what makes Todoroki special after 3 years.',
      compensationAsk: '$300',
      availabilityConfirmed: true,
      contactEmail: 'jin.park@gmail.com',
      aiMatchScore: 84,
      aiMatchRationale: 'Storytelling vlog format ideal for anniversary narrative. YouTube reach would amplify the milestone.',
      status: 'SELECTED',
      selectedAt: new Date('2025-10-05'),
    },
  });
  console.log('  App 12a: Jin x Anniversary (score 84, SELECTED)');

  await prisma.application.create({
    data: {
      briefId: brief12.id,
      creatorName: 'Emma Nakamura',
      creatorHandle: 'emma.bakes',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 15800,
      engagementRate: 5.4,
      contentStyleTags: ['Warm', 'Cozy', 'Styled'],
      pitch: 'Anniversaries are celebrations! I\'d capture the warm, community feeling with styled shots of the special menu.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'emma.nakamura@gmail.com',
      aiMatchScore: 80,
      aiMatchRationale: 'Warm cozy style fits anniversary theme. Instagram focus matches brief deliverables.',
      status: 'DECLINED',
    },
  });
  console.log('  App 12b: Emma x Anniversary (score 80, DECLINED)\n');

  // ─── PROJECTS ─────────────────────────────────────────────────
  console.log('Creating projects...');

  // P1: AWAITING_CREATOR_ACCEPTANCE (from Brief 2 — Summer Ramen)
  const p1Token = crypto.randomUUID();
  const project1 = await prisma.project.create({
    data: {
      applicationId: app2a.id,
      brandProfileId: todorokiBrand.id,
      creatorName: 'Shaurya Garg',
      creatorEmail: 'shaurya@gmail.com',
      creatorAccessToken: p1Token,
      status: 'AWAITING_CREATOR_ACCEPTANCE',
      briefText: 'Summer Ramen Launch — bright, summery energy for the new cold ramen and seasonal sides.',
      deliverables: '1 Reel + 1 Carousel + 1 Story',
      price: 20000,
      compensationType: 'FLAT_FEE',
      usageRights: 'ALL',
      revisionsIncluded: 1,
      contentDueAt: new Date('2026-03-15'),
      createdAt: new Date('2026-02-20'),
    },
  });
  console.log('  P1: Todoroki x Shaurya — AWAITING_CREATOR_ACCEPTANCE');

  // P2: ACCEPTED (from Brief 3 — LP Grand Opening)
  const p2Token = crypto.randomUUID();
  const project2 = await prisma.project.create({
    data: {
      applicationId: app3a.id,
      brandProfileId: todorokiBrand.id,
      creatorName: 'Katelyn Liu',
      creatorEmail: 'katelyn.liu@gmail.com',
      creatorAccessToken: p2Token,
      status: 'ACCEPTED',
      briefText: 'Lincoln Park Grand Opening — capture the excitement of our second location opening.',
      deliverables: '2 Reels + 1 TikTok + 2 Photo Sets',
      price: 35000,
      compensationType: 'FLAT_FEE',
      usageRights: 'ALL',
      revisionsIncluded: 2,
      creatorAcceptedAt: new Date('2026-02-26'),
      contentDueAt: new Date('2026-04-15'),
      createdAt: new Date('2026-02-25'),
    },
  });
  console.log('  P2: Todoroki x Katelyn — ACCEPTED');

  // P3: IN_PROGRESS (from Brief 4 — Weeknight Happy Hour)
  const p3Token = crypto.randomUUID();
  const project3 = await prisma.project.create({
    data: {
      applicationId: app4a.id,
      brandProfileId: todorokiBrand.id,
      creatorName: 'Dani Reyes',
      creatorEmail: 'dani.reyes@gmail.com',
      creatorAccessToken: p3Token,
      status: 'IN_PROGRESS',
      briefText: 'Weeknight Happy Hour Promo — make Tuesday-Thursday nights look like the place to be.',
      deliverables: '1 Reel + 1 Story',
      price: 18000,
      compensationType: 'HYBRID',
      compensationDetails: { description: '$180 cash + complimentary dinner for 2', cashAmount: 18000, productValue: 8000 },
      usageRights: 'ORGANIC_SOCIAL',
      revisionsIncluded: 1,
      creatorAcceptedAt: new Date('2026-02-19'),
      contentDueAt: new Date('2026-03-30'),
      createdAt: new Date('2026-02-18'),
    },
  });
  console.log('  P3: Todoroki x Dani — IN_PROGRESS');

  // P4: DRAFT_SUBMITTED (from Brief 5 — Fall Menu Refresh)
  const p4Token = crypto.randomUUID();
  const project4 = await prisma.project.create({
    data: {
      applicationId: app5a.id,
      brandProfileId: todorokiBrand.id,
      creatorName: 'Emma Nakamura',
      creatorEmail: 'emma.nakamura@gmail.com',
      creatorAccessToken: p4Token,
      status: 'DRAFT_SUBMITTED',
      briefText: 'Fall Menu Refresh — warm autumn tones, cozy comfort food vibes for the new miso-based bowls.',
      deliverables: '2 Carousels + 1 Photo Set',
      price: 25000,
      compensationType: 'FLAT_FEE',
      usageRights: 'ALL',
      revisionsIncluded: 1,
      creatorAcceptedAt: new Date('2026-02-23'),
      contentDueAt: new Date('2026-04-01'),
      createdAt: new Date('2026-02-22'),
    },
  });
  console.log('  P4: Todoroki x Emma — DRAFT_SUBMITTED');

  // P5: REVISION_REQUESTED (from Brief 6 — Behind the Counter)
  const p5Token = crypto.randomUUID();
  const project5 = await prisma.project.create({
    data: {
      applicationId: app6a.id,
      brandProfileId: todorokiBrand.id,
      creatorName: 'Marcus Williams',
      creatorEmail: 'marcus@locale.app',
      creatorAccessToken: p5Token,
      status: 'REVISION_REQUESTED',
      briefText: 'Behind the Counter Series — raw documentary-style showing the craft of noodle making and broth simmering.',
      deliverables: '2 Reels + 1 TikTok',
      price: 0,
      compensationType: 'FREE_PRODUCT',
      compensationDetails: { description: 'Complimentary ramen for 4 visits + feature on our social channels' },
      usageRights: 'ORGANIC_SOCIAL',
      revisionsIncluded: 2,
      revisionsUsed: 1,
      creatorAcceptedAt: new Date('2026-02-16'),
      contentDueAt: null,
      createdAt: new Date('2026-02-15'),
    },
  });
  console.log('  P5: Todoroki x Marcus — REVISION_REQUESTED');

  // P6: APPROVED (from Brief 7 — Ramen Festival)
  const p6Token = crypto.randomUUID();
  const project6 = await prisma.project.create({
    data: {
      applicationId: app7a.id,
      brandProfileId: todorokiBrand.id,
      creatorName: 'Priya Desai',
      creatorEmail: 'priya@gmail.com',
      creatorAccessToken: p6Token,
      status: 'APPROVED',
      briefText: 'Ramen Festival Coverage — capture our booth at the Chicago Ramen Fest. Lines, bowls, happy faces.',
      deliverables: '1 Reel + 2 Stories + 1 Photo Set',
      price: 27500,
      compensationType: 'FLAT_FEE',
      usageRights: 'ALL',
      revisionsIncluded: 1,
      creatorAcceptedAt: new Date('2026-01-11'),
      contentDueAt: new Date('2026-01-20'),
      createdAt: new Date('2026-01-10'),
    },
  });
  console.log('  P6: Todoroki x Priya — APPROVED');

  // P7: COMPLETED with multiple revisions (from Brief 8 — Valentine's Special)
  const p7Token = crypto.randomUUID();
  const project7 = await prisma.project.create({
    data: {
      applicationId: app8a.id,
      brandProfileId: todorokiBrand.id,
      creatorName: 'Lucy Wang',
      creatorEmail: 'lucy.wang@gmail.com',
      creatorAccessToken: p7Token,
      status: 'COMPLETED',
      briefText: 'Valentine\'s Special Set — romantic, intimate. Two bowls, shared sides, candlelight. Make it a date-night must.',
      deliverables: '1 Carousel + 1 Reel',
      price: 30000,
      compensationType: 'FLAT_FEE',
      usageRights: 'ALL',
      revisionsIncluded: 2,
      revisionsUsed: 2,
      creatorAcceptedAt: new Date('2026-02-04'),
      contentDueAt: new Date('2026-02-12'),
      completedAt: new Date('2026-02-11'),
      createdAt: new Date('2026-02-03'),
    },
  });
  console.log('  P7: Todoroki x Lucy — COMPLETED (multi-revision)');

  // P8: DISPUTED (from Brief 9 — Holiday Catering)
  const p8Token = crypto.randomUUID();
  const project8 = await prisma.project.create({
    data: {
      applicationId: app9a.id,
      brandProfileId: todorokiBrand.id,
      creatorName: 'Sam Okafor',
      creatorEmail: 'sam.okafor@gmail.com',
      creatorAccessToken: p8Token,
      status: 'DISPUTED',
      briefText: 'Holiday Catering Push — show catering trays and party packs for holiday gatherings.',
      deliverables: '2 Carousels + 1 Photo Set',
      price: 22500,
      compensationType: 'HYBRID',
      compensationDetails: { description: '$225 cash + free catering tray ($150 value)', cashAmount: 22500, productValue: 15000 },
      usageRights: 'ALL',
      revisionsIncluded: 1,
      creatorAcceptedAt: new Date('2025-12-02'),
      contentDueAt: new Date('2025-12-15'),
      createdAt: new Date('2025-12-01'),
    },
  });
  console.log('  P8: Todoroki x Sam — DISPUTED');

  // P9: COMPLETED but refunded (from Brief 10 — Staff Spotlight)
  const p9Token = crypto.randomUUID();
  const project9 = await prisma.project.create({
    data: {
      applicationId: app10a.id,
      brandProfileId: todorokiBrand.id,
      creatorName: 'Ava Thompson',
      creatorEmail: 'ava.thompson@gmail.com',
      creatorAccessToken: p9Token,
      status: 'COMPLETED',
      briefText: 'Staff Spotlight Series — warm portraits and mini-interviews with the team.',
      deliverables: '1 Reel + 1 Carousel',
      price: 20000,
      compensationType: 'FLAT_FEE',
      usageRights: 'ORGANIC_SOCIAL',
      revisionsIncluded: 1,
      creatorAcceptedAt: new Date('2025-11-11'),
      contentDueAt: new Date('2025-11-30'),
      completedAt: new Date('2025-11-28'),
      createdAt: new Date('2025-11-10'),
    },
  });
  console.log('  P9: Todoroki x Ava — COMPLETED (refunded)');

  // P10: AWAITING_CREATOR_ACCEPTANCE with failed payment (from Brief 12 — Anniversary)
  const p10Token = crypto.randomUUID();
  const project10 = await prisma.project.create({
    data: {
      applicationId: app12a.id,
      brandProfileId: todorokiBrand.id,
      creatorName: 'Jin Park',
      creatorEmail: 'jin.park@gmail.com',
      creatorAccessToken: p10Token,
      status: 'AWAITING_CREATOR_ACCEPTANCE',
      briefText: 'Anniversary Celebration — document the 3-year journey, loyal customers, and celebration.',
      deliverables: '1 Reel + 2 Photo Sets',
      price: 30000,
      compensationType: 'FLAT_FEE',
      usageRights: 'ALL',
      revisionsIncluded: 1,
      contentDueAt: new Date('2025-10-15'),
      createdAt: new Date('2025-10-05'),
    },
  });
  console.log('  P10: Todoroki x Jin — AWAITING_CREATOR_ACCEPTANCE (failed payment)\n');

  // ─── PROJECT DRAFTS ───────────────────────────────────────────
  console.log('Creating project drafts...');

  // P4 draft: SUBMITTED (project is DRAFT_SUBMITTED)
  await prisma.projectDraft.create({
    data: {
      projectId: project4.id,
      version: 1,
      fileUrls: [
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
        'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600',
      ],
      notes: 'First draft of the fall menu carousel — warm tones, miso bowls with autumn garnishes. Let me know if the color grading feels right!',
      status: 'SUBMITTED',
      createdAt: new Date('2026-02-25'),
    },
  });
  console.log('  P4 draft v1: SUBMITTED');

  // P5 draft: REVISION_REQUESTED (project is REVISION_REQUESTED)
  await prisma.projectDraft.create({
    data: {
      projectId: project5.id,
      version: 1,
      fileUrls: [
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
      ],
      notes: 'First batch of behind-the-counter footage — morning prep, noodle pulling, broth tasting. Raw, documentary feel.',
      feedback: 'Love the raw energy! But the noodle-pulling sequence needs better lighting — it\'s a bit too dark. Can you reshoot that section during the afternoon prep window? Also, would love one shot that shows the finished bowl alongside the prep process.',
      status: 'REVISION_REQUESTED',
      createdAt: new Date('2026-02-20'),
    },
  });
  console.log('  P5 draft v1: REVISION_REQUESTED');

  // P6 draft: APPROVED (project is APPROVED)
  await prisma.projectDraft.create({
    data: {
      projectId: project6.id,
      version: 1,
      fileUrls: [
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
      ],
      notes: 'Full festival coverage — booth setup, the line, taste reactions, and the winning moment when we sold out. Mixed Reels and photo set.',
      feedback: 'Perfect! The sold-out moment is incredible. Great work capturing the energy. Approved!',
      status: 'APPROVED',
      createdAt: new Date('2026-01-19'),
    },
  });
  console.log('  P6 draft v1: APPROVED');

  // P7 drafts: 3 versions (REV_REQ → REV_REQ → APPROVED)
  await prisma.projectDraft.create({
    data: {
      projectId: project7.id,
      version: 1,
      fileUrls: [
        'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600',
      ],
      notes: 'First take — candlelight ramen reveal. Going for that moody, romantic film grain look.',
      feedback: 'The mood is great but the food isn\'t visible enough in the candlelight. Can we get some fill light on the bowls without losing the ambiance? Also, the carousel needs more than 1 image.',
      status: 'REVISION_REQUESTED',
      createdAt: new Date('2026-02-07'),
    },
  });
  console.log('  P7 draft v1: REVISION_REQUESTED');

  await prisma.projectDraft.create({
    data: {
      projectId: project7.id,
      version: 2,
      fileUrls: [
        'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600',
        'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
      ],
      notes: 'Added fill light on the bowls, kept the warm candlelight ambiance. Added more carousel frames — close-up of the set, couple sharing, and the sides.',
      feedback: 'Much better on the lighting! The carousel is great. One more tweak — the Reel audio doesn\'t match the romantic vibe. Can you swap to something softer? Everything else is perfect.',
      status: 'REVISION_REQUESTED',
      createdAt: new Date('2026-02-09'),
    },
  });
  console.log('  P7 draft v2: REVISION_REQUESTED');

  await prisma.projectDraft.create({
    data: {
      projectId: project7.id,
      version: 3,
      fileUrls: [
        'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600',
        'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
      ],
      notes: 'Swapped the Reel audio to a softer lo-fi track. Everything else unchanged from v2. Final version!',
      feedback: 'Beautiful work, Lucy. This is exactly what we wanted. Approved!',
      status: 'APPROVED',
      createdAt: new Date('2026-02-10'),
    },
  });
  console.log('  P7 draft v3: APPROVED');

  // P8 draft: SUBMITTED (project is DISPUTED — creator submitted but brand disputes quality)
  await prisma.projectDraft.create({
    data: {
      projectId: project8.id,
      version: 1,
      fileUrls: [
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
      ],
      notes: 'Holiday catering shots — trays, individual portions, and the party setup.',
      status: 'SUBMITTED',
      createdAt: new Date('2025-12-12'),
    },
  });
  console.log('  P8 draft v1: SUBMITTED (disputed)\n');

  // ─── TRANSACTIONS ─────────────────────────────────────────────
  console.log('Creating transactions...');

  // P1: PENDING (just created, awaiting creator acceptance)
  await prisma.transaction.create({
    data: {
      projectId: project1.id,
      amount: 20000,
      platformFee: 2000,
      creatorPayout: 18000,
      status: 'PENDING',
      escrowStatus: 'HELD',
      demoMode: true,
    },
  });
  console.log('  Tx P1: $200 PENDING / HELD');

  // P2: ESCROW_HELD (creator accepted)
  await prisma.transaction.create({
    data: {
      projectId: project2.id,
      amount: 35000,
      platformFee: 3500,
      creatorPayout: 31500,
      status: 'ESCROW_HELD',
      escrowStatus: 'HELD',
      demoMode: true,
    },
  });
  console.log('  Tx P2: $350 ESCROW_HELD / HELD');

  // P3: ESCROW_HELD (in progress)
  await prisma.transaction.create({
    data: {
      projectId: project3.id,
      amount: 18000,
      platformFee: 1800,
      creatorPayout: 16200,
      status: 'ESCROW_HELD',
      escrowStatus: 'HELD',
      demoMode: true,
    },
  });
  console.log('  Tx P3: $180 ESCROW_HELD / HELD');

  // P4: ESCROW_HELD (draft submitted, awaiting review)
  await prisma.transaction.create({
    data: {
      projectId: project4.id,
      amount: 25000,
      platformFee: 2500,
      creatorPayout: 22500,
      status: 'ESCROW_HELD',
      escrowStatus: 'HELD',
      demoMode: true,
    },
  });
  console.log('  Tx P4: $250 ESCROW_HELD / HELD');

  // P5: ESCROW_HELD (revision requested)
  await prisma.transaction.create({
    data: {
      projectId: project5.id,
      amount: 0,
      platformFee: 0,
      creatorPayout: 0,
      status: 'ESCROW_HELD',
      escrowStatus: 'HELD',
      demoMode: true,
    },
  });
  console.log('  Tx P5: $0 (free product) ESCROW_HELD / HELD');

  // P6: ESCROW_HELD (approved, about to release)
  await prisma.transaction.create({
    data: {
      projectId: project6.id,
      amount: 27500,
      platformFee: 2750,
      creatorPayout: 24750,
      status: 'ESCROW_HELD',
      escrowStatus: 'HELD',
      demoMode: true,
    },
  });
  console.log('  Tx P6: $275 ESCROW_HELD / HELD');

  // P7: RELEASED (completed)
  await prisma.transaction.create({
    data: {
      projectId: project7.id,
      amount: 30000,
      platformFee: 3000,
      creatorPayout: 27000,
      status: 'RELEASED',
      escrowStatus: 'RELEASED',
      demoMode: true,
    },
  });
  console.log('  Tx P7: $300 RELEASED / RELEASED');

  // P8: ESCROW_HELD + DISPUTED (disputed project)
  await prisma.transaction.create({
    data: {
      projectId: project8.id,
      amount: 22500,
      platformFee: 2250,
      creatorPayout: 20250,
      status: 'ESCROW_HELD',
      escrowStatus: 'DISPUTED',
      demoMode: true,
    },
  });
  console.log('  Tx P8: $225 ESCROW_HELD / DISPUTED');

  // P9: REFUNDED (completed then refunded)
  await prisma.transaction.create({
    data: {
      projectId: project9.id,
      amount: 20000,
      platformFee: 2000,
      creatorPayout: 18000,
      status: 'REFUNDED',
      escrowStatus: 'CANCELLED',
      demoMode: true,
    },
  });
  console.log('  Tx P9: $200 REFUNDED / CANCELLED');

  // P10: FAILED (payment processing failed)
  await prisma.transaction.create({
    data: {
      projectId: project10.id,
      amount: 30000,
      platformFee: 3000,
      creatorPayout: 27000,
      status: 'FAILED',
      escrowStatus: 'HELD',
      demoMode: true,
    },
  });
  console.log('  Tx P10: $300 FAILED / HELD\n');

  // ─── MESSAGES ─────────────────────────────────────────────────
  console.log('Creating messages...');

  // P3 messages (IN_PROGRESS — active conversation)
  const p3Messages = [
    { senderType: 'BRAND', senderName: 'Josh Rivera', text: 'Hey Dani! Welcome aboard. Excited to have you shoot the happy hour vibe. Any questions about the brief?', createdAt: new Date('2026-02-19T10:00:00Z') },
    { senderType: 'CREATOR', senderName: 'Dani Reyes', text: 'Thanks Josh! Quick question — should I focus more on the drink specials or the food pairings? Or equal split?', createdAt: new Date('2026-02-19T11:30:00Z') },
    { senderType: 'BRAND', senderName: 'Josh Rivera', text: 'Great question — lean 60/40 toward the vibe and people over the actual food. We want it to feel like "this is THE place to be on a Tuesday night."', createdAt: new Date('2026-02-19T12:15:00Z') },
    { senderType: 'CREATOR', senderName: 'Dani Reyes', text: 'Perfect, totally get it. I\'ll come by this Tuesday to scout the lighting and angles. Planning to shoot next week!', createdAt: new Date('2026-02-19T14:00:00Z') },
  ];
  for (const msg of p3Messages) {
    await prisma.message.create({ data: { projectId: project3.id, ...msg } });
  }
  console.log(`  Created ${p3Messages.length} messages for P3 (Weeknight Happy Hour)`);

  // P5 messages (REVISION_REQUESTED)
  const p5Messages = [
    { senderType: 'BRAND', senderName: 'Josh Rivera', text: 'Marcus, the footage is looking great so far! Love the morning prep shots. Just a couple of notes — see the draft feedback.', createdAt: new Date('2026-02-20T16:00:00Z') },
    { senderType: 'CREATOR', senderName: 'Marcus Williams', text: 'Thanks Josh! I\'ll reshoot the noodle section with better lighting this Thursday. I know exactly what angle to get it from.', createdAt: new Date('2026-02-20T17:30:00Z') },
    { senderType: 'BRAND', senderName: 'Josh Rivera', text: 'Sounds good. Come by around 2pm — the light through the front windows is perfect then.', createdAt: new Date('2026-02-20T18:00:00Z') },
  ];
  for (const msg of p5Messages) {
    await prisma.message.create({ data: { projectId: project5.id, ...msg } });
  }
  console.log(`  Created ${p5Messages.length} messages for P5 (Behind the Counter)`);

  // P7 messages (COMPLETED — full revision conversation)
  const p7Messages = [
    { senderType: 'BRAND', senderName: 'Josh Rivera', text: 'Lucy, thanks for the first draft! The mood is spot on but we need the food more visible — see my feedback on the draft.', createdAt: new Date('2026-02-07T15:00:00Z') },
    { senderType: 'CREATOR', senderName: 'Lucy Wang', text: 'Got it — I\'ll add some fill light on the bowls. Working on the carousel frames too. Give me a couple days.', createdAt: new Date('2026-02-07T16:30:00Z') },
    { senderType: 'BRAND', senderName: 'Josh Rivera', text: 'V2 looks much better! Almost there — just the Reel audio needs to be softer. Everything else is great.', createdAt: new Date('2026-02-09T14:00:00Z') },
    { senderType: 'CREATOR', senderName: 'Lucy Wang', text: 'Easy fix! Swapping to a softer lo-fi track now. V3 coming tonight.', createdAt: new Date('2026-02-09T15:00:00Z') },
    { senderType: 'BRAND', senderName: 'Josh Rivera', text: 'Lucy this is beautiful work. Approved! We ran this on our Valentine\'s posts and the engagement was incredible. Thank you!', createdAt: new Date('2026-02-11T10:00:00Z') },
    { senderType: 'CREATOR', senderName: 'Lucy Wang', text: 'So glad you\'re happy with it! The candlelight shots turned out amazing. Would love to work together again!', createdAt: new Date('2026-02-11T11:00:00Z') },
  ];
  for (const msg of p7Messages) {
    await prisma.message.create({ data: { projectId: project7.id, ...msg } });
  }
  console.log(`  Created ${p7Messages.length} messages for P7 (Valentine's Special)`);

  // P8 messages (DISPUTED)
  const p8Messages = [
    { senderType: 'BRAND', senderName: 'Josh Rivera', text: 'Sam, I reviewed the draft and unfortunately the quality doesn\'t meet what we discussed. The images are blurry and the catering trays aren\'t styled as briefed.', createdAt: new Date('2025-12-13T10:00:00Z') },
    { senderType: 'CREATOR', senderName: 'Sam Okafor', text: 'I respectfully disagree — the images match what was in the brief. The casual party styling was intentional to show real-use scenarios.', createdAt: new Date('2025-12-13T12:00:00Z') },
    { senderType: 'BRAND', senderName: 'Josh Rivera', text: 'The brief specifically said "no plastic containers" and "show eco-friendly packaging" — the shots don\'t reflect that. I\'m opening a dispute.', createdAt: new Date('2025-12-13T14:00:00Z') },
  ];
  for (const msg of p8Messages) {
    await prisma.message.create({ data: { projectId: project8.id, ...msg } });
  }
  console.log(`  Created ${p8Messages.length} messages for P8 (Holiday Catering — Disputed)\n`);

  // ─── NOTIFICATIONS ────────────────────────────────────────────
  console.log('Creating notifications...');

  const notifications = [
    // Unread notifications (recent)
    { userId: josh.id, type: 'NEW_APPLICATION', title: 'New application', body: 'Ria Mehra applied to your Fall Menu Refresh brief.', linkUrl: `/operator/brief/${brief5.id}`, read: false, createdAt: new Date('2026-02-25T14:00:00Z') },
    { userId: josh.id, type: 'NEW_APPLICATION', title: 'New application', body: 'Priya Desai applied to your Fall Menu Refresh brief.', linkUrl: `/operator/brief/${brief5.id}`, read: false, createdAt: new Date('2026-02-24T10:00:00Z') },
    { userId: josh.id, type: 'DRAFT_SUBMITTED', title: 'Draft submitted', body: 'Emma Nakamura submitted a draft for the Fall Menu Refresh project.', linkUrl: `/operator/project/${project4.id}`, read: false, createdAt: new Date('2026-02-25T16:00:00Z') },
    { userId: josh.id, type: 'NEW_APPLICATION', title: 'New application', body: 'Marcus Williams applied to your Lincoln Park Grand Opening brief.', linkUrl: `/operator/brief/${brief3.id}`, read: false, createdAt: new Date('2026-02-23T09:00:00Z') },

    // Read notifications (older)
    { userId: josh.id, type: 'NEW_APPLICATION', title: 'New application', body: 'Shaurya Garg applied to your Summer Ramen Launch brief.', linkUrl: `/operator/brief/${brief2.id}`, read: true, createdAt: new Date('2026-02-18T08:00:00Z') },
    { userId: josh.id, type: 'NEW_APPLICATION', title: 'New application', body: 'Katelyn Liu applied to your Lincoln Park Grand Opening brief.', linkUrl: `/operator/brief/${brief3.id}`, read: true, createdAt: new Date('2026-02-22T11:00:00Z') },
    { userId: josh.id, type: 'NEW_APPLICATION', title: 'New application', body: 'Dani Reyes applied to your Weeknight Happy Hour brief.', linkUrl: `/operator/brief/${brief4.id}`, read: true, createdAt: new Date('2026-02-16T15:00:00Z') },
    { userId: josh.id, type: 'DRAFT_SUBMITTED', title: 'Draft submitted', body: 'Marcus Williams submitted a draft for the Behind the Counter project.', linkUrl: `/operator/project/${project5.id}`, read: true, createdAt: new Date('2026-02-20T14:00:00Z') },
    { userId: josh.id, type: 'PROJECT_COMPLETED', title: 'Project completed', body: 'The Valentine\'s Special project with Lucy Wang has been completed!', linkUrl: `/operator/project/${project7.id}`, read: true, createdAt: new Date('2026-02-11T12:00:00Z') },
    { userId: josh.id, type: 'NEW_APPLICATION', title: 'New application', body: 'Lucy Wang applied to your Valentine\'s Special brief.', linkUrl: `/operator/brief/${brief8.id}`, read: true, createdAt: new Date('2026-02-02T10:00:00Z') },
    { userId: josh.id, type: 'NEW_APPLICATION', title: 'New application', body: 'Sam Okafor applied to your Holiday Catering Push brief.', linkUrl: `/operator/brief/${brief9.id}`, read: true, createdAt: new Date('2025-11-30T09:00:00Z') },
    { userId: josh.id, type: 'NEW_APPLICATION', title: 'New application', body: 'Ava Thompson applied to your Staff Spotlight brief.', linkUrl: `/operator/brief/${brief10.id}`, read: true, createdAt: new Date('2025-11-08T14:00:00Z') },
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }
  console.log(`  Created ${notifications.length} notifications (${notifications.filter(n => !n.read).length} unread, ${notifications.filter(n => n.read).length} read)\n`);

  // ─── CAMPAIGN DATA (for Insights) ────────────────────────────
  console.log('Creating campaign data (for Insights)...');

  await prisma.campaignData.createMany({
    data: [
      // Completed campaigns — all for Todoroki
      {
        briefId: brief8.id,
        brandProfileId: todorokiBrand.id,
        campaignGoal: 'EVENT_PROMO',
        contentTypes: ['CAROUSEL', 'REEL'],
        compensationType: 'FLAT_FEE',
        compensationAmount: 30000,
        neighborhood: 'Downtown Evanston',
        city: 'Evanston',
        cuisineTypes: ['Japanese', 'Ramen'],
        numberOfApplications: 3,
        timeToFirstApplication: 120,
        selectedCreatorTier: 'MID',
        wasContentApproved: true,
        revisionsRequested: 2,
        brandSatisfaction: 5,
        completedAt: new Date('2026-02-11T17:00:00Z'),
      },
      {
        briefId: brief7.id,
        brandProfileId: todorokiBrand.id,
        campaignGoal: 'EVENT_PROMO',
        contentTypes: ['REEL', 'STORY', 'PHOTO_SET'],
        compensationType: 'FLAT_FEE',
        compensationAmount: 27500,
        neighborhood: 'Downtown Evanston',
        city: 'Evanston',
        cuisineTypes: ['Japanese', 'Ramen'],
        numberOfApplications: 2,
        timeToFirstApplication: 90,
        selectedCreatorTier: 'NANO',
        wasContentApproved: true,
        revisionsRequested: 0,
        brandSatisfaction: 5,
        completedAt: new Date('2026-01-22T17:00:00Z'),
      },
      {
        briefId: brief10.id,
        brandProfileId: todorokiBrand.id,
        campaignGoal: 'GENERAL_CONTENT',
        contentTypes: ['REEL', 'CAROUSEL'],
        compensationType: 'FLAT_FEE',
        compensationAmount: 20000,
        neighborhood: 'Downtown Evanston',
        city: 'Evanston',
        cuisineTypes: ['Japanese', 'Ramen'],
        numberOfApplications: 2,
        timeToFirstApplication: 45,
        selectedCreatorTier: 'NANO',
        wasContentApproved: true,
        revisionsRequested: 0,
        brandSatisfaction: 4,
        completedAt: new Date('2025-11-28T17:00:00Z'),
      },
      // Historical campaigns (not tied to current briefs)
      {
        briefId: crypto.randomUUID(),
        brandProfileId: todorokiBrand.id,
        campaignGoal: 'MENU_LAUNCH',
        contentTypes: ['REEL', 'CAROUSEL'],
        compensationType: 'FLAT_FEE',
        compensationAmount: 25000,
        neighborhood: 'Downtown Evanston',
        city: 'Evanston',
        cuisineTypes: ['Japanese', 'Ramen'],
        numberOfApplications: 5,
        timeToFirstApplication: 60,
        selectedCreatorTier: 'MICRO',
        wasContentApproved: true,
        revisionsRequested: 1,
        brandSatisfaction: 4,
        completedAt: new Date('2025-10-15T17:00:00Z'),
      },
      {
        briefId: crypto.randomUUID(),
        brandProfileId: todorokiBrand.id,
        campaignGoal: 'SEASONAL_SPECIAL',
        contentTypes: ['PHOTO_SET', 'CAROUSEL'],
        compensationType: 'HYBRID',
        compensationAmount: 20000,
        neighborhood: 'Downtown Evanston',
        city: 'Evanston',
        cuisineTypes: ['Japanese', 'Ramen'],
        numberOfApplications: 4,
        timeToFirstApplication: 180,
        selectedCreatorTier: 'MICRO',
        wasContentApproved: true,
        revisionsRequested: 1,
        brandSatisfaction: 3,
        completedAt: new Date('2025-09-20T17:00:00Z'),
      },
      {
        briefId: crypto.randomUUID(),
        brandProfileId: todorokiBrand.id,
        campaignGoal: 'GRAND_OPENING',
        contentTypes: ['REEL', 'TIKTOK', 'PHOTO_SET'],
        compensationType: 'FLAT_FEE',
        compensationAmount: 40000,
        neighborhood: 'Downtown Evanston',
        city: 'Evanston',
        cuisineTypes: ['Japanese', 'Ramen'],
        numberOfApplications: 8,
        timeToFirstApplication: 30,
        selectedCreatorTier: 'MID',
        wasContentApproved: true,
        revisionsRequested: 0,
        brandSatisfaction: 5,
        completedAt: new Date('2025-08-01T17:00:00Z'),
      },
    ],
  });
  console.log('  Created 6 CampaignData records (Insights unlocked)\n');

  // ─── SUMMARY ──────────────────────────────────────────────────
  console.log('=== Seed complete ===');
  console.log('  2 users (1 loaded operator + 1 blank for onboarding)');
  console.log('  1 brand profile (Todoroki Ramen, PRO/ACTIVE)');
  console.log('  12 briefs (1 DRAFT, 5 OPEN, 4 CLOSED, 2 CANCELLED)');
  console.log('  29 applications (10 SELECTED, 10 PENDING, 5 DECLINED, 2 REJECTED, 2 WITHDRAWN)');
  console.log('  10 projects (all 8 ProjectStatus values + 2 extra for tx coverage)');
  console.log('  7 drafts (2 SUBMITTED, 3 REVISION_REQUESTED, 2 APPROVED)');
  console.log('  10 transactions (PENDING, ESCROW_HELD x4, RELEASED, REFUNDED, FAILED, + DISPUTED/CANCELLED escrow)');
  console.log('  16 messages across 4 projects');
  console.log('  12 notifications (4 unread, 8 read)');
  console.log('  6 campaign data records (Insights unlocked)');
  console.log('\nDemo accounts:');
  console.log('  Loaded: josh@todoroki.com (Josh Rivera / Todoroki Ramen)');
  console.log('  Blank: newoperator@locale.app (onboarding flow)');
  console.log('  Public portal: /portal/briefs (no login required)');
}

// Export main for use by the admin reseed API route
module.exports = { main };

// Run directly when called as a script (npx prisma db seed)
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
