import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "src/server/api/trpc";
import cohere from "cohere-ai";

cohere.init(process.env.COHERE_API_KEY ? process.env.COHERE_API_KEY : "");

export const aiRouter = createTRPCRouter({
  getAIres: publicProcedure.query(async () => {
    const response = await cohere.generate({
      prompt: "Once upon a time in a magical land called",
      max_tokens: 50,
      temperature: 1,
    });
    console.log(response.body.generations[0]);
    return response.body.generations[0];
  }),
});
