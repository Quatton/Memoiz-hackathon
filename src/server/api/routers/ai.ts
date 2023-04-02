import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import cohere from "cohere-ai";

cohere.init(process.env.COHERE_API_KEY ? process.env.COHERE_API_KEY : "");

export const aiRouter = createTRPCRouter({
  askQuestion: protectedProcedure
    .input(z.object({ question: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // get recent diary entries
      const entries = await ctx.prisma.diary.findMany({
        where: {
          authorId: ctx.session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      const diaryBody = entries
        .map(
          (e) =>
            `${Intl.DateTimeFormat("en-US").format(e.createdAt)},${e.title},${
              e.content
            }`
        )
        .join("\n");

      const prompt = `
        You are a question answering bot. You are given a question and here is how you answer it.
        1. If the question is about your diary, you answer it by looking at your diary. If you don't have an answer, you must admit it and give a compensation answer.
        2. If the question is not about your diary, please answer it as a normal question answering bot.
        3. You must answer the question with a full sentence, in an appropriate tone, and with correct grammar. You must also answer the question in a way that is consistent with your personality which is uplifting, positive, and encouraging.

        Diary:
        Date,Title,Content
        ${diaryBody}

        Question: ${input.question}
        Answer:
      `;

      const response = await cohere.generate({
        // model: 6bb104cd-75d6-4898-93bb-a0618bc12434
        prompt: prompt,
        max_tokens: 200,
        temperature: 0.5,
      });

      let answer = "";

      if (response.statusCode === 200) {
        const text = response.body.generations[0]?.text;
        answer = text ? text.replace("Answer:", "") : "";
      } else {
        answer = "Cannot reach server at the moment. Please try again later.";
      }

      return answer;
    }),

  getAIres: protectedProcedure
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

  classify: protectedProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log(input.prompt);
      const response = await cohere.classify({
        inputs: [input.prompt],
        model: "d7c9708f-a8e8-4e08-aa51-ea9cebc55cab-ft",
        examples: [],
      });

      return response.body.classifications[0];
    }),
});
