import { createAuth } from "@gym-tracker-mono/backend/convex/auth";
import { getToken as getTokenNextjs } from "@convex-dev/better-auth/nextjs";

export const getToken = () => {
	return getTokenNextjs(createAuth);
};
