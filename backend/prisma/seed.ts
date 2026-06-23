import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  'Electronics',
  'Home & Kitchen',
  'Apparel',
  'Sports',
  'Books',
  'Toys',
  'Beauty',
  'Automotive',
  'Health',
  'Grocery'
];

const ADJECTIVES = ['Premium', 'Wireless', 'Smart', 'Ergonomic', 'Portable', 'Durable', 'Eco-friendly', 'Compact', 'Luxury', 'Minimalist'];
const NOUNS = ['Headphones', 'Speaker', 'Monitor', 'Keyboard', 'Mouse', 'Desk', 'Chair', 'Lamp', 'Watch', 'Tablet'];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[getRandomInt(0, arr.length - 1)];
}

function generateProductName() {
  return `${getRandomItem(ADJECTIVES)} ${getRandomItem(NOUNS)}`;
}

async function main() {
  console.log('Starting massive data seed...');
  const totalRecords = 200000;
  const batchSize = 10000; // Optimal batch size for PostgreSQL
  
  const startTime = Date.now();
  let inserted = 0;

  for (let i = 0; i < totalRecords; i += batchSize) {
    const products = [];
    const currentBatchSize = Math.min(batchSize, totalRecords - i);
    
    for (let j = 0; j < currentBatchSize; j++) {
      // Spread created_at over the last 5 years to ensure good cursor distribution
      const daysAgo = getRandomInt(0, 365 * 5);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      products.push({
        name: generateProductName(),
        category: getRandomItem(CATEGORIES),
        price: parseFloat((Math.random() * 1000 + 10).toFixed(2)),
        description: `This is a high-quality product in the ${getRandomItem(CATEGORIES)} category.`,
        imageUrl: `https://picsum.photos/seed/${i+j}/400/400`,
        createdAt: createdAt,
        updatedAt: createdAt,
      });
    }

    await prisma.product.createMany({
      data: products,
      skipDuplicates: true,
    });
    
    inserted += currentBatchSize;
    console.log(`Inserted ${inserted}/${totalRecords} records...`);
  }

  const endTime = Date.now();
  console.log(`\n✅ Seeding complete!`);
  console.log(`⏱️ Total time: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
