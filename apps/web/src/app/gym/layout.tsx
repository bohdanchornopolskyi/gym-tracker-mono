"use client";

import type { ReactNode } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import NotAuthenticated from "@/components/not-authenticated";

export default function GymLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>
        <NotAuthenticated />
      </Unauthenticated>
    </>
  );
}
