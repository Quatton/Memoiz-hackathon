# Memoiz - Mood Tracker Demo

> This documentation version is for branch `next-patch` only. As you can see, we have another two routes which are `/notion` and `/chat-notion`. These two routes are for the Notion integration. We are still working on it and it is not ready for production yet. Here we use `NOTION-API-KEY`, which you can get it from [internal integration page](https://www.notion.so/my-integrations). Since you have to put your own `API-KEY` in `.env`, this is not yet ready for production. We will update the documentation once we are ready.

31 March - 7 April 2023 \
Lablab.ai: Build your AI Startup Hackathon. Episode 2

Ever thought of "I wish I could Google my own brain?" The future is now! Memoiz is a semantic search tool for your database that allows you to search for your data using natural language. Paired with a powerful language model, Memoiz can chat with you and help you find what you are looking for.

This current demo is an example of how Memoiz can be used. It is a mood tracker database where you can log your mood and Memoiz will help you remind you of your past days.

## About

Team: We Have Absolutely No Idea

## Why & How we are building Memoiz

Extracting information from a large database can be difficult, especially when you don't know what to look for. That's exactly why ChatGPT and friends were born to assist Google. However, these models are not to be used for personal data. Sometimes, you just want to know what you did last week, or last year. Sometimes, you just want to know what kind of person you were. And, sometimes you want a deep analysis on your thought and past.

Here is how Memoiz works. First, you have your primary database. This is where you store all your text data. Then, you might have a secondary database. This is where you store the embeddings of your text data. (It is possible that both can be on Redis Stack) When the text data is "archived", its content will be embedded by Cohere Embed, turning into a (seemingly but not) meaningless 4096-dimension vector saved into the Redis server. When the user starts chatting with Memoiz, the chat history will determine the keywords for semantic search on the Redis server. The closest vectors will be treated as a context for the text generation prompt. The text generation prompt will then be sent to the Cohere Generate model for the chat response.

In the next steps, we plan to develop a larger-scale mood tracker with a more powerful language model. We also plan to share a public API for developers to use Memoiz in their own projects.

## Database Setup

### For members

We use `MySQL` on `PlanetScale` as a primary database. Please connect to the `PlanetScale` via the CLI

Login to your PlanetScale account

```bash
pscale auth login
pscale org switch wahni
pscale connect hackathon dev
```

or

```
yarn pscale
```

Put `mysql://localhost:3306/hackathon` in the `.env` file

Then,

```bash
npx prisma db pull
```

to pull the database schema from PlanetScale.

Optionally, you can use the `npx prisma studio` to view the database schema.

### For non-members

Please set up your MySQL database and put the connection string in the `.env` file

## Redis Server

To serve locally, run

```bash
docker run -p 6379:6379 -it redis/redis-stack-server:latest
```

And put `REDIS_URL=redis://localhost:6379` in the `.env` file

## Authentication Setup

Please put in Discord OAuth2 credentials in the `.env` file
And set up `NEXTAUTH_SECRET` according to the `.env.example` file.

#

`docker run -p 6379:6379 -it redis/redis-stack-server:latest`
