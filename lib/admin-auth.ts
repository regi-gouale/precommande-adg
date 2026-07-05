import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth } from "@/lib/auth";
import { MissingEnvironmentError } from "@/lib/env";

function isAdminRole(role: unknown) {
  return typeof role === "string" && role.toUpperCase() === "ADMIN";
}

export async function getRequiredAdminSession() {
  let auth: ReturnType<typeof getAuth>;

  try {
    auth = getAuth();
  } catch (error) {
    if (error instanceof MissingEnvironmentError) {
      redirect("/admin/login");
    }

    throw error;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/admin/login");
  }

  if (!isAdminRole((session.user as { role?: string }).role)) {
    redirect("/admin/login");
  }

  return session;
}

export async function assertAdminServerAction() {
  let auth: ReturnType<typeof getAuth>;

  try {
    auth = getAuth();
  } catch (error) {
    if (error instanceof MissingEnvironmentError) {
      throw new Error("Configuration serveur incomplete");
    }

    throw error;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Non authentifie");
  }

  if (!isAdminRole((session.user as { role?: string }).role)) {
    throw new Error("Acces admin requis");
  }

  return session;
}
