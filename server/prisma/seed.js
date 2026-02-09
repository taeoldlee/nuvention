const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Locale seed script starting ---\n');

  // ─── CLEAN SLATE ───
  console.log('Clearing existing data...');
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

  // ─── HELPER ───
  const img = (id, w = 800) => `https://images.unsplash.com/photo-${id}?w=${w}`;

  // ─── OPERATOR USERS ───
  console.log('Creating operator users...');
  const ops = [];
  const opData = [
    { email: 'josh@colectivo.com', name: 'Josh Rivera', avatar: '1507003211169-0a1dd7228f2d' },
    { email: 'marie@coralie.com', name: 'Marie Laurent', avatar: '1494790108377-be9c29b29330' },
    { email: 'ellen@hewn.com', name: 'Ellen King', avatar: '1438761681033-6461ffad8d80' },
    { email: 'danny@fatrice.com', name: 'Danny Bowien', avatar: '1472099645785-5658abf4ff4e' },
    { email: 'jason@lulacafe.com', name: 'Jason Hammel', avatar: '1500648767791-00dcc994a43e' },
    { email: 'paul@bigstar.com', name: 'Paul Kahan', avatar: '1560250097-0b93528c311a' },
    { email: 'stephanie@girlgoat.com', name: 'Stephanie Izard', avatar: '1580489944761-15a19d654956' },
    { email: 'grant@alinea.com', name: 'Grant Achatz', avatar: '1519085360753-af0119f7cbe7' },
    { email: 'stephen@sky.com', name: 'Stephen Gillanders', avatar: '1506794778202-cad84cf45f1d' },
    { email: 'genie@doves.com', name: 'Genie Kwon', avatar: '1534528741775-53994a69daeb' },
    { email: 'erick@virtue.com', name: 'Erick Williams', avatar: '1507591064344-4c6ce005b128' },
    { email: 'brian@boeufhaus.com', name: 'Brian Jupiter', avatar: '1463453091185-61582044d556' },
    { email: 'tim@kasama.com', name: 'Tim Flores', avatar: '1504257432389-52343af06ae3' },
    { email: 'zach@galit.com', name: 'Zach Engel', avatar: '1519345182560-3f2917c472ef' },
    { email: 'diana@mitocaya.com', name: 'Diana Davila', avatar: '1487412720507-e7ab37603c6f' },
    { email: 'noah@cancale.com', name: 'Noah Sandoval', avatar: '1492562080023-ab3db95bfbce' },
    { email: 'josie@newspot.com', name: 'Josie Chen', avatar: '1517841905240-472988babdf9' },
    { email: 'marco@pending.com', name: 'Marco Ali', avatar: '1539571696357-5a69c17a67c6' },
  ];
  for (const d of opData) {
    ops.push(await prisma.user.create({
      data: { email: d.email, name: d.name, role: 'OPERATOR', isDemo: true, avatarUrl: img(d.avatar, 150) },
    }));
  }
  console.log(`  Created ${ops.length} operator users`);

  // ─── CREATOR USERS ───
  console.log('Creating creator users...');
  const crs = [];
  const crData = [
    { email: 'shaurya@mise.app', name: 'Shaurya Garg', avatar: '1506794778202-cad84cf45f1d' },
    { email: 'katelyn@mise.app', name: 'Katelyn Liu', avatar: '1517841905240-472988babdf9' },
    { email: 'maya@mise.app', name: 'Maya Reyes', avatar: '1531746020798-e6953c6e8e04' },
    { email: 'diego@mise.app', name: 'Diego Salazar', avatar: '1500648767791-00dcc994a43e' },
    { email: 'priya@mise.app', name: 'Priya Kapoor', avatar: '1494790108377-be9c29b29330' },
    { email: 'jordan@mise.app', name: 'Jordan Torres', avatar: '1472099645785-5658abf4ff4e' },
    { email: 'sofia@mise.app', name: 'Sofia Martinez', avatar: '1534528741775-53994a69daeb' },
    { email: 'marcus@mise.app', name: 'Marcus Williams', avatar: '1507591064344-4c6ce005b128' },
    { email: 'aisha@mise.app', name: 'Aisha Nkosi', avatar: '1580489944761-15a19d654956' },
    { email: 'leo@mise.app', name: 'Leo Chang', avatar: '1519085360753-af0119f7cbe7' },
    { email: 'nina@mise.app', name: 'Nina Petrov', avatar: '1438761681033-6461ffad8d80' },
    { email: 'kai@mise.app', name: 'Kai Huang', avatar: '1463453091185-61582044d556' },
    { email: 'zara@mise.app', name: 'Zara Bennett', avatar: '1487412720507-e7ab37603c6f' },
    { email: 'remy@mise.app', name: 'Remy Fischer', avatar: '1492562080023-ab3db95bfbce' },
    { email: 'alex@mise.app', name: 'Alex Torres', avatar: '1539571696357-5a69c17a67c6' },
    { email: 'sam@mise.app', name: 'Sam Okonkwo', avatar: '1504257432389-52343af06ae3' },
  ];
  for (const d of crData) {
    crs.push(await prisma.user.create({
      data: { email: d.email, name: d.name, role: 'CREATOR', isDemo: true, avatarUrl: img(d.avatar, 150) },
    }));
  }
  console.log(`  Created ${crs.length} creator users\n`);

  // ─── BRAND PROFILES (16 of 18 operators get profiles) ───
  console.log('Creating brand profiles...');
  const brandData = [
    { idx: 0, biz: 'Colectivo Coffee', hood: 'Evanston', vibe: ['Cozy & Warm', 'Rustic & Raw'], vals: ['Community-first', 'Sustainability'], zones: ['Ambiance / Interior', 'Staff & Culture', 'Community / Events'], cuisine: ['Coffee & Beverage'], min: 15000, max: 25000 },
    { idx: 1, biz: 'Patisserie Coralie', hood: 'Evanston', vibe: ['Polished & Editorial', 'Minimalist & Clean'], vals: ['Quality-obsessed', 'Design-forward'], zones: ['Food & Drink', 'Ambiance / Interior'], cuisine: ['French', 'Bakery & Pastry'], min: 18000, max: 30000 },
    { idx: 2, biz: 'Hewn Bread', hood: 'Evanston', vibe: ['Rustic & Raw', 'Cozy & Warm'], vals: ['Quality-obsessed', 'Community-first', 'Sustainability'], zones: ['Food & Drink', 'Behind the Scenes'], cuisine: ['Bakery & Pastry', 'Farm-to-Table'], min: 12000, max: 20000 },
    { idx: 3, biz: 'Fat Rice', hood: 'Logan Square', vibe: ['Bold & Vibrant', 'Eclectic'], vals: ['Inclusive', 'Community-first'], zones: ['Food & Drink', 'Community / Events'], cuisine: ['Chinese', 'Fusion'], min: 20000, max: 35000 },
    { idx: 4, biz: 'Lula Cafe', hood: 'Logan Square', vibe: ['Cozy & Warm', 'Polished & Editorial'], vals: ['Sustainability', 'Quality-obsessed'], zones: ['Food & Drink', 'Ambiance / Interior'], cuisine: ['Farm-to-Table', 'American'], min: 18000, max: 28000 },
    { idx: 5, biz: 'Big Star', hood: 'Wicker Park', vibe: ['Bold & Vibrant', 'Rustic & Raw'], vals: ['Community-first', 'Inclusive'], zones: ['Food & Drink', 'Community / Events'], cuisine: ['Mexican', 'American'], min: 15000, max: 25000 },
    { idx: 6, biz: 'Girl & The Goat', hood: 'West Loop', vibe: ['Energetic & Bold', 'Polished & Editorial'], vals: ['Quality-obsessed', 'Design-forward'], zones: ['Food & Drink', 'Behind the Scenes'], cuisine: ['Fusion', 'American'], min: 25000, max: 40000 },
    { idx: 7, biz: 'Alinea', hood: 'Lincoln Park', vibe: ['Minimalist & Clean', 'Polished & Editorial'], vals: ['Quality-obsessed', 'Design-forward'], zones: ['Food & Drink', 'Behind the Scenes'], cuisine: ['American', 'Fusion'], min: 35000, max: 50000 },
    { idx: 8, biz: 'S.K.Y.', hood: 'Pilsen', vibe: ['Minimalist & Clean', 'Cozy & Warm'], vals: ['Quality-obsessed', 'Inclusive'], zones: ['Food & Drink', 'Ambiance / Interior'], cuisine: ['Korean', 'Fusion'], min: 20000, max: 30000 },
    { idx: 9, biz: "Dove's Luncheonette", hood: 'Wicker Park', vibe: ['Rustic & Raw', 'Cozy & Warm'], vals: ['Community-first', 'Sustainability'], zones: ['Ambiance / Interior', 'Food & Drink'], cuisine: ['Mexican', 'American'], min: 12000, max: 22000 },
    { idx: 10, biz: 'Virtue', hood: 'Hyde Park', vibe: ['Polished & Editorial', 'Cozy & Warm'], vals: ['Community-first', 'Quality-obsessed'], zones: ['Food & Drink', 'Community / Events'], cuisine: ['American', 'Farm-to-Table'], min: 20000, max: 35000 },
    { idx: 11, biz: 'Boeufhaus', hood: 'Andersonville', vibe: ['Rustic & Raw', 'Polished & Editorial'], vals: ['Quality-obsessed', 'Design-forward'], zones: ['Food & Drink', 'Ambiance / Interior'], cuisine: ['French', 'American'], min: 22000, max: 35000 },
    { idx: 12, biz: 'Kasama', hood: 'Ukrainian Village', vibe: ['Energetic & Bold', 'Polished & Editorial'], vals: ['Quality-obsessed', 'Inclusive'], zones: ['Food & Drink', 'Behind the Scenes'], cuisine: ['Bakery & Pastry', 'Fusion'], min: 20000, max: 32000 },
    { idx: 13, biz: 'Galit', hood: 'Lincoln Park', vibe: ['Bold & Vibrant', 'Cozy & Warm'], vals: ['Community-first', 'Quality-obsessed'], zones: ['Food & Drink', 'Community / Events'], cuisine: ['Middle Eastern', 'Mediterranean'], min: 18000, max: 30000 },
    { idx: 14, biz: 'Mi Tocaya Antojeria', hood: 'Logan Square', vibe: ['Bold & Vibrant', 'Energetic & Bold'], vals: ['Inclusive', 'Community-first'], zones: ['Food & Drink', 'Community / Events'], cuisine: ['Mexican'], min: 15000, max: 25000 },
    { idx: 15, biz: 'Cafe Cancale', hood: 'Ravenswood', vibe: ['Minimalist & Clean', 'Cozy & Warm'], vals: ['Quality-obsessed', 'Sustainability'], zones: ['Ambiance / Interior', 'Food & Drink'], cuisine: ['French', 'Coffee & Beverage'], min: 15000, max: 25000 },
  ];

  const brands = [];
  for (const b of brandData) {
    brands.push(await prisma.brandProfile.create({
      data: {
        userId: ops[b.idx].id,
        businessName: b.biz,
        neighborhood: b.hood,
        city: b.hood === 'Evanston' ? 'Evanston' : 'Chicago',
        state: 'IL',
        vibe: b.vibe,
        values: b.vals,
        contentComfortZones: b.zones,
        cuisineTypes: b.cuisine,
        budgetMin: b.min,
        budgetMax: b.max,
      },
    }));
  }
  console.log(`  Created ${brands.length} brand profiles`);
  console.log('  (Josie Chen and Marco Ali have no brand profiles for onboarding demo)\n');

  // ─── CREATOR PROFILES (14 of 16 creators get profiles) ───
  console.log('Creating creator profiles...');
  const cpData = [
    { idx: 0, name: 'Shaurya G.', bio: 'Warm editorial content for neighborhood cafes and restaurants', ig: '@shaurya.shoots', styles: ['Warm & Editorial', 'Clean & Minimal'], str: ['Food Photography', 'Ambiance Shots', 'Reels/Short Video'], hoods: ['Evanston', 'Rogers Park'], dreams: ['Colectivo Coffee', 'Metric Coffee'], cuisine: ['Italian', 'Coffee & Beverage', 'Bakery & Pastry'], tags: ['warm-light', 'community-feel', 'editorial', 'cozy-spaces'], tier: 'VERIFIED' },
    { idx: 1, name: 'Katelyn L.', bio: 'Beauty and lifestyle content with authentic neighborhood energy', tt: '@kk.ameliu', styles: ['Bold & Energetic', 'Documentary & Candid'], str: ['Reels/Short Video', 'Lifestyle', 'Behind the Scenes'], hoods: ['Evanston', 'Lincoln Park'], dreams: ['Patisserie Coralie', 'Big Star'], cuisine: ['American', 'Mexican', 'Fusion'], tags: ['energetic', 'candid', 'lifestyle', 'gen-z-aesthetic'], tier: 'PRO' },
    { idx: 2, name: 'Maya R.', bio: 'Clean, minimal food photography with a focus on plating and light', ig: '@maya.eats', styles: ['Clean & Minimal', 'Polished & Editorial'], str: ['Food Photography', 'Plating Detail', 'Reels/Short Video'], hoods: ['West Loop', 'Wicker Park'], dreams: ['Girl & The Goat', 'Alinea'], cuisine: ['Japanese', 'Korean', 'Vietnamese'], tags: ['clean-lines', 'natural-light', 'plating', 'minimal'], tier: 'VERIFIED' },
    { idx: 3, name: 'Diego S.', bio: 'Documentary-style food and culture stories from Chicago neighborhoods', ig: '@diego.stories', styles: ['Documentary & Candid', 'Warm & Editorial'], str: ['Behind the Scenes', 'Food Photography', 'Storytelling'], hoods: ['Pilsen', 'Logan Square'], dreams: ['Mi Tocaya Antojeria', 'Fat Rice'], cuisine: ['Mexican', 'Farm-to-Table'], tags: ['documentary', 'authentic', 'storytelling', 'neighborhood'], tier: 'PRO' },
    { idx: 4, name: 'Priya K.', bio: 'Moody, atmospheric food photography with dramatic lighting', ig: '@priya.darkbites', styles: ['Moody & Dark', 'Polished & Editorial'], str: ['Food Photography', 'Ambiance Shots', 'Reels/Short Video'], hoods: ['Lincoln Park', 'Lakeview'], dreams: ['Alinea', 'Galit'], cuisine: ['Indian', 'Middle Eastern', 'Ethiopian'], tags: ['moody', 'dramatic-light', 'dark-aesthetic', 'atmospheric'], tier: 'VERIFIED' },
    { idx: 5, name: 'Jordan T.', bio: 'Bright airy lifestyle shots — coffee, pastries, and morning light', ig: '@jordan.mornings', styles: ['Bright & Airy', 'Clean & Minimal'], str: ['Lifestyle', 'Ambiance Shots', 'Food Photography'], hoods: ['Andersonville', 'Ravenswood'], dreams: ['Cafe Cancale', 'Boeufhaus'], cuisine: ['Coffee & Beverage', 'Bakery & Pastry'], tags: ['bright', 'airy', 'morning-light', 'lifestyle'], tier: 'NEW' },
    { idx: 6, name: 'Sofia M.', bio: 'Bold, vibrant food Reels and energetic restaurant content', tt: '@sofia.bites', styles: ['Bold & Energetic', 'Documentary & Candid'], str: ['Reels/Short Video', 'Food Photography', 'Behind the Scenes'], hoods: ['Wicker Park', 'Bucktown'], dreams: ['Big Star', 'Kasama'], cuisine: ['Italian', 'Mediterranean'], tags: ['bold', 'vibrant', 'energetic', 'reels-first'], tier: 'VERIFIED' },
    { idx: 7, name: 'Marcus W.', bio: 'Warm editorial ambiance and interiors for upscale dining', ig: '@marcus.spaces', styles: ['Warm & Editorial', 'Polished & Editorial'], str: ['Ambiance Shots', 'Food Photography', 'Reels/Short Video'], hoods: ['Hyde Park', 'Pilsen'], dreams: ['Virtue', 'S.K.Y.'], cuisine: ['American', 'French'], tags: ['warm', 'editorial', 'upscale', 'interior'], tier: 'PRO' },
    { idx: 8, name: 'Aisha N.', bio: 'Documentary food stories focused on culture and tradition', ig: '@aisha.roots', styles: ['Documentary & Candid', 'Warm & Editorial'], str: ['Behind the Scenes', 'Storytelling', 'Food Photography'], hoods: ['Logan Square', 'Humboldt Park'], dreams: ['Fat Rice', 'Mi Tocaya Antojeria'], cuisine: ['Ethiopian', 'Middle Eastern'], tags: ['documentary', 'cultural', 'authentic', 'roots'], tier: 'NEW' },
    { idx: 9, name: 'Leo C.', bio: 'Clean minimal food photography with precision plating focus', ig: '@leo.plates', styles: ['Clean & Minimal', 'Polished & Editorial'], str: ['Food Photography', 'Plating Detail', 'Ambiance Shots'], hoods: ['River North', 'Old Town'], dreams: ['Alinea', 'Girl & The Goat'], cuisine: ['Japanese', 'French', 'Fusion'], tags: ['clean', 'precise', 'plating', 'minimal'], tier: 'VERIFIED' },
    { idx: 10, name: 'Nina P.', bio: 'Bright lifestyle content for bakeries and farm-to-table spots', ig: '@nina.bakes', styles: ['Bright & Airy', 'Warm & Editorial'], str: ['Lifestyle', 'Food Photography', 'Reels/Short Video'], hoods: ['Ukrainian Village', 'Wicker Park'], dreams: ['Kasama', 'Hewn Bread'], cuisine: ['Bakery & Pastry', 'Farm-to-Table'], tags: ['bright', 'warm', 'bakery', 'farm-fresh'], tier: 'PRO' },
    { idx: 11, name: 'Kai H.', bio: 'Moody atmospheric shots of bars, kitchens, and late-night dining', ig: '@kai.darkroom', styles: ['Moody & Dark', 'Documentary & Candid'], str: ['Ambiance Shots', 'Behind the Scenes', 'Food Photography'], hoods: ['West Loop', 'River North'], dreams: ['Girl & The Goat', 'S.K.Y.'], cuisine: ['Korean', 'Chinese'], tags: ['moody', 'dark', 'atmospheric', 'night-dining'], tier: 'VERIFIED' },
    { idx: 12, name: 'Zara B.', bio: 'Warm editorial food photography with Mediterranean flair', ig: '@zara.flavors', styles: ['Warm & Editorial', 'Bright & Airy'], str: ['Food Photography', 'Lifestyle', 'Ambiance Shots'], hoods: ['Lakeview', 'Andersonville'], dreams: ['Galit', 'Boeufhaus'], cuisine: ['Mediterranean', 'Middle Eastern'], tags: ['warm', 'mediterranean', 'golden-light', 'editorial'], tier: 'NEW' },
    { idx: 13, name: 'Remy F.', bio: 'Bold high-energy Reels and dynamic restaurant content', tt: '@remy.eats', styles: ['Bold & Energetic', 'Documentary & Candid'], str: ['Reels/Short Video', 'Behind the Scenes', 'Food Photography'], hoods: ['Old Town', 'Lincoln Park'], dreams: ['Alinea', 'Galit'], cuisine: ['French', 'American'], tags: ['bold', 'dynamic', 'high-energy', 'reels'], tier: 'VERIFIED' },
  ];

  const profiles = [];
  for (const c of cpData) {
    profiles.push(await prisma.creatorProfile.create({
      data: {
        userId: crs[c.idx].id,
        displayName: c.name,
        bio: c.bio,
        instagramHandle: c.ig || null,
        tiktokHandle: c.tt || null,
        contentStyles: c.styles,
        strengths: c.str,
        neighborhoods: c.hoods,
        dreamBrands: c.dreams,
        cuisineSpecialties: c.cuisine,
        vibeTags: c.tags,
        tier: c.tier,
      },
    }));
  }
  console.log(`  Created ${profiles.length} creator profiles`);
  console.log('  (Alex Torres and Sam Okonkwo have no profiles for onboarding demo)\n');

  // ─── PORTFOLIO ITEMS ───
  console.log('Creating portfolio items...');
  const foodPhotos = [
    '1554118811-1e0d58224f24', '1461023058943-07fcbe16d735', '1559925393-8be0ec4767c8',
    '1476224203421-9ac39bcb3327', '1521017432531-fbd92d768814', '1414235077428-338989a2e8c0',
    '1445116572660-236099ec97a0', '1504674900247-0877df9cc836', '1556742049-0cfed4f6a45d',
    '1495214783159-3503fd1f1d9c', '1484723091739-30a097e8f929', '1540189549336-e6e99c3679fe',
    '1565299624946-b28f40a0ae38', '1567620905862-fe6c3c1d2e5f', '1482049016688-2d3e1b311543',
    '1551024601-bec78aea704b', '1515003197210-e0cd71810b5f', '1473093295043-cdd812d0e601',
    '1498654896293-37aacf113fd9', '1540914124281-342587941389', '1555939594-58d7cb561ad1',
    '1571091718767-18b5b1457add', '1517248135467-4c7edcad34c4', '1529006557810-274b9b2fc783',
    '1565958011703-44f9829ba187', '1567306226416-28f0efdc88ce', '1550547660-d9450f859349',
    '1519996529931-28324d5a630e', '1481931098730-318b6f776db0', '1432139555190-58524dae6a55',
  ];
  const captions = ['Morning light interior', 'Latte art close-up', 'Cozy reading corner', 'Food plating detail', 'Community moment', 'Lifestyle food shot', 'Candid cafe scene', 'Close-up food', 'Behind the scenes', 'Golden hour shot'];
  const types = ['ambiance', 'food', 'lifestyle', 'community', 'behind-the-scenes'];
  let portfolioCount = 0;
  for (let p = 0; p < profiles.length; p++) {
    const count = 4 + (p % 3); // 4-6 items each
    for (let i = 0; i < count; i++) {
      await prisma.portfolioItem.create({
        data: {
          creatorProfileId: profiles[p].id,
          imageUrl: img(foodPhotos[(p * 6 + i) % foodPhotos.length]),
          caption: captions[(p + i) % captions.length],
          contentType: types[(p + i) % types.length],
          vibeTags: [cpData[p].tags[0], cpData[p].tags[1]],
          verified: true,
        },
      });
      portfolioCount++;
    }
  }
  console.log(`  Created ${portfolioCount} portfolio items\n`);

  // ─── CONTENT REQUESTS ───
  console.log('Creating content requests...');
  const contentTypes = ['Ambiance / Interior', 'Food & Drink', 'Community / Culture', 'Behind the Scenes', 'Seasonal Special'];
  const descriptions = [
    'Capture the morning atmosphere and signature interior details',
    'Photograph our signature dishes and seasonal specials in natural light',
    'Document the weekend community energy and customer interactions',
    'Show the behind-the-scenes craft and preparation process',
    'Seasonal menu launch featuring new items and festive ambiance',
    'Close-up food photography highlighting plating and ingredients',
    'Evening ambiance and bar scene with warm lighting',
    'Morning ritual content — opening prep, first pour, fresh bakes',
    'Lifestyle content showing guests enjoying the full experience',
    'Documentary-style content capturing our story and craft',
  ];

  // Distribution: 5 MATCHING, 8 PRESENTED, 12 SELECTED, 15 COMPLETED, 5 CANCELLED = 45
  const reqStatuses = [
    ...Array(5).fill('MATCHING'),
    ...Array(8).fill('PRESENTED'),
    ...Array(12).fill('SELECTED'),
    ...Array(15).fill('COMPLETED'),
    ...Array(5).fill('CANCELLED'),
  ];
  const compTypes = ['FLAT_FEE', 'FLAT_FEE', 'FLAT_FEE', 'HYBRID', 'FREE_PRODUCT'];

  const requests = [];
  for (let i = 0; i < 45; i++) {
    const brandIdx = i % brands.length;
    const ct = contentTypes[i % contentTypes.length];
    const comp = compTypes[i % compTypes.length];
    requests.push(await prisma.contentRequest.create({
      data: {
        brandProfileId: brands[brandIdx].id,
        contentType: ct,
        description: descriptions[i % descriptions.length],
        budgetRange: `$${150 + (i % 10) * 50}-${300 + (i % 10) * 50}`,
        status: reqStatuses[i],
        compensationType: comp,
        compensationDetails: comp === 'HYBRID' ? { flatFeeCents: 10000, note: 'Plus free meal for two' } : comp === 'FREE_PRODUCT' ? { note: 'Full tasting menu for two' } : null,
      },
    }));
  }
  console.log(`  Created ${requests.length} content requests\n`);

  // ─── MATCHES ───
  console.log('Creating matches...');
  const styles = ['Warm & Editorial', 'Bold & Energetic', 'Clean & Minimal', 'Documentary & Candid', 'Moody & Dark', 'Bright & Airy', 'Polished & Editorial'];
  const delivOpts = ['3 photos + 1 Reel (15s)', '4 photos + 1 Story set', '3 photos + 1 Reel (20s)', '5 photos', '3 photos + 2 Reels (15s)'];
  const timeOpts = ['5 business days', '7 business days', '4 business days', '10 business days'];
  const usageOpts = ['Organic social + in-store, 12 months', 'All digital platforms, 12 months', 'Organic social only, 6 months'];
  const insightOptions = [
    ['Style Fit: 92%', 'Local Expert', 'Cuisine Match'],
    ['Style Fit: 87%', 'Rising Star'],
    ['Vibe Aligned', 'Cuisine Match', 'Local Expert'],
    ['Style Fit: 95%', 'Vibe Aligned'],
    ['Rising Star', 'Cuisine Match'],
    ['Local Expert', 'Style Fit: 88%'],
    ['Cuisine Match', 'Vibe Aligned', 'Rising Star'],
  ];
  const rationales = [
    'Strong vibe alignment with warm editorial style. Active in the neighborhood with excellent portfolio quality.',
    'Bold energetic approach brings fresh perspective. Strong Reels content pairs well with this brand.',
    'Clean minimal aesthetic perfectly captures refined plating and presentation.',
    'Documentary candid style ideal for authentic behind-the-scenes storytelling.',
    'Moody atmospheric approach elevates evening dining and bar content.',
    'Bright airy lifestyle shots complement morning and brunch content perfectly.',
    'Polished editorial eye brings premium quality to food and ambiance photography.',
  ];

  const matches = [];
  let matchCount = 0;
  // Create 3 matches for each PRESENTED, SELECTED, and COMPLETED request
  for (let i = 0; i < requests.length; i++) {
    const status = reqStatuses[i];
    if (status === 'MATCHING' || status === 'CANCELLED') continue;

    for (let m = 0; m < 3; m++) {
      const creatorIdx = (i * 3 + m) % profiles.length;
      const score = 95 - m * 8 - (i % 5);
      const price = 15000 + (i % 8) * 2000 + m * 1000;
      let mStatus = 'PRESENTED';
      if (status === 'SELECTED' || status === 'COMPLETED') {
        mStatus = m === 0 ? 'SELECTED' : 'DECLINED';
      }

      const match = await prisma.match.create({
        data: {
          contentRequestId: requests[i].id,
          creatorProfileId: profiles[creatorIdx].id,
          matchScore: Math.max(score, 55),
          matchRationale: rationales[(i + m) % rationales.length],
          matchSignals: {
            venueAlignment: [`Active in ${brandData[i % brands.length].hood}`],
            aestheticMarkers: cpData[creatorIdx].tags.slice(0, 2).map(t => t.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')),
            communitySignals: [`Shoots in ${cpData[creatorIdx].hoods[0]}`],
            pastOutcomes: matchCount > 20 ? ['85% posting rate'] : [],
            trustSignals: { tier: cpData[creatorIdx].tier, verifiedSamples: 4 + (creatorIdx % 3) },
          },
          matchInsights: insightOptions[(i + m) % insightOptions.length],
          contentPreview: `High-quality ${contentTypes[i % contentTypes.length].toLowerCase()} content tailored for ${brandData[i % brands.length].biz}. ${descriptions[i % descriptions.length]}.`,
          deliverables: delivOpts[(i + m) % delivOpts.length],
          price,
          timeline: timeOpts[(i + m) % timeOpts.length],
          usageRights: usageOpts[(i + m) % usageOpts.length],
          style: styles[(i + m) % styles.length],
          status: mStatus,
        },
      });
      matches.push(match);
      matchCount++;
    }
  }
  console.log(`  Created ${matchCount} matches\n`);

  // ─── PROJECTS ───
  console.log('Creating projects...');
  // Create projects for all SELECTED and COMPLETED requests (first match = selected)
  const projStatuses = ['BRIEF_SENT', 'DRAFT_SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'DELIVERED'];
  const briefTexts = [
    'Capture the morning light and warm atmosphere. Focus on signature interior details and the flow of the space.',
    'Photograph our best dishes in natural light. Emphasize plating, textures, and seasonal ingredients.',
    'Show the weekend energy — staff interactions, customer moments, and the buzz of a full house.',
    'Document the morning prep process from start to service. Raw, authentic, hands-at-work content.',
    'Seasonal feature shoot — new menu items, festive decor, and the feeling of the season in our space.',
    'Close-up food shots with editorial quality. Each dish should tell a story.',
    'Evening atmosphere capture — warm lighting, bar scene, and the dining experience after dark.',
    'Morning ritual content: first pour, fresh bakes, opening the doors. Show the craft behind the calm.',
  ];

  const projects = [];
  let projIdx = 0;
  const selectedMatches = matches.filter(m => m.status === 'SELECTED');
  for (const match of selectedMatches) {
    const brandIdx = requests.findIndex(r => r.id === match.contentRequestId) % brands.length;
    const pStatus = projStatuses[projIdx % projStatuses.length];
    const proj = await prisma.project.create({
      data: {
        matchId: match.id,
        brandProfileId: brands[brandIdx].id,
        creatorProfileId: match.creatorProfileId,
        status: pStatus,
        deliverables: match.deliverables,
        price: match.price,
        timeline: match.timeline,
        usageRights: match.usageRights,
        briefText: briefTexts[projIdx % briefTexts.length],
        compensationType: 'FLAT_FEE',
      },
    });
    projects.push({ ...proj, _status: pStatus });
    projIdx++;
  }
  console.log(`  Created ${projects.length} projects\n`);

  // ─── DRAFTS ───
  console.log('Creating project drafts...');
  const draftPhotos = [
    '1554118811-1e0d58224f24', '1493857671505-72967e2e2760', '1453614512568-c4024d13c247',
    '1476224203421-9ac39bcb3327', '1504674900247-0877df9cc836', '1414235077428-338989a2e8c0',
  ];
  const feedbacks = [
    'Love the energy! Could we get one more shot focused on the bar area?',
    'Great composition. The lighting on dish 2 feels a bit dark — can we brighten?',
    'Almost perfect! Please crop the third photo tighter on the plating detail.',
    'The Reel pacing is great but we need the logo visible in the opening frame.',
  ];
  let draftCount = 0;
  for (const proj of projects) {
    // BRIEF_SENT = no draft
    if (proj._status === 'BRIEF_SENT') continue;

    const draftStatus = proj._status === 'REVISION_REQUESTED' ? 'REVISION_REQUESTED'
      : proj._status === 'APPROVED' || proj._status === 'DELIVERED' ? 'APPROVED'
      : 'SUBMITTED';

    await prisma.projectDraft.create({
      data: {
        projectId: proj.id,
        version: 1,
        fileUrls: draftPhotos.slice(0, 3).map(id => img(id)),
        notes: 'Shot in natural morning light. Focused on warmth, texture, and authentic atmosphere.',
        feedback: draftStatus === 'REVISION_REQUESTED' ? feedbacks[draftCount % feedbacks.length] : draftStatus === 'APPROVED' ? 'Looks perfect — approved!' : null,
        status: draftStatus,
      },
    });
    draftCount++;
  }
  console.log(`  Created ${draftCount} project drafts\n`);

  // ─── TRANSACTIONS ───
  console.log('Creating transactions...');
  let txCount = 0;
  for (const proj of projects) {
    const txStatus = (proj._status === 'APPROVED' || proj._status === 'DELIVERED') ? 'COMPLETED' : 'PENDING';
    await prisma.transaction.create({
      data: {
        projectId: proj.id,
        amount: proj.price,
        platformFee: Math.round(proj.price * 0.15),
        creatorPayout: Math.round(proj.price * 0.85),
        type: 'COMMISSION',
        status: txStatus,
        escrowStatus: txStatus === 'COMPLETED' ? 'RELEASED' : 'HELD',
        demoMode: true,
      },
    });
    txCount++;
  }
  console.log(`  Created ${txCount} transactions\n`);

  // ─── SUMMARY ───
  console.log('=== Seed complete ===');
  console.log(`  ${ops.length + crs.length} users (${ops.length} operators, ${crs.length} creators)`);
  console.log(`  ${brands.length} brand profiles`);
  console.log(`  ${profiles.length} creator profiles`);
  console.log(`  ${portfolioCount} portfolio items`);
  console.log(`  ${requests.length} content requests`);
  console.log(`  ${matchCount} matches`);
  console.log(`  ${projects.length} projects`);
  console.log(`  ${draftCount} project drafts`);
  console.log(`  ${txCount} transactions`);
  console.log('\nDemo accounts:');
  console.log('  Operators with profiles: josh@colectivo.com, marie@coralie.com, ellen@hewn.com, +13 more');
  console.log('  Operators without profiles: josie@newspot.com, marco@pending.com');
  console.log('  Creators with profiles: shaurya@mise.app, katelyn@mise.app, maya@mise.app, +11 more');
  console.log('  Creators without profiles: alex@mise.app, sam@mise.app');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error('\nSeed failed:', e); await prisma.$disconnect(); process.exit(1); });
