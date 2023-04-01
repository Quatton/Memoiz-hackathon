import { createTRPCRouter } from "src/server/api/trpc";
import { exampleRouter } from "src/server/api/routers/example";
import { diaryRouter } from "src/server/api/routers/diary";
import { aiRouter } from "src/server/api/routers/ai";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  diary: diaryRouter,
  ai: aiRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
