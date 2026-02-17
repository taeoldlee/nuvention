const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Locale seed script starting ---\n');

  // ─── CLEAN SLATE ───────────────────────────────────────────────
  // Delete in reverse-dependency order to respect foreign keys.
  console.log('Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.projectDraft.deleteMany();
  await prisma.project.deleteMany();
  await prisma.match.deleteMany();
  await prisma.contentRequest.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.brandProfile.deleteMany();
  await prisma.user.deleteMany();
  console.log('  All tables cleared.\n');

  // ─── USERS ─────────────────────────────────────────────────────
  // Use stable IDs so sessions survive reseeds / redeploys
  console.log('Creating users...');

  const josh = await prisma.user.create({
    data: {
      id: 'demo-operator-josh',
      email: 'josh@colectivo.com',
      name: 'Josh Rivera',
      role: 'OPERATOR',
      isDemo: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });
  console.log('  Created operator: Josh Rivera (Colectivo Coffee)');

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

  const josie = await prisma.user.create({
    data: {
      id: 'demo-operator-josie',
      email: 'newoperator@locale.app',
      name: '',
      role: 'OPERATOR',
      isDemo: true,
    },
  });
  console.log('  Created operator: New Operator (no name, no profile)');

  const shaurya = await prisma.user.create({
    data: {
      id: 'demo-creator-shaurya',
      email: 'shaurya@locale.app',
      name: 'Shaurya Garg',
      role: 'CREATOR',
      isDemo: true,
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    },
  });
  console.log('  Created creator: Shaurya Garg');

  const katelyn = await prisma.user.create({
    data: {
      id: 'demo-creator-katelyn',
      email: 'katelyn@locale.app',
      name: 'Katelyn Liu',
      role: 'CREATOR',
      isDemo: true,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    },
  });
  console.log('  Created creator: Katelyn Liu');

  const alex = await prisma.user.create({
    data: {
      id: 'demo-creator-alex',
      email: 'newcreator@locale.app',
      name: '',
      role: 'CREATOR',
      isDemo: true,
    },
  });
  console.log('  Created creator: New Creator (no name, no profile)');
  console.log(`  Total users: 7\n`);

  // ─── BRAND PROFILES ────────────────────────────────────────────
  console.log('Creating brand profiles...');

  const colectivoBrand = await prisma.brandProfile.create({
    data: {
      userId: josh.id,
      businessName: 'Colectivo Coffee',
      neighborhood: 'Evanston',
      city: 'Evanston',
      state: 'IL',
      vibe: ['Cozy & Warm', 'Rustic & Raw'],
      values: ['Community-first', 'Sustainability'],
      contentComfortZones: ['Ambiance / Interior', 'Staff & Culture', 'Community / Events'],
      budgetMin: 15000,
      budgetMax: 25000,
      vibeAnalysis: {
        primaryVibe: 'Warm Community Hub',
        aestheticTags: ['exposed-brick', 'warm-wood', 'community-tables', 'craft-coffee', 'local-art'],
        contentRecommendations: [
          'Morning ritual moments',
          'Barista craft close-ups',
          'Community gathering shots',
          'Seasonal drink launches',
        ],
        avoidTags: ['corporate', 'chain-feel', 'overly-polished'],
      },
    },
  });
  console.log('  Created brand: Colectivo Coffee');

  const coralieBrand = await prisma.brandProfile.create({
    data: {
      userId: marie.id,
      businessName: 'Patisserie Coralie',
      neighborhood: 'Evanston',
      city: 'Evanston',
      state: 'IL',
      vibe: ['Polished & Editorial', 'Minimalist & Clean'],
      values: ['Quality-obsessed', 'Design-forward'],
      contentComfortZones: ['Food & Drink', 'Ambiance / Interior'],
      budgetMin: 18000,
      budgetMax: 30000,
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
  console.log('  Created brand: Patisserie Coralie');

  const hewnBrand = await prisma.brandProfile.create({
    data: {
      userId: ellen.id,
      businessName: 'Hewn Bread',
      neighborhood: 'Evanston',
      city: 'Evanston',
      state: 'IL',
      vibe: ['Rustic & Raw', 'Cozy & Warm'],
      values: ['Quality-obsessed', 'Community-first', 'Sustainability'],
      contentComfortZones: ['Food & Drink', 'Behind the Scenes'],
      budgetMin: 12000,
      budgetMax: 20000,
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
  console.log('  Created brand: Hewn Bread');
  console.log('  (Josie Chen / New Coffee Lab has no brand profile)\n');

  // ─── CREATOR PROFILES ──────────────────────────────────────────
  console.log('Creating creator profiles...');

  const shauryaProfile = await prisma.creatorProfile.create({
    data: {
      userId: shaurya.id,
      displayName: 'Shaurya G.',
      bio: 'Warm editorial content for neighborhood cafes and restaurants',
      instagramHandle: 'vibrant_lifestyle',
      contentStyles: ['Warm', 'Editorial', 'Clean', 'Minimal'],
      strengths: ['Food Photography', 'Ambiance Shots', 'Reels/Short Video'],
      neighborhoods: ['Evanston', 'Rogers Park'],
      dreamBrands: ['Colectivo Coffee', 'Metric Coffee', 'Daisies Chicago'],
      vibeTags: ['warm-light', 'community-feel', 'editorial', 'cozy-spaces'],
      tier: 'VERIFIED',
    },
  });
  console.log('  Created creator profile: Shaurya G.');

  const katelynProfile = await prisma.creatorProfile.create({
    data: {
      userId: katelyn.id,
      displayName: 'Katelyn L.',
      bio: 'Beauty and lifestyle content with authentic neighborhood energy',
      tiktokHandle: 'kk.ameliu',
      contentStyles: ['Bold', 'Energetic', 'Documentary', 'Candid'],
      strengths: ['Reels/Short Video', 'Lifestyle', 'Behind the Scenes'],
      neighborhoods: ['Evanston', 'Lincoln Park'],
      dreamBrands: ['Patisserie Coralie', 'New Coffee Lab'],
      vibeTags: ['energetic', 'candid', 'lifestyle', 'gen-z-aesthetic'],
      tier: 'PRO',
    },
  });
  console.log('  Created creator profile: Katelyn L.');
  console.log('  (Alex Torres / New Creator has no creator profile)\n');

  // ─── PORTFOLIO ITEMS ───────────────────────────────────────────
  console.log('Creating portfolio items...');

  // Shaurya's portfolio (5 items)
  const shauryaPortfolio = [
    {
      creatorProfileId: shauryaProfile.id,
      imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
      caption: 'Warm cafe interior with morning light',
      contentType: 'ambiance',
      vibeTags: ['warm-light', 'interior', 'cozy'],
      verified: true,
    },
    {
      creatorProfileId: shauryaProfile.id,
      imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800',
      caption: 'Latte art close-up',
      contentType: 'food',
      vibeTags: ['latte-art', 'close-up', 'warm-tones'],
      verified: true,
    },
    {
      creatorProfileId: shauryaProfile.id,
      imageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800',
      caption: 'Cozy reading corner',
      contentType: 'ambiance',
      vibeTags: ['cozy', 'natural-light', 'lifestyle'],
      verified: true,
    },
    {
      creatorProfileId: shauryaProfile.id,
      imageUrl: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800',
      caption: 'Food plating detail',
      contentType: 'food',
      vibeTags: ['editorial', 'plating', 'natural-light'],
      verified: true,
    },
    {
      creatorProfileId: shauryaProfile.id,
      imageUrl: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800',
      caption: 'Coffee shop community',
      contentType: 'community',
      vibeTags: ['community', 'candid', 'warm'],
      verified: true,
    },
  ];

  for (const item of shauryaPortfolio) {
    await prisma.portfolioItem.create({ data: item });
  }
  console.log("  Created 5 portfolio items for Shaurya G.");

  // Katelyn's portfolio (4 items)
  const katelynPortfolio = [
    {
      creatorProfileId: katelynProfile.id,
      imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      caption: 'Lifestyle food moment',
      contentType: 'lifestyle',
      vibeTags: ['lifestyle', 'bold', 'energetic'],
      verified: true,
    },
    {
      creatorProfileId: katelynProfile.id,
      imageUrl: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800',
      caption: 'Candid cafe moment',
      contentType: 'lifestyle',
      vibeTags: ['candid', 'lifestyle', 'natural'],
      verified: true,
    },
    {
      creatorProfileId: katelynProfile.id,
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      caption: 'Close-up food detail',
      contentType: 'food',
      vibeTags: ['close-up', 'vibrant', 'appetizing'],
      verified: true,
    },
    {
      creatorProfileId: katelynProfile.id,
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
      caption: 'Behind the scenes',
      contentType: 'behind-the-scenes',
      vibeTags: ['bts', 'candid', 'authentic'],
      verified: true,
    },
  ];

  for (const item of katelynPortfolio) {
    await prisma.portfolioItem.create({ data: item });
  }
  console.log("  Created 4 portfolio items for Katelyn L.\n");

  // ─── CONTENT REQUESTS ──────────────────────────────────────────
  console.log('Creating content requests...');

  const request1 = await prisma.contentRequest.create({
    data: {
      brandProfileId: colectivoBrand.id,
      contentType: 'Ambiance / Interior',
      description: 'Morning light, our signature warm atmosphere, the reading corner',
      budgetRange: '$150-250',
      status: 'SELECTED',
    },
  });
  console.log('  Request 1: Colectivo - Ambiance / Interior (SELECTED)');

  const request2 = await prisma.contentRequest.create({
    data: {
      brandProfileId: colectivoBrand.id,
      contentType: 'Community / Culture',
      description: 'Weekend community vibes, barista interactions, regulars',
      budgetRange: '$180-250',
      status: 'SELECTED',
    },
  });
  console.log('  Request 2: Colectivo - Community / Culture (SELECTED)');

  const request3 = await prisma.contentRequest.create({
    data: {
      brandProfileId: hewnBrand.id,
      contentType: 'Behind the Scenes',
      description: 'Morning baking process, dough preparation, fresh loaves',
      budgetRange: '$120-200',
      status: 'SELECTED',
    },
  });
  console.log('  Request 3: Hewn - Behind the Scenes (SELECTED)');

  const request4 = await prisma.contentRequest.create({
    data: {
      brandProfileId: coralieBrand.id,
      contentType: 'Food & Drink',
      description: 'Signature pastries, seasonal specials, coffee pairings, plating details',
      budgetRange: '$200-300',
      status: 'COMPLETED',
    },
  });
  console.log('  Request 4: Patisserie Coralie - Food & Drink (COMPLETED)');

  const request5 = await prisma.contentRequest.create({
    data: {
      brandProfileId: coralieBrand.id,
      contentType: 'Reels & Short Video',
      description: 'Short-form video content showcasing pastry-making process and finished pieces. Think satisfying croissant pulls, glaze pours, and morning prep montages.',
      budgetRange: '$250-400',
      status: 'SELECTED',
    },
  });
  console.log('  Request 5: Patisserie Coralie - Reels & Short Video (SELECTED)');

  const request6 = await prisma.contentRequest.create({
    data: {
      brandProfileId: hewnBrand.id,
      contentType: 'Community / Events',
      description: 'Saturday morning farmers market pop-up and in-store bread tasting events. Capture the community energy and customer interactions.',
      budgetRange: '$150-250',
      status: 'MATCHING',
    },
  });
  console.log('  Request 6: Hewn - Community / Events (MATCHING)\n');

  // ─── MATCHES ───────────────────────────────────────────────────
  console.log('Creating matches...');

  // --- Request 1 matches (Colectivo Ambiance) ---
  const match1a = await prisma.match.create({
    data: {
      contentRequestId: request1.id,
      creatorProfileId: shauryaProfile.id,
      matchScore: 94,
      matchRationale:
        "Warm editorial style perfectly captures Colectivo's cozy community atmosphere. Active in Evanston with strong ambiance portfolio.",
      contentPreview: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
      deliverables: '3 photos + 1 Reel (15s)',
      price: 18000,
      timeline: '5 business days',
      usageRights: 'Organic social + in-store, 12 months',
      style: 'Warm & Editorial',
      status: 'SELECTED',
    },
  });
  console.log('  Match 1a: Shaurya x Colectivo Ambiance (score 94, SELECTED)');

  const match1b = await prisma.match.create({
    data: {
      contentRequestId: request1.id,
      creatorProfileId: katelynProfile.id,
      matchScore: 76,
      matchRationale:
        'Energetic style brings fresh perspective. Strong with Reels content that could add movement to interior shots.',
      contentPreview: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800',
      deliverables: '3 photos + 1 Reel (20s)',
      price: 20000,
      timeline: '7 business days',
      usageRights: 'Organic social, 6 months',
      style: 'Bold & Energetic',
      status: 'DECLINED',
    },
  });
  console.log('  Match 1b: Katelyn x Colectivo Ambiance (score 76, DECLINED)');

  const match1c = await prisma.match.create({
    data: {
      contentRequestId: request1.id,
      creatorProfileId: shauryaProfile.id,
      matchScore: 71,
      matchRationale:
        'Clean minimal approach offers an alternative aesthetic. Good food photography could complement ambiance shots.',
      contentPreview: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800',
      deliverables: '3 photos',
      price: 15000,
      timeline: '5 business days',
      usageRights: 'Organic social, 6 months',
      style: 'Clean & Minimal',
      status: 'DECLINED',
    },
  });
  console.log('  Match 1c: Shaurya (alt) x Colectivo Ambiance (score 71, DECLINED)');

  // --- Request 2 matches (Colectivo Community) ---
  const match2a = await prisma.match.create({
    data: {
      contentRequestId: request2.id,
      creatorProfileId: katelynProfile.id,
      matchScore: 81,
      matchRationale:
        'Documentary candid style is perfect for capturing authentic community moments and barista interactions.',
      contentPreview: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800',
      deliverables: '3 photos + 1 Reel (20s)',
      price: 20000,
      timeline: '7 business days',
      usageRights: 'Organic social + in-store, 12 months',
      style: 'Documentary & Candid',
      status: 'SELECTED',
    },
  });
  console.log('  Match 2a: Katelyn x Colectivo Community (score 81, SELECTED)');

  const match2b = await prisma.match.create({
    data: {
      contentRequestId: request2.id,
      creatorProfileId: shauryaProfile.id,
      matchScore: 78,
      matchRationale:
        'Strong community-feel portfolio. Warm editorial approach adds a storytelling layer to community content.',
      contentPreview: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
      deliverables: '3 photos + 1 Reel (15s)',
      price: 18000,
      timeline: '5 business days',
      usageRights: 'Organic social, 12 months',
      style: 'Warm & Editorial',
      status: 'DECLINED',
    },
  });
  console.log('  Match 2b: Shaurya x Colectivo Community (score 78, DECLINED)');

  const match2c = await prisma.match.create({
    data: {
      contentRequestId: request2.id,
      creatorProfileId: katelynProfile.id,
      matchScore: 69,
      matchRationale:
        'Lifestyle perspective could capture the everyday regulars vibe with an authentic Gen-Z lens.',
      contentPreview: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      deliverables: '2 photos + 1 Reel (15s)',
      price: 16000,
      timeline: '5 business days',
      usageRights: 'Organic social, 6 months',
      style: 'Bold & Energetic',
      status: 'DECLINED',
    },
  });
  console.log('  Match 2c: Katelyn (alt) x Colectivo Community (score 69, DECLINED)');

  // --- Request 3 matches (Hewn BTS) ---
  const match3a = await prisma.match.create({
    data: {
      contentRequestId: request3.id,
      creatorProfileId: shauryaProfile.id,
      matchScore: 88,
      matchRationale:
        "Warm editorial style perfectly suited for capturing the artisan bread-making process. Morning light expertise aligns with Hewn's dawn baking schedule.",
      contentPreview: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800',
      deliverables: '3 photos + 1 Reel (15s)',
      price: 16000,
      timeline: '5 business days',
      usageRights: 'Organic social + in-store, 12 months',
      style: 'Warm & Editorial',
      status: 'SELECTED',
    },
  });
  console.log('  Match 3a: Shaurya x Hewn BTS (score 88, SELECTED)');

  const match3b = await prisma.match.create({
    data: {
      contentRequestId: request3.id,
      creatorProfileId: katelynProfile.id,
      matchScore: 74,
      matchRationale:
        'Behind-the-scenes strength could bring an energetic documentary feel to the baking process.',
      contentPreview: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
      deliverables: '3 photos + 1 Reel (20s)',
      price: 18000,
      timeline: '7 business days',
      usageRights: 'Organic social, 6 months',
      style: 'Documentary & Candid',
      status: 'DECLINED',
    },
  });
  console.log('  Match 3b: Katelyn x Hewn BTS (score 74, DECLINED)');

  const match3c = await prisma.match.create({
    data: {
      contentRequestId: request3.id,
      creatorProfileId: shauryaProfile.id,
      matchScore: 66,
      matchRationale:
        'Clean minimal approach could offer a modern take on traditional baking documentation.',
      contentPreview: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800',
      deliverables: '3 photos',
      price: 14000,
      timeline: '5 business days',
      usageRights: 'Organic social, 6 months',
      style: 'Clean & Minimal',
      status: 'DECLINED',
    },
  });
  console.log('  Match 3c: Shaurya (alt) x Hewn BTS (score 66, DECLINED)');

  // --- Request 4 matches (Coralie Food) ---
  const match4a = await prisma.match.create({
    data: {
      contentRequestId: request4.id,
      creatorProfileId: shauryaProfile.id,
      matchScore: 91,
      matchRationale:
        "Clean editorial style is ideal for Coralie's refined pastry presentation. Strong food photography portfolio with natural-light expertise.",
      contentPreview: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800',
      deliverables: '4 photos + 1 Story set',
      price: 22000,
      timeline: '5 business days',
      usageRights: 'Organic social + in-store, 12 months',
      style: 'Clean & Minimal',
      status: 'SELECTED',
    },
  });
  console.log('  Match 4a: Shaurya x Coralie Food (score 91, SELECTED)');

  const match4b = await prisma.match.create({
    data: {
      contentRequestId: request4.id,
      creatorProfileId: katelynProfile.id,
      matchScore: 73,
      matchRationale:
        'Energetic lifestyle approach could add a fresh, casual feel to the pastry content.',
      contentPreview: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      deliverables: '3 photos + 1 Reel (15s)',
      price: 19000,
      timeline: '7 business days',
      usageRights: 'Organic social, 6 months',
      style: 'Bold & Energetic',
      status: 'DECLINED',
    },
  });
  console.log('  Match 4b: Katelyn x Coralie Food (score 73, DECLINED)');

  const match4c = await prisma.match.create({
    data: {
      contentRequestId: request4.id,
      creatorProfileId: shauryaProfile.id,
      matchScore: 68,
      matchRationale:
        'Warm editorial lens could provide a cozy, inviting angle on the pastry display.',
      contentPreview: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
      deliverables: '3 photos',
      price: 16000,
      timeline: '5 business days',
      usageRights: 'Organic social, 6 months',
      style: 'Warm & Editorial',
      status: 'DECLINED',
    },
  });
  console.log('  Match 4c: Shaurya (alt) x Coralie Food (score 68, DECLINED)');

  // --- Request 5 matches (Coralie Reels) ---
  const match5a = await prisma.match.create({
    data: {
      contentRequestId: request5.id,
      creatorProfileId: katelynProfile.id,
      matchScore: 89,
      matchRationale:
        'Bold energetic style is ideal for short-form pastry content. Strong Reels expertise and lifestyle approach will make Coralie\'s artisan process feel accessible and shareable.',
      contentPreview: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      deliverables: '3 Reels (15-30s each)',
      price: 28000,
      timeline: '10 business days',
      usageRights: 'Organic social + paid ads, 12 months',
      style: 'Bold & Energetic',
      status: 'SELECTED',
    },
  });
  console.log('  Match 5a: Katelyn x Coralie Reels (score 89, SELECTED)');

  const match5b = await prisma.match.create({
    data: {
      contentRequestId: request5.id,
      creatorProfileId: shauryaProfile.id,
      matchScore: 72,
      matchRationale:
        'Warm editorial style could bring a cinematic feel to the pastry process, though less native to short-form format.',
      contentPreview: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800',
      deliverables: '2 Reels (15s each)',
      price: 22000,
      timeline: '7 business days',
      usageRights: 'Organic social, 6 months',
      style: 'Warm & Editorial',
      status: 'DECLINED',
    },
  });
  console.log('  Match 5b: Shaurya x Coralie Reels (score 72, DECLINED)');

  // --- Request 6 matches (Hewn Community) ---
  const match6a = await prisma.match.create({
    data: {
      contentRequestId: request6.id,
      creatorProfileId: katelynProfile.id,
      matchScore: 85,
      matchRationale:
        'Documentary candid style is perfect for capturing farmers market energy and authentic customer interactions. Strong community content in portfolio.',
      contentPreview: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800',
      deliverables: '4 photos + 1 Reel (30s)',
      price: 20000,
      timeline: '7 business days',
      usageRights: 'Organic social + in-store, 12 months',
      style: 'Documentary & Candid',
      status: 'PRESENTED',
    },
  });
  console.log('  Match 6a: Katelyn x Hewn Community (score 85, PRESENTED)');

  const match6b = await prisma.match.create({
    data: {
      contentRequestId: request6.id,
      creatorProfileId: shauryaProfile.id,
      matchScore: 80,
      matchRationale:
        'Warm community-feel portfolio aligns well with farmers market atmosphere. Morning light expertise is a bonus for outdoor events.',
      contentPreview: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800',
      deliverables: '3 photos + 1 Reel (15s)',
      price: 18000,
      timeline: '5 business days',
      usageRights: 'Organic social, 12 months',
      style: 'Warm & Editorial',
      status: 'PRESENTED',
    },
  });
  console.log('  Match 6b: Shaurya x Hewn Community (score 80, PRESENTED)\n');

  // ─── PROJECTS ──────────────────────────────────────────────────
  console.log('Creating projects...');

  // Project 1: Colectivo x Shaurya - Ambiance (DRAFT_SUBMITTED)
  const project1 = await prisma.project.create({
    data: {
      matchId: match1a.id,
      brandProfileId: colectivoBrand.id,
      creatorProfileId: shauryaProfile.id,
      status: 'DRAFT_SUBMITTED',
      deliverables: '3 photos + 1 Reel (15s)',
      price: 18000,
      timeline: '5 business days',
      usageRights: 'Organic social + in-store, 12 months',
      briefText:
        'Capture the morning light hitting the east-facing windows at Colectivo. Focus on the warm wood tones, community table area, and the reading nook. We want our audience to feel the warmth and comfort of being here on a quiet morning.',
    },
  });
  console.log('  Project 1: Colectivo x Shaurya - Ambiance (DRAFT_SUBMITTED)');

  // Project 2: Colectivo x Katelyn - Community (REVISION_REQUESTED)
  const project2 = await prisma.project.create({
    data: {
      matchId: match2a.id,
      brandProfileId: colectivoBrand.id,
      creatorProfileId: katelynProfile.id,
      status: 'REVISION_REQUESTED',
      deliverables: '3 photos + 1 Reel (20s)',
      price: 20000,
      timeline: '7 business days',
      usageRights: 'Organic social + in-store, 12 months',
      briefText:
        'Show the weekend community energy at Colectivo. Capture barista interactions with regulars, the buzz of the Saturday morning crowd, and organic moments of connection. Keep it candid and authentic.',
    },
  });
  console.log('  Project 2: Colectivo x Katelyn - Community (REVISION_REQUESTED)');

  // Project 3: Hewn x Shaurya - BTS (BRIEF_SENT)
  const project3 = await prisma.project.create({
    data: {
      matchId: match3a.id,
      brandProfileId: hewnBrand.id,
      creatorProfileId: shauryaProfile.id,
      status: 'BRIEF_SENT',
      deliverables: '3 photos + 1 Reel (15s)',
      price: 16000,
      timeline: '5 business days',
      usageRights: 'Organic social + in-store, 12 months',
      briefText:
        "Document the morning baking process at Hewn. Arrive by 5 AM for the dough prep. Capture the flour-dusted surfaces, hands shaping loaves, the wood-fired oven glow, and the moment the first loaves come out golden. Tell the story of craft.",
    },
  });
  console.log('  Project 3: Hewn x Shaurya - BTS (BRIEF_SENT)');

  // Project 4: Patisserie Coralie x Shaurya - Food (APPROVED)
  const project4 = await prisma.project.create({
    data: {
      matchId: match4a.id,
      brandProfileId: coralieBrand.id,
      creatorProfileId: shauryaProfile.id,
      status: 'APPROVED',
      deliverables: '4 photos + 1 Story set',
      price: 22000,
      timeline: '5 business days',
      usageRights: 'Organic social + in-store, 12 months',
      briefText:
        'Photograph our signature pastries with a clean, editorial eye. Focus on the croissant layers, seasonal tart details, and the morning display case. Include a cafe-au-lait pour for the Story set. Natural light is essential.',
    },
  });
  console.log('  Project 4: Patisserie Coralie x Shaurya - Food (APPROVED)');

  // Project 5: Patisserie Coralie x Katelyn - Reels (BRIEF_SENT)
  const project5 = await prisma.project.create({
    data: {
      matchId: match5a.id,
      brandProfileId: coralieBrand.id,
      creatorProfileId: katelynProfile.id,
      status: 'BRIEF_SENT',
      deliverables: '3 Reels (15-30s each)',
      price: 28000,
      timeline: '10 business days',
      usageRights: 'Organic social + paid ads, 12 months',
      briefText:
        'Create 3 short-form Reels showcasing our pastry craft. Reel 1: Croissant lamination and baking process (satisfying dough folds). Reel 2: Morning display case reveal with natural light. Reel 3: A signature pastry + coffee pairing moment. Keep it energetic and shareable — think trending audio with clean cuts.',
    },
  });
  console.log('  Project 5: Patisserie Coralie x Katelyn - Reels (BRIEF_SENT)\n');

  // ─── PROJECT DRAFTS ────────────────────────────────────────────
  console.log('Creating project drafts...');

  // Draft for Project 1 (Draft Submitted)
  await prisma.projectDraft.create({
    data: {
      projectId: project1.id,
      version: 1,
      fileUrls: [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
        'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800',
        'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800',
      ],
      notes:
        'Captured the morning light hitting the east-facing windows. Focused on the warm wood tones and community table area. The Reel shows a slow walkthrough from entrance to the reading nook.',
      status: 'SUBMITTED',
    },
  });
  console.log('  Draft v1 for Project 1 (Colectivo Ambiance) - SUBMITTED');

  // Draft for Project 2 (Revision Requested)
  await prisma.projectDraft.create({
    data: {
      projectId: project2.id,
      version: 1,
      fileUrls: [
        'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800',
        'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      ],
      notes: 'Captured the weekend crowd and barista interactions. Focused on candid moments of community connection.',
      feedback:
        'Love the energy! Could we get one more shot of the barista interaction? The first set felt slightly too posed.',
      status: 'REVISION_REQUESTED',
    },
  });
  console.log('  Draft v1 for Project 2 (Colectivo Community) - REVISION_REQUESTED');

  // Draft for Project 4 (Approved)
  await prisma.projectDraft.create({
    data: {
      projectId: project4.id,
      version: 1,
      fileUrls: [
        'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800',
      ],
      notes:
        'Close-up croissant layers, morning pastry display, seasonal tart detail, and cafe-au-lait pour. All shot in natural morning light from the east-facing windows.',
      status: 'APPROVED',
    },
  });
  console.log('  Draft v1 for Project 4 (Coralie Food) - APPROVED');
  console.log('  (No draft for Project 3 - Hewn BTS is still at BRIEF_SENT)\n');

  // ─── TRANSACTIONS ──────────────────────────────────────────────
  console.log('Creating transactions...');

  // Transaction for Project 1
  await prisma.transaction.create({
    data: {
      projectId: project1.id,
      amount: 18000,
      platformFee: 2700, // 15%
      creatorPayout: 15300, // 85%
      type: 'COMMISSION',
      status: 'PENDING',
      demoMode: true,
    },
  });
  console.log('  Transaction for Project 1: $180.00 (PENDING)');

  // Transaction for Project 2
  await prisma.transaction.create({
    data: {
      projectId: project2.id,
      amount: 20000,
      platformFee: 3000, // 15%
      creatorPayout: 17000, // 85%
      type: 'COMMISSION',
      status: 'PENDING',
      demoMode: true,
    },
  });
  console.log('  Transaction for Project 2: $200.00 (PENDING)');

  // Transaction for Project 3
  await prisma.transaction.create({
    data: {
      projectId: project3.id,
      amount: 16000,
      platformFee: 2400, // 15%
      creatorPayout: 13600, // 85%
      type: 'COMMISSION',
      status: 'PENDING',
      demoMode: true,
    },
  });
  console.log('  Transaction for Project 3: $160.00 (PENDING)');

  // Transaction for Project 4
  await prisma.transaction.create({
    data: {
      projectId: project4.id,
      amount: 22000,
      platformFee: 3300, // 15%
      creatorPayout: 18700, // 85%
      type: 'COMMISSION',
      status: 'COMPLETED',
      demoMode: true,
    },
  });
  console.log('  Transaction for Project 4: $220.00 (COMPLETED)');

  // Transaction for Project 5
  await prisma.transaction.create({
    data: {
      projectId: project5.id,
      amount: 28000,
      platformFee: 4200, // 15%
      creatorPayout: 23800, // 85%
      type: 'COMMISSION',
      status: 'PENDING',
      demoMode: true,
    },
  });
  console.log('  Transaction for Project 5: $280.00 (PENDING)\n');

  // ─── MESSAGES ──────────────────────────────────────────────────
  console.log('Creating messages...');
  await prisma.message.createMany({
    data: [
      { projectId: project1.id, userId: josh.id, text: 'Hey Shaurya! Excited to see your take on our space.', createdAt: new Date('2026-02-10T10:00:00Z') },
      { projectId: project1.id, userId: shaurya.id, text: 'Thanks Josh! I love the Colectivo vibe. Planning to shoot during golden hour.', createdAt: new Date('2026-02-10T10:30:00Z') },
      { projectId: project1.id, userId: josh.id, text: 'Perfect - the light is amazing around 4pm through the west windows.', createdAt: new Date('2026-02-10T11:00:00Z') },
      { projectId: project2.id, userId: josh.id, text: 'The latte art shots look great so far!', createdAt: new Date('2026-02-12T14:00:00Z') },
      { projectId: project2.id, userId: shaurya.id, text: 'Thanks! I\'ll have the full set ready by Friday.', createdAt: new Date('2026-02-12T14:15:00Z') },
    ],
  });
  console.log('  Created 5 messages across 2 projects');

  // ─── NOTIFICATIONS ────────────────────────────────────────────
  console.log('Creating notifications...');
  await prisma.notification.createMany({
    data: [
      { userId: josh.id, type: 'DRAFT_SUBMITTED', title: 'New draft submitted', body: 'Shaurya submitted a draft for your Ambiance project.', linkUrl: `/operator/project/${project1.id}`, read: false, createdAt: new Date('2026-02-14T09:00:00Z') },
      { userId: josh.id, type: 'BRIEF_ACCEPTED', title: 'Creator accepted your brief', body: 'Shaurya accepted your Food & Drink brief.', linkUrl: `/operator/project/${project2.id}`, read: true, createdAt: new Date('2026-02-11T08:00:00Z') },
      { userId: josh.id, type: 'MESSAGE', title: 'New message from Shaurya', body: "Thanks! I'll have the full set ready by Friday.", linkUrl: `/operator/project/${project2.id}`, read: false, createdAt: new Date('2026-02-12T14:15:00Z') },
      { userId: shaurya.id, type: 'APPROVED', title: 'Your draft was approved!', body: 'Great work! The brand approved your submission.', linkUrl: `/creator/project/${project4.id}`, read: true, createdAt: new Date('2026-02-13T16:00:00Z') },
      { userId: shaurya.id, type: 'REVISION_REQUESTED', title: 'Revision requested', body: 'Could you reshoot the interior shots with warmer tones?', linkUrl: `/creator/project/${project3.id}`, read: false, createdAt: new Date('2026-02-15T10:00:00Z') },
      { userId: katelyn.id, type: 'BRIEF_RECEIVED', title: 'New brief waiting for you', body: 'A local bakery wants food photography content.', linkUrl: '/creator/dashboard', read: false, createdAt: new Date('2026-02-14T12:00:00Z') },
    ],
  });
  console.log('  Created 6 notifications for 3 users\n');

  // ─── SUMMARY ───────────────────────────────────────────────────
  console.log('=== Seed complete ===');
  console.log('  7 users (4 operators, 3 creators)');
  console.log('  3 brand profiles');
  console.log('  2 creator profiles');
  console.log('  9 portfolio items');
  console.log('  6 content requests');
  console.log('  16 matches');
  console.log('  5 projects');
  console.log('  3 project drafts');
  console.log('  5 transactions');
  console.log('  5 messages');
  console.log('  6 notifications');
  console.log('\nDemo accounts:');
  console.log('  Operators: josh@colectivo.com, marie@coralie.com, ellen@hewn.com, josie@coffeelab.com');
  console.log('  Creators:  shaurya@locale.app, katelyn@locale.app, newcreator@locale.app');
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
