import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "swapboard";

const CATEGORIES = ["Academic", "Furniture", "Clothing", "Electronics", "Other"];
const LISTING_TYPES = ["sell", "swap", "free"];

const contacts = [
  "maya@university.edu", "jordan@university.edu", "celine@university.edu",
  "alex@university.edu", "priya@university.edu", "tom@university.edu",
  "sarah@university.edu", "devon@university.edu", "sam@university.edu",
  "marcus@university.edu", "nina@university.edu", "leo@university.edu",
  "zoe@university.edu", "kai@university.edu", "ava@university.edu",
  "ethan@university.edu", "mia@university.edu", "lucas@university.edu",
  "emma@university.edu", "noah@university.edu",
];

const academicListings = [
  { title: "Organic Chemistry Textbook (8th ed.)", description: "McMurry, barely used. No highlighting." },
  { title: "Calculus: Early Transcendentals", description: "Stewart 8th edition. Some pencil marks." },
  { title: "Introduction to Psychology", description: "Myers 12th edition. Good condition." },
  { title: "Biology: Life on Earth", description: "Audesirk 10th ed. Highlighted but readable." },
  { title: "Physics for Scientists and Engineers", description: "Serway 9th ed. Spine intact." },
  { title: "Microeconomics textbook", description: "Mankiw 8th edition. Light use." },
  { title: "Macroeconomics textbook", description: "Mankiw 7th edition. Some notes." },
  { title: "Linear Algebra textbook", description: "Lay 5th edition. Clean copy." },
  { title: "Discrete Mathematics", description: "Rosen 8th ed. Used one semester." },
  { title: "Data Structures & Algorithms", description: "CLRS 4th edition. Heavy but complete." },
  { title: "Computer Networks textbook", description: "Tanenbaum 5th ed. Good condition." },
  { title: "Operating Systems textbook", description: "Silberschatz 10th ed. Minor wear." },
  { title: "Statistics for Business", description: "Berenson 14th ed. Includes access code." },
  { title: "Introduction to Sociology", description: "Giddens 8th edition. Lightly used." },
  { title: "American History textbook", description: "Henretta 9th ed. Good shape." },
  { title: "Anatomy & Physiology", description: "Marieb 10th ed. Some highlighting." },
  { title: "Chemistry: The Central Science", description: "Brown 14th ed. Clean copy." },
  { title: "Political Science textbook", description: "O'Connor 12th ed. Minor notes." },
  { title: "TI-84 Plus Calculator", description: "Works perfectly. Comes with batteries." },
  { title: "Scientific calculator Casio", description: "FX-115ES Plus. Like new." },
  { title: "Graphing calculator TI-Nspire", description: "CX II, barely used." },
  { title: "Spanish language workbook", description: "Vistas 6th ed. Unused exercises." },
  { title: "French textbook", description: "Vis-à-vis 6th ed. Good condition." },
  { title: "Philosophy reader", description: "Pojman anthology. Annotated but legible." },
  { title: "English Literature anthology", description: "Norton 9th ed. Some highlighting." },
  { title: "Research Methods textbook", description: "Creswell 4th ed. Clean." },
  { title: "Environmental Science", description: "Cunningham 14th ed. Good shape." },
  { title: "Introduction to Marketing", description: "Kotler 16th ed. Barely used." },
  { title: "Financial Accounting textbook", description: "Weygandt 10th ed. Minor wear." },
  { title: "Art History survey book", description: "Stokstad 5th ed. Heavy but clean." },
];

const furnitureListings = [
  { title: "IKEA KALLAX shelf (2x4)", description: "White, great condition. Self-pickup." },
  { title: "Desk lamp (LED, adjustable)", description: "Three brightness levels. USB port on base." },
  { title: "Twin XL mattress topper", description: "Memory foam, 2 inches. Washed." },
  { title: "Desk chair (ergonomic)", description: "Black mesh. Adjustable height." },
  { title: "Study desk (IKEA MICKE)", description: "White, scratches on top. Functional." },
  { title: "Bookshelf (5 shelves)", description: "Dark brown. Sturdy and solid." },
  { title: "Floor lamp", description: "Black metal. Works perfectly." },
  { title: "Bedside table", description: "White with drawer. Minor scuffs." },
  { title: "Folding table", description: "Plastic, seats 4. Lightweight." },
  { title: "Futon (black)", description: "Converts to bed. Light wear." },
  { title: "Bean bag chair", description: "Navy blue. Still fluffy." },
  { title: "Whiteboard (2x3 ft)", description: "Magnetic. Includes markers." },
  { title: "Corkboard", description: "24x36 in. Includes pushpins." },
  { title: "Laundry hamper", description: "Collapsible, gray fabric." },
  { title: "Storage bins (set of 3)", description: "Clear plastic with lids." },
  { title: "Tension rod set", description: "Adjustable. For closets or windows." },
  { title: "Over-door organizer", description: "6 pockets. Fits standard dorm doors." },
  { title: "Under-bed storage (2 boxes)", description: "Rolling, fits twin XL." },
  { title: "Shower caddy", description: "Chrome. Some rust spots but works." },
  { title: "Mirror (full length)", description: "Leaning style. No frame damage." },
];

const clothingListings = [
  { title: "North Face Fleece Jacket (M)", description: "Navy blue. Light pilling on sleeves." },
  { title: "Formal Blazer (W, Size 6)", description: "Black. Worn twice. Career fair ready." },
  { title: "Winter Boots (Size 9)", description: "Sorel Caribou. Waterproof. Good tread." },
  { title: "Rain jacket (unisex M)", description: "Columbia. Folds into pocket." },
  { title: "Dress pants (M 32x30)", description: "Charcoal gray. Dry cleaned." },
  { title: "White dress shirt (M)", description: "Non-iron. Worn a few times." },
  { title: "Wool scarf", description: "Dark green. Soft and warm." },
  { title: "Gloves (S/M)", description: "Touchscreen compatible. Black." },
  { title: "Puffer vest (W, S)", description: "Red. Great for layering." },
  { title: "Denim jacket (M)", description: "Medium wash. Classic fit." },
  { title: "Workout leggings (W, M)", description: "Nike. Black. Light use." },
  { title: "Running shoes (M 10)", description: "Adidas. Good condition." },
  { title: "Dress shoes (M 10.5)", description: "Black Oxford. Barely worn." },
  { title: "Heels (W, Size 7)", description: "Nude, block heel. Work appropriate." },
  { title: "Backpack (Herschel)", description: "Gray. Small wear on straps." },
  { title: "Tote bag (canvas)", description: "Navy with university logo." },
  { title: "Graduation gown", description: "Size medium. Dry cleaned." },
  { title: "Ski jacket (M)", description: "Blue. Waterproof. Used one season." },
  { title: "Cardigan (W, S)", description: "Cream. Soft knit. Minor pilling." },
  { title: "Formal dress (W, 4)", description: "Navy. Knee length. Worn once." },
];

const electronicsListings = [
  { title: "Dell 24\" Monitor", description: "1080p. HDMI + DisplayPort. Works great." },
  { title: "Mechanical Keyboard (TKL)", description: "Blue switches. White backlight." },
  { title: "Laptop stand (aluminum)", description: "Adjustable. Fits 13-17 inch." },
  { title: "USB-C hub (7-in-1)", description: "HDMI, USB, SD card. Works perfectly." },
  { title: "Wireless mouse", description: "Logitech MX Master. Excellent condition." },
  { title: "External hard drive 1TB", description: "Seagate. USB 3.0. Works perfectly." },
  { title: "Webcam (1080p)", description: "Logitech C920. Includes original box." },
  { title: "Noise-cancelling headphones", description: "Sony WH-1000XM4. Barely used." },
  { title: "Desk speakers", description: "Edifier R1280T. Clean sound." },
  { title: "iPad (6th gen)", description: "32GB. Some scratches on back. Works great." },
  { title: "Kindle Paperwhite", description: "8GB. Waterproof. Includes case." },
  { title: "Portable charger 20000mAh", description: "Anker. Charges 3 devices." },
  { title: "HDMI cable (6ft)", description: "High-speed. Works with 4K." },
  { title: "Ethernet cable (25ft)", description: "Cat6. Never used." },
  { title: "Surge protector (8-outlet)", description: "With USB ports. Braided cord." },
  { title: "Smart LED light strip", description: "16ft. RGB. Works with Alexa." },
  { title: "Graphic tablet (Wacom)", description: "Small. For digital art/design." },
  { title: "Blue Yeti microphone", description: "Silver. Stand included." },
  { title: "Ring light (10 inch)", description: "With phone holder. 3 color modes." },
  { title: "Switch Lite (yellow)", description: "Works perfectly. No games included." },
];

const otherListings = [
  { title: "Mini fridge (2.6 cu ft)", description: "Black. Dorm-sized. Cools well." },
  { title: "Coffee maker (Keurig K-Mini)", description: "Barely used. Clean and works." },
  { title: "Microwave (700W)", description: "White. Dorm-approved size." },
  { title: "Yoga mat", description: "Purple, 6mm. Includes carrying strap." },
  { title: "Dumbbell set (5-25 lb)", description: "Hex rubber. Full set." },
  { title: "Resistance bands set", description: "5 levels. Includes bag." },
  { title: "Bike lock (Kryptonite)", description: "U-lock. With two keys." },
  { title: "Bike helmet", description: "Medium. Black. CPSC certified." },
  { title: "Electric kettle", description: "1.7L. Variable temp. Barely used." },
  { title: "Rice cooker (3-cup)", description: "Aroma. Works perfectly." },
  { title: "Toaster (2-slice)", description: "Black. Adjustable browning." },
  { title: "Blender (personal)", description: "NutriBullet 600W. Two cups included." },
  { title: "Air purifier", description: "Levoit. H13 HEPA. Quiet." },
  { title: "Humidifier (cool mist)", description: "1.5L. Runs 24 hours." },
  { title: "Desk fan", description: "USB-powered. 3 speeds." },
  { title: "Space heater", description: "750/1500W. Safety tip-over switch." },
  { title: "Cleaning supplies kit", description: "Mop, bucket, broom, dustpan." },
  { title: "Tool kit (basic)", description: "Hammer, screwdrivers, wrench, pliers." },
  { title: "Extension cord (10ft)", description: "3-prong. Indoor use." },
  { title: "Board game (Catan)", description: "Complete set. All pieces present." },
];

const requestTitles = {
  Academic: [
    "Looking for Intro to Psychology textbook",
    "Need Statistics textbook for Fall",
    "Searching for Biology lab manual",
    "Want Calculus textbook, any edition",
    "Need Spanish 1 workbook",
    "Looking for Physics textbook Serway",
    "Need Chemistry lab coat (M)",
    "Searching for Art History Stokstad",
    "Want a scientific calculator",
    "Need Discrete Math textbook",
    "Looking for Economics Mankiw",
    "Need English Literature Norton anthology",
    "Searching for Research Methods book",
    "Want Financial Accounting textbook",
    "Need TI-84 calculator for finals",
  ],
  Furniture: [
    "Need a desk for my dorm room",
    "Looking for twin XL bed frame",
    "Want a small bookshelf",
    "Need floor lamp for reading",
    "Searching for desk chair",
    "Looking for bedside table",
    "Need storage bins for closet",
    "Want a whiteboard for studying",
    "Need over-door organizer",
    "Looking for futon or couch",
  ],
  Clothing: [
    "Need winter coat, women's S or M",
    "Looking for formal blazer for interview",
    "Want running shoes, size 9",
    "Need dress pants for internship",
    "Searching for rain jacket, medium",
    "Looking for warm gloves",
    "Need graduation gown, size S",
    "Want a backpack for campus",
    "Need dress shoes, men's 10",
    "Looking for workout clothes, W M",
  ],
  Electronics: [
    "Need laptop charger USB-C 65W",
    "Looking for external hard drive 1TB",
    "Want a monitor for my desk",
    "Need HDMI cable for dorm",
    "Searching for wireless mouse",
    "Looking for headphones for studying",
    "Need surge protector with USB",
    "Want a webcam for online classes",
    "Need portable charger for commuting",
    "Looking for desk lamp with USB",
  ],
  Other: [
    "Need a microwave for dorm room",
    "Looking for small coffee maker",
    "Want yoga mat for dorm workouts",
    "Need bike for getting around campus",
    "Searching for electric kettle",
    "Looking for mini fridge under $50",
    "Need air purifier for allergies",
    "Want a desk fan for summer",
    "Need blender for meal prep",
    "Looking for board games for game night",
  ],
};

const requestDescriptions = [
  "Any condition considered, just needs to work.",
  "Prefer good condition but open to anything.",
  "Budget is flexible for the right item.",
  "Need it by next week if possible.",
  "Moving into dorms and starting from scratch.",
  "Will pick up anywhere on campus.",
  "First semester student, on a tight budget.",
  "Happy to negotiate on price.",
  "Graduating student looking to furnish first apartment.",
  "Transfer student, need to set up quickly.",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack = 180) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d;
}

function generateListings(count) {
  const allTemplates = [
    ...academicListings.map((t) => ({ ...t, category: "Academic" })),
    ...furnitureListings.map((t) => ({ ...t, category: "Furniture" })),
    ...clothingListings.map((t) => ({ ...t, category: "Clothing" })),
    ...electronicsListings.map((t) => ({ ...t, category: "Electronics" })),
    ...otherListings.map((t) => ({ ...t, category: "Other" })),
  ];

  const listings = [];
  for (let i = 0; i < count; i++) {
    const template = randomFrom(allTemplates);
    const type = randomFrom(LISTING_TYPES);
    const createdAt = randomDate(180);
    listings.push({
      title: template.title,
      description: template.description,
      category: template.category,
      type,
      price: type === "sell" ? randomPrice(5, 120) : null,
      contact: randomFrom(contacts),
      createdAt,
      updatedAt: createdAt,
    });
  }
  return listings;
}

function generateRequests(count) {
  const requests = [];
  for (let i = 0; i < count; i++) {
    const category = randomFrom(CATEGORIES);
    const titles = requestTitles[category];
    const createdAt = randomDate(180);
    const fulfilled = Math.random() < 0.2;
    requests.push({
      title: randomFrom(titles),
      description: randomFrom(requestDescriptions),
      category,
      budget: Math.random() < 0.7 ? randomPrice(10, 100) : null,
      contact: randomFrom(contacts),
      fulfilled,
      createdAt,
      updatedAt: createdAt,
    });
  }
  return requests;
}

async function seed() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    await db.collection("listings").deleteMany({});
    await db.collection("requests").deleteMany({});

    await db.collection("listings").createIndex({ title: "text", description: "text" });

    const listings = generateListings(800);
    const requests = generateRequests(300);

    const listResult = await db.collection("listings").insertMany(listings);
    const reqResult = await db.collection("requests").insertMany(requests);

    console.log(`✓ Seeded ${listResult.insertedCount} listings`);
    console.log(`✓ Seeded ${reqResult.insertedCount} requests`);
    console.log(`✓ Total: ${listResult.insertedCount + reqResult.insertedCount} records`);
    console.log("Database seeded successfully.");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await client.close();
  }
}

seed();