"use client";

import { polarClient } from "@polar-sh/better-auth";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [adminClient(), polarClient()],
});
