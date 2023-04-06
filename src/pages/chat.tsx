import { type NextPage } from "next";
import { useState } from "react";
import Container from "src/components/Container";
import Header from "src/components/Header";
import Nav from "src/components/Nav";
import { motion } from "framer-motion";
import { api } from "src/utils/api";
import { IoIosSend } from "react-icons/io";
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

  const talk2api = () => {
    setTimeout(() => {
      setChat((x) => [
        ...x,
        {
          text: "はい",
          type: "received",
        },
      ]);
      setLoading(false);
    }, 2000);
  };
  const handleSentMsg = () => {
    setChat((x) => [
      ...x,
      {
        text: query,
        type: "sent",
      },
    ]);

    mutation.mutate({
      question: query,
    });
    setQuery("");
    setLoading(true);
  };

  return (
    <Container>
      <Header title="" desc="" />
      <Nav
        breads={[
          { title: "Home", path: "/" },
          { title: "Chat", path: "/chat" },
        ]}
      />
      <main className="mx-auto flex h-full w-full flex-col items-center justify-center gap-6">
        <div>
          <div className="w-72 rounded-t-xl bg-slate-50 px-2 py-16 md:w-96">
            {chat.map((x, idx) => {
              return (
                <div
                  key={idx}
                  className={`chat ${
                    x.type === "received" ? "chat-start" : "chat-end"
                  }`}
                >
                  <div className="chat-bubble">{x.text}</div>
                </div>
              );
            })}
            {loading ? (
              <div className={`chat chat-start`}>
                <div className="chat-bubble">
                  <div className="mt-3 flex gap-2">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        type: "tween",
                        delay: 0,
                        repeat: Infinity,
                        duration: 1.1,
                        repeatType: "loop",
                      }}
                      className="h-2 w-2 rounded-full bg-white"
                    ></motion.div>
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        type: "tween",
                        delay: 0.1,
                        repeat: Infinity,
                        duration: 1.1,
                        repeatType: "loop",
                      }}
                      className="h-2 w-2 rounded-full bg-white"
                    ></motion.div>
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        type: "tween",
                        delay: 0.2,
                        repeat: Infinity,
                        duration: 1.1,
                        repeatType: "loop",
                      }}
                      className="h-2 w-2 rounded-full bg-white"
                    ></motion.div>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="-mt-1 w-72 rounded-b-xl bg-white p-2 md:w-96">
            <form
              className="input-group w-full"
              onSubmit={(e) => {
                e.preventDefault();
                handleSentMsg();
              }}
            >
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                placeholder="Search…"
                className="input-bordered  input w-full"
              />
              <button
                type="submit"
                className="btn-primary btn-square btn gap-2"
              >
                <IoIosSend size={22} />
              </button>
            </form>
          </div>
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
        ></form>

        <button className="btn-primary btn">Ask me a question</button>
        <button className="btn-primary btn">Save</button>
      </main>
    </Container>
  );
};

export default Home;
