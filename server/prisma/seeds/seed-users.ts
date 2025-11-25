import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

// Load .env file from project root
config({ path: resolve(__dirname, '../../../.env') });

// Initialize Prisma Client with adapter
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting users seeding...');

  const password = 'bismillah';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create super admin user
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@belajarshafa.com' },
    update: {
      password: hashedPassword,
      name: 'Super Admin',
      role: 'ADMIN',
      isVerified: true,
    },
    create: {
      email: 'admin@belajarshafa.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log(`Created/updated super admin: ${superAdmin.email}`);

  // Create manager user
  const manager = await prisma.user.upsert({
    where: { email: 'manager@belajarshafa.com' },
    update: {
      password: hashedPassword,
      name: 'Manager',
      role: 'MANAGER',
      isVerified: true,
    },
    create: {
      email: 'manager@belajarshafa.com',
      password: hashedPassword,
      name: 'Manager',
      role: 'MANAGER',
      isVerified: true,
    },
  });
  console.log(`Created/updated manager: ${manager.email}`);

  console.log('Users seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

