import { createClient } from "redis";
import { Redis } from "@upstash/redis";

export const redisStack = createClient({
  url: process.env.REDIS_URL,
});

export const upstashRedis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});
