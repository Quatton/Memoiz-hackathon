import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";

export const diaryRouter = createTRPCRouter({
  getMyDiaries: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.diary.findMany({
      where: {
        authorId: ctx.session.user.id,
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
