import { randomUUID } from "node:crypto";

import { hashPassword } from "better-auth/crypto";

import { getPrisma } from "../lib/prisma";

const prisma = getPrisma();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD sont requis");
  }

  const now = new Date();
  const userId = randomUUID();

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      id: userId,
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

  console.log(`Admin pret: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
