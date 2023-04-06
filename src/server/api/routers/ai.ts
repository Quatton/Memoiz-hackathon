import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";

import cohere from "cohere-ai";
import { redis } from "src/server/redis";
import { TRPCError } from "@trpc/server";

cohere.init(process.env.COHERE_API_KEY ? process.env.COHERE_API_KEY : "");

async function knnSearch(
  client: typeof redis,
  topK: number,
  authorId: string,
  query_vector: number[]
) {
  const query_vector_bytes = Buffer.from(new Float32Array(query_vector).buffer);
  const query = `(@authorId:${authorId})=>[KNN ${topK} @embedding $query_vec AS vector_score]`;
  const res = await client.ft.search(`diary`, query, {
    DIALECT: 2,
    SORTBY: "vector_score",
    PARAMS: {
      query_vec: query_vector_bytes,
    },
    LIMIT: {
      from: 0,
      size: topK,
    },
    RETURN: ["title", "content", "createdAt"],
  });

  return res;
}

export const aiRouter = createTRPCRouter({
  askQuestion: protectedProcedure
    .input(
      z.object({
        chat: z.array(
          z.object({
            text: z.string(),
            // type is either sent or received
            type: z.literal("received").or(z.literal("sent")),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // get last message
      const lastMessage = input.chat.at(-1);

      if (!lastMessage || lastMessage.type === "received")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You need to send a message first",
        });

      if (
        input.chat.filter((message) => message.type === "received").length > 3
      )
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can only exchange 3 messages at a time",
        });
      // embed the question

      const embed = await cohere.embed({
        texts: [lastMessage.text],
      });

      const embedding = embed.body.embeddings[0];

      if (embed.statusCode !== 200 || !embedding)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Cannot reach server at the moment. Please try again later.",
        });

      // get recent diary entries

      try {
        await redis.connect();
      } catch (error) {
        console.log(error);
      }
      const entries = await knnSearch(redis, 3, ctx.session.user.id, embedding);

      try {
        await redis.quit();
      } catch (error) {
        console.log(error);
      }

      const schema = z.object({
        title: z.string(),
        content: z.string(),
        createdAt: z.string(),
      });

      const diaryBody = entries.documents
        .map(({ value }) => {
          const parsed = schema.safeParse(value);
          if (parsed.success) {
            return `${Intl.DateTimeFormat("en-US").format(
              new Date(parseInt(parsed.data.createdAt))
            )},${parsed.data.title},${parsed.data.content
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => line.length > 0)
              .join(" ")}`;
          }
        })
        .join("\n");

      const chatHistory = input.chat
        .map((message) => {
          if (message.type === "sent") {
            return `User: ${message.text}`;
          } else {
            return `Bot: ${message.text}`;
          }
        })
        .join("\n");

      const prompt = `
        You are a question answering bot. You are given a question and here is how you answer it.
        1. If the question is about your diary, you answer it by looking at your diary. If you don't have an answer, you must admit it and give a compensation answer.
        2. If the question is not about your diary, please answer it as a normal question answering bot.
        3. You must answer the question with a full sentence, in an appropriate tone, and with correct grammar. You must also answer the question in a way that is consistent with your personality which is uplifting, positive, and encouraging.
        
        Refer to your diary entries below:
        ${diaryBody}

        Chat history:
        ${chatHistory}
        Bot:`;

      const response = await cohere.generate({
        model: "command-xlarge-nightly",
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.7,
        stop_sequences: ["User:", "--"],
        num_generations: 1,
        frequency_penalty: 0.5,
      });

      let answer = "";

      if (response.statusCode === 200) {
        const text = response.body.generations[0]?.text;
        answer = text ? text.replace("User:", "") : "";
      } else {
        answer = "Cannot reach server at the moment. Please try again later.";
      }

      return answer;
    }),

  classify: protectedProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ input }) => {
      console.log(input.prompt);
      const response = await cohere.classify({
        inputs: [input.prompt],
        model: "d7c9708f-a8e8-4e08-aa51-ea9cebc55cab-ft",
        examples: [],
      });

      return response.body.classifications[0];
    }),
});
