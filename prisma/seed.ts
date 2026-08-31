import { PrismaClient, MenuSection } from "@prisma/client";
import { hashPassword } from "../src/lib/crypto";

const prisma = new PrismaClient();

type PriceInput = { label: string; priceRs: number };
type ItemInput = {
  name: string;
  description?: string;
  badge?: string;
  imageUrl?: string;
  prices: PriceInput[];
};
type CategoryInput = {
  section: MenuSection;
  slug: string;
  name: string;
  tagline?: string;
  items: ItemInput[];
};

const categories: CategoryInput[] = [
  {
    section: MenuSection.PIZZA,
    slug: "the-oven-royalties",
    name: "The Oven Royalties",
    tagline: "Stone-baked pizzas, made to order",
    items: [
           {
        name: "Arabic Bite",
        imageUrl: "/images/menu-items/arabic-bite.jpg",
        prices: [
          { label: "Medium", priceRs: 1250 },
          { label: "Large", priceRs: 1750 },
        ],
      },
      {
        name: "Emperor Pizza",
        badge: "Signature",
        imageUrl: "/images/menu-items/emperor-pizza.jpg",
        prices: [
          { label: "Medium", priceRs: 1499 },
          { label: "Large", priceRs: 1999 },
        ],
      },
      {
        name: "Oven Special Stuff",
        imageUrl: "/images/menu-items/oven-special-stuff.jpg",
        prices: [
          { label: "Medium", priceRs: 1499 },
          { label: "Large", priceRs: 2099 },
        ],
      },
      {
        name: "Pizza Pasta",
        imageUrl: "/images/menu-items/pizza-pasta.jpg",
        prices: [
          { label: "Medium", priceRs: 1450 },
          { label: "Large", priceRs: 1999 },
        ],
      },
      {
        name: "Crown Crust",
        badge: "Best Seller",
        imageUrl: "/images/menu-items/crown-crust.jpg",
        prices: [
          { label: "Medium", priceRs: 1149 },
          { label: "Large", priceRs: 1499 },
        ],
      },
      {
        name: "Special Extreme Plus",
        imageUrl: "/images/menu-items/special-extreme-plus.jpg",
        prices: [
          { label: "Small", priceRs: 799 },
          { label: "Medium", priceRs: 1499 },
          { label: "Large", priceRs: 1999 },
        ],
      },
      {
        name: "Shawarma Pizza",
        imageUrl: "/images/menu-items/shawarma-pizza.jpg",
        prices: [
          { label: "Small", priceRs: 650 },
          { label: "Medium", priceRs: 1000 },
          { label: "Large", priceRs: 1350 },
        ],
      },
      {
        name: "Creamy Pizza",
        imageUrl: "/images/menu-items/creamy-pizza.jpg",
        prices: [
          { label: "Small", priceRs: 699 },
          { label: "Medium", priceRs: 1049 },
          { label: "Large", priceRs: 1299 },
        ],
      },
      {
        name: "Special Fajita",
        imageUrl: "/images/menu-items/special-fajita.jpg",
        prices: [
          { label: "Small", priceRs: 599 },
          { label: "Medium", priceRs: 899 },
          { label: "Large", priceRs: 1099 },
        ],
      },
      {
        name: "Chicken Tikka",
        badge: "Best Seller",
        imageUrl: "/images/menu-items/chicken-tikka.jpg",
        prices: [
          { label: "Small", priceRs: 599 },
          { label: "Medium", priceRs: 899 },
          { label: "Large", priceRs: 1099 },
        ],
      },
      {
        name: "Cheese Lover",
        description: "Without chicken",
        imageUrl: "/images/menu-items/cheese-lover.jpg",
        prices: [
          { label: "Small", priceRs: 399 },
          { label: "Medium", priceRs: 750 },
          { label: "Large", priceRs: 899 },
        ],
      },
      {
        name: "Special Extreme",
        imageUrl: "/images/menu-items/special-extreme.jpg",
        prices: [
          { label: "Small", priceRs: 699 },
          { label: "Medium", priceRs: 1149 },
          { label: "Large", priceRs: 1499 },
        ],
      },
      {
        name: "Extra Large Pizza",
        description: "Choose your flavour",
        imageUrl: "/images/menu-items/extra-large-pizza.jpg",
        prices: [
          { label: "Regular Flavour", priceRs: 1999 },
          { label: "Special Flavour", priceRs: 2499 },
        ],
      },
    ],
  },
  {
    section: MenuSection.BURGER,
    slug: "burgers-and-more",
    name: "Burgers & More",
    tagline: "Flame-grilled patties, toasted buns",
    items: [
      { name: "Zinger Burger", imageUrl: "/images/menu-items/zinger-burger.jpg", prices: [{ label: "Regular", priceRs: 399 }] },
      { name: "Chicken Burger", imageUrl: "/images/menu-items/chicken-burger.jpg", prices: [{ label: "Regular", priceRs: 300 }] },
      { name: "Tower Burger", imageUrl: "/images/menu-items/tower-burger.jpg", prices: [{ label: "Regular", priceRs: 650 }] },
      { name: "Chicken & Chapli Burger", imageUrl: "/images/menu-items/chicken-chapli-burger.jpg", prices: [{ label: "Regular", priceRs: 400 }] },
      { name: "Chapli Burger", imageUrl: "/images/menu-items/chapli-burger.jpg", prices: [{ label: "Regular", priceRs: 300 }] },
      { name: "Grill Burger", imageUrl: "/images/menu-items/grill-burger.jpg", prices: [{ label: "Regular", priceRs: 550 }] },
      { name: "Oven Special Grill Burger", badge: "Signature", imageUrl: "/images/menu-items/oven-special-grill-burger.jpg", prices: [{ label: "Regular", priceRs: 650 }] },
      { name: "Emperor Burger", badge: "Signature", imageUrl: "/images/menu-items/emperor-burger.jpg", prices: [{ label: "Regular", priceRs: 750 }] },
    ],
  },
  {
    section: MenuSection.SANDWICH,
    slug: "wraps-and-sandwiches",
    name: "Wraps & Sandwiches",
    tagline: "Rolled fresh, packed to travel",
    items: [
      { name: "Tortilla Grill Wrap", imageUrl: "/images/menu-items/tortilla-grill-wrap.jpg", prices: [{ label: "Regular", priceRs: 500 }] },
      { name: "Special Behari Wrap", imageUrl: "/images/menu-items/special-behari-wrap.jpg", prices: [{ label: "Regular", priceRs: 600 }] },
      { name: "Special Emperor Wrap", imageUrl: "/images/menu-items/special-emperor-wrap.jpg", prices: [{ label: "Regular", priceRs: 600 }] },
      { name: "Grill Sandwich", imageUrl: "/images/menu-items/grill-sandwich.jpg", prices: [{ label: "Regular", priceRs: 650 }] },
      { name: "Pan Sandwich", imageUrl: "/images/menu-items/pan-sandwich.jpg", prices: [{ label: "Regular", priceRs: 650 }] },
      {
        name: "Chicken Cheese Calzone",
        imageUrl: "/images/menu-items/chicken-cheese-calzone.jpg",
        prices: [
          { label: "Half", priceRs: 500 },
          { label: "Full", priceRs: 750 },
        ],
      },
      {
        name: "Chicken Crunchy Calzone",
        imageUrl: "/images/menu-items/chicken-crunchy-calzone.jpg",
        prices: [
          { label: "Half", priceRs: 500 },
          { label: "Full", priceRs: 750 },
        ],
      },
    ],
  },
  {
    section: MenuSection.SHAWARMA,
    slug: "shawarma",
    name: "Shawarma",
    tagline: "Char-grilled, rolled fresh to order",
    items: [
      { name: "Plain Shawarma", prices: [{ label: "Regular", priceRs: 220 }] },
      { name: "Chicken Cheese Shawarma", prices: [{ label: "Regular", priceRs: 300 }] },
      { name: "Zinger Shawarma", prices: [{ label: "Regular", priceRs: 350 }] },
      { name: "Malai Boti Shawarma", prices: [{ label: "Regular", priceRs: 250 }] },
      { name: "Grill Shawarma", prices: [{ label: "Regular", priceRs: 250 }] },
      { name: "Paratha Wrap", prices: [{ label: "Regular", priceRs: 350 }] },
      { name: "Twister Wrap", prices: [{ label: "Regular", priceRs: 350 }] },
      { name: "Shawarma Platter", description: "Chef's mixed platter", prices: [{ label: "Platter", priceRs: 499 }] },
    ],
  },
  {
    section: MenuSection.WING,
    slug: "wings-and-sides",
    name: "Wings, Fries & Sides",
    tagline: "Crisp, hot, straight out of the fryer",
    items: [
      {
        name: "Hot Wings",
        prices: [
          { label: "5 pc", priceRs: 350 },
          { label: "10 pc", priceRs: 650 },
        ],
      },
      {
        name: "Juicy Wings",
        prices: [
          { label: "5 pc", priceRs: 350 },
          { label: "10 pc", priceRs: 680 },
        ],
      },
      {
        name: "Special Juicy Wings",
        badge: "Signature",
        prices: [
          { label: "5 pc", priceRs: 450 },
          { label: "10 pc", priceRs: 750 },
        ],
      },
      { name: "Fried Chest Piece", prices: [{ label: "Piece", priceRs: 420 }] },
      {
        name: "Regular Fries",
        prices: [{ label: "Regular", priceRs: 200 }],
      },
      {
        name: "Large Fries",
        prices: [{ label: "Large", priceRs: 350 }],
      },
      {
        name: "Loaded Fries",
        prices: [
          { label: "Small", priceRs: 450 },
          { label: "Medium", priceRs: 690 },
          { label: "Large", priceRs: 1000 },
        ],
      },
      {
        name: "Hotshots Nuggets",
        prices: [
          { label: "5 pc / 10 pc", priceRs: 350 },
        ],
      },
      {
        name: "Pizza Platter",
        description: "Large fries, 5 HotShots & half large pizza",
        badge: "Sharing",
        prices: [{ label: "Platter", priceRs: 1099 }],
      },
      {
        name: "Extra Topping â€” Chicken",
        prices: [
          { label: "Small", priceRs: 100 },
          { label: "Medium", priceRs: 150 },
          { label: "Large", priceRs: 200 },
        ],
      },
      {
        name: "Extra Topping â€” Cheese",
        prices: [
          { label: "Small", priceRs: 100 },
          { label: "Medium", priceRs: 150 },
          { label: "Large", priceRs: 200 },
        ],
      },
    ],
  },
  {
    section: MenuSection.COFFEE,
    slug: "the-oven-coffees",
    name: "The Oven Coffee's",
    tagline: "Brewed fresh, cup by cup",
    items: [
      { name: "Cappuccino", badge: "Strong", prices: [{ label: "Cup", priceRs: 180 }] },
      { name: "Latte", badge: "Light", prices: [{ label: "Cup", priceRs: 180 }] },
      { name: "Karak Chai", prices: [{ label: "Cup", priceRs: 100 }] },
      { name: "Cardamom Chai", prices: [{ label: "Cup", priceRs: 160 }] },
      { name: "Kashmiri Chai", prices: [{ label: "Cup", priceRs: 130 }] },
      { name: "Green Tea", prices: [{ label: "Cup", priceRs: 100 }] },
    ],
  },
  {
    section: MenuSection.DRINK,
    slug: "drinks-bar",
    name: "Drinks Bar",
    tagline: "Cold, fruity, made at the counter",
    items: [
      { name: "Blue Lagoon", imageUrl: "/images/menu-items/blue-lagoon.jpg", prices: [{ label: "Glass", priceRs: 150 }] },
      { name: "Blue Sapphire", imageUrl: "/images/menu-items/blue-sapphire.jpg", prices: [{ label: "Glass", priceRs: 200 }] },
      { name: "Mint Margarita", imageUrl: "/images/menu-items/mint-margarita.jpg", prices: [{ label: "Glass", priceRs: 200 }] },
      { name: "Ice Cream Shake", imageUrl: "/images/menu-items/ice-cream-shake.jpg", prices: [{ label: "Glass", priceRs: 300 }] },
      { name: "Cocktail Shake", imageUrl: "/images/menu-items/cocktail-shake.jpg", prices: [{ label: "Glass", priceRs: 300 }] },
      { name: "Pina Colada", imageUrl: "/images/menu-items/pina-colada.jpg", prices: [{ label: "Glass", priceRs: 250 }] },
      { name: "Cocktail Juice", imageUrl: "/images/menu-items/cocktail-juice.jpg", prices: [{ label: "Glass", priceRs: 200 }] },
      { name: "Cold Coffee", imageUrl: "/images/menu-items/cold-coffee.jpg", prices: [{ label: "Glass", priceRs: 300 }] },
      {
        name: "Bottled Soft Drink",
        prices: [
          { label: "Regular", priceRs: 100 },
          { label: "500ml", priceRs: 120 },
          { label: "1L", priceRs: 180 },
          { label: "1.5L", priceRs: 230 },
        ],
      },
      {
        name: "Mineral Water",
        prices: [
          { label: "Small", priceRs: 70 },
          { label: "Large", priceRs: 120 },
        ],
      },
    ],
  },
  {
    section: MenuSection.DESSERT,
    slug: "desserts",
    name: "Desserts",
    tagline: "Something sweet to finish",
    items: [
      { name: "Special Ice Cream", description: "Single scoop", prices: [{ label: "Scoop", priceRs: 120 }] },
    ],
  },
];

const deals = [
  {
    title: "The Oven Combo",
    description: "A full meal for one â€” small pizza, hot wings, fries and a drink, bundled and discounted.",
    priceRs: 999,
    activeWindow: "10 AM â€“ 5 PM",
    includedItems: [
      "1 Small Pizza â€” Chicken Tikka or Special Fajita",
      "5 pc Hot Wings",
      "1 Regular Fries",
      "1 Regular Bottled Drink",
    ],
    displayOrder: 1,
  },
  {
    title: "Burger & Shake Combo",
    description: "A Zinger Burger paired with fries and a cold shake â€” a student favourite.",
    priceRs: 850,
    activeWindow: "10 AM â€“ 5 PM",
    includedItems: ["1 Zinger Burger", "1 Regular Fries", "1 Cold Coffee or Ice Cream Shake"],
    displayOrder: 2,
  },
  {
    title: "Small Pizza â€” Tikka / Fajita",
    description: "A student-sized small pizza in Chicken Tikka or Special Fajita flavour.",
    priceRs: 500,
    activeWindow: "10 AM â€“ 5 PM",
    includedItems: ["1 Small Pizza â€” Chicken Tikka or Special Fajita"],
    displayOrder: 3,
  },
  {
    title: "Medium Pizza â€” Tikka / Fajita",
    description: "A medium pizza in Chicken Tikka or Special Fajita flavour, made fresh to order.",
    priceRs: 800,
    activeWindow: "10 AM â€“ 5 PM",
    includedItems: ["1 Medium Pizza â€” Chicken Tikka or Special Fajita"],
    displayOrder: 4,
  },
  {
    title: "Pan Sandwich",
    description: "Grilled pan sandwich served with a side of fries.",
    priceRs: 550,
    activeWindow: "10 AM â€“ 5 PM",
    includedItems: ["1 Pan Sandwich", "1 Side of Fries"],
    displayOrder: 5,
  },
  {
    title: "Zinger Burger + Reggy Burger",
    description: "One Zinger Burger and one Reggy Burger, paired together.",
    priceRs: 600,
    activeWindow: "10 AM â€“ 5 PM",
    includedItems: ["1 Zinger Burger", "1 Reggy Burger"],
    displayOrder: 6,
  },
  {
    title: "2 Chicken Shawarma",
    description: "Two freshly rolled chicken shawarma, char-grilled and packed to go.",
    priceRs: 400,
    activeWindow: "10 AM â€“ 5 PM",
    includedItems: ["2 Chicken Shawarma"],
    displayOrder: 7,
  },
];

// Default admin passwords â€” the same for every branch to start with. Each
// branch's admin should log in at /admin/login (using the adminUsername
// below) and this should be changed for production use; there's no UI for
// that yet, so for now re-run `npm run db:seed` after editing the password
// here, or update Branch.passwordHash directly (use hashPassword()).
const DEFAULT_ADMIN_PASSWORD = "TheOven@2026";

const branchSeeds = [
  {
    slug: "mian-channu",
    name: "The Oven Pizza â€” Mian Channu",
    address: "Shaheed Rd, near Municipal Gym, Mian Channu, 60000, Pakistan",
    photoUrl: "/images/branch-mian-channu.png",
    phone: "0300-1520250",
    phone2: "+92 318 7739973",
    adminUsername: "mian-channu",
    passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
    displayOrder: 1,
  },
  {
    slug: "sahiwal",
    name: "The Oven Pizza â€” Sahiwal",
    address: "Sahiwal, Punjab, Pakistan",
    photoUrl: "/images/branch-sahiwal.jpeg",
    phone: "0304-1112302",
    adminUsername: "sahiwal",
    passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
    displayOrder: 2,
  },
  
  {
    slug: "chichawatni",
    name: "The Oven Pizza â€” Chichawatni",
    address: "Near Zahid Iqbal Chowk, Chichawatni, Pakistan",
    photoUrl: "/images/branch-chichawatni.png",
    phone: "0304-1114303",
    adminUsername: "chichawatni",
    passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
    displayOrder: 4,
  },
];

async function main() {
  console.log("Seeding databaseâ€¦");

  for (const branch of branchSeeds) {
    await prisma.branch.upsert({
      where: { slug: branch.slug },
      update: branch,
      create: branch,
    });
  }

  for (let ci = 0; ci < categories.length; ci++) {
        const cat = categories[ci]!;
    const category = await prisma.menuCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        tagline: cat.tagline,
        section: cat.section,
        displayOrder: ci,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        tagline: cat.tagline,
        section: cat.section,
        displayOrder: ci,
      },
    });

    // Reset items for this category so re-seeding stays in sync with source data.
    await prisma.menuItem.deleteMany({ where: { categoryId: category.id } });

    for (let ii = 0; ii < cat.items.length; ii++) {
      const item = cat.items[ii]!;
      await prisma.menuItem.create({
        data: {
          categoryId: category.id,
          name: item.name,
          description: item.description,
          badge: item.badge,
          imageUrl: item.imageUrl,
          displayOrder: ii,
          prices: {
            create: item.prices.map((p, pi) => ({
              label: p.label,
              priceRs: p.priceRs,
              displayOrder: pi,
            })),
          },
        },
      });
    }
  }

  await prisma.deal.deleteMany({});
  for (const deal of deals) {
    await prisma.deal.create({ data: deal });
  }

  console.log(
    `Seeded ${branchSeeds.length} branches, ${categories.length} categories and ${deals.length} deals.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

