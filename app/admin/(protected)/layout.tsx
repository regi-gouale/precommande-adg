import { AdminShell } from "@/components/admin-shell";
import { getRequiredAdminSession } from "@/lib/admin-auth";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await getRequiredAdminSession();

  return <AdminShell>{children}</AdminShell>;
}
