"use server";

import { getToken } from "@/lib/auth-server";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { cache } from "react";

export const getUser = cache(async () => {
  const token = await getToken();
  return fetchQuery(api.auth.getCurrentUser, {}, { token });
});
