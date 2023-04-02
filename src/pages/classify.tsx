import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";


import { api } from "src/utils/api";

const Home: NextPage = () => {
  const [query, setQuery] = useState<string>("")
  const [result, setResult] = useState<string>()
  const [loading, setLoading] = useState(false);
  const mutation = api.ai.classify.useMutation({
    onSuccess: (e) => {

      setChat([...chat, {
        text: e && e.prediction ? e.prediction : '',
        type: 'received'

      }])
      setLoading(false)
    },
    onError: (e) => {
      console.error(e);
      setLoading(false)
    },
  });

  const [chat, setChat] = useState<{ text: string, type: 'received' | 'sent' }[]>(
    [{
      'text': 'Hey, Jims',
      type: 'received'
    }]
  )

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen artboard phone-4 mx-auto w-full flex-col items-center justify-center gap-6">
        <div className="bg-primary rounded-xl p-6 gap-3 flex flex-col shadow-md">
          <h1 className="text-3xl text-center p-3 text-white font-semibold">{`I Classify`}</h1>
          {/* <div className="grid grid-cols-5 gap-3 w-fit justify-center">
            {
              Array.from(Array(5).keys()).map((x) => {
                return <div className="rounded-full hover:bg-slate-200 hover:cursor-pointer transition-colors text-primary bg-white h-8 w-8 flex justify-center items-center" key={x}>
                  {x}
                </div>
              })
            }
          </div> */}
        </div>
        <div className="bg-slate-50 w-full rounded-md py-16">
          {chat.map((x, idx) => {
            return <div key={idx} className={`chat ${x.type === 'received' ? 'chat-start' : 'chat-end'}`}>
              <div className="chat-bubble">{x.text}</div>
            </div>
          })}

        </div>
        <form className="form-control" onSubmit={(e) => {
          e.preventDefault()
          setChat([...chat, {

            text: query,
            type: 'sent'

          }])
          mutation.mutate({ prompt: `${query}` })
          setQuery('')


        }}>
          <div className="input-group">
            <input type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
              }} placeholder="Search…" className="input input-bordered" />
            <button type="submit" className="btn btn-square btn-primary">
              Send
            </button>
          </div>
        </form>

        <button className="btn btn-primary">Ask me a question</button>
        <button className="btn btn-primary">Save</button>
      </main>

    </>
  );
};

export default Home;


