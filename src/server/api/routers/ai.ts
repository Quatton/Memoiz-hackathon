import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "src/server/api/trpc";
import cohere from "cohere-ai";

cohere.init(process.env.COHERE_API_KEY ? process.env.COHERE_API_KEY : "");

export const aiRouter = createTRPCRouter({
  getAIres: publicProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const response = await cohere.generate({
        prompt: input.prompt,
        max_tokens: 50,
        temperature: 1,
      });
      const res = response.body.generations[0];
      if (res) res.text = `${input.prompt}${res ? res.text : ""}`;
      return res;
    }),
});
