import Link from "next/link";

import { getRequiredAdminSession } from "@/lib/admin-auth";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await getRequiredAdminSession();

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8">
      <nav className="flex flex-wrap gap-3 rounded-xl border p-3 text-sm">
        <Link href="/admin" className="underline">
          Dashboard
        </Link>
        <Link href="/admin/orders" className="underline">
          Commandes
        </Link>
        <Link href="/admin/offers" className="underline">
          Offres
        </Link>
        <Link href="/admin/book" className="underline">
          Livre
        </Link>
        <Link href="/admin/settings" className="underline">
          Parametres
        </Link>
      </nav>
      {children}
    </div>
  );
}
