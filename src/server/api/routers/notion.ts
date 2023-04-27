import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "src/server/api/trpc";

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export const notionRouter = createTRPCRouter({
  getSyncedDatabases: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.notionDatabase.findMany({
      where: {
        authorId: ctx.user?.id,
      },
    });
  }),
  searchDatabases: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const searchResult = await notion.search({
        auth: process.env.NOTION_API_KEY,
        query: input.query,
        filter: {
          property: "object",
          value: "database",
        },
      });

      return searchResult;
    }),

  getDatabaseById: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(100),
        next_cursor: z.string().or(z.undefined()),
      })
    )
    .query(async ({ ctx, input }) => {
      const database = await notion.databases.retrieve({
        database_id: input.id,
      });

      const pages = await notion.databases.query({
        database_id: input.id,
        page_size: 100,
        start_cursor: input.next_cursor,
      });

      return {
        database,
        pages,
      };
    }),
});
