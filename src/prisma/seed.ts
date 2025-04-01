// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL  || 'i8oTt@example.com';
  const password = process.env.ADMIN_PASSWORD || 'holasoycontrasena';

  if (!password) {
    throw new Error ('ADMIN_PASSWORD is not defined');
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      password: hashedPassword,
      role: Role.ADMIN
    },
  });
  console.log('✅ Usuario admin creado');
}

seed()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());