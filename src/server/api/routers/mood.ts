/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const moodRouter = createTRPCRouter({
  getMoods: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.mood.findMany({
      where: {
        authorId: ctx.session.user.id,
      },
    });
  }),

  addMood: protectedProcedure
    .input(
      z.object({
        value: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const new_mood = await ctx.prisma.mood.create({
        data: {
          value: input.value,
          author: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });

      return new_mood;
    }),

  updateMood: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(100),
        value: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const originalMood = await ctx.prisma.mood.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!originalMood)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mood not found",
        });

      const new_mood = await ctx.prisma.mood.update({
        where: {
          id: input.id,
        },
        data: {
          value: input.value,
        },
      });

      return new_mood;
    }),
});
