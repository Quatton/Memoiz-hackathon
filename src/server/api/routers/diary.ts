/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";

import cohere from "cohere-ai";
import { TRPCError } from "@trpc/server";
import { redisStack as redisStack } from "src/server/redis";
import { SchemaFieldTypes, VectorAlgorithms } from "redis";
import { type Diary } from "@prisma/client";

cohere.init(process.env.COHERE_API_KEY ? process.env.COHERE_API_KEY : "");

async function load_vector(diary: Diary, vector: number[]) {
  const key = `diary:${diary.id}`;

  const diary_data = {
    title: diary.title,
    content: diary.content,
    createdAt: diary.createdAt.getTime(),
    embedding: vector,
    authorId: diary.authorId,
  };

  await redisStack.json.set(key, "$", diary_data);
}

async function create_flat_index(
  vector_dimension = 4096,
  distance_metric: "L2" | "IP" | "COSINE" = "L2"
) {
  // const number_of_vectors = parseInt(
  //   (await client.get(`diary:${authorId}:count`)) || "0"
  // );
  await redisStack.ft.create(
    `diary`,
    {
      "$.embedding": {
        type: SchemaFieldTypes.VECTOR,
        TYPE: "FLOAT32",
        ALGORITHM: VectorAlgorithms.FLAT,
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
      "$.title": {
        type: SchemaFieldTypes.TEXT,
        AS: "title",
      },
      "$.content": {
        type: SchemaFieldTypes.TEXT,
        AS: "content",
      },
      "$.createdAt": {
        type: SchemaFieldTypes.NUMERIC,
        AS: "createdAt",
      },
    },
    {
      ON: "JSON",
      PREFIX: "diary",
    }
  );
}

export const diaryRouter = createTRPCRouter({
  getMyDiaries: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.diary.findMany({
      where: {
        authorId: ctx.session.user.id,
      },
    });
  }),

  getDiariesByDateTime: protectedProcedure
    .input(
      z.object({
        datetime: z.string().datetime(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.diary.findMany({
        where: {
          authorId: ctx.session.user.id,
          AND: {
            createdAt: input.datetime,
          },
        },
      });
    }),

  getDiaryById: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(100),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.diary.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  deleteDiary: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const diary = await ctx.prisma.diary.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!diary) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Diary not found",
        });
      }

      if (diary.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this diary",
        });
      }

      await ctx.prisma.diary.delete({
        where: {
          id: input.id,
        },
      });

      if (!diary.isArchived) return true;

      // forget on redis

      try {
        await redisStack.connect();
      } catch (e) {
        // it ok
      }

      await redisStack.json.forget(`diary:${diary.id}`);

      try {
        await redisStack.quit();
      } catch (e) {
        // it ok
      }

      return true;
    }),

  unarchiveDiary: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const diary = await ctx.prisma.diary.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!diary) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Diary not found",
        });
      }

      if (diary.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to unarchive this diary",
        });
      }

      if (!diary.isArchived) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Diary is not archived",
        });
      }

      // if updatedAt was less than 24 hr ago, don't allow
      if (diary.updatedAt.getTime() > Date.now() - 24 * 60 * 60 * 1000) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Diary was updated less than 24 hours ago",
        });
      }

      // forget on redis

      try {
        await redisStack.connect();
      } catch (e) {
        // it ok
      }

      await redisStack.json.forget(`diary:${diary.id}`);

      try {
        await redisStack.quit();
      } catch (e) {
        // it ok
      }

      await ctx.prisma.diary.update({
        where: {
          id: input.id,
        },
        data: {
          isArchived: false,
        },
      });
    }),

  archiveDiary: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const diary = await ctx.prisma.diary.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!diary) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Diary not found",
        });
      }

      if (diary.isArchived) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Diary is already archived",
        });
      }

      // const segments = await getSegmentedText(diary.content);

      const embed = await cohere.embed({
        texts: [diary.content],
      });

      if (embed.statusCode !== 200 || !embed.body.embeddings[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Cannot reach server at the moment. Please try again later.",
        });
      }

      const embedding = embed.body.embeddings[0];

      try {
        await redisStack.connect();
      } catch (error) {
        // it ok
      }

      const res = await redisStack.ft._list();
      if (!res.includes("diary")) {
        await create_flat_index();
      }
      await load_vector(diary, embedding);
      try {
        await redisStack.quit();
      } catch (error) {
        // it ok
      }

      await ctx.prisma.diary.update({
        where: {
          id: input.id,
        },
        data: {
          isArchived: true,
        },
      });

      return diary;
    }),

  createDiary: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(60),
        content: z.string().max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const diary = await ctx.prisma.diary.create({
        data: {
          title: input.title,
          content: input.content,
          author: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });

      return diary;
    }),

  updateDiary: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(100),
        title: z.string().min(1).max(60),
        content: z.string().max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const originalDiary = await ctx.prisma.diary.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!originalDiary)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Diary not found",
        });

      if (originalDiary.authorId !== ctx.session.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to update this diary",
        });

      if (originalDiary.isArchived)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Diary is already archived",
        });

      const diary = await ctx.prisma.diary.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          content: input.content,
        },
      });

      return diary;
    }),
});
