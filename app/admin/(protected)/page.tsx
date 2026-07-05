import { getPrisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const prisma = getPrisma();

  const [totalOrders, pendingOrders, paidOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.order.count({ where: { paymentStatus: "PAID" } }),
  ]);

  return (
    <main className="grid gap-4">
      <h1 className="text-3xl font-semibold">Back-office admin</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Total commandes</p>
          <p className="text-2xl font-semibold">{totalOrders}</p>
        </article>
        <article className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">
            En attente de paiement
          </p>
          <p className="text-2xl font-semibold">{pendingOrders}</p>
        </article>
        <article className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Payées</p>
          <p className="text-2xl font-semibold">{paidOrders}</p>
        </article>
      </div>
    </main>
  );
}
