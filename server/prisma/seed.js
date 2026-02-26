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
  console.log('  Created operator: New Operator (no name, no profile)\n');

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
  console.log('  Brief 4: Todoroki - Late Night TikTok (DRAFT)');

  const brief5 = await prisma.brief.create({
    data: {
      id: 'demo-brief-coralie-valentines',
      brandProfileId: coralieBrand.id,
      title: 'Valentine\'s Day Macaron Gift Box Campaign',
      campaignGoal: 'EVENT_PROMO',
      contentTypes: ['REEL', 'STORY', 'PHOTO_SET'],
      numberOfDeliverables: 5,
      creativeDirection: 'Showcase our limited-edition Valentine\'s macaron collection. Think romantic but modern — blush tones, elegant packaging, the reveal moment of opening the gift box. We want it to feel aspirational yet attainable.',
      dos: 'Show the gift box unboxing, capture the pastel color palette, include a lifestyle shot of gifting',
      donts: 'Nothing overly cheesy or cliché, avoid red hearts, keep it sophisticated',
      deadline: new Date('2026-02-12'),
      compensationType: 'HYBRID',
      compensationAmount: 30000,
      compensationDetails: { description: '$300 + Valentine\'s macaron collection for you and a friend' },
      usageRights: 'ALL',
      locationRequirement: 'FLEXIBLE',
      additionalNotes: 'We can ship the gift box to you or you can pick up in-store for an in-person shoot.',
      revisionsIncluded: 2,
      status: 'CLOSED',
      closedAt: new Date('2026-02-10'),
    },
  });
  console.log('  Brief 5: Coralie - Valentine\'s Macarons (CLOSED)');

  const brief6 = await prisma.brief.create({
    data: {
      id: 'demo-brief-hewn-farmers-market',
      brandProfileId: hewnBrand.id,
      title: 'Farmers Market Season Kickoff',
      campaignGoal: 'EVENT_PROMO',
      contentTypes: ['REEL', 'CAROUSEL', 'PHOTO_SET'],
      numberOfDeliverables: 4,
      creativeDirection: 'Capture Hewn\'s presence at the Evanston Farmers Market opening day. The stall setup, the crowd, golden loaves on display, and the community atmosphere. Early morning golden light is key.',
      dos: 'Show the market atmosphere, capture customer interactions, include bread close-ups with natural light',
      donts: 'No staged shots, avoid blocking other vendors, nothing that feels like an ad',
      deadline: new Date('2026-04-01'),
      compensationType: 'FREE_PRODUCT',
      compensationDetails: { description: 'Monthly bread subscription for 6 months + market day loaf bundle' },
      usageRights: 'ORGANIC_SOCIAL',
      locationRequirement: 'IN_PERSON',
      additionalNotes: 'Market opens at 7:30am. Best light is 7:30-9am. We\'re in stall #12 near the center.',
      revisionsIncluded: 1,
      status: 'OPEN',
    },
  });
  console.log('  Brief 6: Hewn - Farmers Market (OPEN)');

  const brief7 = await prisma.brief.create({
    data: {
      id: 'demo-brief-todoroki-grand-opening',
      brandProfileId: todorokiBrand.id,
      title: 'Todoroki Lincoln Park Grand Opening',
      campaignGoal: 'GRAND_OPENING',
      contentTypes: ['REEL', 'TIKTOK', 'STORY', 'PHOTO_SET'],
      numberOfDeliverables: 8,
      creativeDirection: 'Document the grand opening weekend of our second location in Lincoln Park. Capture the excitement, the line out the door, first bowls being served, the space reveal, and the energy of day one. We need both polished content and raw, in-the-moment stories.',
      dos: 'Capture the ribbon cutting, first customers, kitchen in action, the new space, and crowd energy',
      donts: 'No construction mess visible, avoid empty restaurant shots, nothing that feels corporate',
      deadline: new Date('2026-04-15'),
      compensationType: 'FLAT_FEE',
      compensationAmount: 45000,
      usageRights: 'ALL',
      locationRequirement: 'IN_PERSON',
      additionalNotes: 'Grand opening is Saturday April 12. We need 2 creators — one for photo, one for video. This is a big one!',
      revisionsIncluded: 2,
      status: 'OPEN',
    },
  });
  console.log('  Brief 7: Todoroki - Lincoln Park Grand Opening (OPEN)');

  const brief8 = await prisma.brief.create({
    data: {
      id: 'demo-brief-coralie-mothers-day',
      brandProfileId: coralieBrand.id,
      title: 'Mother\'s Day Brunch Experience',
      campaignGoal: 'SEASONAL_SPECIAL',
      contentTypes: ['CAROUSEL', 'REEL', 'PHOTO_SET'],
      numberOfDeliverables: 5,
      creativeDirection: 'Capture the elegance of our Mother\'s Day brunch service. Table settings with fresh flowers, multi-course pastry presentation, champagne pours, and the joy of families celebrating together. Light, airy, celebratory.',
      dos: 'Show the full brunch spread, capture candid family moments, highlight floral arrangements and table setting',
      donts: 'No dark moody tones, nothing that looks staged or stiff, avoid showing empty seats',
      deadline: new Date('2026-05-10'),
      compensationType: 'HYBRID',
      compensationAmount: 35000,
      compensationDetails: { description: '$350 + brunch for 4 on the house' },
      usageRights: 'ALL',
      locationRequirement: 'IN_PERSON',
      revisionsIncluded: 2,
      status: 'OPEN',
    },
  });
  console.log('  Brief 8: Coralie - Mother\'s Day Brunch (OPEN)\n');

  // ─── APPLICATIONS ──────────────────────────────────────────────
  console.log('Creating applications...');

  // --- Brief 1 applications (Todoroki Ramen Launch) ---
  const app1a = await prisma.application.create({
    data: {
      briefId: brief1.id,

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
      creatorName: 'Jin Park',
      creatorHandle: 'jin.eats.evanston',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 9500,
      engagementRate: 8.4,
      topPostUrls: [
        'https://instagram.com/p/example_jin1',
        'https://instagram.com/p/example_jin2',
      ],
      contentStyleTags: ['Warm', 'Community', 'Authentic'],
      pitch: 'Evanston local and weekly Todoroki regular! I know the staff by name and have been photographing their food for my personal feed for over a year. My warm, community-focused style would be a natural fit.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'jin@locale.app',
      aiMatchScore: 65,
      aiMatchRationale: 'Strong community connection but smaller portfolio. Authentic local voice but limited professional food photography experience.',
      status: 'REJECTED',
    },
  });
  console.log('  App 1d: Jin x Todoroki Ramen (score 65, REJECTED)');

  // --- Brief 2 applications (Patisserie Coralie) ---
  const app2a = await prisma.application.create({
    data: {
      briefId: brief2.id,

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

  const app2e = await prisma.application.create({
    data: {
      briefId: brief2.id,
      creatorName: 'Ava Thompson',
      creatorHandle: 'ava.creates',
      creatorPlatform: 'TIKTOK',
      followerCount: 18000,
      engagementRate: 6.8,
      topPostUrls: [
        'https://tiktok.com/@ava.creates/video1',
        'https://tiktok.com/@ava.creates/video2',
      ],
      contentStyleTags: ['Energetic', 'Lifestyle', 'Story-driven'],
      pitch: 'I bring a fresh, story-driven approach to food content. Recently created a viral pastry series for a Wilmette bakery that drove 40% more weekend foot traffic. I can deliver Stories and Carousels alongside my signature short-form videos.',
      compensationAsk: '$300',
      availabilityConfirmed: true,
      contactEmail: 'ava@locale.app',
      aiMatchScore: 72,
      aiMatchRationale: 'Strong video storytelling skills. Energetic style is slightly different from Coralie\'s refined aesthetic but high engagement rate shows audience resonance.',
      status: 'PENDING',
    },
  });
  console.log('  App 2e: Ava x Coralie (score 72, PENDING)');

  // --- Brief 3 applications (Hewn Bread BTS) ---
  const app3a = await prisma.application.create({
    data: {
      briefId: brief3.id,

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
  console.log('  App 3b: Shaurya x Hewn BTS (score 82, PENDING)');

  const app3c = await prisma.application.create({
    data: {
      briefId: brief3.id,
      creatorName: 'Jin Park',
      creatorHandle: 'jin.eats.evanston',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 9500,
      engagementRate: 8.4,
      topPostUrls: ['https://instagram.com/p/example_jin1', 'https://instagram.com/p/example_jin2'],
      contentStyleTags: ['Warm', 'Community', 'Authentic'],
      pitch: 'Evanston local here — I already visit Hewn weekly! My authentic, community-driven style captures the neighborhood feel. I\'m an early riser and have shot BTS content for 3 other local bakeries.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'jin@locale.app',
      aiMatchScore: 87,
      aiMatchRationale: 'Local Evanston creator with authentic community style. High engagement nano-influencer — perfect match for Hewn\'s artisan craft narrative.',
      status: 'PENDING',
    },
  });
  console.log('  App 3c: Jin x Hewn BTS (score 87, PENDING)');

  // --- Brief 5 applications (Valentine's — CLOSED brief, so these are historical) ---
  const app5a = await prisma.application.create({
    data: {
      briefId: brief5.id,

      creatorName: 'Emma Nakamura',
      creatorHandle: 'emma.bakes',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 15800,
      engagementRate: 6.3,
      topPostUrls: ['https://instagram.com/p/example7'],
      contentStyleTags: ['Clean', 'Minimalist', 'Bright'],
      pitch: 'Valentine\'s pastry content is my absolute sweet spot. I\'ve done gift box reveals for 4 brands and know how to make unboxing feel special without being cheesy.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'emma@locale.app',
      aiMatchScore: 96,
      aiMatchRationale: 'Perfect match — bakery specialist with clean, elegant aesthetic. Past Valentine\'s content experience.',
      status: 'SELECTED',
      selectedAt: new Date('2026-02-05'),
    },
  });
  console.log('  App 5a: Emma x Coralie Valentine\'s (score 96, SELECTED)');

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
      pitch: 'I love creating aspirational gift content. My lifestyle approach would make the macaron box feel like a must-have Valentine\'s gift.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'priya@gmail.com',
      aiMatchScore: 84,
      aiMatchRationale: 'Strong editorial lifestyle creator. Good fit for aspirational gift content.',
      status: 'DECLINED',
    },
  });
  console.log('  App 5b: Priya x Coralie Valentine\'s (score 84, DECLINED)');

  await prisma.application.create({
    data: {
      briefId: brief5.id,
      creatorName: 'Lucy Wang',
      creatorHandle: 'lucy.tastes',
      creatorPlatform: 'TIKTOK',
      followerCount: 32000,
      engagementRate: 5.1,
      contentStyleTags: ['Cinematic', 'Story-driven', 'Moody'],
      pitch: 'My cinematic style would make the macaron unboxing feel like a luxury brand ad. I\'ve done similar gift reveal content for high-end chocolatiers with great results.',
      compensationAsk: '$350',
      availabilityConfirmed: true,
      contactEmail: 'lucy.wang@gmail.com',
      aiMatchScore: 75,
      aiMatchRationale: 'Cinematic style could work but moody tone may clash with Coralie\'s bright, airy brand. Worth considering for video.',
      status: 'DECLINED',
    },
  });
  console.log('  App 5c: Lucy x Coralie Valentine\'s (score 75, DECLINED)');

  // --- Brief 6 applications (Hewn Farmers Market) ---
  await prisma.application.create({
    data: {
      briefId: brief6.id,

      creatorName: 'Dani Reyes',
      creatorHandle: 'dani.creates',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 3100,
      engagementRate: 8.1,
      topPostUrls: ['https://instagram.com/p/example3'],
      contentStyleTags: ['Documentary', 'Raw', 'Candid'],
      pitch: 'I go to the Evanston Farmers Market every Saturday already! Documenting Hewn\'s stall would be natural for me — I know the vendors, the regulars, and the rhythm of the market.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'dani@gmail.com',
      aiMatchScore: 93,
      aiMatchRationale: 'Perfect match — already a market regular, documentary style ideal for event coverage, strong community connection.',
      status: 'PENDING',
    },
  });
  console.log('  App 6a: Dani x Hewn Farmers Market (score 93, PENDING)');

  await prisma.application.create({
    data: {
      briefId: brief6.id,

      creatorName: 'Marcus Williams',
      creatorHandle: 'marcus.mornings',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 11200,
      engagementRate: 6.7,
      topPostUrls: ['https://instagram.com/p/example_marcus1', 'https://instagram.com/p/example_marcus2'],
      contentStyleTags: ['Golden Hour', 'Warm', 'Editorial'],
      pitch: 'I specialize in early morning golden-hour photography. Markets at dawn are my favorite subject — the light, the energy, the fresh produce. I\'ve covered 12 farmers markets across the Midwest.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'marcus@locale.app',
      aiMatchScore: 89,
      aiMatchRationale: 'Golden hour specialist with farmers market experience. Warm editorial style aligns with Hewn\'s rustic brand.',
      status: 'PENDING',
    },
  });
  console.log('  App 6b: Marcus x Hewn Farmers Market (score 89, PENDING)');

  await prisma.application.create({
    data: {
      briefId: brief6.id,
      creatorName: 'Sam Okafor',
      creatorHandle: 'sam.eats.chi',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 21000,
      engagementRate: 4.7,
      topPostUrls: ['https://instagram.com/p/example_sam1'],
      contentStyleTags: ['Bright', 'Lifestyle', 'Community'],
      pitch: 'I\'m a community specialist — I capture the social energy of food events. I\'ve covered 20+ food festivals and markets and know how to show both the product and the people.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'sam.okafor@gmail.com',
      aiMatchScore: 85,
      aiMatchRationale: 'Community-focused creator with event coverage experience. Bright, social style suits the market atmosphere.',
      status: 'PENDING',
    },
  });
  console.log('  App 6c: Sam x Hewn Farmers Market (score 85, PENDING)');

  // --- Brief 7 applications (Todoroki Grand Opening) ---
  await prisma.application.create({
    data: {
      briefId: brief7.id,

      creatorName: 'Katelyn Liu',
      creatorHandle: 'kk.ameliu',
      creatorPlatform: 'TIKTOK',
      followerCount: 24500,
      engagementRate: 7.2,
      topPostUrls: ['https://tiktok.com/@kk.ameliu/video1', 'https://tiktok.com/@kk.ameliu/video2'],
      contentStyleTags: ['Bold', 'Energetic', 'Candid'],
      pitch: 'Grand openings are my thing! I covered the Ramen-San Lincoln Park opening and got 800K views. I know how to capture the line, the energy, the first bite reactions. Let me bring that same viral energy to Todoroki LP.',
      compensationAsk: '$500',
      availabilityConfirmed: true,
      contactEmail: 'katelyn@locale.app',
      aiMatchScore: 91,
      aiMatchRationale: 'Proven grand opening content with viral track record. Energetic style perfect for capturing opening day excitement.',
      status: 'PENDING',
    },
  });
  console.log('  App 7a: Katelyn x Todoroki Grand Opening (score 91, PENDING)');

  await prisma.application.create({
    data: {
      briefId: brief7.id,

      creatorName: 'Shaurya Garg',
      creatorHandle: 'shauryaeats',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 8200,
      engagementRate: 5.4,
      topPostUrls: ['https://instagram.com/p/example1'],
      contentStyleTags: ['Warm', 'Editorial', 'Clean'],
      pitch: 'Since I\'m already working with Todoroki on the Ramen Launch, I know the brand inside out. I can bring that same warm editorial style to the grand opening — plus Josh and I already have great chemistry.',
      compensationAsk: '$400',
      availabilityConfirmed: true,
      contactEmail: 'shaurya@locale.app',
      aiMatchScore: 88,
      aiMatchRationale: 'Already working with Todoroki — brand familiarity is a huge plus. Warm editorial style provides polished counterpart to video content.',
      status: 'PENDING',
    },
  });
  console.log('  App 7b: Shaurya x Todoroki Grand Opening (score 88, PENDING)');

  await prisma.application.create({
    data: {
      briefId: brief7.id,

      creatorName: 'Marcus Williams',
      creatorHandle: 'marcus.mornings',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 11200,
      engagementRate: 6.7,
      topPostUrls: ['https://instagram.com/p/example_marcus1'],
      contentStyleTags: ['Golden Hour', 'Warm', 'Editorial'],
      pitch: 'I\'d love to capture the daytime energy at the grand opening. My warm, golden editorial style would complement the neon-lit evening content from a video creator.',
      compensationAsk: '$350',
      availabilityConfirmed: true,
      contactEmail: 'marcus@locale.app',
      aiMatchScore: 80,
      aiMatchRationale: 'Strong editorial photographer with warm style. Good complement for a video-focused co-creator.',
      status: 'PENDING',
    },
  });
  console.log('  App 7c: Marcus x Todoroki Grand Opening (score 80, PENDING)');

  await prisma.application.create({
    data: {
      briefId: brief7.id,
      creatorName: 'Lucy Wang',
      creatorHandle: 'lucy.tastes',
      creatorPlatform: 'TIKTOK',
      followerCount: 32000,
      engagementRate: 5.1,
      contentStyleTags: ['Cinematic', 'Story-driven', 'Moody'],
      pitch: 'My cinematic style is perfect for a grand opening. I create mini-doc content — the build-up, the doors opening, the first bowls going out. My last restaurant opening video hit 150K views.',
      compensationAsk: '$500',
      availabilityConfirmed: true,
      contactEmail: 'lucy.wang@gmail.com',
      aiMatchScore: 86,
      aiMatchRationale: 'Cinematic storytelling approach would create compelling grand opening narrative. Strong video portfolio with restaurant experience.',
      status: 'PENDING',
    },
  });
  console.log('  App 7d: Lucy x Todoroki Grand Opening (score 86, PENDING)');

  await prisma.application.create({
    data: {
      briefId: brief7.id,
      creatorName: 'Mike Chen',
      creatorHandle: 'mikechen.photo',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 45000,
      engagementRate: 3.2,
      contentStyleTags: ['Clean', 'Minimalist', 'Editorial'],
      pitch: 'My polished editorial photography would provide the hero images for the grand opening. I\'ve shot 8 restaurant launches and know how to capture the "before & after" story of a new space.',
      compensationAsk: '$450',
      availabilityConfirmed: true,
      contactEmail: 'mike.chen@gmail.com',
      aiMatchScore: 74,
      aiMatchRationale: 'Experienced restaurant launch photographer but minimalist style slightly different from Todoroki\'s warm brand. Strong portfolio regardless.',
      status: 'PENDING',
    },
  });
  console.log('  App 7e: Mike x Todoroki Grand Opening (score 74, PENDING)');

  // --- Brief 8 applications (Coralie Mother's Day) ---
  await prisma.application.create({
    data: {
      briefId: brief8.id,

      creatorName: 'Emma Nakamura',
      creatorHandle: 'emma.bakes',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 15800,
      engagementRate: 6.3,
      topPostUrls: ['https://instagram.com/p/example7', 'https://instagram.com/p/example8'],
      contentStyleTags: ['Clean', 'Minimalist', 'Bright'],
      pitch: 'After the Valentine\'s campaign, I know Coralie\'s brand inside out. I can bring the same refined quality to the Mother\'s Day brunch. I\'ll focus on the warmth of family moments while keeping the editorial polish.',
      compensationAsk: 'Accepts offered terms',
      availabilityConfirmed: true,
      contactEmail: 'emma@locale.app',
      aiMatchScore: 95,
      aiMatchRationale: 'Previous Coralie campaign success. Clean editorial style perfectly aligned. Brand familiarity is a strong advantage.',
      status: 'PENDING',
    },
  });
  console.log('  App 8a: Emma x Coralie Mother\'s Day (score 95, PENDING)');

  await prisma.application.create({
    data: {
      briefId: brief8.id,

      creatorName: 'Priya Desai',
      creatorHandle: 'priya.tableview',
      creatorPlatform: 'INSTAGRAM',
      followerCount: 5600,
      engagementRate: 9.1,
      topPostUrls: ['https://instagram.com/p/example10', 'https://instagram.com/p/example11'],
      contentStyleTags: ['Editorial', 'Bright', 'Lifestyle'],
      pitch: 'Table settings and brunch spreads are literally my brand. I\'ve shot Mother\'s Day content for 3 restaurants and know how to capture the joy without it looking forced.',
      compensationAsk: '$300',
      availabilityConfirmed: true,
      contactEmail: 'priya@gmail.com',
      aiMatchScore: 91,
      aiMatchRationale: 'Specialty in table settings and brunch content. Editorial bright style matches Coralie perfectly. Mother\'s Day experience.',
      status: 'PENDING',
    },
  });
  console.log('  App 8b: Priya x Coralie Mother\'s Day (score 91, PENDING)');

  await prisma.application.create({
    data: {
      briefId: brief8.id,
      creatorName: 'Ria Mehra',
      creatorHandle: 'ria.bitesize',
      creatorPlatform: 'YOUTUBE',
      followerCount: 67000,
      engagementRate: 3.9,
      contentStyleTags: ['Editorial', 'Long-form', 'Polished'],
      pitch: 'I can create a full brunch experience video for YouTube alongside Instagram carousel content. My editorial style matches Coralie\'s brand, and a Mother\'s Day feature would drive significant discovery.',
      compensationAsk: '$400',
      availabilityConfirmed: true,
      contactEmail: 'ria.mehra@gmail.com',
      aiMatchScore: 82,
      aiMatchRationale: 'Editorial style aligns well. YouTube reach would expand brand visibility. Long-form format tells a richer story.',
      status: 'PENDING',
    },
  });
  console.log('  App 8c: Ria x Coralie Mother\'s Day (score 82, PENDING)\n');

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

  // Project 2: Coralie x Emma (from Valentine's — COMPLETED)
  const project2Token = crypto.randomUUID();
  const project2 = await prisma.project.create({
    data: {
      applicationId: app5a.id,
      brandProfileId: coralieBrand.id,
      creatorName: 'Emma Nakamura',
      creatorEmail: 'emma@locale.app',
      creatorAccessToken: project2Token,
      status: 'COMPLETED',
      briefText: 'Valentine\'s Day Macaron Gift Box Campaign\n\nShowcase our limited-edition Valentine\'s macaron collection. Think romantic but modern — blush tones, elegant packaging, the reveal moment of opening the gift box.',
      deliverables: '5 REEL, STORY, PHOTO_SET',
      price: 30000,
      compensationType: 'HYBRID',
      compensationDetails: { description: '$300 + Valentine\'s macaron collection for you and a friend' },
      usageRights: 'ALL',
      revisionsIncluded: 2,
      revisionsUsed: 1,
      creatorAcceptedAt: new Date('2026-02-06'),
      contentDueAt: new Date('2026-02-12'),
      completedAt: new Date('2026-02-11'),
    },
  });
  console.log('  Project 2: Coralie x Emma Valentine\'s (COMPLETED)');

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
  console.log('  Draft v1 for Project 1 (Todoroki x Shaurya) - SUBMITTED');

  await prisma.projectDraft.create({
    data: {
      projectId: project2.id,
      version: 1,
      fileUrls: [
        'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=800',
        'https://images.unsplash.com/photo-1612203985729-70726954388c?w=800',
      ],
      notes: 'First draft of the macaron gift box reveal. Focused on the blush tones and unboxing moment.',
      feedback: 'Love the colors! Can we get a closer shot of the individual macarons and one more lifestyle shot?',
      status: 'REVISION_REQUESTED',
      createdAt: new Date('2026-02-08'),
    },
  });
  console.log('  Draft v1 for Project 2 (Coralie x Emma) - REVISION_REQUESTED');

  await prisma.projectDraft.create({
    data: {
      projectId: project2.id,
      version: 2,
      fileUrls: [
        'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=800',
        'https://images.unsplash.com/photo-1612203985729-70726954388c?w=800',
        'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=800',
        'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800',
      ],
      notes: 'Revised! Added macro shots of individual macarons and a lifestyle gifting scene with natural light.',
      status: 'APPROVED',
      createdAt: new Date('2026-02-10'),
    },
  });
  console.log('  Draft v2 for Project 2 (Coralie x Emma) - APPROVED\n');

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
  console.log('  Transaction for Project 1: $200.00 (ESCROW_HELD)');

  await prisma.transaction.create({
    data: {
      projectId: project2.id,
      amount: 30000,
      platformFee: 3000,
      creatorPayout: 27000,
      status: 'RELEASED',
      escrowStatus: 'RELEASED',
      demoMode: true,
    },
  });
  console.log('  Transaction for Project 2: $300.00 (RELEASED)\n');

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
  console.log('  Created 4 messages for Project 1');

  await prisma.message.createMany({
    data: [
      {
        projectId: project2.id,
        senderType: 'BRAND',
        senderName: 'Marie Laurent',
        text: 'Welcome Emma! So excited about this campaign. The macaron boxes are ready — would you prefer pickup or shipping?',
        createdAt: new Date('2026-02-06T09:00:00Z'),
      },
      {
        projectId: project2.id,
        senderType: 'CREATOR',
        senderName: 'Emma Nakamura',
        text: 'I\'d love to pick up in person! That way I can get a few shots of the shop and display case too. Would tomorrow morning work?',
        createdAt: new Date('2026-02-06T09:30:00Z'),
      },
      {
        projectId: project2.id,
        senderType: 'BRAND',
        senderName: 'Marie Laurent',
        text: 'Perfect! Come by around 8:30am — the morning light through our windows is gorgeous. I\'ll have the Valentine\'s display set up.',
        createdAt: new Date('2026-02-06T10:00:00Z'),
      },
      {
        projectId: project2.id,
        senderType: 'CREATOR',
        senderName: 'Emma Nakamura',
        text: 'Uploaded revised draft with the macro shots you wanted. I think the close-ups of the raspberry macaron turned out amazing!',
        createdAt: new Date('2026-02-10T14:00:00Z'),
      },
      {
        projectId: project2.id,
        senderType: 'BRAND',
        senderName: 'Marie Laurent',
        text: 'These are STUNNING. The raspberry close-up is exactly what I wanted. Approved! Thank you so much Emma.',
        createdAt: new Date('2026-02-10T15:00:00Z'),
      },
    ],
  });
  console.log('  Created 5 messages for Project 2\n');

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
      {
        userId: josh.id,
        type: 'NEW_APPLICATION',
        title: 'New application received',
        body: 'Katelyn Liu applied to your Grand Opening brief.',
        linkUrl: `/operator/brief/${brief7.id}`,
        read: false,
        createdAt: new Date('2026-02-23T09:00:00Z'),
      },
      {
        userId: josh.id,
        type: 'NEW_APPLICATION',
        title: 'New application received',
        body: 'North Shore Creators submitted Lucy Wang for your Grand Opening brief.',
        linkUrl: `/operator/brief/${brief7.id}`,
        read: false,
        createdAt: new Date('2026-02-23T11:00:00Z'),
      },
      {
        userId: marie.id,
        type: 'PROJECT_COMPLETED',
        title: 'Project completed',
        body: 'Valentine\'s Day Macaron campaign with Emma Nakamura is complete!',
        linkUrl: `/operator/project/${project2.id}`,
        read: true,
        createdAt: new Date('2026-02-11T16:00:00Z'),
      },
      {
        userId: marie.id,
        type: 'NEW_APPLICATION',
        title: 'New application received',
        body: 'Emma Nakamura applied to your Mother\'s Day Brunch brief.',
        linkUrl: `/operator/brief/${brief8.id}`,
        read: false,
        createdAt: new Date('2026-02-23T14:00:00Z'),
      },
      {
        userId: ellen.id,
        type: 'NEW_APPLICATION',
        title: 'New application received',
        body: 'Marcus Williams applied to your Farmers Market brief.',
        linkUrl: `/operator/brief/${brief6.id}`,
        read: false,
        createdAt: new Date('2026-02-23T08:00:00Z'),
      },
    ],
  });
  console.log('  Created 12 notifications\n');

  // ─── CAMPAIGN DATA (for Insights) ──────────────────────────────
  await prisma.campaignData.createMany({
    data: [
      {
        briefId: brief1.id,
        brandProfileId: todorokiBrand.id,
        campaignGoal: 'MENU_LAUNCH',
        contentTypes: ['REEL', 'PHOTO_SET'],
        compensationType: 'FLAT_FEE',
        compensationAmount: 20000,
        neighborhood: 'Evanston',
        city: 'Evanston',
        cuisineTypes: ['Japanese'],
        numberOfApplications: 8,
        timeToFirstApplication: 240,
        selectedCreatorTier: 'MICRO',
        wasContentApproved: true,
        revisionsRequested: 1,
        brandSatisfaction: 5,
        completedAt: new Date('2026-01-20T12:00:00Z'),
      },
      {
        briefId: brief3.id,
        brandProfileId: hewnBrand.id,
        campaignGoal: 'GENERAL_CONTENT',
        contentTypes: ['REEL', 'PHOTO_SET'],
        compensationType: 'FREE_PRODUCT',
        neighborhood: 'Evanston',
        city: 'Evanston',
        cuisineTypes: ['Bakery & Pastry'],
        numberOfApplications: 5,
        timeToFirstApplication: 480,
        selectedCreatorTier: 'NANO',
        wasContentApproved: true,
        revisionsRequested: 0,
        brandSatisfaction: 4,
        completedAt: new Date('2026-01-28T10:00:00Z'),
      },
      {
        briefId: brief5.id,
        brandProfileId: coralieBrand.id,
        campaignGoal: 'EVENT_PROMO',
        contentTypes: ['REEL', 'STORY', 'PHOTO_SET'],
        compensationType: 'HYBRID',
        compensationAmount: 30000,
        neighborhood: 'Evanston',
        city: 'Evanston',
        cuisineTypes: ['French', 'Bakery & Pastry'],
        numberOfApplications: 12,
        timeToFirstApplication: 120,
        selectedCreatorTier: 'MICRO',
        wasContentApproved: true,
        revisionsRequested: 2,
        brandSatisfaction: 4,
        completedAt: new Date('2026-02-10T15:00:00Z'),
      },
      {
        briefId: brief6.id,
        brandProfileId: hewnBrand.id,
        campaignGoal: 'EVENT_PROMO',
        contentTypes: ['REEL', 'CAROUSEL', 'PHOTO_SET'],
        compensationType: 'FREE_PRODUCT',
        neighborhood: 'Evanston',
        city: 'Evanston',
        cuisineTypes: ['Bakery & Pastry'],
        numberOfApplications: 7,
        timeToFirstApplication: 360,
        selectedCreatorTier: 'NANO',
        wasContentApproved: false,
        revisionsRequested: 3,
        brandSatisfaction: 2,
      },
      {
        briefId: brief7.id,
        brandProfileId: todorokiBrand.id,
        campaignGoal: 'GRAND_OPENING',
        contentTypes: ['REEL', 'TIKTOK', 'STORY', 'PHOTO_SET'],
        compensationType: 'FLAT_FEE',
        compensationAmount: 45000,
        neighborhood: 'Evanston',
        city: 'Evanston',
        cuisineTypes: ['Japanese'],
        numberOfApplications: 18,
        timeToFirstApplication: 60,
        selectedCreatorTier: 'MID',
        wasContentApproved: true,
        revisionsRequested: 1,
        brandSatisfaction: 5,
        completedAt: new Date('2026-01-15T18:00:00Z'),
      },
      {
        briefId: brief8.id,
        brandProfileId: coralieBrand.id,
        campaignGoal: 'SEASONAL_SPECIAL',
        contentTypes: ['CAROUSEL', 'REEL', 'PHOTO_SET'],
        compensationType: 'HYBRID',
        compensationAmount: 35000,
        neighborhood: 'Evanston',
        city: 'Evanston',
        cuisineTypes: ['French', 'Bakery & Pastry'],
        numberOfApplications: 9,
        timeToFirstApplication: 180,
        selectedCreatorTier: 'MICRO',
        wasContentApproved: true,
        revisionsRequested: 0,
        brandSatisfaction: 5,
        completedAt: new Date('2026-02-14T14:00:00Z'),
      },
      {
        briefId: brief2.id,
        brandProfileId: coralieBrand.id,
        campaignGoal: 'SEASONAL_SPECIAL',
        contentTypes: ['CAROUSEL', 'STORY', 'PHOTO_SET'],
        compensationType: 'FREE_PRODUCT',
        neighborhood: 'Evanston',
        city: 'Evanston',
        cuisineTypes: ['French', 'Bakery & Pastry'],
        numberOfApplications: 6,
        timeToFirstApplication: 540,
        selectedCreatorTier: 'NANO',
        wasContentApproved: true,
        revisionsRequested: 1,
        brandSatisfaction: 4,
        completedAt: new Date('2026-01-10T11:00:00Z'),
      },
      {
        briefId: brief1.id,
        brandProfileId: todorokiBrand.id,
        campaignGoal: 'MENU_LAUNCH',
        contentTypes: ['REEL', 'PHOTO_SET'],
        compensationType: 'FLAT_FEE',
        compensationAmount: 20000,
        neighborhood: 'Evanston',
        city: 'Evanston',
        cuisineTypes: ['Japanese'],
        numberOfApplications: 11,
        timeToFirstApplication: 150,
        selectedCreatorTier: 'MICRO',
        wasContentApproved: false,
        revisionsRequested: 2,
        brandSatisfaction: 3,
        completedAt: new Date('2026-01-08T16:00:00Z'),
      },
      {
        briefId: brief3.id,
        brandProfileId: hewnBrand.id,
        campaignGoal: 'GENERAL_CONTENT',
        contentTypes: ['REEL', 'PHOTO_SET'],
        compensationType: 'FREE_PRODUCT',
        neighborhood: 'Evanston',
        city: 'Evanston',
        cuisineTypes: ['Bakery & Pastry'],
        numberOfApplications: 4,
        timeToFirstApplication: 720,
        selectedCreatorTier: 'NANO',
        wasContentApproved: true,
        revisionsRequested: 0,
        brandSatisfaction: 5,
        completedAt: new Date('2025-12-20T09:00:00Z'),
      },
      {
        briefId: brief7.id,
        brandProfileId: todorokiBrand.id,
        campaignGoal: 'GRAND_OPENING',
        contentTypes: ['REEL', 'TIKTOK', 'STORY'],
        compensationType: 'FLAT_FEE',
        compensationAmount: 45000,
        neighborhood: 'Evanston',
        city: 'Evanston',
        cuisineTypes: ['Japanese'],
        numberOfApplications: 15,
        timeToFirstApplication: 90,
        selectedCreatorTier: 'MID',
        wasContentApproved: true,
        revisionsRequested: 1,
        brandSatisfaction: 5,
        completedAt: new Date('2025-12-05T17:00:00Z'),
      },
    ],
  });
  console.log('  Created 10 CampaignData records\n');

  // ─── SUMMARY ───────────────────────────────────────────────────
  console.log('=== Seed complete ===');
  console.log('  4 users (4 operators)');
  console.log('  3 brand profiles');
  console.log('  8 briefs (6 OPEN, 1 DRAFT, 1 CLOSED)');
  console.log('  ~27 applications across 7 briefs');
  console.log('  2 projects (1 DRAFT_SUBMITTED, 1 COMPLETED)');
  console.log('  3 project drafts');
  console.log('  2 transactions');
  console.log('  9 messages');
  console.log('  12 notifications');
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
