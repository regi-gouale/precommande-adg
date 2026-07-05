import { notFound } from "next/navigation";

import { updateOrderStatus } from "@/app/admin/(protected)/orders/[id]/actions";
import { formatDateTimeFull } from "@/lib/date";
import { getPrisma } from "@/lib/prisma";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prisma = getPrisma();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="grid gap-5">
      <h1 className="text-3xl font-semibold">Commande {order.id}</h1>

      <section className="grid gap-2 rounded-xl border p-4 text-sm">
        <p>
          <strong>Client:</strong> {order.firstName} {order.lastName}
        </p>
        <p>
          <strong>Email:</strong> {order.email}
        </p>
        <p>
          <strong>Telephone:</strong> {order.phone || "-"}
        </p>
        <p>
          <strong>Adresse:</strong> {order.shippingAddress}
        </p>
        <p>
          <strong>Offre:</strong> {order.offerSlug} x{order.quantity}
        </p>
        <p>
          <strong>Paiement:</strong> {order.paymentStatus}
        </p>
        <p>
          <strong>Statut:</strong> {order.status}
        </p>
      </section>

      <section className="grid gap-3 rounded-xl border p-4">
        <h2 className="text-xl font-semibold">Changer le statut</h2>
        <form
          action={updateOrderStatus}
          className="flex flex-wrap items-center gap-2"
        >
          <input type="hidden" name="orderId" value={order.id} />
          <select
            name="status"
            defaultValue={order.status}
            className="rounded-lg border px-3 py-2"
          >
            <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
            <option value="PREORDER_CONFIRMED">PREORDER_CONFIRMED</option>
            <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
          >
            Enregistrer
          </button>
        </form>
      </section>

      <section className="grid gap-2 rounded-xl border p-4">
        <h2 className="text-xl font-semibold">Historique des statuts</h2>
        <ul className="grid gap-2 text-sm">
          {order.statusHistory.map((entry) => (
            <li key={entry.id} className="rounded-lg border p-2">
              <p>
                {entry.fromStatus || "-"} {"->"} {entry.toStatus}
              </p>
              <p className="text-muted-foreground">
                {formatDateTimeFull(entry.createdAt)}
              </p>
              <p className="text-muted-foreground">{entry.note || ""}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
