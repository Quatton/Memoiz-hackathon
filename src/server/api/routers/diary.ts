import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";

export const diaryRouter = createTRPCRouter({
  getMyDiary: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.diary.findMany({
      where: {
        authorId: ctx.session.user.id,
      },
    });
  }),

  createDiary: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        content: z.string().min(1).max(10000),
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
});
