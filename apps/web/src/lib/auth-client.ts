import { createAuthClient } from "better-auth/react";
import {
  convexClient,
  crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3001",
  plugins: [convexClient(), crossDomainClient()],
  socialProviders: {
    google: {
      enabled: true,
    },
  },
});
