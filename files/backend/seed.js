import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "swapboard";

const listings = [
  {
    title: "Organic Chemistry Textbook (8th ed.)",
    description: "McMurry Organic Chem, barely used. No highlighting, all pages intact.",
    category: "Academic",
    type: "sell",
    price: 45,
    contact: "maya@university.edu",
    createdAt: new Date("2024-04-20"),
    updatedAt: new Date("2024-04-20"),
  },
  {
    title: "Calculus: Early Transcendentals",
    description: "Stewart 8th edition. Some pencil marks but fully readable.",
    category: "Academic",
    type: "swap",
    price: null,
    contact: "alex@university.edu",
    createdAt: new Date("2024-04-18"),
    updatedAt: new Date("2024-04-18"),
  },
  {
    title: "IKEA KALLAX Shelf Unit (2x4)",
    description: "White, great condition. Fits standard dorm rooms. Self-pickup only.",
    category: "Furniture",
    type: "sell",
    price: 30,
    contact: "maya@university.edu",
    createdAt: new Date("2024-04-15"),
    updatedAt: new Date("2024-04-15"),
  },
  {
    title: "Desk Lamp (adjustable)",
    description: "LED, three brightness levels. USB charging port on base.",
    category: "Furniture",
    type: "free",
    price: null,
    contact: "priya@university.edu",
    createdAt: new Date("2024-04-17"),
    updatedAt: new Date("2024-04-17"),
  },
  {
    title: "Twin XL Mattress Topper",
    description: "Memory foam, 2 inches. Used one year, washed before listing.",
    category: "Furniture",
    type: "sell",
    price: 20,
    contact: "tom@university.edu",
    createdAt: new Date("2024-04-10"),
    updatedAt: new Date("2024-04-10"),
  },
  {
    title: "North Face Fleece Jacket (M)",
    description: "Navy blue, size medium. Light pilling on sleeves, otherwise great.",
    category: "Clothing",
    type: "sell",
    price: 25,
    contact: "sarah@university.edu",
    createdAt: new Date("2024-04-19"),
    updatedAt: new Date("2024-04-19"),
  },
  {
    title: "Formal Blazer (W, Size 6)",
    description: "Black blazer, perfect for career fairs. Worn twice.",
    category: "Clothing",
    type: "swap",
    price: null,
    contact: "celine@university.edu",
    createdAt: new Date("2024-04-14"),
    updatedAt: new Date("2024-04-14"),
  },
  {
    title: "Winter Boots (Size 9)",
    description: "Sorel Caribou, waterproof. Good tread left. Perfect for campus winters.",
    category: "Clothing",
    type: "sell",
    price: 40,
    contact: "jordan@university.edu",
    createdAt: new Date("2024-04-12"),
    updatedAt: new Date("2024-04-12"),
  },
  {
    title: "Dell 24\" Monitor",
    description: "1080p, HDMI + DisplayPort. Works perfectly, upgrading to ultrawide.",
    category: "Electronics",
    type: "sell",
    price: 80,
    contact: "maya@university.edu",
    createdAt: new Date("2024-04-21"),
    updatedAt: new Date("2024-04-21"),
  },
  {
    title: "Mechanical Keyboard (TKL)",
    description: "Blue switches, white backlight. Includes USB-C cable.",
    category: "Electronics",
    type: "sell",
    price: 55,
    contact: "devon@university.edu",
    createdAt: new Date("2024-04-16"),
    updatedAt: new Date("2024-04-16"),
  },
  {
    title: "TI-84 Plus Calculator",
    description: "Works perfectly. Comes with AAA batteries.",
    category: "Electronics",
    type: "sell",
    price: 35,
    contact: "alex@university.edu",
    createdAt: new Date("2024-04-13"),
    updatedAt: new Date("2024-04-13"),
  },
  {
    title: "Mini Fridge (2.6 cu ft)",
    description: "Black, dorm-sized. Cools well. Pickup from East Hall this week only.",
    category: "Other",
    type: "sell",
    price: 50,
    contact: "priya@university.edu",
    createdAt: new Date("2024-04-11"),
    updatedAt: new Date("2024-04-11"),
  },
  {
    title: "Yoga Mat",
    description: "Purple, 6mm thick. Light use. Includes carrying strap.",
    category: "Other",
    type: "free",
    price: null,
    contact: "sam@university.edu",
    createdAt: new Date("2024-04-09"),
    updatedAt: new Date("2024-04-09"),
  },
  {
    title: "Coffee Maker (Keurig K-Mini)",
    description: "Barely used. All pods gone but machine is clean and works great.",
    category: "Other",
    type: "sell",
    price: 28,
    contact: "tom@university.edu",
    createdAt: new Date("2024-04-08"),
    updatedAt: new Date("2024-04-08"),
  },
];

const requests = [
  {
    title: "Looking for Intro to Psychology textbook",
    description: "Need Myers Psychology 12th or 13th edition for Fall semester.",
    category: "Academic",
    budget: 30,
    contact: "jordan@university.edu",
    fulfilled: false,
    createdAt: new Date("2024-04-21"),
    updatedAt: new Date("2024-04-21"),
  },
  {
    title: "Need a Statistics textbook",
    description: "Any intro stats book works — OpenIntro or Navidi preferred.",
    category: "Academic",
    budget: 20,
    contact: "newstudent@university.edu",
    fulfilled: false,
    createdAt: new Date("2024-04-20"),
    updatedAt: new Date("2024-04-20"),
  },
  {
    title: "Desk or study table for my room",
    description: "Anything with enough space for a monitor. Doesn't need to be fancy.",
    category: "Furniture",
    budget: 40,
    contact: "jordan@university.edu",
    fulfilled: false,
    createdAt: new Date("2024-04-19"),
    updatedAt: new Date("2024-04-19"),
  },
  {
    title: "Twin XL bedding set",
    description: "Sheets, pillowcases, and a comforter. Any color is fine.",
    category: "Furniture",
    budget: 25,
    contact: "fresher2024@university.edu",
    fulfilled: false,
    createdAt: new Date("2024-04-18"),
    updatedAt: new Date("2024-04-18"),
  },
  {
    title: "Winter coat, women's size S or M",
    description: "Moving from California, need something actually warm for winter here.",
    category: "Clothing",
    budget: 35,
    contact: "celine@university.edu",
    fulfilled: false,
    createdAt: new Date("2024-04-17"),
    updatedAt: new Date("2024-04-17"),
  },
  {
    title: "Business casual outfit for internship",
    description: "Men's medium. Interview at a finance firm, need to look professional.",
    category: "Clothing",
    budget: 30,
    contact: "marcus@university.edu",
    fulfilled: false,
    createdAt: new Date("2024-04-15"),
    updatedAt: new Date("2024-04-15"),
  },
  {
    title: "Laptop charger — USB-C 65W",
    description: "My charger died, need a replacement ASAP for finals week.",
    category: "Electronics",
    budget: 20,
    contact: "panicmode@university.edu",
    fulfilled: false,
    createdAt: new Date("2024-04-22"),
    updatedAt: new Date("2024-04-22"),
  },
  {
    title: "External hard drive (1TB+)",
    description: "For backing up my thesis files. USB-A or C both fine.",
    category: "Electronics",
    budget: 30,
    contact: "thesis_stress@university.edu",
    fulfilled: false,
    createdAt: new Date("2024-04-16"),
    updatedAt: new Date("2024-04-16"),
  },
  {
    title: "Bike or scooter for campus",
    description: "Need to get across campus faster. Any condition considered.",
    category: "Other",
    budget: 60,
    contact: "jordan@university.edu",
    fulfilled: false,
    createdAt: new Date("2024-04-14"),
    updatedAt: new Date("2024-04-14"),
  },
  {
    title: "Microwave for dorm room",
    description: "Small size only — dorm rules say max 700W.",
    category: "Other",
    budget: 20,
    contact: "newstudent@university.edu",
    fulfilled: true,
    createdAt: new Date("2024-04-05"),
    updatedAt: new Date("2024-04-12"),
  },
];

async function seed() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // Clear existing data
    await db.collection("listings").deleteMany({});
    await db.collection("requests").deleteMany({});

    // Create text indexes for search
    await db.collection("listings").createIndex({ title: "text", description: "text" });

    // Insert seed data
    const listResult = await db.collection("listings").insertMany(listings);
    const reqResult = await db.collection("requests").insertMany(requests);

    console.log(`✓ Seeded ${listResult.insertedCount} listings`);
    console.log(`✓ Seeded ${reqResult.insertedCount} requests`);
    console.log("Database seeded successfully.");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await client.close();
  }
}

seed();
