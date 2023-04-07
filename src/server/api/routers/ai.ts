import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";

import cohere from "cohere-ai";
import { redisStack } from "src/server/redis";
import { TRPCError } from "@trpc/server";

cohere.init(process.env.COHERE_API_KEY ? process.env.COHERE_API_KEY : "");

async function knnSearch(
  topK: number,
  authorId: string,
  query_vector: number[]
) {
  const query_vector_bytes = Buffer.from(new Float32Array(query_vector).buffer);
  const query = `(@authorId:${authorId})=>[KNN ${topK} @embedding $query_vec AS vector_score]`;
  const res = await redisStack.ft.search(`diary`, query, {
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
      if (
        input.chat.filter((message) => message.type === "received").length > 3
      )
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can only exchange 3 messages at a time",
        });
      // embed the question

      const chatHistory = input.chat
        .map((message) => {
          if (message.type === "sent") {
            return `User: ${message.text}`;
          } else {
            return `Bot: ${message.text}`;
          }
        })
        .join("\n");

      const embed = await cohere.embed({
        texts: [chatHistory],
        truncate: "START",
      });

      const embedding = embed.body.embeddings[0];

      if (embed.statusCode !== 200 || !embedding)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Cannot reach server at the moment. Please try again later.",
        });

      // get recent diary entries

      try {
        await redisStack.connect();
      } catch (error) {
        // it ok
      }
      const entries = await knnSearch(3, ctx.session.user.id, embedding);

      try {
        await redisStack.quit();
      } catch (error) {
        // it ok
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
            return `${Intl.DateTimeFormat("en-US", {
              dateStyle: "medium",
            }).format(new Date(parseInt(parsed.data.createdAt)))},${
              parsed.data.title
            },${parsed.data.content
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => line.length > 0)
              .join(" ")}`;
          }
        })
        .join("\n==========\n");

      const prompt = `You are a personal second brain. Follow through this set of instructions.
1. Read through the chat history, refer to user's diary entries. 
2. If diary contains the information, paraphrase the diary and respond accurately.
3. If you have to make a prediction or recommendation, try your best to logically deduce from the diary entries, and explain your evidence.
4. If diary doesn't contain the information, admit that you cannot find information from the diary and give an alternative response.
5. If you are not sure about the answer, ask the user to clarify the question. If the user doesn't clarify, give an alternative response.
6. Always insist on your answer if you have a concrete evidence. Otherwise, apologize for being wrong. 

Content Policy: Remain civil. Avoid inappropriate content and language. Decline requests that are potentially immoral or harmful.
Language: If user's language is not English, process it in English, then translate back to the user's language.
- English: Use American English. Level: 8th grade.
- 日本語: 敬語を使う。レベル: 中学生.
- 中文: 用正式的语言。等级: 中学生.
- 한국어: 정식 언어를 사용한다. 레벨: 중학생.
- ไทย: ใช้ภาษาทางการ. ระดับ: มัธยมศึกษา
- Tiếng Việt: Sử dụng ngôn ngữ chính thức. Cấp độ: học sinh trung học cơ sở.

Tone: enthusiastic, open-minded, professional.
Style: concise, hedging, logical.
Today's date: ${Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        new Date()
      )}.

Refer to the user's diary entries below:
${diaryBody}
[END OF DIARY]

Chat history:
${chatHistory}
Bot:`;

      console.log(prompt);

      const response = await cohere.generate({
        model: "command-xlarge-nightly",
        prompt: prompt.trim(),
        max_tokens: 150,
        temperature: 0.7,
        stop_sequences: ["User:", "Bot:"],
        num_generations: 1,
        frequency_penalty: 0.3,
        truncate: "START",
      });

      let answer = "";

      if (response.statusCode === 200) {
        const text = response.body.generations[0]?.text;
        answer = text ? text.replace("User:", "").replace("Bot:", "") : "";
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
