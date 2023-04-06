import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";

import cohere from "cohere-ai";
import { redis } from "src/server/redis";
import { SchemaFieldTypes, VectorAlgorithms } from "redis";
import { TRPCError } from "@trpc/server";

cohere.init(process.env.COHERE_API_KEY ? process.env.COHERE_API_KEY : "");

async function knnSearch(
  client: typeof redis,
  topK: number,
  authorId: string,
  query_vector: number[]
) {
  const query_vector_bytes = Buffer.from(query_vector);
  const query = `*=>[KNN ${topK} @embedding $query_vec AS vector_score]`;
  const res = await client.ft.search(`diary:${authorId}`, query, {
    DIALECT: 2,
    SORTBY: "vector_score",
    PARAMS: {
      query_vec: query_vector_bytes,
    },
    LIMIT: {
      from: 0,
      size: topK,
    },
    RETURN: ["id", "title", "content", "created_at", "embedding"],
  });

  return res;
}

export const aiRouter = createTRPCRouter({
  askQuestion: protectedProcedure
    .input(z.object({ question: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // embed the question
      const embed = await cohere.embed({
        texts: [input.question],
      });

      const embedding = embed.body.embeddings[0];

      if (embed.statusCode !== 200 || !embedding)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Cannot reach server at the moment. Please try again later.",
        });

      // connect to redis
      await redis.connect();
      // get recent diary entries
      const entries = await knnSearch(redis, 5, ctx.session.user.id, embedding);

      await redis.quit();

      console.log(entries.documents);

      // document schema
      const schema = z.object({
        title: z.string(),
        content: z.string(),
        createdAt: z.number(),
      });

      const diaryBody = entries.documents
        .map(({ value }) => {
          const parsed = schema.safeParse(value);
          if (parsed.success) {
            return `Intl.DateTimeFormat("en-US").format(new Date(${parsed.data.createdAt})),${parsed.data.title},${parsed.data.content}`;
          }
        })
        .join("\n");

      console.log(diaryBody);

      const prompt = `
        You are a question answering bot. You are given a question and here is how you answer it.
        1. If the question is about your diary, you answer it by looking at your diary. If you don't have an answer, you must admit it and give a compensation answer.
        2. If the question is not about your diary, please answer it as a normal question answering bot.
        3. You must answer the question with a full sentence, in an appropriate tone, and with correct grammar. You must also answer the question in a way that is consistent with your personality which is uplifting, positive, and encouraging.
        
        Diary:
        ${diaryBody}

        Question: ${input.question}
        Answer:`;

      const response = await cohere.generate({
        model: "command-xlarge-nightly",
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.7,
        stop_sequences: ["Question", "--"],
        num_generations: 1,
        frequency_penalty: 0.5,
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
