import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "src/server/api/trpc";

import { redisStack as client } from "src/server/redis";

import {
  Client,
  isFullBlock,
  isFullDatabase,
  isFullPage,
} from "@notionhq/client";
import {
  DatabaseObjectResponse,
  GetDatabaseResponse,
  ParagraphBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { TRPCError } from "@trpc/server";
import { SchemaFieldTypes, VectorAlgorithms } from "redis";

import cohere from "cohere-ai";
cohere.init(process.env.COHERE_API_KEY ? process.env.COHERE_API_KEY : "");

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function create_hnsw_index(
  vector_dimension = 4096,
  distance_metric: "L2" | "IP" | "COSINE" = "L2"
) {
  const index_list = await client.ft._list();
  if (index_list.includes("notion")) {
    return;
  }

  await client.ft.create(
    `notion`,
    {
      "$.embedding": {
        type: SchemaFieldTypes.VECTOR,
        TYPE: "FLOAT32",
        ALGORITHM: VectorAlgorithms.HNSW,
        DIM: vector_dimension,
        DISTANCE_METRIC: distance_metric,
        AS: "embedding",
        // INITIAL_CAP: number_of_vectors,
        // BLOCK_SIZE: number_of_vectors,
      },
      "$.authorId": {
        type: SchemaFieldTypes.TEXT,
        AS: "authorId",
      },
      "$.createdAt": {
        type: SchemaFieldTypes.NUMERIC,
        AS: "createdAt",
      },
      "$.pageId": {
        type: SchemaFieldTypes.TEXT,
        AS: "pageId",
      },
      "$.blockId": {
        type: SchemaFieldTypes.TEXT,
        AS: "blockId",
      },
    },
    {
      ON: "JSON",
      PREFIX: "notion",
    }
  );
}

export const notionRouter = createTRPCRouter({
  getSyncedDatabases: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.notionDatabase.findMany({
      where: {
        authorId: ctx.session.user.id,
      },
    });
  }),
  searchDatabases: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
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
    .query(async ({ input }) => {
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

  syncDatabase: protectedProcedure
    .input(
      z.object({
        databaseId: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const syncedDatabase = await ctx.prisma.notionDatabase.findUnique({
        where: {
          databaseId_authorId: {
            authorId: ctx.session.user.id,
            databaseId: input.databaseId,
          },
        },
      });

      let database: DatabaseObjectResponse;

      try {
        const fdatabase = await notion.databases.retrieve({
          database_id: input.databaseId,
        });

        if (!isFullDatabase(fdatabase)) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not retrieve database",
          });
        }

        database = fdatabase;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not retrieve database",
        });
      }

      let processedBlocks: {
        parent: string;
        id: string;
        text: string;
        createdAt: Date;
      }[] = [];

      try {
        const pages = await notion.databases
          .query({
            database_id: input.databaseId,
            page_size: 100,
          })
          .then((pages) =>
            pages.results.filter(isFullPage).map(async (page) => {
              const result = await notion.blocks.children.list({
                block_id: page.id,
              });

              const blocks = result.results
                .filter(isFullBlock)
                .filter(
                  (block): block is ParagraphBlockObjectResponse =>
                    block.type === "paragraph"
                );

              // Pre-process
              const processedBlocks = blocks.map((block) => {
                const text = block.paragraph.rich_text
                  .map((text) => text.plain_text)
                  .join("");

                return {
                  parent: page.id,
                  id: block.id,
                  text,
                  createdAt: new Date(block.created_time),
                };
              });

              return processedBlocks;
            })
          );

        processedBlocks = (await Promise.all(pages)).flat();
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error processing pages",
        });
      }

      // embed
      const embeddings: {
        embedding: number[];
        pageId: string;
        blockId: string;
        createdAt: Date;
      }[] = [];

      const batchedProcessedBlocks = processedBlocks.reduce((acc, curr, i) => {
        const index = Math.floor(i / 96);
        acc[index] = acc[index] || [];
        acc[index]!.push(curr);
        return acc;
      }, [] as (typeof processedBlocks)[]);

      // embed
      for (const batch of batchedProcessedBlocks) {
        const embeddingsBatch = await cohere.embed({
          texts: batch.map((block) => block.text),
          truncate: "END",
        });

        if (embeddingsBatch.statusCode !== 200) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error embedding blocks",
          });
        }

        embeddings.push(
          ...embeddingsBatch.body.embeddings.map((embedding, i) => ({
            embedding,
            pageId: batch[i]!.parent,
            blockId: batch[i]!.id,
            createdAt: batch[i]!.createdAt,
          }))
        );
      }

      // Save to Redis
      try {
        await client.connect();
        await create_hnsw_index();

        for (const embedding of embeddings) {
          const key = `notion:${embedding.pageId}:${embedding.blockId}`;
          const res = await client.json.set(key, "$", {
            embedding: embedding.embedding,
            pageId: embedding.pageId,
            blockId: embedding.blockId,
            authorId: ctx.session.user.id,
            createdAt: embedding.createdAt.getTime(),
          });
          console.log(res);
        }

        await ctx.prisma.notionDatabase.upsert({
          where: {
            databaseId_authorId: {
              authorId: ctx.session.user.id,
              databaseId: input.databaseId,
            },
          },
          create: {
            databaseId: input.databaseId,
            authorId: ctx.session.user.id,
            title: database.title[0]?.plain_text ?? "(Untitled)",
            lastSync: new Date(),
          },
          update: {
            databaseId: input.databaseId,
            authorId: ctx.session.user.id,
            title: database.title[0]?.plain_text ?? "(Untitled)",
            lastSync: new Date(),
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error saving embeddings",
        });
      } finally {
        await client.disconnect();
      }
    }),
});
