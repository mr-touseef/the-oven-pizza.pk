import { cache } from "react";
import type { Branch } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * Wrapped in React's `cache()` so multiple calls within the same server
 * request (e.g. from the root layout's JSON-LD and a page's own render)
 * share one database round trip instead of querying twice.
 */
export const getBranches = cache(async (): Promise<Branch[]> => {
  try {
    return await prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });
  } catch (error) {
    console.error("Failed to load branches from the database:", error);
    return [];
  }
});
