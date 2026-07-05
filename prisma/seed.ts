import { randomUUID } from "node:crypto";

import { hashPassword } from "better-auth/crypto";

import { getPrisma } from "../lib/prisma";

const prisma = getPrisma();

const DEFAULT_ADMIN_EMAIL = "admin@local.test";
const DEFAULT_ADMIN_PASSWORD = "Admin12345!";
const DEFAULT_ADMIN_NAME = "Admin";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? DEFAULT_ADMIN_NAME;

  const now = new Date();

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      id: randomUUID(),
      name,
      email,
      emailVerified: true,
      role: "ADMIN",
      banned: false,
      createdAt: now,
      updatedAt: now,
    },
    update: {
      name,
      role: "ADMIN",
      banned: false,
      updatedAt: now,
    },
  });

  await prisma.account.upsert({
    where: {
      id: `${user.id}-credential`,
    },
    create: {
      id: `${user.id}-credential`,
      accountId: email,
      providerId: "credential",
      userId: user.id,
      password: passwordHash,
      createdAt: now,
      updatedAt: now,
    },
    update: {
      password: passwordHash,
      updatedAt: now,
    },
  });

  console.log("Admin seed termine.");
  console.log(`Email: ${email}`);

  if (!process.env.ADMIN_PASSWORD) {
    console.log(`Password: ${DEFAULT_ADMIN_PASSWORD}`);
  }
}

seedAdmin()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
