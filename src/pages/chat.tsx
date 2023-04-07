import { type NextPage } from "next";
import { useState } from "react";
import Container from "src/components/Container";
import Header from "src/components/Header";
import Nav from "src/components/Nav";
import { motion } from "framer-motion";
import { api } from "src/utils/api";
import { IoIosSend } from "react-icons/io";
import { MdDeleteSweep, MdRefresh, MdWarning } from "react-icons/md";
const Home: NextPage = () => {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const mutation = api.ai.askQuestion.useMutation({
    onSuccess: (e) => {
      setChat((x) => {
        const newChat = [
          ...x,
          {
            text: e,
            type: "received",
          },
        ] as typeof chat;

        if (newChat.filter((x) => x.type === "received").length > 3) {
          newChat.push({
            text: "Chat ended. Please refresh the chat by the button below.",
            type: "received",
          });
        }
        return newChat;
      });
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
      text: "Hey, what can I help?",
      type: "received",
    },
  ]);


  // const talk2api = () => {
  //   setTimeout(() => {
  //     setChat((x) => [
  //       ...x,
  //       {
  //         text: "はい",
  //         type: "received",
  //       },
  //     ]);
  //     setLoading(false);
  //   }, 2000);
  // };

  const handleSentMsg = () => {
    if (query.length === 0) return

    const newChat = [
      ...chat,
      {
        text: query,
        type: "sent",
      },
    ] as typeof chat;
    setChat(newChat);

    mutation.mutate({
      chat: newChat,
    });

    setQuery("");
    setLoading(true);
  };

  return (
    <Container>
      <Header title="Chat" desc="" />
      <Nav />
      <main className="h-full w-full flex flex-col justify-center items-center flex-1 pb-16 pt-12 px-5">
        <div className="flex w-full items-center justify-center gap-2 rounded-xl text-sm sm:text-base mb-2">
          <MdWarning />
          <span>Chat history is not saved upon closing</span>
        </div>
        <div>
          <div className="w-full rounded-t-xl bg-slate-50 px-2 py-16">
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
            {mutation.isError && (
              <div className={`chat chat-start`}>
                <div className="chat-bubble">
                  <div className="flex items-center gap-2">
                    <span className="text-error">Reload</span>
                    <MdRefresh size={22}
                      className="text-white hover:text-base hover:cursor-pointer"
                      onClick={() => {
                        mutation.reset();
                        setLoading(true);
                        mutation.mutate({
                          chat: chat,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="-mt-1 w-full rounded-b-xl bg-white p-2">
            <form
              className="input-group w-full"
              onSubmit={(e) => {
                e.preventDefault();
                handleSentMsg();
              }}
            >
              <button
                type="button"
                className="btn-primary btn-square btn gap-2"
                onClick={() => {
                  mutation.reset();
                  setChat([
                    {

                      text: "Hey, what can I help?",
                      type: "received",
                    },
                  ]);
                }}
              >
                <MdDeleteSweep size={22} />
              </button>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}

                placeholder="Type something..."
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
      </main>
    </Container>
  );
};

export default Home;
