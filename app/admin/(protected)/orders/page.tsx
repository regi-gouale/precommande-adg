import Link from "next/link";

import { formatDateTimeFull } from "@/lib/date";
import { getPrisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  const prisma = getPrisma();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="grid gap-4">
      <h1 className="text-3xl font-semibold">Commandes</h1>
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Offre</th>
              <th className="px-3 py-2">Paiement</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="underline"
                  >
                    {order.id.slice(0, 8)}...
                  </Link>
                </td>
                <td className="px-3 py-2">
                  {order.firstName} {order.lastName}
                </td>
                <td className="px-3 py-2">{order.offerSlug}</td>
                <td className="px-3 py-2">{order.paymentStatus}</td>
                <td className="px-3 py-2">{order.status}</td>
                <td className="px-3 py-2">
                  {formatDateTimeFull(order.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
