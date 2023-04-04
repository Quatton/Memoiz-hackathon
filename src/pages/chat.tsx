import { type NextPage } from "next";
import { useState } from "react";
import Container from "src/components/Container";
import Header from "src/components/Header";
import Nav from "src/components/Nav";

import { api } from "src/utils/api";

const Home: NextPage = () => {
  const [query, setQuery] = useState<string>("");
  const [result, setResult] = useState<string>();
  const [loading, setLoading] = useState(false);
  const mutation = api.ai.askQuestion.useMutation({
    onSuccess: (e) => {
      setChat([
        ...chat,
        {
          text: e,
          type: "received",
        },
      ]);
      setLoading(false);
    },
    onError: (e) => {
      console.error(e);
      setLoading(false);
    },
  });

  const [chat, setChat] = useState<
    { text: string; type: "received" | "sent" }[]
  >([
    {
      text: "Hey, Jims",
      type: "received",
    },
  ]);

  return (
    <Container>
      <Header title="" desc="" />
      <Nav breads={[{ title: 'Home', path: '/' }, { title: 'Chat', path: '/chat' }]} />
      <main className="mx-auto flex h-full w-full flex-col items-center justify-center gap-6">

        <div className="w-72 md:w-96 rounded-md bg-slate-50 py-16">
          {chat.map((x, idx) => {
            return (
              <div
                key={idx}
                className={`chat ${x.type === "received" ? "chat-start" : "chat-end"
                  }`}
              >
                <div className="chat-bubble">{x.text}</div>
              </div>
            );
          })}
        </div>
        <form
          className="form-control"
          onSubmit={(e) => {
            e.preventDefault();
            setChat([
              ...chat,
              {
                text: query,
                type: "sent",
              },
            ]);
            mutation.mutate({ question: `${query}` });
            setQuery("");
          }}
        >
          <div className="input-group">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Search…"
              className="input-bordered input"
            />
            <button type="submit" className="btn-primary btn-square btn">
              Send
            </button>
          </div>
        </form>

        <button className="btn-primary btn">Ask me a question</button>
        <button className="btn-primary btn">Save</button>
      </main>
    </Container>
  );
};

export default Home;
