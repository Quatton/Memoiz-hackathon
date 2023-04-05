import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";

import cohere from "cohere-ai";
import { TRPCError } from "@trpc/server";
import { TextSegmentationRes } from "src/server/ai21";

cohere.init(process.env.COHERE_API_KEY ? process.env.COHERE_API_KEY : "");

const getSegmentedText = async (text: string) => {
  if (text.length < 30) return [text];

  const url = "https://api.ai21.com/studio/v1/segmentation";

  const response = await fetch(url, {
    method: "POST",
    headers: [
      ["Content-Type", "application/json"],
      ["Accept", "application/json"],
      ["Authorization", `Bearer ${process.env.AI21_API_KEY || ""}`],
    ],
    body: JSON.stringify({
      source: text,
      sourceType: "TEXT",
    }),
  });

  const res = await response.json();

  return res.segments.map((segment) => segment.segmentText);
};

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

      const segments = await getSegmentedText(diary.content);

      const embed = await cohere.embed({
        texts: segments,
      });

      if (embed.statusCode !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Cannot reach server at the moment. Please try again later.",
        });
      }

      const embeddingss = embed.body.embeddings;

      await ctx.prisma.diary.update({
        where: {
          id: diary.id,
        },
        data: {
          isArchived: true,
          segments: {
            createMany: {
              data: embeddingss.map((embeddings, index) => ({
                segment: segments[index] as string,
                embeddings: embeddings.join(","),
                authorId: ctx.session.user.id,
              })),
            },
          },
        },
        include: {
          segments: true,
        },
      });

      return diary;
    }),

  archiveAllDiary: protectedProcedure.mutation(async ({ ctx }) => {
    // fetch all unarchived diaries at least 24 hours old
    const diaries = await ctx.prisma.diary.findMany({
      where: {
        authorId: ctx.session.user.id,
        isArchived: false,
        createdAt: {
          lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    await Promise.all(
      diaries.map(async (diary) => {
        const segments = await getSegmentedText(diary.content);

        const embed = await cohere.embed({
          texts: segments,
        });

        if (embed.statusCode !== 200) {
          return null;
        }

        const embeddings = embed.body.embeddings;

        await ctx.prisma.diary.update({
          where: {
            id: diary.id,
          },
          data: {
            isArchived: true,
            segments: {
              createMany: {
                data: embeddings.map((embedding, index) => ({
                  segment: segments[index] as string,
                  embedding: embedding.join(","),
                  authorId: ctx.session.user.id,
                })),
              },
            },
          },
        });
      })
    );
  }),

  createDiary: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        content: z.string().max(10000),
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
        title: z.string().min(1).max(100),
        content: z.string().max(10000),
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
