"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertAdminServerAction } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";

const statusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "PENDING_PAYMENT",
    "PREORDER_CONFIRMED",
    "READY_FOR_PICKUP",
    "COMPLETED",
    "CANCELLED",
  ]),
});

export async function updateOrderStatus(formData: FormData) {
  await assertAdminServerAction();
  const prisma = getPrisma();

  const parsed = statusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    throw new Error("Donnees invalides");
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
  });

  if (!order) {
    throw new Error("Commande introuvable");
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: parsed.data.status,
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: parsed.data.status,
        note: "Mise a jour manuelle admin",
      },
    });
  });

  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/admin/orders");
}
